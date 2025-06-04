// pages/api/listen-input.js
// Create this file if the App Router version doesn't work

const { spawn } = require("child_process");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const inputPromise = new Promise((resolve, reject) => {
      const child = spawn(
        "node",
        [
          "-e",
          `
        const readline = require('readline');
        
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const timeout = setTimeout(() => {
          rl.close();
          process.exit(1);
        }, 20000);
        
        rl.on('line', (input) => {
          clearTimeout(timeout);
          console.log(input.trim());
          rl.close();
          process.exit(0);
        });
        
        process.on('SIGINT', () => {
          clearTimeout(timeout);
          rl.close();
          process.exit(1);
        });
      `,
        ],
        {
          stdio: ["inherit", "pipe", "pipe"],
        }
      );

      let output = "";
      let hasOutput = false;

      child.stdout.on("data", (data) => {
        output += data.toString();
        hasOutput = true;
      });

      child.on("close", (code) => {
        if (code === 0 && hasOutput && output.trim()) {
          resolve(output.trim());
        } else {
          reject(new Error("No input received or timeout"));
        }
      });

      child.on("error", (error) => {
        reject(error);
      });
    });

    const result = await inputPromise;

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

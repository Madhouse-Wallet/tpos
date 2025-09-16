import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fiatAmount } = req.body;

    // Validate required fields
    if (!fiatAmount) {
      return res.status(400).json({
        error: "Missing required fields: from, to, and fiatAmount are required",
      });
    }

    const data = JSON.stringify({
      from: "KES",
      to: "USDC",
      fiatAmount: parseFloat(fiatAmount),
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://widget-api.kotanipay.io/onramp/rates",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "eyJ1c2VyX2lkIjoiNjg3OTE5YWNhODY3NDRlNTVkMDM5OWI4IiwiY3JlYXRlZF9hdCI6IjIwMjUtMDctMTdUMTc6MjI6MzIuNzQ2WiJ9.6da2c9ca8ad4b1665b5cacb989ce1e3f1b988d4deee7308e95ab7ecc6482def4",
        Connection: "keep-alive",
        Origin: "https://widget.kotanipay.com",
        Referer: "https://widget.kotanipay.com/",
      },
      data,
    };

    const response = await axios.request(config);
    console.log("response", response.data);
    return res.status(200).json({
      status: "success",
      data: response.data,
    });
  } catch (error: any) {
    console.error(
      "Kotanipay onramp rates error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      status: "failure",
      error: error.response?.data || error.message,
    });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { payInvoice, userLogIn } from "../api/lnbits";
import client from "../../lib/mongodb"; // Import the MongoDB client

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { invoice, address } = req.body;
    console.log("line-14", invoice, address);
    const db = (await client.connect()).db(); // Defaults to the database in the connection string
    const usersCollection = db.collection("users"); // Use 'users' collection
    const existingUser = await usersCollection.findOne({
      wallet: address,
    });
    console.log("line-19", existingUser);
    let getToken = (await userLogIn(2, existingUser?.lnbitId_3)) as any;
    // let getToken = getUserToken?.data?.token;
    // const getToken = await logIn(2) as any;
    // console.log("data-->", data)
    console.log("line-25", getToken);
    if (getToken?.status) {
      let token = getToken?.data?.token;
      const payInv = (await payInvoice(
        {
          out: true,
          bolt11: invoice, // ← invoice from above
        },
        token,
        2,
        existingUser?.lnbitAdminKey_3
      )) as any;
      if (payInv?.status) {
        console.log("done payment!");
        return res
          .status(200)
          .json({ status: "success", message: "Done Payment!", userData: {} });
      } else {
        return res.status(400).json({ status: "failure", message: payInv.msg });
      }
    } else {
      return res.status(400).json({ status: "failure", message: getToken.msg });
    }
  } catch (error) {
    console.error("Error adding user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "3mb",
    },
  },
};

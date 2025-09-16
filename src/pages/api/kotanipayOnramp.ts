import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // if (req.method !== "POST") {
  //   return res.status(405).json({ error: "Method not allowed" });
  // }

  try {
    const {
      phoneNumber,
      fiatAmount,
      address,
      rateId,
    } = req.body;

    const data = JSON.stringify({
      phoneNumber: phoneNumber,
      network:  "MPESA",
      chain:   "BASE",
      token:  "USDC",
      fiatAmount: parseFloat(fiatAmount),
      currency:  "KES",
      address: address,
      rateId: rateId ,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://widget-api.kotanipay.io/onramp",
      headers: {
        Connection: "keep-alive",
        "Content-Type": "application/json",
        Origin: "https://widget.kotanipay.com",
        Referer: "https://widget.kotanipay.com/",
        "x-api-key":
          "eyJ1c2VyX2lkIjoiNjg3OTE5YWNhODY3NDRlNTVkMDM5OWI4IiwiY3JlYXRlZF9hdCI6IjIwMjUtMDctMTdUMTc6MjI6MzIuNzQ2WiJ9.6da2c9ca8ad4b1665b5cacb989ce1e3f1b988d4deee7308e95ab7ecc6482def4",
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
      "Kotanipay onramp error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      status: "failure",
      error: error.response?.data || error.message,
    });
  }
}

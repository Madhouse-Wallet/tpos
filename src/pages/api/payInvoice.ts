import { payTposInvoice } from "../../lib/apiCall";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { invoice, address } = req.body;
    console.log("line-14", invoice, address);

    if (!invoice || !address) {
      return res.status(400).json({
        status: "failure",
        message: "Invoice and address are required",
      });
    }

    // Call the external API
    const apiResponse = await payTposInvoice({
      invoice,
      address,
    });

    // Check if the API call failed
    if (!apiResponse || apiResponse === false) {
      return res.status(500).json({
        status: "failure",
        message: "Failed to pay invoice via external API",
      });
    }

    // Check if the API returned an error
    if (apiResponse.error) {
      return res.status(400).json({
        status: "failure",
        message: apiResponse.error,
      });
    }

    // Check if the API response indicates success
    if (apiResponse.status !== "success") {
      return res.status(400).json({
        status: "failure",
        message: apiResponse.message || "Payment failed",
      });
    }

    // Return the same format as your original code
    console.log("done payment!");
    return res.status(200).json({
      status: "success",
      message: apiResponse.message || "Done Payment!",
      userData: apiResponse.data || {},
    });
  } catch (error) {
    console.error("Error paying invoice:", error);
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

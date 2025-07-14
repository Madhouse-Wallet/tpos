import { lambdaInvokeFunction } from "../../lib/apiCall";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { tpoId} = req.body;

    console.log("line-20", tpoId);

    if (!tpoId) {
      return res.status(400).json({
        status: "failure",
        message: "TPOS ID is required",
      });
    }
    // Call the external API
    const apiResponse = await lambdaInvokeFunction({
      tpoId
    },"madhouse-backend-production-getLnAddress")
    console.log("apiResponse-->,",apiResponse)
    // Check if the API call failed
    if (!apiResponse || apiResponse === false) {
      return res.status(500).json({
        status: "failure",
        message: "Failed to create invoice via external API",
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
        message: apiResponse.message || "Invoice creation failed",
      });
    }

    // Check if data exists
    if (!apiResponse.data) {
      return res.status(500).json({
        status: "failure",
        message: "No invoice data returned from external API",
      });
    }

    // Return the invoice data - assuming the original function returned the invoice directly
    return res.status(200).json(apiResponse.data);
  } catch (error) {
    console.error("Error creating TPOS invoice:", error);
    return res.status(500).json({
      status: "failure",
      message: "Internal server error",
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

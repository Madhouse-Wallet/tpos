import { lambdaInvokeFunction } from "../../lib/apiCall";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { walletId, fromDate, toDate, tag, apiKey } = req.body;

    if (!walletId) {
      return res
        .status(400)
        .json({ status: "failure", message: "walletId is required" });
    }

    // Call the external API

    const apiResponse = await lambdaInvokeFunction({
       walletId,
      fromDate,
      toDate,
      tag,
      apiKey,
    }, "madhouse-backend-production-getTposTrxn")


    // const apiResponse = await getTposTrxn({
    //   walletId,
    //   fromDate,
    //   toDate,
    //   tag,
    //   apiKey,
    // });

    // Check if the API call failed
    if (!apiResponse || apiResponse === false) {
      return res.status(500).json({
        status: "failure",
        message: "Failed to fetch transaction data from external API",
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
        message:
          apiResponse.message || "External API did not return success status",
      });
    }

    // Check if data exists
    if (!apiResponse.data) {
      return res.status(500).json({
        status: "failure",
        message: "No transaction data returned from external API",
      });
    }

    // Return the same format as your original code
    return res.status(200).json({
      status: "success",
      data: apiResponse.data,
    });
  } catch (error) {
    console.error("API Error in getPayments handler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

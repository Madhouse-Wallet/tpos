import { createTposInvoice, lambdaInvokeFunction } from "../../lib/apiCall";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, address, currency, country } = req.body;

    console.log("line-20", amount, address, currency, country);

    if (!amount) {
      return res.status(400).json({
        status: "failure",
        message: "Amount is required",
      });
    }

    // Call the external API
    const apiResponse = await lambdaInvokeFunction(
      {
        amount,
        address,
        currency,
         country
      },
      "coinbase-pay-dev-call"
    );
    console.log("apiResponse-->,", apiResponse);
    // const apiResponse = await createTposInvoice({
    //   tpoId,
    //   amount,
    //   memo,
    //   userLnaddress,
    //   details,
    // });

    // Check if the API call failed
    if (!apiResponse || apiResponse === false) {
      return res.status(500).json({
        status: "failure",
        message: "Failed to create invoice via external API",
      });
    }

    // Check if the API returned an error
    if (
      apiResponse.error ||
      apiResponse.message == "Error" ||
      apiResponse.errorType
    ) {
      return res.status(500).json({
        status: "failure",
        message: apiResponse.error || "",
      });
    }

    // Return the invoice data - assuming the original function returned the invoice directly
    // apiResponse.message == "Error"
    if (apiResponse.message != "Error") {
      return res.status(200).json(apiResponse);
    }
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

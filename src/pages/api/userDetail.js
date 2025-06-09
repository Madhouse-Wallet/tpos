import { getUser } from "../../lib/apiCall";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, wallet, tposId } = req.query;
    console.log("Query params:", { email, wallet, tposId });

    // Check if at least one identifier is provided
    if (!email && !wallet && !tposId) {
      return res.status(400).json({
        error:
          "At least one identifier is required (email, wallet, or tposId)",
      });
    }

    // Determine which parameter to use (priority: email > wallet > tposId)
    let userParam = {};
    let identifierType = "";

    if (email) {
      userParam = { email };
      identifierType = "email";
    } else if (wallet) {
      userParam = { wallet };
      identifierType = "wallet";
    } else if (tposId) {
      userParam = { tposId };
      identifierType = "tposId";
    }

    console.log(`Using ${identifierType}:`, userParam);

    // Call the external API
    const apiResponse = await getUser(userParam);

    // Check if the API call failed
    if (!apiResponse || apiResponse === false) {
      return res.status(500).json({
        error: "Failed to fetch user data from external API",
      });
    }

    // Check if the API returned an error
    if (apiResponse.error) {
      // Handle different error cases based on the API response
      if (
        apiResponse.error === "User not found for this email" ||
        apiResponse.error.includes("User not found")
      ) {
        return res.status(404).json({
          error: `User not found for this ${identifierType}`,
        });
      }

      return res.status(400).json({
        error: apiResponse.error,
        message: apiResponse.message || "Error from external API",
      });
    }

    // Check if the API response indicates success
    if (apiResponse.status !== "success") {
      return res.status(500).json({
        error: "External API did not return success status",
      });
    }

    // Check if data exists
    if (!apiResponse.data) {
      return res.status(500).json({
        error: "No user data returned from external API",
      });
    }

    // Return the same format as your original code
    res.status(200).json({
      success: true,
      user: apiResponse.data,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

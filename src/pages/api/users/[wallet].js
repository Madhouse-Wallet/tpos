import client from "../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { wallet } = req.query;

    if (!wallet) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    // Connect to database
    const db = (await client.connect()).db();
    const usersCollection = db.collection("users");

    // Find user by wallet address
    const existingUser = await usersCollection.findOne({
      wallet: wallet,
    });

    if (!existingUser) {
      return res
        .status(404)
        .json({ error: "User not found for this wallet address" });
    }

    // Return user details (you might want to exclude sensitive fields)
    const { password, ...userDetails } = existingUser;

    res.status(200).json({
      success: true,
      user: userDetails,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  } finally {
    // Close the database connection
    await client.close();
  }
}

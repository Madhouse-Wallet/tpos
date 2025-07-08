import { logIn, getStats } from "./lnbit";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { lnbitLinkId_2, lnbitLinkId, lnbitWalletId, lnbitWalletId_2, tposId } = req.body;
    const login = await logIn(1);
    const masterToken = login?.data?.token;
    if (!masterToken) return res.status(401).json({ status: "failure", message: "Token fetch failed" });
    if (lnbitLinkId === tposId) {
      console.log("Step 2: Handling USDC flow bal:");
      const stats = await getStats(lnbitWalletId, masterToken, 1);
      if (!stats.status) return res.status(400).json({ status: "failure", message: stats.msg });

      const balanceSats = Number(stats.data?.[0]?.balance || 0);
      let sats = Math.floor(balanceSats / 1000);
      console.log("calculate balance-", sats);
      return res.status(200).json({
        success: true,
        balance: sats,
      });
    } else if (lnbitLinkId_2 === tposId) {
      console.log("Step 2: Handling Bitcoin flow bal:");
      const stats = await getStats(lnbitWalletId_2, masterToken, 1);
      if (!stats.status) return res.status(400).json({ status: "failure", message: stats.msg });

      const balanceSats = Number(stats.data?.[0]?.balance || 0);
      let sats = Math.floor(balanceSats / 1000);
      console.log("calculate balance-", sats);
      return res.status(200).json({
        success: true,
        balance: sats,
      });
    } else {
      return res.status(200).json({
        success: true,
        balance: 0,
      });
    }

  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

import { lambdaInvokeFunction } from "../../lib/apiCall";
import { logIn, getStats, userLogIn, createSwapReverse, payInvoice } from "./lnbit";
import { createLbtcToUsdcShift } from "./sideShiftAI";
import axios from "axios";
import { sendBitcoinTransaction } from "./sendbitcoin";
import { calcLnToChainFeeWithReceivedAmount } from "../../utils/helper";
import { reverseSwap } from "./botlzFee";
// Define response type for the BlockCypher API
interface BlockCypherResponse {
  private: string;
  public: string;
  address: string;
  wif: string;
}

 
const getDestinationAddress = async (walletAddress: any, amount: any) => {
  try {
    const shift = await createLbtcToUsdcShift(amount, walletAddress, process.env.NEXT_PUBLIC_SIDESHIFT_SECRET_KEY!, process.env.NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID!) as any;

    console.log("shift--> response", shift)
    return {
      status: true,
      depositAddress: shift.depositAddress,
      settleAmount: parseFloat(shift.settleAmount || 0),
    };
  } catch (error: any) {
    console.log(error?.message || "Failed to get the quotes");
    return { status: false, message: error?.message || "Failed to get the quotes" };
  }
};

const getBitcoinBalance = async (address: string): Promise<{
  balance: any;
  address: string;
  error: string | null;
} | null> => {
  try {
    if (!address || typeof address !== "string") {
      throw new Error("Invalid Bitcoin address format");
    }

    const response = await fetch(
      `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance?token=119e78d53a7047eb8455275fc461bd7d`
    );

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const data = await response.json();
    const balanceInBTC = data.balance / 100000000;

    return {
      balance: balanceInBTC,
      address,
      error: null,
    };
  } catch (error: any) {
    console.error("Error fetching Bitcoin balance:", error?.message || error);
    return null;
  }
};



export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { tpoId } = req.body;
    if (!tpoId) return res.status(400).json({ status: "failure", message: "tpoId is required" });

    console.log("Step 1: Fetching user data from lambda");
    const userRes = await lambdaInvokeFunction({ tposId: tpoId }, "madhouse-backend-production-getUser");
    if (userRes?.status !== "success") return res.status(500).json({ error: "Failed to fetch user" });

    const user = userRes.data;

    const login = await logIn(1);
    const masterToken = login?.data?.token;
    if (!masterToken) return res.status(401).json({ status: "failure", message: "Token fetch failed" });

    // ----- USDC Flow -----
    if (user.lnbitLinkId === tpoId) {
      console.log("Step 2: Handling USDC flow");
      const stats = await getStats(user.lnbitWalletId, masterToken, 1);
      if (!stats.status) return res.status(400).json({ status: "failure", message: stats.msg });

      const balanceSats = Number(stats.data?.[0]?.balance || 0);
      let sats = Math.floor(balanceSats / 1000);
      console.log("calculate balance-", sats);
      sats = Math.floor(sats * 0.95);
      console.log("calculate balance after 0.95-", sats);

      if (sats < 25000 || sats > 24000000) return res.status(400).json({ status: "failure", message: "Insufficient Balance" });

      let calculateOnChainAmount = await reverseSwap(sats)
      console.log("calculateOnChainAmount-->", calculateOnChainAmount)

      const finalRoute = await getDestinationAddress(user.wallet, (calculateOnChainAmount.onchainAmount / 100000000));
      if (!finalRoute?.status) return res.status(400).json({ status: "failure", message: ("error during final route : " + finalRoute.message) });


      const usdcToken = (await userLogIn(1, user.lnbitId))?.data?.token;
      const swap = await createSwapReverse({
        wallet: user.lnbitWalletId,
        asset: "L-BTC/BTC",
        amount: sats,
        direction: "send",
        instant_settlement: true,
        onchain_address: finalRoute.depositAddress,
        feerate: true,
        feerate_value: 0
      }, usdcToken, 1);

      console.log("Step 4: Created swap", swap);
      if (!swap?.status) return res.status(400).json({ status: "failure", message: swap.msg });

      const invoice = await payInvoice({ out: true, bolt11: swap.data.invoice }, usdcToken, 1, user?.lnbitAdminKey);
      console.log("invoice-->", invoice)
      if (!invoice?.status) return res.status(400).json({ status: "failure", message: invoice.msg });

      return res.status(200).json({
        status: "success",
        message: "Transfer Done to Generated sideshift Liquid Address!",
        data: {}
      });
      // ----- Bitcoin Flow -----
    } else if (user.lnbitLinkId_2 === tpoId) {
      console.log("Step 2: Handling Bitcoin flow");
      const stats = await getStats(user.lnbitWalletId_2, masterToken, 1);

      if (!stats.status) return res.status(400).json({ status: "failure", message: stats.msg });

      let sats = Math.floor(Number(stats.data?.[0]?.balance || 0) / 1000);
      console.log("calculate balance-", sats);
      sats = Math.floor(sats * 0.95);
      console.log("calculate balance after 0.95-", sats);

      if (sats < 26000 || sats > 24000000) return res.status(400).json({ status: "failure", message: "Insufficient Balance" });

      const btcToken = (await userLogIn(1, user.lnbitId_2))?.data?.token;
      const swap = await createSwapReverse({
        wallet: user.lnbitWalletId_2,
        asset: "BTC/BTC",
        amount: sats,
        direction: "send",
        instant_settlement: true,
        onchain_address: user.bitcoinWallet,
        feerate: true,
        feerate_value: 0
      }, btcToken, 1);

      console.log("Step 3: Created swap for BTC", swap);
      if (!swap?.status) return res.status(400).json({ status: "failure", message: swap.msg });

      const invoice = await payInvoice({ out: true, bolt11: swap.data.invoice }, btcToken, 1, user?.lnbitAdminKey_2);
      if (invoice?.status) {
        return res.status(200).json({ status: "success", message: "Transfer Done To Bitcoin!", data: invoice.data });
      } else {
        return res.status(400).json({ status: "failure", message: swap.msg });
      }
    }

    // No match found for TPO ID
    return res.status(400).json({ status: "failure", message: "Invalid tpoId for user" });

  } catch (err: any) {
    console.error("API Error in getPayments handler:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

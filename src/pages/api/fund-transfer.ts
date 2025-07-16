import { lambdaInvokeFunction } from "../../lib/apiCall";
import { logIn, getStats, userLogIn, createSwapReverse, payInvoice } from "./lnbit";
import { createLbtcToUsdcShift } from "./sideShiftAI";
import { createReverseSwap, createReverseSwapSocket } from "./boltzSocket"
// Define response type for the BlockCypher API
interface BlockCypherResponse {
  private: string;
  public: string;
  address: string;
  wif: string;
}


const getDestinationAddress = async (walletAddress: any, amount: any, boltzSwapId: any) => {
  try {
    const shift = await createLbtcToUsdcShift(amount, walletAddress, process.env.NEXT_PUBLIC_SIDESHIFT_SECRET_KEY!, process.env.NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID!, process.env.NEXT_PUBLIC_REFUND_ADDRESS!, boltzSwapId) as any;

    console.log("shift--> response", shift)
    return {
      status: true,
      shift,
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
      let createBoltzSwapApi = await createReverseSwap(10000)
      console.log("createBoltzSwapApi-->", createBoltzSwapApi)
      const boltzRouteAdd1 = await lambdaInvokeFunction({
        email: user.email,
        wallet: user.wallet,
        type: "tpos usdc shift",
        data: createBoltzSwapApi.storeData
      }, "madhouse-backend-production-addBoltzTrxn");
      let invoice_amount = 0;
      const feeMultiplier = Number(process.env.NEXT_PUBLIC_FEE_MULTIPLIER) || 1.1; // e.g. 1.1
      const liquidBTCNetworkFee = Number(process.env.NEXT_PUBLIC_LIQUID_BTC_NETWORK_FEE) //200 sats is the averave fee for a Liquid transaction settlements

      const minSwap = Number(process.env.NEXT_PUBLIC_MIN_USDC_SWAP_SATS);
      const maxSwap = Number(process.env.NEXT_PUBLIC_MAX_USDC_SWAP_SATS);


      if (sats >= maxSwap * feeMultiplier) {
        invoice_amount = maxSwap;
      } else if (sats >= minSwap * feeMultiplier) {
        // Ensure room for 10% fee
        invoice_amount = sats / feeMultiplier;
      } else {
        return res.status(400).json({ status: "failure", message: "Insufficient Balance" })
      }
      invoice_amount = Math.floor(invoice_amount)
      console.log("invoice_amount-->", invoice_amount)


      if (!createBoltzSwapApi?.status) return res.status(400).json({ status: "failure", message: ("error creating swap : " + createBoltzSwapApi.message) });
      const shift_amount = parseInt(createBoltzSwapApi.data.onchainAmount) - liquidBTCNetworkFee;
      console.log("shift_amount-->", shift_amount)
      const finalRoute = await getDestinationAddress(user.wallet, (shift_amount / 100000000), createBoltzSwapApi.data.id);

      if (!finalRoute?.status) return res.status(400).json({ status: "failure", message: ("error during final route : " + finalRoute.message) });


      const shiftRouteAdd = await lambdaInvokeFunction({
        email: user.email,
        wallet: user.wallet,
        type: "tpos usdc shift",
        data: finalRoute.shift
      }, "madhouse-backend-production-addSideShiftTrxn");

      console.log("finalRoute-->", finalRoute)
      const usdcToken = (await userLogIn(1, user.lnbitId))?.data?.token;


      const swapSocket = await createReverseSwapSocket(createBoltzSwapApi.data,
        createBoltzSwapApi.preimage, createBoltzSwapApi.keys, finalRoute.depositAddress);

      console.log("Step 4: Created swap", swapSocket);


      if (!swapSocket?.status) return res.status(400).json({ status: "failure", message: swapSocket.message });

      const boltzRouteAdd = await lambdaInvokeFunction({
        email: user.email,
        wallet: user.wallet,
        type: "tpos usdc shift",
        data: createBoltzSwapApi.storeData
      }, "madhouse-backend-production-addBoltzTrxn");

      // pay invoice
      const invoice = await payInvoice({ out: true, bolt11: swapSocket.data.invoice }, usdcToken, 1, user?.lnbitAdminKey);

      console.log("tpos usdc invoice-->", invoice)
      if (!invoice?.status) return res.status(400).json({ status: "failure", message: invoice.msg });




      return res.status(200).json({
        status: "success",
        message: "Successfully Transfered the USDC!",
        data: {}
      });
      // ----- Bitcoin Flow -----
    } else if (user.lnbitLinkId_2 === tpoId) {
      console.log("Step 2: Handling Bitcoin flow");
      const stats = await getStats(user.lnbitWalletId_2, masterToken, 1);

      if (!stats.status) return res.status(400).json({ status: "failure", message: stats.msg });

      let sats = Math.floor(Number(stats.data?.[0]?.balance || 0) / 1000);
      console.log("calculate balance-", sats);
      const feeMultiplier = 1.1;
      const minSwap = Number(process.env.NEXT_PUBLIC_MIN_BTC_SWAP_SATS);
      const maxSwap = Number(process.env.NEXT_PUBLIC_MAX_BTC_SWAP_SATS);


      if (sats >= maxSwap * feeMultiplier) {
        sats = maxSwap;
      } else if (sats >= minSwap * feeMultiplier) {
        // Ensure room for 10% fee
        sats = sats / feeMultiplier;
      } else {
        return res.status(400).json({ status: "failure", message: "Insufficient Balance" })
      }

      console.log("swaping to btc for sats : ", sats);

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
      console.log("tpos bitcoin invoice-->", invoice)
      return res.status(400).json({ status: "failure", message: swap.msg });

      // if (invoice?.status) {
      //   return res.status(200).json({ status: "success", message: "Transfer Done To Bitcoin!", data: invoice.data });
      // } else {
      //   return res.status(400).json({ status: "failure", message: swap.msg });
      // }
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

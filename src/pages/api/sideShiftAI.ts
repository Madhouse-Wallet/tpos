import axios, { AxiosError } from "axios";

// Response interfaces
interface QuoteResponse {
  id: string;
  createdAt: string;
  depositCoin: string;
  depositNetwork: string;
  settleCoin: string;
  settleNetwork: string;
  depositAmount: string;
  settleAmount: string;
  rate: string;
  expiresAt: string;
}

interface ShiftResponse {
  id: string;
  createdAt: string;
  depositCoin: string;
  depositNetwork: string;
  settleCoin: string;
  settleNetwork: string;
  depositAddress: string;
  settleAddress: string;
  depositAmount: string;
  settleAmount: string;
  status: string;
  expiresAt: string;
}

// Fixed IP address as used in curl commands
const FIXED_IP_ADDRESS = process.env.NEXT_PUBLIC_IP_ADDRESS;

/**
 * Combined function to create a USDC to BTC fixed shift in one call
 * @param btcAmount - Amount of USDC to convert
 * @param userBaseWallet - Bitcoin address to receive BTC
 * @param secretKey - SideShift API secret key
 * @param affiliateId - SideShift affiliate ID
 * @returns The shift response containing deposit address and other details
 */

export const createBtcToUsdcShift = async (
  btcAmount: string,
  userBaseWallet: string,
  secretKey: string,
  affiliateId: string
): Promise<ShiftResponse> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        depositCoin: "BTC",
        depositNetwork: "bitcoin",
        settleCoin: "USDC",
        settleNetwork: "base",
        depositAmount: btcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;

    // Step 2: Create a fixed shift using the quote
    const shiftResponse = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      {
        settleAddress: userBaseWallet,
        affiliateId,
        quoteId: quoteData.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return shiftResponse.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `SideShift operation failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};



export const createLbtcToUsdcShift = async (
  btcAmount: string,
  userBaseWallet: string,
  secretKey: string,
  affiliateId: string,
  refundAddress: string,
  boltzSwapId: string
): Promise<ShiftResponse> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        "depositCoin": "btc",
        "depositNetwork": "liquid",
        "settleCoin": "usdc",
        "settleNetwork": "base",
        "settleAmount": null,
        depositAmount: btcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;

    // Step 2: Create a fixed shift using the quote
    const shiftResponse = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      {
        settleAddress: userBaseWallet,
        affiliateId,
        quoteId: quoteData.id,
        "refundAddress": refundAddress,
        "refundMemo": `Failed to settle shift for Wallet Address: ${userBaseWallet} Boltz Reverse Swap ID: ${boltzSwapId}`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return shiftResponse.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `SideShift operation failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};



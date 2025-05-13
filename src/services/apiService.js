/**
 * Creates an invoice using the TPOS API
 * @param {string} tpoId - The ID of the TPOS
 * @param {number} amount - The amount for the invoice
 * @param {string} memo - The memo for the invoice
 * @param {number} [tipAmount=0] - Optional tip amount
 * @param {string} [userLnaddress=''] - Optional lightning address
 * @param {object} [details={}] - Optional details object
 * @returns {Promise<object>} - The API response
 */
export const createTposInvoice = async (
  tpoId,
  amount,
  memo,
  tipAmount = 0,
  userLnaddress = "",
  details = {}
) => {
  try {
    console.log(
      "line-20",
      tpoId,
      amount,
      memo,
      tipAmount,
      userLnaddress,
      details
    );
    if (!tpoId) {
      throw new Error("TPOS ID is required");
    }

    const response = await fetch(
      `https://lnbits.madhousewallet.com/tpos/api/v1/tposs/${tpoId}/invoices`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          memo: memo || "",
          details: details,
          tip_amount: Number(tipAmount),
          user_lnaddress: userLnaddress,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.detail || `API error with status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating TPOS invoice:", error);
    throw error;
  }
};



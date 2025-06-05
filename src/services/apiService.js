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
  // tipAmount = 0,
  userLnaddress = "",
  details = {}
) => {
  try {
    console.log(
      "line-20",
      tpoId,
      amount,
      memo,
      // tipAmount,
      userLnaddress,
      details
    );
    if (!tpoId) {
      throw new Error("TPOS ID is required");
    }

    // Construct the body conditionally
    const body = {
      amount: Number(amount),
      memo: memo || "",
      details: details,
      // tip_amount: Number(tipAmount),
    };

    if (userLnaddress) {
      body.user_lnaddress = userLnaddress;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_LNBITS_URL}/${tpoId}/invoices`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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

export const payInvoice = async (invoice, address) => {
  try {
    try {
      return await fetch(`/api/payInvoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice,
          address,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("data-->", data);
          return data;
        });
    } catch (error) {
      console.log(error);
      return false;
    }
  } catch (error) {
    console.log("sendBtc error-->", error);
    return false;
  }
};

export const getUserByWallet = async (walletAddress) => {
  try {
    const response = await fetch(`/api/users/${walletAddress}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch user details");
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching user by wallet:", error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    console.log("line-121", email);
    const response = await fetch(`/api/userDetail/${email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch user details");
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching user by wallet:", error);
    throw error;
  }
};

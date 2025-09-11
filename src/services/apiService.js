export const createTposInvoice = async (
  tpoId,
  amount,
  memo,
  userLnaddress,
  details
) => {
  try {
    try {
      return await fetch(`/api/createInvoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tpoId,
          amount,
          memo,
          userLnaddress,
          details,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          // console.log("data-->", data);
          return data;
        });
    } catch (error) {
      console.log(error);
      return false;
    }
  } catch (error) {
    console.log("createInvoice error-->", error);
    return false;
  }
};

export const createAppleInvoice = async (
  amount,
  address,
) => {
  try {
    try {
      return await fetch(`/api/createAppleInvoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          address,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          // console.log("data-->", data);
          return data;
        });
    } catch (error) {
      console.log(error);
      return false;
    }
  } catch (error) {
    console.log("createInvoice error-->", error);
    return false;
  }
};

export const getLnAddress = async (tpoId) => {
  try {
    try {
      return await fetch(`/api/getLnAddress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tpoId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          // console.log("data-->", data);
          return data;
        });
    } catch (error) {
      console.log(error);
      return false;
    }
  } catch (error) {
    console.log("createInvoice error-->", error);
    return false;
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
          // console.log("data-->", data);
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

export const getUserByEmail = async (email) => {
  try {
    // console.log("Fetching user by email:", email);
    const response = await fetch(`/api/userDetail?email=${email}`, {
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
    console.error("Error fetching user by email:", error);
    throw error;
  }
};

export const getUserByWallet = async (wallet) => {
  try {
    // console.log("Fetching user by wallet:", wallet);
    const response = await fetch(`/api/userDetail?wallet=${wallet}`, {
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
    console.error("Error fetching user by wallet ID:", error);
    throw error;
  }
};

export const getUserByTposID = async (tposId) => {
  try {
    // console.log("Fetching user by tposId:", tposId);
    const response = await fetch(`/api/userDetail?tposId=${tposId}`, {
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
    console.error("Error fetching user by tpos ID:", error);
    throw error;
  }
};



export const getCurrencyList = async () => {
  try {
    const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching currency data:', error);
    throw error;
  }
};


//lnbitLinkId_2, lnbitLinkId, lnbitWalletId, lnbitWalletId_2, tposId

// fund-transfer
export const fundTrnsfer = async (walletId, tpoId) => {
  try {
    try {
      return await fetch(`/api/fund-transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletId,
          tpoId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          // console.log("data-->", data);
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

export const walletBal = async (
  lnbitLinkId_2,
  lnbitLinkId,
  lnbitWalletId,
  lnbitWalletId_2,
  tposId
) => {
  try {
    try {
      return await fetch(`/api/userWalletBal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lnbitLinkId_2,
          lnbitLinkId,
          lnbitWalletId,
          lnbitWalletId_2,
          tposId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          return data.balance;
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

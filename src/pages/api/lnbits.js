const { ModifierFlags } = require("typescript");
const { Module } = require("webpack");

const payInvoice = async (data, token, type = 1, apiKey) => {
  try {
    let backendUrl = "";
    // let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL;
      // apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY;
    } else {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL_2;
      // apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${backendUrl}api/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    if (response?.payment_hash) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const userLogIn = async (type = 1, usr) => {
  try {
    let backendUrl = "";
    let username = "";
    let password = "";
    if (type == 1) {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL;
      username = process.env.NEXT_PUBLIC_LNBIT_USERNAME;
      password = process.env.NEXT_PUBLIC_LNBIT_PASS;
    } else {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL_2;
      username = process.env.NEXT_PUBLIC_LNBIT_USERNAME_2;
      password = process.env.NEXT_PUBLIC_LNBIT_PASS_2;
    }
    // Fixed IP address as used in curl commands
    let response = await fetch(`${backendUrl}api/v1/auth/usr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usr,
      }),
    });
    response = await response.json();
    if (response?.access_token) {
      return {
        status: true,
        data: { token: response?.access_token },
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const getPayments = async (
  walletId,
  token,
  type = 1,
  fromDate = null,
  toDate = null,
  tag = null,
  apiKey = null
) => {
  console.log("line-510", fromDate, toDate, apiKey);
  try {
    let backendUrl = "";
    // let apiKey = "";

    if (type === 1) {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL;
      // apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY;
    } else {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL_2;
      // apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY_2;
    }

    const params = new URLSearchParams({
      // wallet_id: walletId,
      sortby: "time",
      direction: "desc",
      limit: 10,
    });

    if (fromDate) {
      const formattedFromDate = `${fromDate}T00:00:00`;
      params.append("time[ge]", formattedFromDate);
    }

    if (toDate) {
      const formattedToDate = `${toDate}T23:59:59`;
      params.append("time[le]", formattedToDate);
    }

    if (tag) {
      params.append("tag", tag); // Only added if provided
    }

    const url = `${backendUrl}api/v1/payments/paginated?${params.toString()}`;
    console.log("line-542", url);

    let response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
    });

    response = await response.json();

    console.log("line-771", response);
    if (response?.data) {
      return {
        status: true,
        data: response?.data,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const logIn = async (type = 1) => {
  try {
    let backendUrl = "";
    let username = "";
    let password = "";
    if (type == 1) {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL;
      username = process.env.NEXT_PUBLIC_LNBIT_USERNAME;
      password = process.env.NEXT_PUBLIC_LNBIT_PASS;
    } else {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL_2;
      username = process.env.NEXT_PUBLIC_LNBIT_USERNAME_2;
      password = process.env.NEXT_PUBLIC_LNBIT_PASS_2;
    }
    // Fixed IP address as used in curl commands
    let response = await fetch(`${backendUrl}api/v1/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    response = await response.json();
    // console.log("response login",response)
    if (response?.access_token) {
      return {
        status: true,
        data: { token: response?.access_token },
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

module.exports = {
  payInvoice,
  userLogIn,
  getPayments,
  logIn,
};

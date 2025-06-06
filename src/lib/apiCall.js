import axios from "axios";

export const createTposInvoice = async (data) => {
  try {
    return await fetch(
      `${process.env.NEXT_PUBLIC_LAMBDA_API_URL}api/v1/create-tpos-invoice`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const payTposInvoice = async (data) => {
  try {
    return await fetch(
      `${process.env.NEXT_PUBLIC_LAMBDA_API_URL}api/v1/tpos-pay-invoice`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getTposTrxn = async (data) => {
  try {
    return await fetch(
      `${process.env.NEXT_PUBLIC_LAMBDA_API_URL}api/v1/get-tpos-trxn`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("line-52", data);
        return data;
      });
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getUser = async (data) => {
  try {
    return await fetch(
      `${process.env.NEXT_PUBLIC_LAMBDA_API_URL}api/v1/getUser`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
  } catch (error) {
    console.log(error);
    return false;
  }
};

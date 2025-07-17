import axios from "axios";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
const REGION = process.env.NEXT_PUBLIC_AWS_S3_REGION;


export const lambdaInvokeFunction = async (payload, FUNCTION_NAME) => {
  const lambdaClient = new LambdaClient({
    region: REGION,
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_KEY,
    },
  });

  const command = new InvokeCommand({
    FunctionName: FUNCTION_NAME,
    Payload: new TextEncoder().encode(JSON.stringify(payload)),
    LogType: "Tail",
  });

  try {
    const response = await lambdaClient.send(command);
    const result = new TextDecoder().decode(response.Payload);

    if (response.LogResult) {
      // console.log("Lambda logs:", Buffer.from(response.LogResult, "base64").toString("ascii"));
    }

    // return JSON.parse(result);
    const parsed = JSON.parse(result);
    if (parsed.body) {
      parsed.body = JSON.parse(parsed.body);
    }

    return parsed.body || parsed;


  } catch (error) {
    console.log("error lambdaInvokeFunction ---->", error)
  }
}
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
        // console.log("line-52", data);
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

 
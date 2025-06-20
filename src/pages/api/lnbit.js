const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const REGION = process.env.NEXT_PUBLIC_AWS_S3_REGION;

const lambdaInvokeFunction = async (payload, FUNCTION_NAME) => {
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
            console.log(
                "Lambda logs:",
                Buffer.from(response.LogResult, "base64").toString("ascii")
            );
        }

        const parsed = JSON.parse(result);
        if (parsed.body) {
            parsed.body = JSON.parse(parsed.body);
        }

        return parsed.body || parsed;
    } catch (error) {
        console.log("error lambdaInvokeFunction ---->", error);
        return {
            status: false,
            msg: "Lambda call failed",
        };
    }
};

const logIn = async (type = 1) => {
    try {
        const apiResponse = await lambdaInvokeFunction(
            { name: "logIn", data: [type] },
            "madhouse-backend-production-lnbitCalls"
        );
        // console.log("logIn apiResponse lambdaInvokeFunction -->", apiResponse?.data)
        if (apiResponse?.status == "success") {
            return apiResponse?.data;
        } else {
            return {
                status: false,
                msg: "fetch failed",
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
        const apiResponse = await lambdaInvokeFunction(
            { name: "userLogIn", data: [type, usr] },
            "madhouse-backend-production-lnbitCalls"
        );
        // console.log("userLogIn apiResponse lambdaInvokeFunction -->", apiResponse?.data)
        if (apiResponse?.status == "success") {
            return apiResponse?.data;
        } else {
            return {
                status: false,
                msg: "fetch failed",
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

const getStats = async (walletId, token, type = 1) => {
    try {
        const apiResponse = await lambdaInvokeFunction(
            { name: "getStats", data: [walletId, token, type] },
            "madhouse-backend-production-lnbitCalls"
        );
        // console.log("getStats apiResponse lambdaInvokeFunction -->", apiResponse?.data)
        if (apiResponse?.status == "success") {
            return apiResponse?.data;
        } else {
            return {
                status: false,
                msg: "fetch failed",
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

const createSwapReverse = async (data, token, type = 1) => {
    try {
        const apiResponse = await lambdaInvokeFunction(
            { name: "createSwapReverse", data: [data, token, type] },
            "madhouse-backend-production-lnbitCalls"
        );
        // console.log("createSwapReverse apiResponse lambdaInvokeFunction -->", apiResponse?.data)
        if (apiResponse?.status == "success") {
            return apiResponse?.data;
        } else {
            return {
                status: false,
                msg: "fetch failed",
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

const payInvoice = async (data, token, type = 1, apiKey) => {
    try {
        const apiResponse = await lambdaInvokeFunction(
            { name: "payInvoice", data: [data, token, type, apiKey] },
            "madhouse-backend-production-lnbitCalls"
        );
        // console.log("payInvoice apiResponse lambdaInvokeFunction -->", apiResponse?.data)
        if (apiResponse?.status == "success") {
            return apiResponse?.data;
        } else {
            return {
                status: false,
                msg: "fetch failed",
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
    logIn,
    userLogIn,
    getStats,
    createSwapReverse,
    payInvoice
};

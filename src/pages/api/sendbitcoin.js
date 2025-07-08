import axios from "axios";
const bitcoin = require("bitcoinjs-lib");
const secp = require("@bitcoinerlab/secp256k1");
const ecfactory = require("ecpair");
const ECPair = ecfactory.ECPairFactory(secp);

export async function sendBitcoinTransaction({
  fromAddress,
  toAddress,
  amountSatoshi,
  privateKeyHex,
  network = "main",
}) {
  try {
    if (!fromAddress || !toAddress || !amountSatoshi || !privateKeyHex) {
      throw new Error("Missing required fields: fromAddress, toAddress, amountSatoshi, privateKeyHex");
    }

    const keyPair = ECPair.fromWIF(privateKeyHex, bitcoin.networks.bitcoin);
    const privateKeyWallet = keyPair.privateKey.toString("hex");

    const cleanPrivateKey = privateKeyWallet;

    if (cleanPrivateKey.length !== 64) {
      throw new Error(`Invalid private key length: Expected 64 hex characters but received ${cleanPrivateKey.length}`);
    }

    const baseUrl = `https://api.blockcypher.com/v1/btc/${network}`;
    const keyBuffer = Buffer.from(cleanPrivateKey, "hex");
    const keys = ECPair.fromPrivateKey(keyBuffer);

    const newTx = {
      inputs: [{ addresses: [fromAddress] }],
      outputs: [{ addresses: [toAddress], value: amountSatoshi }],
    };

    const txCreateResponse = await axios.post(`${baseUrl}/txs/new`, newTx);
    const tmpTx = txCreateResponse.data;

    if (!tmpTx.tosign || tmpTx.tosign.length === 0) {
      throw new Error("No data to sign received from BlockCypher");
    }

    tmpTx.pubkeys = [];
    tmpTx.signatures = tmpTx.tosign.map((tosignHex) => {
      tmpTx.pubkeys.push(keys.publicKey.toString("hex"));

      const hashBuffer = Buffer.from(tosignHex, "hex");
      const signature = keys.sign(hashBuffer);

      const derSig = bitcoin.script.signature.encode(
        signature,
        bitcoin.Transaction.SIGHASH_ALL
      );

      return derSig.toString("hex").slice(0, -2);
    });

    const txSendResponse = await axios.post(`${baseUrl}/txs/send`, tmpTx);
    const finalTx = txSendResponse.data;

    return {
      success: true,
      transactionHash: finalTx.tx.hash,
      details: finalTx,
    };
  } catch (error) {
    console.error("sendBitcoinTransaction Error:", error);

    return {
      success: false,
      error: error.response ? error.response.data : error.message,
      errorDetails: {
        message: error.message,
        stack: error.stack,
        response: error.response
          ? {
            status: error.response.status,
            data: error.response.data,
          }
          : null,
      },
    };
  }
}

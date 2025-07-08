
// Polyfill for crypto.getRandomValues in Node.js
import { webcrypto } from 'crypto';
// @ts-ignore
if (typeof globalThis.crypto === 'undefined') {
  // @ts-ignore
  globalThis.crypto = webcrypto;
}
import axios from 'axios';
import { randomBytes } from 'crypto';
import { ECPairFactory } from 'ecpair';
import { crypto } from 'liquidjs-lib';
import * as ecc from 'tiny-secp256k1';

import {
  init,
} from 'boltz-core/dist/lib/liquid';

// Endpoint of the Boltz instance to be used
const endpoint = 'https://api.boltz.exchange';
export const reverseSwap = async (invoiceAmount: any) => {
  try {
    // await init();
    const zkp = (await import("@vulpemventures/secp256k1-zkp")).default;
    const secp = await zkp();

    //   init(secp);
    // const zkp = await Secp256k1ZKP();
    init(secp);

    // Create a random preimage for the swap; has to have a length of 32 bytes
    const preimage = randomBytes(32);
    const keys = ECPairFactory(ecc).makeRandom();

    // Create a Reverse Swap
    const createdResponse = (
      await axios.post(`${endpoint}/v2/swap/reverse`, {
        invoiceAmount,
        to: 'L-BTC',
        from: 'BTC',
        claimPublicKey: Buffer.from(keys.publicKey).toString('hex'),
        preimageHash: crypto.sha256(preimage).toString('hex'),
        //address: destinationAddress,
      })
    ).data;

    console.log('Swap quote');
    // console.log(createdResponse);
    // console.log('Created swap');
    // console.log(createdResponse);
    return createdResponse;
  } catch (error) {
    console.log("error-->", error)
    return false
  }

};

// (async () => {
//   await reverseSwap();
// })();

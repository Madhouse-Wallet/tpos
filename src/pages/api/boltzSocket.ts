
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
import { crypto, Transaction, address, networks } from 'liquidjs-lib';
import * as ecc from 'tiny-secp256k1';
import {
  Musig,
  OutputType,
  SwapTreeSerializer,
  detectSwap,
  targetFee,
} from 'boltz-core';
import {
  TaprootUtils,
  constructClaimTransaction,
  init,
} from 'boltz-core/dist/lib/liquid';
import ws from 'ws';

// Endpoint of the Boltz instance to be used
const endpoint = 'https://api.boltz.exchange';
const destinationAddress = 'lq1qqvqkkuu3tx8j8zuqn3vegkgcpwk6ftpfr9wne3uddzqgs6q7dm0smv9p9kdl53s95xgsn2y0ghwm89jgn3n5zncf528j32t4f';
const sideshift = 'https://sideshift.ai'
const lnbits = 'http://ec2-34-233-145-255.compute-1.amazonaws.com';
const usdcAddress = '0x240Bc1B772053fA84225F5c247A3a27D3b723ec1'
const webSocketEndpoint = 'wss://api.boltz.exchange/v2/ws'
// Amount you want to swap
const invoiceAmount = 170//10_000;
const network = networks.liquid;
export const monitorSwap = async (createdResponse: any) => {
  try {
    // await init();
  console.log("createdResponse-->",createdResponse)
  const zkp = (await import("@vulpemventures/secp256k1-zkp")).default;
  const secp = await zkp();

  //   init(secp);
  // const zkp = await Secp256k1ZKP();
  init(secp);

  // Create a random preimage for the swap; has to have a length of 32 bytes
  const preimage = randomBytes(32);
  const keys = ECPairFactory(ecc).makeRandom();

   


  // Create a WebSocket and subscribe to updates for the created swap
  const webSocket = new ws(`${webSocketEndpoint}/v2/ws`);
  webSocket.on('open', () => {
    webSocket.send(
      JSON.stringify({
        op: 'subscribe',
        channel: 'swap.update',
        args: [createdResponse.boltz_id],
      }),
    );
  });

  webSocket.on('message', async (rawMsg: any) => {
    const msg = JSON.parse(rawMsg.toString('utf-8'));
    if (msg.event !== 'update') {
      return;
    }

    console.log('Got WebSocket update');
    console.log(msg);
    console.log();

    switch (msg.args[0].status) {
      // "swap.created" means Boltz is waiting for the invoice to be paid
      case 'swap.created': {
        console.log('Waiting invoice to be paid');
        // const boltzPublicKey = Buffer.from(
        //   createdResponse.refundPublicKey,
        //   'hex',
        // );
        // console.log("boltzPublicKey-->", boltzPublicKey)
        // // Create a musig signing session and tweak it with the Taptree of the swap scripts
        // const musig = new Musig(secp, keys, randomBytes(32), [
        //   boltzPublicKey,
        //   keys.publicKey,
        // ]);
        // console.log("musig", musig)
        // const tweakedKey = TaprootUtils.tweakMusig(
        //   musig,
        //   SwapTreeSerializer.deserializeSwapTree(createdResponse.swapTree).tree,
        // );
        // console.log("tweakedKey", tweakedKey)
        // Parse the lockup transaction and find the output relevant for the swap
        // console.log("msg.args[0]-->",msg.args[0])
        // const lockupTx = Transaction.fromHex(msg.args[0].transaction.hex);
        // console.log("lockupTx-->",lockupTx)
        // const swapOutput = detectSwap(tweakedKey, lockupTx);
        // console.log("swapOutput-->", swapOutput)
        // if (swapOutput === undefined) {
        //   console.error('No swap output found in lockup transaction');
        //   return;
        // }

        break;
      }

      // "transaction.mempool" means that Boltz sent an onchain transaction
      case 'transaction.mempool': {
        console.log('Creating claim transaction');

        const boltzPublicKey = Buffer.from(
          createdResponse.refundPublicKey,
          'hex',
        );
        console.log("boltzPublicKey-->", boltzPublicKey)
        // Create a musig signing session and tweak it with the Taptree of the swap scripts
        const musig = new Musig(secp, keys, randomBytes(32), [
          boltzPublicKey,
          (keys as any).publicKey,
        ]);
        console.log("musig-->", musig)
        const tweakedKey = TaprootUtils.tweakMusig(
          musig,
          SwapTreeSerializer.deserializeSwapTree(createdResponse.swapTree).tree,
        );
        console.log("tweakedKey-->", tweakedKey)
        // Parse the lockup transaction and find the output relevant for the swap
        console.log("msg.args[0-->", msg.args[0])
        const lockupTx = Transaction.fromHex(msg.args[0].transaction.hex);
        console.log("lockupTx-->", lockupTx)
        const swapOutput = detectSwap(tweakedKey, lockupTx);
        console.log("swapOutput-->", swapOutput)
        if (swapOutput === undefined) {
          console.error('No swap output found in lockup transaction');
          return;
        }

        // Create a claim transaction to be signed cooperatively via a key path spend
        const claimTx = targetFee(0.1, (fee: any) =>
          constructClaimTransaction(
            [
              {
                ...swapOutput,
                keys,
                preimage,
                cooperative: true,
                type: OutputType.Taproot,
                txHash: lockupTx.getHash(),
                blindingPrivateKey: Buffer.from(
                  createdResponse.blindingKey,
                  'hex',
                ),
              },
            ],
            address.toOutputScript(destinationAddress, network),
            fee,
            false,
            network,
            address.fromConfidential(destinationAddress).blindingKey,
          ),
        );
        console.log("claimTx-->", claimTx)
        // Get the partial signature from Boltz
        const boltzSig = (
          await axios.post(
            `${endpoint}/v2/swap/reverse/${createdResponse.boltz_id}/claim`,
            {
              index: 0,
              transaction: claimTx.toHex(),
              preimage: preimage.toString('hex'),
              pubNonce: Buffer.from(musig.getPublicNonce()).toString('hex'),
            },
          )
        ).data;
        console.log("boltzSig-->", boltzSig)
        // Aggregate the nonces
        musig.aggregateNonces([
          [boltzPublicKey, Buffer.from(boltzSig.pubNonce, 'hex')],
        ]);

        // Initialize the session to sign the claim transaction
        musig.initializeSession(
          claimTx.hashForWitnessV1(
            0,
            [swapOutput.script],
            [{ value: swapOutput.value, asset: swapOutput.asset }],
            Transaction.SIGHASH_DEFAULT,
            network.genesisBlockHash,
          ),
        );

        // Add the partial signature from Boltz
        musig.addPartial(
          boltzPublicKey,
          Buffer.from(boltzSig.partialSignature, 'hex'),
        );

        // Create our partial signature
        musig.signPartial();

        // Witness of the input to the aggregated signature
        claimTx.ins[0].witness = [musig.aggregatePartials()];

        // Broadcast the finalized transaction
        let dt = await axios.post(`${endpoint}/v2/chain/L-BTC/transaction`, {
          hex: claimTx.toHex(),
        });
        console.log("final-->", dt)
        break;
      }

      case 'invoice.settled':
        console.log('Swap successful');
        webSocket.close();
        break;
    }
  });



  // //    // Create Shift
  // const shiftquoteResponse = (
  //   await axios.post(`${sideshift}/api/v2/quotes`, {
  //       "depositCoin": "btc",
  //       "depositNetwork": "liquid",
  //       "settleCoin": "usdc",
  //       "settleNetwork": "base",
  //       "depositAmount": `${Number(boltzResponse.onchainAmount)/100_000_000}`,
  //       "settleAmount": null,
  //       "affiliateId": "rNtpPduGPW"
  //     })
  // ).data;
  // console.log('Sideshift Quote');
  // console.log(shiftquoteResponse);
  // console.log();

  //   const fixedshiftResponse = (
  //   await axios.post(`${sideshift}/api/v2/shifts/fixed`, {
  //         "settleAddress": usdcAddress,
  //         "affiliateId": "rNtpPduGPW",
  //         "quoteId": shiftquoteResponse.id,
  //         "refundAddress": liquidBTC
  //       }
  //   )
  //       ).data;
  // console.log('Sideshift Shift');
  // console.log(fixedshiftResponse);
  // console.log();

  //  // Create a Reverse Swap
  // const lnbitsResponse = (
  //   await axios.post(`${lnbits}/boltz/api/v1/swap/reverse`, {
  //       "wallet": "4e70c678127b408094b651d945ae5e87",
  //       "asset": "L-BTC/BTC",
  //       "amount": 150,
  //       "direction": "send",
  //       "instant_settlement": true,
  //       "onchain_address": liquidBTC, //fixedshiftResponse.depositAddress,
  //       "feerate": false,
  //       "feerate_value": 0
  //     },{
  //       headers: {
  //   'Content-Type': 'application/json',
  //   'X-API-KEY': 'b292ba2de84143fd980aef139c7bfe07',
  // }
  //     })
  // ).data;
  // console.log('Swap Created');
  // console.log(lnbitsResponse);
  // console.log();



  } catch (error) {
    console.log("error-->",error)
  }
  

}


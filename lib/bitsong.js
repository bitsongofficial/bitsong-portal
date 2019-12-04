/*
    Developed / Developing by BasBlock / BitSong
    [WARNING] This library is under ACTIVE DEVELOPMENT and should be treated as alpha version. We will remove this warning when we have a release that is stable, secure, and propoerly tested.
*/
import fetch from "node-fetch";
import bip39 from "bip39";
import bip32 from "bip32";
import bech32 from "bech32";
import secp256k1 from "secp256k1";
import crypto from "crypto";
import bitcoinjs from "bitcoinjs-lib";
import createHash from "create-hash";
import CryptoJS from "crypto-js";

const entropySalt = "!!!___!!!YOU COULD REPLACE THIS WITH ANYTHING!!!___!!!";
const keySize = 256;
const iterations = 100;

function sortObject(obj) {
  if (obj === null) return null;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sortObject);
  const sortedKeys = Object.keys(obj).sort();
  const result = {};
  sortedKeys.forEach(key => {
    result[key] = sortObject(obj[key]);
  });
  return result;
}

const getRndInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

class Wallet {
  constructor(url, chainId) {
    this.url = url;
    this.chainId = chainId;
    this.path = "m/44'/118'/0'/0/0";
    this.bech32MainPrefix = process.env.BECH32_PREFIX;

    if (!this.url) {
      throw new Error("url object was not set or invalid");
    }
    if (!this.chainId) {
      throw new Error("chainId object was not set or invalid");
    }
  }

  sha2(data) {
    return createHash("sha256")
      .update(data)
      .digest();
  }

  xor(a, b) {
    if (!Buffer.isBuffer(a)) a = Buffer(a);
    if (!Buffer.isBuffer(b)) b = Buffer(b);
    let res = [];
    let length = Math.min(a.length, b.length);
    for (let i = 0; i < length; i++) {
      res.push(a[i] ^ b[i]);
    }
    return Buffer(res);
  }

  generateMnemonic() {
    let mnemonic = bip39.generateMnemonic();
    let entropyHex = bip39.mnemonicToEntropy(mnemonic);
    let entropyBuf = new Buffer(entropyHex, "hex");
    let salt = this.sha2(entropySalt);
    salt = salt.slice(0, 16);
    entropyBuf = this.xor(entropyBuf, new Buffer(salt));
    entropyHex = entropyBuf.toString("hex");
    mnemonic = bip39.entropyToMnemonic(entropyHex);

    return mnemonic;
  }

  getAccounts(address) {
    const accountsApi = "/auth/accounts/";

    return fetch(this.url + accountsApi + address).then(response =>
      response.json()
    );
  }

  getAddress(mnemonic) {
    if (typeof mnemonic !== "string") {
      throw new Error("mnemonic expects a string");
    }
    const seed = bip39.mnemonicToSeed(mnemonic);
    const node = bip32.fromSeed(seed);
    const child = node.derivePath(this.path);
    const words = bech32.toWords(child.identifier);
    return bech32.encode(this.bech32MainPrefix, words);
  }

  getECPairPriv(mnemonic) {
    if (typeof mnemonic !== "string") {
      throw new Error("mnemonic expects a string");
    }
    const seed = bip39.mnemonicToSeed(mnemonic);
    const node = bip32.fromSeed(seed);
    const child = node.derivePath(this.path);
    const ecpair = bitcoinjs.ECPair.fromPrivateKey(child.privateKey, {
      compressed: false
    });
    return ecpair.privateKey;
  }

  getECPairPrivFromPK(privateKey) {
    if (typeof privateKey !== "string") {
      throw new Error("privateKey expects a string");
    }

    const buf = Buffer.from(privateKey, "hex");

    const ecpair = bitcoinjs.ECPair.fromPrivateKey(buf, {
      compressed: false
    });

    return ecpair.privateKey;
  }

  encrypt(message, password) {
    const salt = CryptoJS.lib.WordArray.random(128 / 8);

    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: keySize / 32,
      iterations: iterations
    });

    const iv = CryptoJS.lib.WordArray.random(128 / 8);

    const encrypted = CryptoJS.AES.encrypt(message, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });

    // salt, iv will be hex 32 in length
    // append them to the ciphertext for use  in decryption
    const transitmessage =
      salt.toString() + iv.toString() + encrypted.toString();
    return transitmessage;
  }

  decrypt(transitMessage, password) {
    const salt = CryptoJS.enc.Hex.parse(transitMessage.substr(0, 32));
    const iv = CryptoJS.enc.Hex.parse(transitMessage.substr(32, 32));
    const encrypted = transitMessage.substring(64);

    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: keySize / 32,
      iterations: iterations
    });

    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    }).toString(CryptoJS.enc.Utf8);

    return decrypted;
  }

  getPubKeyBase64(ecpairPriv) {
    const pubKeyByte = secp256k1.publicKeyCreate(ecpairPriv);
    return Buffer.from(pubKeyByte, "binary").toString("base64");
  }

  convertStringToBytes(str) {
    if (typeof str !== "string") {
      throw new Error("str expects a string");
    }
    var myBuffer = [];
    var buffer = Buffer.from(str, "utf8");
    for (var i = 0; i < buffer.length; i++) {
      myBuffer.push(buffer[i]);
    }
    return myBuffer;
  }

  NewStdMsg(msgs, account_number, sequence, memo = "") {
    const stdSignMsg = new Object();
    const gas = msgs.length > 1 ? 1000000 : 200000;

    stdSignMsg.json = {
      account_number: String(account_number),
      chain_id: this.chainId,
      fee: {
        amount: [
          {
            amount: String(100000), // 0.01btsg
            denom: "ubtsg"
          }
        ],
        gas: String(gas)
      },
      memo: memo,
      msgs: msgs,
      sequence: String(sequence)
    };

    stdSignMsg.bytes = this.convertStringToBytes(
      JSON.stringify(sortObject(stdSignMsg.json))
    );

    return stdSignMsg;
  }

  sign(stdSignMsg, ecpairPriv, modeType = "sync") {
    // The supported return types includes "block"(return after tx commit), "sync"(return afer CheckTx) and "async"(return right away).
    let signMessage = new Object();
    signMessage = stdSignMsg.json;

    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(sortObject(signMessage)))
      .digest("hex");
    const buf = Buffer.from(hash, "hex");

    let signObj = secp256k1.sign(buf, ecpairPriv);
    var signatureBase64 = Buffer.from(signObj.signature, "binary").toString(
      "base64"
    );
    let signedTx = new Object();

    signedTx = {
      tx: {
        msg: stdSignMsg.json.msgs,
        fee: stdSignMsg.json.fee,
        signatures: [
          {
            signature: signatureBase64,
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: this.getPubKeyBase64(ecpairPriv)
            }
          }
        ],
        memo: stdSignMsg.json.memo
      },
      mode: modeType
    };

    return signedTx;
  }

  broadcast(signedTx) {
    const broadcastApi = "/txs";

    return fetch(this.url + broadcastApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(signedTx)
    }).then(response => response.json());
  }

  // Transactions
  async publish(
    from,
    title,
    ipfsHash,
    redistibutionSplitRate,
    mnemonicDecrypted
  ) {
    const account = await this.getAccounts(from);
    const account_number = account.result.value.account_number;
    const sequence = account.result.value.sequence;
    const ecpairPriv = await this.getECPairPriv(mnemonicDecrypted);

    const msgs = [
      {
        type: "song/Publish",
        value: {
          title: title,
          content: ipfsHash,
          owner: from,
          total_reward: String(0),
          redistribution_split_rate: String(redistibutionSplitRate)
        }
      }
    ];

    const stdSignMsg = await this.NewStdMsg(msgs, account_number, sequence, "");
    const signedTx = await this.sign(stdSignMsg, ecpairPriv, "block");

    return await this.broadcast(signedTx);
  }

  /* Test functions */
  async artistCreate(name, from, pk) {
    const account = await this.getAccounts(from);
    const account_number = account.result.value.account_number;
    const sequence = account.result.value.sequence;
    const ecpairPriv = await this.getECPairPrivFromPK(pk);

    const msgs = [
      {
        type: "go-bitsong/MsgCreateArtist",
        value: {
          name: name,
          owner: from
        }
      }
    ];

    const stdSignMsg = await this.NewStdMsg(
      msgs,
      account_number,
      sequence,
      "- BitSong Artist Portal"
    );

    const signedTx = await this.sign(stdSignMsg, ecpairPriv, "block");

    return await this.broadcast(signedTx);
  }

  async verifyArtistProposal(id, title, description, from, pk) {
    const account = await this.getAccounts(from);
    const account_number = account.result.value.account_number;
    const sequence = account.result.value.sequence;
    const ecpairPriv = await this.getECPairPrivFromPK(pk);

    const msgs = [
      {
        type: "cosmos-sdk/MsgSubmitProposal",
        value: {
          content: {
            type: "go-bitsong/ArtistVerifyProposal",
            value: {
              title: title,
              description: description,
              id: id
            }
          },
          initial_deposit: [
            {
              denom: "ubtsg",
              amount: "10000"
            }
          ],
          proposer: from
        }
      }
    ];

    const stdSignMsg = await this.NewStdMsg(
      msgs,
      account_number,
      sequence,
      "- BitSong Artist Portal"
    );

    const signedTx = await this.sign(stdSignMsg, ecpairPriv, "block");

    return await this.broadcast(signedTx);
  }

  async albumCreate(
    title,
    album_type,
    release_date,
    release_date_precision,
    from,
    pk
  ) {
    const account = await this.getAccounts(from);
    const account_number = account.result.value.account_number;
    const sequence = account.result.value.sequence;
    const ecpairPriv = await this.getECPairPrivFromPK(pk);

    const msgs = [
      {
        type: "go-bitsong/MsgCreateAlbum",
        value: {
          title: title,
          album_type: album_type,
          release_date: release_date,
          release_date_precision: release_date_precision,
          owner: from
        }
      }
    ];

    const stdSignMsg = await this.NewStdMsg(
      msgs,
      account_number,
      sequence,
      "- BitSong Artist Portal"
    );

    const signedTx = await this.sign(stdSignMsg, ecpairPriv, "block");

    return await this.broadcast(signedTx);
  }

  async verifyAlbumProposal(id, title, description, from, pk) {
    const account = await this.getAccounts(from);
    const account_number = account.result.value.account_number;
    const sequence = account.result.value.sequence;
    const ecpairPriv = await this.getECPairPrivFromPK(pk);

    const msgs = [
      {
        type: "cosmos-sdk/MsgSubmitProposal",
        value: {
          content: {
            type: "go-bitsong/AlbumVerifyProposal",
            value: {
              title: title,
              description: description,
              id: id
            }
          },
          initial_deposit: [
            {
              denom: "ubtsg",
              amount: "10000"
            }
          ],
          proposer: from
        }
      }
    ];

    const stdSignMsg = await this.NewStdMsg(
      msgs,
      account_number,
      sequence,
      "- BitSong Artist Portal"
    );

    const signedTx = await this.sign(stdSignMsg, ecpairPriv, "block");

    return await this.broadcast(signedTx);
  }

  async trackCreate(title, from, pk) {
    const account = await this.getAccounts(from);
    const account_number = account.result.value.account_number;
    const sequence = account.result.value.sequence;
    const ecpairPriv = await this.getECPairPrivFromPK(pk);

    const msgs = [
      {
        type: "go-bitsong/MsgCreateTrack",
        value: {
          title: title,
          owner: from
        }
      }
    ];

    const stdSignMsg = await this.NewStdMsg(
      msgs,
      account_number,
      sequence,
      "- BitSong Artist Portal"
    );

    const signedTx = await this.sign(stdSignMsg, ecpairPriv, "block");

    return await this.broadcast(signedTx);
  }

  async verifyTrackProposal(id, title, description, from, pk) {
    const account = await this.getAccounts(from);
    const account_number = account.result.value.account_number;
    const sequence = account.result.value.sequence;
    const ecpairPriv = await this.getECPairPrivFromPK(pk);

    const msgs = [
      {
        type: "cosmos-sdk/MsgSubmitProposal",
        value: {
          content: {
            type: "go-bitsong/TrackVerifyProposal",
            value: {
              title: title,
              description: description,
              id: id
            }
          },
          initial_deposit: [
            {
              denom: "ubtsg",
              amount: "10000"
            }
          ],
          proposer: from
        }
      }
    ];

    const stdSignMsg = await this.NewStdMsg(
      msgs,
      account_number,
      sequence,
      "- BitSong Artist Portal"
    );

    const signedTx = await this.sign(stdSignMsg, ecpairPriv, "block");

    return await this.broadcast(signedTx);
  }

  async sendFaucet(recipient) {
    const account = await this.getAccounts(process.env.FAUCET_ADDRESS);
    const account_number = account.result.value.account_number;
    const sequence = account.result.value.sequence;
    const ecpairPriv = await this.getECPairPriv(process.env.FAUCET_SEED);
    const amount = getRndInteger(100000, 1000000);

    const msgs = [
      {
        type: "cosmos-sdk/MsgSend",
        value: {
          amount: [
            {
              amount: String(amount),
              denom: process.env.DENOM
            }
          ],
          from_address: process.env.FAUCET_ADDRESS,
          to_address: recipient
        }
      }
    ];

    const stdSignMsg = await this.NewStdMsg(msgs, account_number, sequence, "");
    const signedTx = await this.sign(
      stdSignMsg,
      ecpairPriv,
      process.env.SIGN_MODE_TYPE
    );

    return await this.broadcast(signedTx);
  }

  async send(from, to, amount, pk) {
    const account = await this.getAccounts(from);
    const account_number = account.result.value.account_number;
    const sequence = account.result.value.sequence;
    const ecpairPriv = await this.getECPairPrivFromPK(pk);

    const msgs = [
      {
        type: "cosmos-sdk/MsgSend",
        value: {
          amount: [
            {
              amount: String(amount),
              denom: process.env.DENOM
            }
          ],
          from_address: from,
          to_address: to
        }
      }
    ];

    const stdSignMsg = await this.NewStdMsg(msgs, account_number, sequence, "");
    const signedTx = await this.sign(
      stdSignMsg,
      ecpairPriv,
      process.env.SIGN_MODE_TYPE
    );

    return await this.broadcast(signedTx);
  }

  async delegate(from, validator, amount, mnemonicDecrypted) {
    const account = await this.getAccounts(from);
    const account_number = account.result.value.account_number;
    const sequence = account.result.value.sequence;
    const ecpairPriv = await this.getECPairPriv(mnemonicDecrypted);

    const msgs = [
      {
        type: "cosmos-sdk/MsgDelegate",
        value: {
          amount: {
            amount: String(amount),
            denom: "ubtsg"
          },
          delegator_address: from,
          validator_address: validator
        }
      }
    ];

    const stdSignMsg = await this.NewStdMsg(msgs, account_number, sequence, "");
    const signedTx = await this.sign(stdSignMsg, ecpairPriv, "block");

    return await this.broadcast(signedTx);
  }

  async undelegate(from, validator, amount, mnemonicDecrypted) {
    const account = await this.getAccounts(from);
    const account_number = account.result.value.account_number;
    const sequence = account.result.value.sequence;
    const ecpairPriv = await this.getECPairPriv(mnemonicDecrypted);

    const msgs = [
      {
        type: "cosmos-sdk/MsgUndelegate",
        value: {
          amount: {
            amount: String(amount),
            denom: process.env.DENOM
          },
          delegator_address: from,
          validator_address: validator
        }
      }
    ];

    const stdSignMsg = await this.NewStdMsg(msgs, account_number, sequence, "");
    const signedTx = await this.sign(
      stdSignMsg,
      ecpairPriv,
      process.env.SIGN_MODE_TYPE
    );

    return await this.broadcast(signedTx);
  }

  async withdrawAllRewards(from, validators, mnemonicDecrypted) {
    const account = await this.getAccounts(from);
    const account_number = account.result.value.account_number;
    const sequence = account.result.value.sequence;
    const ecpairPriv = await this.getECPairPriv(mnemonicDecrypted);

    const msgs = validators.map(v => {
      return {
        type: "cosmos-sdk/MsgWithdrawDelegationReward",
        value: {
          delegator_address: from,
          validator_address: v
        }
      };
    });

    const stdSignMsg = await this.NewStdMsg(msgs, account_number, sequence, "");
    const signedTx = await this.sign(
      stdSignMsg,
      ecpairPriv,
      process.env.SIGN_MODE_TYPE
    );

    return await this.broadcast(signedTx);
  }
}

String.prototype.escapeSpecialChars = function() {
  return this.replace(/\\n/g, "\\n")
    .replace(/\\'/g, "\\'")
    .replace(/\\"/g, '\\"')
    .replace(/\\&/g, "\\&")
    .replace(/\\r/g, "\\r")
    .replace(/\\t/g, "\\t")
    .replace(/\\b/g, "\\b")
    .replace(/\\f/g, "\\f");
};

export default Wallet;

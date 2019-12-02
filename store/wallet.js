import BitSongClient from "@bitsongofficial/js-sdk";
import FileSaver from "file-saver";
import uuidv1 from "uuid/v1";

const btsg = new BitSongClient("https://rpc.testnet-2.bitsong.network");

const wait = ms => {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve();
    }, ms);
  });
};

export const state = () => ({
  address: null,
  pk: null,
  decriptedPK: null
});

export const getters = {
  address: state => {
    return state.address;
  },
  pk: state => {
    return state.pk;
  }
};

export const mutations = {
  setAddress: (state, payload) => {
    state.address = payload;
  },
  setPk: (state, payload) => {
    state.pk = payload;
  },
  setDecryptedPK: (state, payload) => {
    state.decriptedPK = payload;
  }
};

export const actions = {
  createAccountWithKeystore: async ({ dispatch, commit }, password) => {
    dispatch("app/toggleLoading", null, {
      root: true
    });
    await wait(500);
    try {
      const uuid = uuidv1();
      const data = await btsg.createAccountWithKeystore(password);

      if (data.address && data.privateKey) {
        commit("setAddress", data.address);
        commit("setPk", JSON.stringify(data.keystore));
      }

      const blob = new Blob([JSON.stringify(data.keystore)], {
        type: "text/plain;charset=utf-8"
      });

      dispatch("app/toggleLoading", null, {
        root: true
      });

      FileSaver.saveAs(blob, `${uuid}_keystore.txt`);

      $nuxt.$router.push("/");
    } catch (e) {
      dispatch("app/toggleLoading", null, {
        root: true
      });
      console.error(e);
    }
  },
  recoverAccountFromKeystore: async (
    { dispatch, commit },
    { keystore, password }
  ) => {
    dispatch("app/toggleLoading", null, {
      root: true
    });

    await wait(500);

    try {
      const data = btsg.recoverAccountFromKeystore(keystore, password);

      if (data.address && data.privateKey) {
        commit("setAddress", data.address);
        commit("setPk", keystore);
        commit("setDecryptedPK", data.privateKey);
      }

      dispatch("app/toggleLoading", null, {
        root: true
      });

      $nuxt.$router.push("/");

      return true;
    } catch (e) {
      dispatch("app/toggleLoading", null, {
        root: true
      });

      return false;
    }
  }
};

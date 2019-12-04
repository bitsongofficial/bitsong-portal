const lcd = `/lcd`;

export const state = () => ({
  artists: []
});

export const getters = {
  all: state => {
    return state.artists;
  }
};

export const mutations = {
  SET_ARTISTS: (state, payload) => {
    state.artists = payload;
  }
};

export const actions = {
  async getAll({ commit, rootState }, payload) {
    const artists = Promise.all([
      this.$axios.$get(
        `${lcd}/artist/all?owner=${rootState.wallet.address}&status=verified`
      ),
      this.$axios.$get(`${lcd}/artist/all?owner=${rootState.wallet.address}`)
    ])
      .then(([verified, unverified]) =>
        []
          .concat(verified.result, unverified.result)
          .filter(artist => artist !== null)
      )
      .then(artists => commit(`SET_ARTISTS`, artists));
  }
};

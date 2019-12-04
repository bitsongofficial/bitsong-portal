const lcd = `/lcd`;

export const state = () => ({
  tracks: []
});

export const getters = {
  all: state => {
    return state.tracks;
  }
};

export const mutations = {
  SET_TRACKS: (state, payload) => {
    state.tracks = payload;
  }
};

export const actions = {
  async getAll({ commit, rootState }, payload) {
    return Promise.all([
      this.$axios.$get(
        `${lcd}/track/all?owner=${rootState.wallet.address}&status=verified`
      ),
      this.$axios.$get(`${lcd}/track/all?owner=${rootState.wallet.address}`)
    ])
      .then(([verified, unverified]) =>
        []
          .concat(verified.result, unverified.result)
          .filter(track => track !== null)
      )
      .then(tracks => commit(`SET_TRACKS`, tracks));
  }
};

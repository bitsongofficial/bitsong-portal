const lcd = `/lcd`;

export const state = () => ({
  albums: []
});

export const getters = {
  all: state => {
    return state.albums;
  }
};

export const mutations = {
  SET_ALBUMS: (state, payload) => {
    state.albums = payload;
  }
};

export const actions = {
  async getAll({ commit, rootState }, payload) {
    const albums = Promise.all([
      this.$axios.$get(
        `${lcd}/album/all?owner=${rootState.wallet.address}&status=verified`
      ),
      this.$axios.$get(`${lcd}/album/all?owner=${rootState.wallet.address}`)
    ])
      .then(([verified, unverified]) =>
        []
          .concat(verified.result, unverified.result)
          .filter(album => album !== null)
      )
      .then(albums => commit(`SET_ALBUMS`, albums));
  }
};

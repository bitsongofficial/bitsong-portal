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
  },
  PUSH_ARTIST: (state, payload) => {
    state.artists.push(payload);
  }
};

export const actions = {
  async getAll({ commit }, payload) {
    commit("SET_ARTISTS", []);
    const artistsVerified = await this.$axios.$get(
      `${lcd}/artist/all?status=verified`
    );
    for (var i = 0; i < artistsVerified.result.length; i++) {
      commit("PUSH_ARTIST", artistsVerified.result[i]);
    }
    const artists = await this.$axios.$get(
      `${lcd}/artist/all?owner=${$nuxt.$store.getters["wallet/address"]}`
    );
    for (var i = 0; i < artists.result.length; i++) {
      commit("PUSH_ARTIST", artists.result[i]);
    }
  }
};

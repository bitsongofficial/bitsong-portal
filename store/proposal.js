const lcd = `/lcd`;

export const state = () => ({
  proposals: []
});

export const getters = {
  all: state => {
    return state.proposals;
  }
};

export const mutations = {
  SET_PROPOSALS: (state, payload) => {
    state.proposals = payload;
  }
};

export const actions = {
  async getAll({ commit }, payload) {
    const proposals = await this.$axios.$get(`${lcd}/gov/proposals`);
    commit("SET_PROPOSALS", proposals.result);
  }
};

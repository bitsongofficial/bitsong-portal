export const state = () => ({
  loading: false
});

export const getters = {
  loading: state => {
    return state.loading;
  }
};

export const mutations = {
  toggleLoading(state) {
    state.loading = !state.loading;
  }
};

export const actions = {
  toggleLoading({ commit }) {
    commit("toggleLoading");
  }
};

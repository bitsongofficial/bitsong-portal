<template>
  <v-app>
    <v-app-bar fixed app>
      <v-toolbar-title>
        <router-link to="/" style="text-decoration: none;color:black"
          >BitSong Portal</router-link
        >
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items v-if="!loggedin">
        <v-btn text to="/unlock">Sign In</v-btn>
      </v-toolbar-items>
      <v-toolbar-items v-else>
        <v-btn text to="/artists">Artists</v-btn>
        <v-btn text>Albums</v-btn>
        <v-btn text>Tracks</v-btn>
        <v-btn text to="/proposals">Proposals</v-btn>
      </v-toolbar-items>
      <v-btn icon v-if="loggedin">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <Loading v-model="$store.getters[`app/loading`]" />
  </v-app>
</template>

<script>
import Loading from "@/components/Loading";

export default {
  components: {
    Loading
  },
  computed: {
    loggedin() {
      return this.$store.getters["wallet/address"] !== "" ? true : false;
    }
  }
};
</script>

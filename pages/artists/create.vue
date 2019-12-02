<template>
  <v-container>
    <v-row class="d-flex justify-center">
      <v-col cols="4">
        <v-card>
          <v-card-title>CREATE ARTIST</v-card-title>
          <v-card-text>
            <p>
              Create your artist.... [TODO: TO COMPLETE...]
            </p>
            <v-text-field
              ref="name"
              v-model="name"
              label="Enter your artist name"
              v-validate="'required|min:1|max:86'"
              data-vv-name="name"
              :error-messages="errors.collect('name')"
            ></v-text-field>
            <p v-if="response" class="my-2">
              <b>RESULT</b>:<br /><br />
              <code> {{ response }}</code>
            </p>
            <p v-if="error" class="my-2 red--text font-weight-bold">
              error....
            </p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :block="$vuetify.breakpoint.smAndDown"
              @click="onSubmit"
              color="primary"
              :disabled="isDisabled"
              >Create Artist <v-icon right>mdi-plus</v-icon></v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Wallet from "@/lib/bitsong";

export default {
  data() {
    return {
      error: false,
      name: "",
      response: ""
    };
  },
  computed: {
    isDisabled() {
      return this.name.length < 1;
    }
  },
  methods: {
    async onSubmit() {
      this.$store.dispatch("app/toggleLoading", null, {
        root: true
      });

      const wallet = new Wallet("/lcd", "bitsong-dev-network-2");
      const from = this.$store.state.wallet.address;
      const pk = this.$store.state.wallet.decriptedPK;

      const response = await wallet.artistCreate(this.name, from, pk);

      if (response) {
        this.response = response;
      }

      this.$store.dispatch("app/toggleLoading", null, {
        root: true
      });

      // const result = await this.$store.dispatch(`artist/create`, {
      //   name: this.name
      // });

      // if (!result) {
      //   this.error = true;
      // }
    }
  }
};
</script>

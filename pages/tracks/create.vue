<template>
  <v-container>
    <v-row class="d-flex justify-center">
      <v-col cols="4">
        <v-card>
          <v-card-title>CREATE TRACK</v-card-title>
          <v-card-text>
            <p>Create your track.... [TODO: TO COMPLETE...]</p>
            <v-text-field
              ref="title"
              v-model="title"
              label="Enter your track title"
              v-validate="'required|min:1|max:86'"
              data-vv-name="title"
              :error-messages="errors.collect('title')"
            ></v-text-field>
            <p v-if="response" class="my-2">
              <b>RESULT</b>:
              <br />
              <br />
              <code>{{ response }}</code>
            </p>
            <p v-if="error" class="my-2 red--text font-weight-bold">error....</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :block="$vuetify.breakpoint.smAndDown"
              @click="onSubmit"
              color="primary"
              :disabled="isDisabled"
            >
              Create Track
              <v-icon right>mdi-plus</v-icon>
            </v-btn>
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
      title: "",
      response: ""
    };
  },
  computed: {
    isDisabled() {
      return this.title.length < 1;
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

      const response = await wallet.trackCreate(this.title, from, pk);

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

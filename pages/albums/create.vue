<template>
  <v-container>
    <v-row class="d-flex justify-center">
      <v-col cols="4">
        <v-card>
          <v-card-title>CREATE ALBUM</v-card-title>
          <v-card-text>
            <p>Create your album.... [TODO: TO COMPLETE...]</p>
            <v-text-field
              ref="title"
              v-model="title"
              label="Enter your album title"
              v-validate="'required|min:1|max:86'"
              data-vv-name="title"
              :error-messages="errors.collect('title')"
            ></v-text-field>
            <v-text-field
              ref="album_type"
              v-model="album_type"
              label="Enter your album type"
              v-validate="'required|min:1|max:86'"
              data-vv-name="album_type"
              :error-messages="errors.collect('album_type')"
            ></v-text-field>
            <v-text-field
              ref="release_date"
              v-model="release_date"
              label="Enter your release date"
              v-validate="'required|min:1|max:86'"
              data-vv-name="release_date"
              :error-messages="errors.collect('release_date')"
            ></v-text-field>
            <v-text-field
              ref="release_date_precision"
              v-model="release_date_precision"
              label="Enter your release date precision"
              v-validate="'required|min:1|max:86'"
              data-vv-name="release_date_precision"
              :error-messages="errors.collect('release_date_precision')"
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
              Create Album
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
      album_type: "",
      release_date: "",
      release_date_precision: "",
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

      const response = await wallet.albumCreate(
        this.title,
        this.album_type,
        this.release_date,
        this.release_date_precision,
        from,
        pk
      );

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

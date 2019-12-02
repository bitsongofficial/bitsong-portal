<template>
  <v-container>
    <v-row class="d-flex justify-center">
      <v-col cols="4">
        <v-card>
          <v-card-title>UNLOCK YOUR WALLET</v-card-title>
          <v-card-text>
            <p>
              Connect an encrypted wallet file and input your password or
              <router-link to="/create">Create a new wallet</router-link>
            </p>
            <v-file-input
              @change="captureFile"
              label="Upload your keystore file"
            ></v-file-input>
            <v-text-field
              ref="password"
              v-model="password"
              label="Enter your wallet password"
              v-validate="'required|min:8|max:86'"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPassword ? 'text' : 'password'"
              data-vv-name="password"
              :error-messages="errors.collect('password')"
              @click:append="showPassword = !showPassword"
            ></v-text-field>
            <p v-if="fileError" class="my-2 red--text font-weight-bold">
              File format not allowed or password wrong!
            </p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :block="$vuetify.breakpoint.smAndDown"
              @click="onSubmit"
              color="primary"
              :disabled="isDisabled"
              >Unlock Wallet <v-icon right>mdi-lock-open</v-icon></v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      fileError: false,
      fileLoaded: false,
      password: "",
      showPassword: false,
      keystore: ""
    };
  },
  computed: {
    isDisabled() {
      return this.password.length < 8 || this.fileError || !this.fileLoaded;
    }
  },
  methods: {
    captureFile(file) {
      this.keystore = "";
      this.fileError = false;
      this.fileLoaded = false;
      if (file === null) return;

      const reader = new FileReader();
      if (typeof file !== "undefined") {
        reader.readAsArrayBuffer(file);
        reader.onloadend = async () => {
          try {
            const keystore = await this.convertToBuffer(reader.result);
            if (this.isKyestore(JSON.parse(keystore.toString()))) {
              this.keystore = keystore.toString();
              this.fileLoaded = true;
            }
          } catch (e) {
            this.fileError = true;
          }
        };
      }
    },
    async convertToBuffer(reader) {
      return Buffer.from(reader);
    },
    isKyestore(payload) {
      return (
        payload.hasOwnProperty("version") && payload.hasOwnProperty("crypto")
      );
    },
    async onSubmit() {
      const result = await this.$store.dispatch(
        `wallet/recoverAccountFromKeystore`,
        {
          keystore: this.keystore,
          password: this.password
        }
      );

      if (!result) {
        this.fileError = true;
      }
    }
  }
};
</script>

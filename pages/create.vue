<template>
  <v-container>
    <v-row class="d-flex justify-center">
      <v-col cols="4">
        <v-card>
          <v-card-title>CREATE NEW WALLET</v-card-title>
          <v-card-text>
            <p>
              Create Keystore File + Password or
              <router-link to="/unlock">Unlock your wallet</router-link>
            </p>
            <v-text-field label="new password"></v-text-field>
            <v-text-field label="Confirm password"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text>Button</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

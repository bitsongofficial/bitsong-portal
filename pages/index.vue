<template>
  <v-container>
    <h1>Welcome to bitsong portal</h1>
    <p>BitSong portal is for artist!</p>
    <p><b>Wallet Address:</b><br />{{ $store.getters["wallet/address"] }}</p>
  </v-container>
</template>

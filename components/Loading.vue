<template>
  <v-dialog v-model="value" width="80" persistent>
    <v-card min-height="80" class="d-flex">
      <v-card-text class="text-center pa-4 align-self-center">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["value"]
};
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            Proposals
            <v-spacer></v-spacer>
            <v-btn text small @click="refresh"
              ><v-icon>mdi-reload</v-icon></v-btn
            >
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="data_header"
              :items-per-page="limitRecords"
              :items="proposals"
            >
              <template v-slot:item.id="{ item }">
                {{ item.id }}
              </template>
              <template v-slot:item.title="{ item }">
                {{ item.content.value.title }}
              </template>
              <template v-slot:item.status="{ item }">
                <v-chip outlined small>{{ item.proposal_status }}</v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      limitRecords: 100,
      data_header: [
        { text: "ID", value: "id", sortable: false },
        { text: "Title", value: "title", sortable: false },
        { text: "Status", value: "status", sortable: false }
      ]
    };
  },
  mounted() {
    this.$store.dispatch(`proposal/getAll`);
  },
  methods: {
    refresh() {
      this.$store.dispatch(`proposal/getAll`);
    }
  },
  computed: {
    proposals() {
      return this.$store.getters["proposal/all"];
    }
  }
};
</script>

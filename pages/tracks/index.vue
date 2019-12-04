<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            My Tracks
            <v-spacer></v-spacer>
            <v-btn text small @click="refresh">
              <v-icon>mdi-reload</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-btn-toggle tile group>
              <v-btn to="/tracks/create">
                <v-icon left>mdi-plus</v-icon>Create Track
              </v-btn>
            </v-btn-toggle>
          </v-card-text>
          <v-card-text>
            <v-data-table :headers="data_header" :items-per-page="limitRecords" :items="myTracks">
              <template v-slot:item.id="{ item }">{{ item.id }}</template>
              <template v-slot:item.title="{ item }">{{ item.title }}</template>
              <template v-slot:item.status="{ item }">
                <v-chip outlined small v-if="item.status === ''">
                  {{
                  item.status !== "" ? item.status : "Null"
                  }}
                </v-chip>
                <v-chip small color="primary" v-else>
                  {{
                  item.status !== "" ? item.status : "Null"
                  }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  v-if="item.status === ''"
                  text
                  small
                  color="primary"
                  to="/tracks/verify"
                >Verify</v-btn>
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
        { text: "Status", value: "status", sortable: false },
        { text: "Actions", value: "actions", align: "right", sortable: false }
      ]
    };
  },
  methods: {
    refresh() {
      this.$store.dispatch(`track/getAll`);
    }
  },
  mounted() {
    this.$store.dispatch(`track/getAll`);
  },
  computed: {
    myTracks() {
      return this.$store.getters["track/all"];
    }
  }
};
</script>

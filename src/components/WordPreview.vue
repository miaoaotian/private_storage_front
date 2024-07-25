<template>
    <div class="docx-container">
      <div ref="file"></div>
    </div>
</template>

<script>
import axios from "axios";
import { renderAsync } from "docx-preview";

export default {
  props: {
    url: {
      type: String,
      default: "",
    },
  },

  mounted() {
    this.renderFile();
  },

  watch: {
    url(value) {
      this.renderFile();
    },
  },

  methods: {
    renderFile() {
      console.log(this.url);
      axios({
        method: "get",
        responseType: "blob",
        url: this.url,
      }).then((response) => {
        renderAsync(response.data, this.$refs.file);
      });
    },
  },
};
</script>

<style scoped>
.docx-container ::v-deep .docx-wrapper {
  background-color: #fff;
  padding: 20px 20px;
}
.docx-container ::v-deep .docx-wrapper > section.docx {
  width: 55vw !important;
  padding: 0rem !important;
  min-height: auto !important;
  box-shadow: none;
  margin-bottom: 0;
  overflow-y: scroll;
  height: 100vh;
}

.docx-container ::v-deep .docx-wrapper > section.docx::-webkit-scrollbar {
  display: none;
}
</style>


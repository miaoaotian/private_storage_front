<template>
  <div class="pdf-container">
    <iframe :src="pdfUrl" frameborder="0" class="pdf-iframe"></iframe>
  </div>
</template>

<script>

export default {
  name: 'PDFPreview',
  props: {
    url: {
      type: String,
      required: true
    }
  },
  computed: {
    pdfUrl() {
      if (this.url.endsWith('.ppt') || this.url.endsWith('.pptx')) {
        let newurl = this.url.replace(/pptx?$/, 'pdf');
        return `${newurl}?toolbar=0&navpanes=0&scrollbar=0`;
      }
      return `${this.url}#toolbar=0&navpanes=0&scrollbar=0`;
    }
  },

};
</script>

<style scoped>
.pdf-container {
  width: 800px;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>

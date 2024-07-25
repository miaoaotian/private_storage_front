<template>
    <div>
      <pre><code ref="codeBlock" v-html="codeContent" class="hljs"></code></pre>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/github.css'; 
  
  export default {
    name: 'CodePreview',
    props: {
      url: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        codeContent: ''
      };
    },
    watch: {
      url: {
        immediate: true,
        handler(newUrl) {
          if (newUrl) {
            this.fetchCodeContent(newUrl);
          }
        }
      }
    },
    methods: {
      fetchCodeContent(url) {
        axios.get(url)
          .then(response => {
            this.codeContent = hljs.highlightAuto(response.data).value;
          })
          .catch(error => {
            console.error('Error fetching code content:', error);
          });
      }
    },
    mounted() {
      if (this.url) {
        this.fetchCodeContent(this.url);
      }
    }
  };
  </script>
  
  <style scoped>
  .hljs {
    padding: 1em;
    border-radius: 4px;
    background: #f0f0f0;
  }
  </style>
  
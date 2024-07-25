<template>
    <div>
      <pre>{{ content }}</pre>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'TextPreview',
    props: {
      url: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        content: ''
      };
    },
    watch: {
      url: {
        immediate: true,
        handler(newUrl) {
          if (newUrl) {
            this.fetchTextContent(newUrl);
          }
        }
      }
    },
    methods: {
      async fetchTextContent(url) {
        try {
          const response = await axios.get(url);
          this.content = response.data;
        } catch (error) {
          console.error('Error fetching text content:', error);
        }
      }
    },
    mounted() {
      if (this.url) {
        this.fetchTextContent(this.url);
      }
    }
  };
  </script>
  
  <style scoped>
  pre {
    white-space: pre-wrap; 
    word-wrap: break-word; 
    padding: 1em;
    background-color: #f4f4f4;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  </style>
  
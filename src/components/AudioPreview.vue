<template>
    <div class="audio-preview">
        <h4></h4>
      <div class="audio-container">
        <audio :src="url" controls></audio>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AudioPreview',
    props: {
      url: {
        type: String,
        required: true
      }
    },
    computed: {
        
    }
  };
  </script>
  
  <style scoped>
  .audio-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }
  
  .audio-container {
    margin-top: 20px;
    width: 500px;
    max-width: 600px;
  }
  
  audio {
    width: 100%;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  </style>
  
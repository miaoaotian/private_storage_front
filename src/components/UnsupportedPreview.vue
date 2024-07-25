<template>
    <div class="unsupported-preview">
        <img src="../assets/icon-image/zip.png" width="200px" alt="">
      <p>本文件不支持预览，请下载后访问：</p>
      <el-button type="primary"><i class="el-icon-download"></i><a :href="url" download>下载文件</a></el-button>
      
    </div>
  </template>
  
  <script>
  export default {
    name: 'UnsupportedPreview',
    props: {
      url: {
        type: String,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  .unsupported-preview {
    height: 600px;
    text-align: center;
    margin: 20px;
  }
  
  .unsupported-preview a {
    color: white;
    text-decoration: none;
  }
  </style>
  
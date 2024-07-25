<template>
  <div id="app">
    <router-view></router-view>
    <!-- 将上传组件全局注册 -->
    <global-uploader />
  </div>
</template>

<script>
import GlobalUploader from '/vue-simple-uploader/GlobalUploader'
export default {
  name: 'App',
  components: {
    GlobalUploader
  },
}
</script>

<style>
html,body{
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>

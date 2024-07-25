import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store' 
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueHighlightJS from 'vue-highlightjs'
import 'highlight.js/styles/default.css'
import VueClipboard from 'vue-clipboard2'
import Icon from './components/Icon.vue'
import uploader from 'vue-simple-uploader'
import 'normalize.css';
Vue.use(ElementUI)
Vue.use(VueHighlightJS)
Vue.use(uploader)
Vue.use(VueClipboard)
Vue.component('Icon', Icon)
Vue.prototype.$bus = new Vue();
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
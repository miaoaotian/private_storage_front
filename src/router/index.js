import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    { path: '/login', component: () => import('../views/Login.vue') },
    {
      path: '/',
      component: () => import('../views/index.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '/',
          redirect: '/main/all'
        },
        {
          path: '/main/all',
          component: () => import('../views/All.vue'),
          name: 'all',
          meta: { requiresAuth: true },
        },
        {
          path: '/main/doc',
          component: () => import('../views/Doc.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/main/img',
          component: () => import('../views/Img.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/main/video',
          component: () => import('../views/Video.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/main/audio',
          component: () => import('../views/Audio.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/main/other',
          component: () => import('../views/Other.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'Share',
          component: () => import('../views/Share.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'Recycle',
          component: () => import('../views/Recycle.vue'),
          meta: { requiresAuth: true }
        },
      ]
    },
    {
      path: '/share/:link',
      component: () => import('../views/OutShare.vue'), 
      props: true, // 启用 props 将路由参数传递到组件
      meta: { requiresAuth: false }
    },
    {
      path: '/shareInfo',
      component: () => import('../views/OutShareInfo.vue'),
      meta: { requiresAuth: false }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const tokenExpiration = localStorage.getItem('tokenExpiration');
  const now = new Date().getTime();

  // 检查 token 是否存在以及是否过期
  if (token && tokenExpiration && now < parseInt(tokenExpiration)) {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      next();
    } else {
      next();
    }
  } else {
    localStorage.removeItem('token'); // 清除过期的 token
    localStorage.removeItem('tokenExpiration'); // 清除过期时间
    localStorage.setItem('auth',0);
    if (to.matched.some(record => record.meta.requiresAuth)) {
      next('/login'); // 引导用户至登录页面
    } else {
      next(); // 对于无需认证的路由正常导航
    }
  }
});

export default router;

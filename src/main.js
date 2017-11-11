// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import FastClick from 'fastclick'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
// import VueResource from 'vue-resource'
import RouterConfig from './router/index'
import App from './App'
import Home from './components/HelloFromVux'
import { AlertPlugin, ToastPlugin, AjaxPlugin } from 'vux'
import wx from 'weixin-js-sdk'
import _g from './helpers/global'

Vue.use(AlertPlugin)
Vue.use(ToastPlugin)
Vue.use(AjaxPlugin)
Vue.use(VueRouter)
Vue.use(Vuex)
// Vue.use(VueResource)
const bus = new Vue()
window.bus = bus
window._g = _g

const routes = RouterConfig
const router = new VueRouter({
  routes
})
let store = new Vuex.Store({
  state:{
    hasNet:true,
    dialogUnShow:true,
    dialogUnText:'',
    payType:'',
    payGoodId:'',
  },

  actions: {
  },
  mutations: {
  },
  getters: {
    hasNet: state=> {
      return state.hasNet
    },
    dialogUnShow: state=> {
      return state.dialogUnShow
    },
    dialogUnText: state=> {
      return state.dialogUnText
    },
    payType: state=> {
      return state.payType
    },
    payGoodId: state=> {
      return state.payGoodId
    },
  },
  modules: {

  }
})
// var url = require('aUrl')
Vue.mixin({
    data: function() {
        return {
            toast : {
                show : false,
                msg : '',
            },
            isIndex:false,
            //分页
            pullupStatus:'default',
            pulldownStatus:'default',
            pulldefaultConfig:{
              height: 100,
              content: "",
              upContent: "",
              loadingContent: "",
              downContent: ""
            },
            page: {
                totalpage: 1,
                currPage: 1,
                limit: 5,
                hasNext: true
            },
            addr:{
              latitude:'0',
              longitude:'0',
            }
        }
    },
    methods: {
        //分页
        getCurrentValue:function(value){
          this.pullupStatus = value.pullupStatus;
          this.pulldownStatus = value.pulldownStatus;
        },
        setTitle: function(title){
            document.title = title;
            var iframe = document.createElement('iframe');
            iframe.style.visibility = 'hidden';
            iframe.style.width = '1px';
            iframe.style.height = '1px';
            iframe.onload = function () {
                setTimeout(function () {
                    document.body.removeChild(iframe);
                }, 0);
            };
            document.body.appendChild(iframe);
        },
        loadMore (callback) {
          if(this.page.hasNext){
              setTimeout(() => {
                callback
              }, 2000)
          }
        },
    },

})
Vue.filter('price2', function (value) {
  if(typeof value ==  'string'){
    value = parseFloat(value);
  }
  if(!value) value = 0;
  return value.toFixed(2);
})
let userdata = JSON.parse(localStorage.getItem('_user'))
// let token = '';
// router.beforeEach((to, from, next) => {
//   if (from.path == '/account/moreset') {
//     token = ''
//   }
//   // 是否一级导航
//   if (to.path.replace(/[^/]/g, '').length > 1) {
//     router.app.isIndex = false
//   } else {
//     router.app.isIndex = true
//   }
//   // 验证是否登陆
//   if (to.meta.auth) {
//     if (!token) {
//       userdata = JSON.parse(localStorage.getItem('_user'))
//       if (userdata) {
//         token = userdata.token
//       }
//     }
//     if (token) {
//       next()
//     } else {
//       _g.toastMsg('error', '未登录')
//       setTimeout(() => {
//         router.push({path: '/login?path=' + to.path,replace: true})
//       }, 1500)
//     }
//   } else {
//     next()
//   }
// })
// router.afterEach((to, from, next) => {
//   // 验证是否登陆
//   if (to.meta.auth) {
//     if (!token) {
//       _g.toastMsg('error', '未登录')
//       setTimeout(() => {
//         router.push({path: '/login?path=' + to.path, replace: true})
//       }, 1500)
//     }
//   }
//   if (to.path.replace(/[^/]/g, '').length > 1) {
//     router.app.isIndex = false
//   } else {
//     router.app.isIndex = true
//   }
// })
//ajax 拦截   全局做判断
let url = document.location.href.split('#')[0]
let seturl = ''

if (url.indexOf('weixin-usedgoods.thy360.com')!=-1) {
  seturl = 'https://weixin-usedgoods.thy360.com'
}else{
  seturl = 'https://weixin-dev-h9.thy360.com'
}
//Vue.http.headers.common['client'] = 3;
Vue.http.defaults.baseURL = seturl
Vue.http.defaults.timeout = 1000 * 15
Vue.http.defaults.headers['client'] = '3'
//Vue.http.defaults.headers['imei'] = ''
// Vue.http.defaults.headers.token = userdata ? userdata.token : ''
Vue.http.interceptors.request.use(
  config => {
    if (JSON.parse(localStorage.getItem('_user'))) {  // 判断是否存在token，如果存在的话，则每个http header都加上token
      config.headers.token = JSON.parse(localStorage.getItem('_user')).token;
    } else {
      config.headers.token ='';
      token = ''
    }
    return config;
  },
  err => {
    return Promise.reject(err);
});
Vue.http.interceptors.response.use(
  response => {
    console.log(response)
    if(response.status==200){
      store.state.hasNet=true
    }
    if(response.data.code==402){
      _g.toastMsg('error', '请先绑定手机号')
      setTimeout(() => {
        router.replace('/account/bindPhone')
      }, 1500)
    }
    return response;
  },
  err =>{
    _g.toastMsg('error', '出错了')
  },
  error => {
    if (error.response) {
      _g.toastMsg('error', '出错了')
    }
    return Promise.reject(error.response.data)   // 返回接口返回的错误信息
});

wx.getLocation({
    type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
    success: function (res) {
        this.addr.latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
        this.addr.longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
    }
});
FastClick.attach(document.body)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app-box')

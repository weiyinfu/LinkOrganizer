/**
 * 主文件
 *
 */
import Vue from "vue"
import VueRouter from "vue-router"
import ElementUI from "element-ui"
import "element-ui/lib/theme-chalk/index.css"

//使用模块化导入CSS会有一些问题
// const App = () => import("./pages/App/App.vue")
// const User = () => import("./pages/User/User.vue")
// const Home = () => import("./pages/Home.vue")
// const Crawl = () => import("./pages/Crawl.vue")
import App from "./pages/App/App.vue"
import User from "./pages/User/User.vue"
import Home from "./pages/Home.vue"
import Crawl from "./pages/Crawl.vue"
import Manage from "./pages/Manager.vue"

const ajax = require("./js/Ajax")
const CommonMethod = require("./js/CommonMethod")

Vue.use(VueRouter)
Vue.use(ElementUI)
Vue.use(ajax)
Vue.use(CommonMethod)

new Vue({
  el: "#app",
  router: new VueRouter({
    routes: [
      { name: "login.page", path: "/", component: Home },
      { name: "manage.page", path: "/manage", component: Manage },
      {
        name: "user.home",
        path: "/:username",
        component: User
      },
      {
        name: "link.page",
        path: "/:username/link/:linkId",
        component: App
      },
      { name: "crawl.page", path: "/crawl/:linkId", component: Crawl }
    ]
  })
})

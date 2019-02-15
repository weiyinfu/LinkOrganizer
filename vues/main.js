/**
 * 主文件
 *
 */
import Vue from "vue"
import VueRouter from "vue-router"
import ElementUI from "element-ui"

import Organizer from "./pages/Organizer/Organizer.vue"
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
        component: Organizer
      },
      { name: "crawl.page", path: "/crawl/:linkId", component: Crawl }
    ]
  })
})

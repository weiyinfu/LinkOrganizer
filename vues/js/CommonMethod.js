/**公用的方法 */
const cookie = require("js-cookie")
const util = require("../js/util")
module.exports = {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        //获取用户家目录
        userHome() {
          if (cookie.get("username")) {
            return {
              name: "user.home",
              params: { username: cookie.get("username") }
            }
          } else {
            return { name: "login.page" }
          }
        },
        getUsername() {
          return cookie.get("username")
        },
        betterSpan(s) {
          return util.betterSpan(s)
        }
      }
    })
  }
}

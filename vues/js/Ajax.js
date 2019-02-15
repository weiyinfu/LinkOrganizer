/**
 * 统一的网络请求接口：主要是进行权限验证
 * 实现一个Vue插件
 * */
const axios = require("axios")
const url = require("url")
const accessControl = require("./AccessControl")
const config = require("../config")

module.exports = {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        get(url, ...args) {
          var res = accessControl.control(url)
          return new Promise((resolve, reject) => {
            if (!res) {
              reject("forbidden")
              return
            }
            if (this.locationStruct().path.startsWith(config.baseUrl)) {
              url = config.baseUrl + url
            }
            axios
              .get(url, ...args)
              .then(resp => {
                resolve(resp)
              })
              .catch(err => {
                reject(err)
              })
          })
        },
        post(url, ...args) {
          var res = accessControl.control(url)
          return new Promise((resolve, reject) => {
            if (!res) {
              reject("forbidden")
              return
            }
            if (this.locationStruct().path.startsWith(config.baseUrl)) {
              url = config.baseUrl + url
            }
            axios
              .post(url, ...args)
              .then(resp => {
                resolve(resp)
              })
              .catch(err => {
                reject(err)
              })
          })
        },
        locationStruct() {
          return url.parse(location.href)
        }
      }
    })
  }
}

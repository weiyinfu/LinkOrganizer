/**
 * 统一的网络请求接口：主要是进行权限验证
 * 实现一个Vue插件
 * */
const axios = require("axios")
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
            axios
              .get(config.baseUrl + url, ...args)
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
            axios
              .post(config.baseUrl + url, ...args)
              .then(resp => {
                resolve(resp)
              })
              .catch(err => {
                reject(err)
              })
          })
        }
      }
    })
  }
}

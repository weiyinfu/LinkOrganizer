/**
 * 访问控制函数
 */

const cookie = require("js-cookie")
const config = require("../config")
const access = require("../Access")
function getUrlMap() {
  var a = {}
  for (var i in access) {
    a[access[i].url] = access[i]
  }
  return a
}
const urlMap = getUrlMap()
function login(writeLocation) {
  //触发登录事件之后，立马登录
  if (writeLocation)
    //如果保存上次URL
    cookie.set("lastUrl", location.href)
  var githubUrl = `https://github.com/login/oauth/authorize?client_id=${config.GithubClientId}`
  location.href = githubUrl
}
function hasLogin() {
  var username = cookie.get("username")
  if (!username) {
    return false
  } else return true
}
function loginValidator() {
  if (!hasLogin()) {
    login()
    return false
  } else {
    return true
  }
}

const validatorMap = {
  login: loginValidator
}

function control(url) {
  if (!urlMap[url]) return true
  for (var validatorName of urlMap[url].preprocessor) {
    var func = validatorMap[validatorName]
    if (func) {
      const validateResult = func(url)
      if (!validateResult) return false
    }
  }
  return true
}
module.exports = {
  control,
  login
}

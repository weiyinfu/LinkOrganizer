/**
 * github三方登录
 * */
const config = require("../conf/config")
const axios = require("axios")

//根据accessToken获取用户验证码
function getUserInfo(accessToken) {
  return new Promise((resolve, reject) => {
    axios
      .get("https://api.github.com/user?access_token=" + accessToken)
      .then(resp => {
        resolve(resp.data)
      })
      .catch(err => {
        reject(err.response)
      })
  })
}

//根据登录码去github上换成accessToken
function getAccessToken(code) {
  return new Promise((resolve, reject) => {
    axios
      .post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: config.githubAuth.clientId,
          client_secret: config.githubAuth.clientSecret,
          code: code
        },
        {
          headers: {
            Accept: "application/json"
          }
        }
      )
      .then(resp => {
        if (resp.data.error) {
          reject(resp.data)
        } else {
          resolve(resp.data.access_token)
        }
      })
      .catch(error => {
        reject(error)
      })
  })
}
module.exports = {
  getAccessToken,
  getUserInfo
}

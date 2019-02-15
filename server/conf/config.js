/*全局配置
三个凡是：
凡是前端的东西，后端都可以随便使用
凡是后端的东西，前端都不可以随便使用
凡是公共的部分，一律放在前端
配置的流向可以从前端到后端，但是不可以从后端到前端
*/
const path = require("path")
const configLoader = require("../lib/ConfigLoader")
const frontEndConf = require("../../vues/config")
const fs = require("fs")
var conf = configLoader(__dirname)

const logPath = path.normalize(path.join(__dirname, "../../cnblog"))
if (!fs.existsSync(logPath)) {
  fs.mkdir(logPath, () => {
    console.log("made folder " + logPath)
  })
}
module.exports = {
  managerList: ["weiyinfu"],
  // mode: "development",
  mode: "production",
  port: 8879,
  logPath,
  githubAuth: {
    clientId: frontEndConf.GithubClientId,
    clientSecret: conf["GithubAuthClientSecret"]
  },
  mysql: {
    host: "weiyinfu.cn",
    port: 3306,
    user: conf["mysql.user"],
    password: conf["mysql.password"],
    database: "linkorganizer"
  },
  //博客园数据更新周期，7天
  cnblogUpdateInterval: 7 * 24 * 3600 * 1000,
  githubUpdateInterval: 7 * 24 * 3600 * 1000,
  cookieSessionSecret: conf["CookieSessionSecret"],
  baseUrl: frontEndConf.baseUrl
}

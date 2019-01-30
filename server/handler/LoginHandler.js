const log = require("../lib/log")
const GithubAuth = require("../lib/GithubAuth")
const userDao = require("../dao/UserDao")
const config = require("../conf/config")

const logger = log.getLogger()
function loginSuccess(username, req, resp) {
  //更新用户的cookie和session
  userDao.getUser({ name: username }, (e, r) => {
    if (e) {
      logger.error(e)
      resp.status(500).end("getUser error")
      return
    }
    var usr = r[0]
    req.session.userId = usr.id
    resp.cookie("username", usr.name)
    var lastUrl = req.cookies.lastUrl
    if (!lastUrl) lastUrl = config.baseUrl + "/#/" + usr.name
    resp.clearCookie("lastUrl")
    resp.redirect(lastUrl)
  })
}
function loginFail(req, resp) {
  //通过cookie读取用户登录之前所在的页面
  var lastUrl = req.cookies.lastUrl
  if (!lastUrl) lastUrl = config.baseUrl + "/#/"
  logger.info("redirect user to " + lastUrl)
  resp.clearCookie("lastUrl")
  resp.redirect(lastUrl)
  resp.end()
}
//处理用户登录（通过Github登录）
function handleLogin(req, resp) {
  /**
   * 忆苦思甜，多用回调
   */
  logger.info("handle github login ", req.query)
  GithubAuth.getAccessToken(req.query.code)
    .then(accessCode => {
      GithubAuth.getUserInfo(accessCode)
        .then(githubInfo => {
          //是否有用户
          userDao.getUser({ name: githubInfo.login }, (err, res) => {
            if (err) {
              logger.error("getUser error on name ", githubInfo.login)
              logger.error(err)
              loginFail(req, resp)
              return
            }
            if (res.length == 0) {
              //用户不存在，插入新用户
              userDao.insertUser(
                {
                  avatar_url: githubInfo.avatar_url,
                  name: githubInfo.login,
                  extra: { githubInfo }
                },
                (err,
                res => {
                  if (err) {
                    logger.error("insertUser error on ", githubInfo)
                    logger.error(err)
                    loginFail(req, resp)
                    return
                  }
                  logger.info("insert user result", res)
                  loginSuccess(githubInfo.name, req, resp)
                })
              )
            } else {
              //用户存在，更新用户
              const nowUser = res[0]
              var extra = nowUser.extra
              if (extra == null) extra = {}
              extra.github_info = githubInfo
              userDao.updateUser(
                {
                  avatar_url: githubInfo.avatar_url,
                  name: githubInfo.login,
                  extra
                },
                { name: githubInfo.login },
                (err, res) => {
                  if (err) {
                    logger.error("update user error ", githubInfo)
                    logger.error(err)
                    loginFail(req, resp)
                    return
                  }
                  loginSuccess(githubInfo.name, req, resp)
                }
              )
            }
          })
        })
        .catch(err => {
          logger.error("getUserInfo error by accessToken")
          logger.error(err)
          loginFail(req, resp)
        })
    })
    .catch(err => {
      logger.error("get access token error")
      logger.error(err)
      loginFail(req, resp)
    })
}
module.exports = { handleLogin }

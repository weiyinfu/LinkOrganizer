/**
 * 权限控制
 */
const log = require("../lib/log")
const access = require("../../vues/Access")
const userDao = require("../dao/UserDao")
const config = require("../conf/config")

function getUrl2PreprocessorMap() {
  if (getUrl2PreprocessorMap.map) {
    return getUrl2PreprocessorMap.map
  }
  var a = {}
  for (var urlName in access) {
    var i = access[urlName]
    a[i.url] = i
  }
  getUrl2PreprocessorMap.map = a
  return a
}
class ArrayIterator {
  constructor(ar) {
    this.index = 0
    this.ar = ar
  }
  hasNext() {
    return this.index < this.ar.length
  }
  moveNext() {
    return this.ar[this.index++]
  }
}
const logger = log.getLogger()
function ifUserLogin(req, resp, next) {
  logger.info("need check user login for " + req.path)
  var userId = req.session.userId
  logger.info("当前用户的session信息", req.session)
  userDao.getUser({ id: userId }, (err, res) => {
    if (err) {
      resp.status(500).end("internal error")
      return
    }
    if (res.length == 0) {
      resp.clearCookie()
      resp.status(403).end("you need login ")
      return
    }
    next()
  })
}
function ifUserIsManager(req, resp, next) {
  logger.info("check user if manager ", req.path)
  var userId = req.session.userId
  if (!userId) {
    resp.status(403).end("you must login")
    return
  }
  userDao.getUser({ id: userId }, (e, r) => {
    if (e) {
      logger.error(e)
      resp.status(500).end("getUser error")
      return
    }
    if (r.length == 0) {
      resp.status(403).end("no this user at all")
      return
    }
    if (config.managerList.indexOf(r[0].name) == -1) {
      resp.status(403).end("you are not manager at all ")
      return
    }
    next()
  })
}
const processorMap = {
  login: ifUserLogin,
  manager: ifUserIsManager
}
function handle(req, resp, iterator, callback) {
  if (!iterator.hasNext()) {
    callback()
    return
  }
  const processorName = iterator.moveNext()
  logger.info("handle", processorName)
  var processor = processorMap[processorName]
  if (!processor) {
    logger.error("lack validator for ", processorName)
  }
  processor(req, resp, () => {
    handle(req, resp, iterator, callback)
  })
}
//检查用户具有某个API的访问权限，这是一个中间件
function checkAccess(req, resp, next) {
  logger.info("checking access ", req.path)
  var urlInfo = getUrl2PreprocessorMap()[req.path]
  if (!urlInfo) {
    next()
    return
  }
  handle(req, resp, new ArrayIterator(urlInfo.preprocessor), next)
}
module.exports = checkAccess

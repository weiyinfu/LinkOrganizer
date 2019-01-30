const userDao = require("../dao/UserDao")
const linkDao = require("../dao/LinkDao")
const log = require("../lib/log")
const express = require("express")
const login = require("./LoginHandler")
const crawl = require("./CrawlHandler")
const access = require("../../vues/Access")
const AccessControlMiddleware = require("./AccessControl")
const SafeWrapper = require("./SafeWrapperMiddleware")
const store = require("./store")
const logger = log.getLogger()
const router = express.Router()

//异常捕捉器
router.use(SafeWrapper)
// 权限控制过滤器
router.use(AccessControlMiddleware)

router.get(access.githubLogin.url, login.handleLogin)
router.get(access.startCrawl.url, crawl.startCrawl)
//获取数据
router.get(access.getLink.url, (req, resp) => {
  var linkId = req.query.linkId
  linkDao.getLinkById(linkId, (err, res) => {
    if (err) {
      logger.error(err)
      resp.status(500).end(`get link (${linkId}) error`)
      return
    }
    if (res.length == 0) {
      resp.status(400).end(`cannot find link (${linkId})`)
      return
    }
    var link = res[0]
    resp.json(link)
  })
})
//获取用户的全部link
router.get(access.getLinkOfUser.url, (req, resp) => {
  var username = req.query.username
  userDao.getUser({ name: username }, (err, res) => {
    if (err) {
      resp.status(500).end(`getUser error on user(${username})`)
      logger.error(err)
      return
    }
    if (res.length == 0) {
      resp.status(400).end(`cannot find user(${username})`)
      return
    }
    var userId = res[0].id
    linkDao.getLinkOfUser(userId, (err, res) => {
      if (err) {
        logger.error(err)
        resp.status(500).end(`getLinkOfUser error on user(${username})`)
        return
      }
      resp.json(res)
    })
  })
})
router.get(access.getUserByName.url, (req, resp) => {
  var username = req.query.username
  userDao.getUser({ name: username }, (e, r) => {
    if (e) {
      logger.error(e)
      resp.status(500).end(`getUserByName error on user(${username})`)
      return
    }
    if (!r.length) {
      resp.status(400).end(`cannot find user on user(${username})`)
      return
    }
    resp.json(r[0])
  })
})
//保存数据
router.post(access.updateLink.url, (req, resp) => {
  var link = req.body
  var userId = req.session.userId
  linkDao.getLinkById(link.id, (err, res) => {
    if (err) {
      logger.error(err)
      resp.status(500).end("internal error")
      return
    }
    if (res.length == 0) {
      resp.status(400).end("cannot find link")
      return
    }
    var li = res[0]
    if (li.user_id != userId) {
      resp.status(403).end("it is not yours")
      return
    }
    linkDao.updateLink(link, link.id, (err, res) => {
      if (err) {
        logger.error(err)
        resp.status(500).end("updateLink error")
        return
      }
      resp.end("ok")
    })
  })
})
//添加链接
router.post(access.addLink.url, (req, resp) => {
  var userId = req.session.userId
  var link = {
    name: req.body.name,
    extra: {
      account: req.body.account
    },
    create_time: new Date().getTime(),
    type: req.body.type,
    user_id: userId,
    update_time: 0
  }
  logger.info("add link ", link)
  linkDao.insertLink(link, (e, r) => {
    if (e) {
      logger.error(e)
      resp.status(500).end("insertLink error")
    } else {
      resp.end("ok")
    }
  })
})
//获取全部用户列表
router.get(access.userList.url, (req, resp) => {
  userDao.getAllUser((err, res) => {
    if (err) {
      logger.error(err)
      resp.status(500).end("getUserList error")
      return
    }
    resp.json(res)
  })
})
router.get(access.deleteLink.url, (req, resp) => {
  var linkId = req.query.linkId
  linkDao.getLinkById(linkId, (e, r) => {
    if (e) {
      logger.error(e)
      resp.status(500).end()
      return
    }
    var linkInfo = r[0]
    var userId = req.session.userId
    if (linkInfo.user_id != userId) {
      resp.status(403).end()
      logger.info("userId dont match")
      return
    }
    linkDao.deleteLink(linkId, (e, r) => {
      if (e) {
        logger.error(e)
        resp.status(500).end("delete link error")
      } else {
        resp.end("ok")
      }
    })
  })
})
router.get(access.storeState.url, (req, resp) => {
  const crawlerIdList = Object.keys(store.crawlerMap)
  resp.json(crawlerIdList).end()
})
module.exports = router

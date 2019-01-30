/**爬虫启动控制器和爬虫状态控制器 */
const store = require("./store")
const linkDao = require("../dao/LinkDao")
const cnblogCrawler = require("../crawl/CnblogCrawler")
const githubCrawler = require("../crawl/GithubCrawler")
const merge = require("../../vues/js/MergeTree")
const config = require("../conf/config")
const log = require("../lib/log")

const logger = log.getLogger()
const crawlerInfoMap = {
  cnblog: { Crawler: cnblogCrawler, interval: config.cnblogUpdateInterval },
  github: { Crawler: githubCrawler, interval: config.githubUpdateInterval }
}

function startCrawl(req, resp) {
  const linkId = req.query.linkId
  const userId = req.session.userId
  //如果爬虫已经启动，禁止再次启动

  if (store.crawlerMap[linkId]) {
    resp.status(403).end("crawler has already running")
  }
  linkDao.getLinkById(linkId, (e, r) => {
    if (e) {
      resp.status(500).end("internal error")
      return
    }
    if (r.length == 0) {
      resp.status(400).end("cannot find " + linkId)
      return
    }
    const link = r[0]
    const extra = link.extra
    const linkType = link.type
    const crawlerInfo = crawlerInfoMap[linkType]
    const lastCrawlTime = extra.lastCrawlTime
    if (link.user_id != userId) {
      resp.status(403).end("it is not yours")
      return
    }
    //没有对应的爬虫
    if (!crawlerInfo) {
      resp.status(403).end("unkown crawler type")
      return
    }
    var now = new Date().getTime()
    if (now - lastCrawlTime < crawlerInfo.interval) {
      logger.info("update too frequently ", req.session)
      resp.end("too frequent")
      return
    }
    const CrawlerClass = crawlerInfo.Crawler
    CrawlerClass.exist(extra.account, hasThisUser => {
      if (!hasThisUser) {
        resp.status(400).end("no this user at all : " + extra.account)
        return
      }
      var crawler = new CrawlerClass(extra.account, console.log, data => {
        var a = { label: "root", children: data }
        if (link.content) {
          var organized = JSON.parse(link.content)
          var merged = merge(organized, a, "removeLack")
          a = merged
        }
        extra.lastCrawlTime = new Date().getTime()
        linkDao.updateLink({ content: JSON.stringify(a), extra }, link.id, (e, r) => {
          if (e) {
            crawler.cout("Something wrong happend !!")
          } else {
            crawler.cout("everything is ok ")
            crawler.cout("over")
          }
          //移除掉爬虫映射
          delete store.crawlerMap[linkId]
        })
      })
      store.crawlerMap[linkId] = crawler
      crawler.start()
      logger.info("will return crawler Id " + linkId)
      resp.end(linkId + "") //将爬虫ID返回给客户端，供其查看爬虫爬取过程
    })
  })
}
module.exports = {
  startCrawl
}

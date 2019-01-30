/**
 * websocket服务端处理逻辑
 * */
//打印爬虫控制台
var url = require("url")
var querystring = require("querystring")
var store = require("./store")
var log = require("../lib/log")
var logger = log.getLogger()
module.exports = function(conn, request) {
  logger.info("got connection")
  var query = url.parse(request.url)
  var params = querystring.parse(query.query)
  var linkId = params.linkId
  logger.info("connection linkId " + linkId)
  var crawlerMap = store.crawlerMap
  if (!crawlerMap[linkId]) {
    //如果没有正在爬取，那么用户就不该来这个页面
    conn.send("nothing")
  } else {
    //crawling是用户ID到输出信息的映射
    crawlerMap[linkId].cout = function(message) {
      if (typeof message != "string") {
        message = JSON.stringify(message)
      }
      conn.send(message)
    }
  }
  conn.send("connection has been established")
  conn.on("message", function incoming(message) {
    logger.info("received: %s", message)
  })
}

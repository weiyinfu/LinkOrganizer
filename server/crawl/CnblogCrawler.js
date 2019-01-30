/*博客园博客标题爬虫 */
const axios = require("axios")
const cheerio = require("cheerio")
const Crawler = require("./Crawler")
const urlParser = require("url")
const queryParser = require("querystring")
const log=require("../lib/log")

const logger=log.getLogger()

class CnblogCrawler {
  //判断用户是否存在
  static exist(username, callback) {
    axios
      .get(`http://www.cnblogs.com/${username}`)
      .then(resp => callback(true))
      .catch(err => {
        callback(false)
      })
  }
  constructor(username, cout, callback) {
    this.username = username
    this.cout = cout
    this.callback = callback
    this.posts = []
    this.spider = new Crawler(cout, () => {
      callback(this.posts)
    })
  }

  parsePage($) {
    var titles = $(".postTitle a")
    for (var i = 0; i < titles.length; i++) {
      var title = titles.eq(i).text()
      if (title.startsWith("[置顶]")) {
        continue
      }
      this.posts.push({
        label: title,
        url: titles.eq(i).attr("href")
      })
    }
  }

  //爬取第一页
  firstPageHandler(resp) {
    var $ = cheerio.load(resp)
    this.parsePage($)
    //if this request is homepage,find the next page button
    var nextPage = $("#nav_next_page a")
    if (nextPage.length == 0) {
      //if dont have the next page
      return []
    }
    var secondPageUrl = nextPage.attr("href")
    return [{ url: secondPageUrl, handler: data => this.secondPageHandler(data) }]
  }

  //爬取第二页
  secondPageHandler(resp) {
    var $ = cheerio.load(resp)
    this.parsePage($)
    var links = $("#homepage_top_pager a")
    //解析总页数
    var totalPage = 2
    for (var i = 0; i < links.length; i++) {
      if (links.eq(i).text() == "末页") {
        var lastLink = links.eq(i).attr("href")
        var urlStruct = urlParser.parse(lastLink)
        var queries = queryParser.parse(urlStruct.query)
        totalPage = parseInt(queries.page)
      }
    }
    var nextRequests = []
    for (let i = 3; i <= totalPage; i++) {
      nextRequests.push({
        url: `https://www.cnblogs.com/${this.username}/default.html?page=${i}`,
        handler: data => this.commonPageHandler(data)
      })
    }
    return nextRequests
  }

  //爬取其他页
  commonPageHandler(resp) {
    var $ = cheerio.load(resp)
    this.parsePage($)
    return []
  }

  start() {
    this.spider.crawl(`https://cnblogs.com/${this.username}/`, data => this.firstPageHandler(data))
  }
}

module.exports = CnblogCrawler

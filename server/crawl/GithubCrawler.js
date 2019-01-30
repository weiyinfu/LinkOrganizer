/**
 * github爬虫
 * */

const axios = require("axios")
const Crawler = require("./Crawler")
const cheerio = require("cheerio")
const log = require("../lib/log")
const logger = log.getLogger()

class GithubCrawler {
  //判断用户是否存在
  static exist(username, callback) {
    logger.info("testing username " + username)
    axios
      .get(`http://github.com/${username}`)
      .then(resp => {
        logger.info("has this user ")

        callback(true)
      })
      .catch(err => {
        logger.error(err)
        callback(false)
      })
  }

  constructor(username, cout, callback) {
    this.repos = [] //下载到的repo
    this.username = username.trim()
    this.spider = new Crawler(cout, () => {
      this.formatData(this.repos)
      callback(this.repos)
    })
    this.cout = cout
  }

  handler(page) {
    var $ = cheerio.load(page)
    var next = $(".pagination a")
    var nextRequests = []
    for (var i = 0; i < next.length; i++) {
      var it = next.eq(i)
      if (it.text().indexOf("Next") != -1) {
        nextRequests.push({
          url: it.attr("href"),
          handler: data => this.handler(data)
        })
      }
    }
    var lis = $("#user-repositories-list li")
    for (var i = 0; i < lis.length; i++) {
      var li = lis.eq(i)
      var repo = {
        label: li
          .find("h3")
          .text()
          .trim(),
        url: li
          .find("h3 a")
          .attr("href")
          .trim(),
        repoDesc: li
          .find("p")
          .text()
          .trim(),
        language: li
          .find("[itemprop=programmingLanguage]")
          .text()
          .trim(),
        star: li
          .find(".muted-link.mr-3")
          .eq(0)
          .text()
          .trim(),
        fork: li
          .find(".muted-link.mr-3")
          .eq(1)
          .text()
          .trim(),
        forkedFrom: li
          .find(".f6.text-gray.mb-1 a")
          .text()
          .trim()
      }
      this.cout(repo)
      this.repos.push(repo)
    }
    return nextRequests
  }

  //简单地规整一下数据
  formatData(repos) {
    for (var repo of repos) {
      var star = repo.star ? parseInt(repo.star) : 0
      var fork = repo.fork ? parseInt(repo.fork) : 0
      repo.star = star
      repo.fork = fork
      repo.url = `http://github.com${repo.url}`
      if (!repo.language) {
        repo.language = "txt"
      }
    }
  }

  start() {
    this.spider.crawl("https://github.com/" + this.username + "?tab=repositories", data => this.handler(data))
  }
}

module.exports = GithubCrawler

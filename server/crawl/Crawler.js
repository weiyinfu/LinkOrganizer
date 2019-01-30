/**
 * JS爬虫框架
 * */
const axios = require("axios")
const log = require("../lib/log")

const logger = log.getLogger()

class Crawler {
  constructor(cout, callback) {
    this.visited = new Set() //已经访问过的url列表
    this.activeCount = 0 //活跃线程数
    this.cout = cout //输出函数
    this.callback = callback //任务完成之后调用的函数
    this.over = false //结束标志
  }

  crawl(url, handler) {
    if (this.visited.has(url)) {
      //已访问过的不必再访问
      return
    }
    this.activeCount++ //活跃线程数加一
    this.cout(`crawling ${url}`)
    this.visited.add(url)
    axios
      .get(url)
      .then(resp => {
        if (resp.status == 200) {
          var requests = handler(resp.data)
          for (var req of requests) {
            this.crawl(req.url, req.handler)
          }
        } else {
          this.cout(resp.status)
          this.cout("请求" + url + "失败")
        }
        this.activeCount--
        this.checkOver() //每次请求完成之后都要检查一次是否完成全部任务
      })
      .catch(err => {
        this.activeCount--
        this.cout("请求失败")
        if (err.response)
          //如果是其它地方的异常，可能没有response对象，防止再出异常
          this.cout("" + err.response.status)
        logger.error(err)
        this.over = true
        this.checkOver()
      })
  }

  //根据活跃线程数检查是否下载完毕
  checkOver() {
    if (!this.over && this.activeCount > 0) {
      this.cout("downloading ...")
    } else {
      this.cout("下载完毕")
      this.callback()
    }
  }
}

module.exports = Crawler

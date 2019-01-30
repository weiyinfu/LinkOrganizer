const GithubCrawler = require("../server/crawl/GithubCrawler")
var username = "weiyinfu"
new GithubCrawler(
  username,
  function(s) {
    console.log(s)
  },
  function(data) {
    //导出爬取到的数据
    console.log("正在保存数据" + data.length)
    console.log(data)
  }
).start()

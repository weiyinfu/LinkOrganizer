const CnblogCrawler = require("../server/crawl/CnblogCrawler")
var crawler = new CnblogCrawler("weiyinfu", console.log, data => {
  console.log(data.length)
})
crawler.start()

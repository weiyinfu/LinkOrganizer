const GithubCrawler = require("../server/crawl/GithubCrawler")
GithubCrawler.exist("weiyinfu", hasThisUser => {
  console.log(hasThisUser)
})

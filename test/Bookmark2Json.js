const bookmark2json = require("../vues/js/BookmarkJson").bookmark2json
const path = require("path")
const fs = require("fs")
var a = bookmark2json(path.join(__dirname, "chrome-bookmark.html"))
console.log(a)
fs.writeFileSync(path.join(__dirname, "bookmark.json"), JSON.stringify(a))

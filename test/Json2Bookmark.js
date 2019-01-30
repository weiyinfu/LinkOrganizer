var fs = require("fs")
var path = require("path")
const json2bookmark = require("../vues/js/BookmarkJson").json2bookmark
var a = JSON.parse(fs.readFileSync(path.join(__dirname, "./bookmark.json")).toString("utf8"))
var s = json2bookmark(a)
fs.writeFileSync(path.join(__dirname, "bookmark.html"), s)
console.log(s)

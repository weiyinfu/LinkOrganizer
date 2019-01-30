/*
 * 统计代码量
 */
var fs = require("fs")
var path = require("path")

var ignoreName = new Set(["node_modules", "dist", ".idea", "ElTree", "test"])
var allowedFileType = new Set(["js", "vue", "less"])
function go(folder) {
  var lineCount = {}
  for (var i of fs.readdirSync(folder)) {
    if (ignoreName.has(i)) continue
    if (fs.statSync(path.join(folder, i)).isDirectory()) {
      var res = go(path.join(folder, i))
      for (var i in res) {
        if (!lineCount[i]) {
          lineCount[i] = 0
        }
        lineCount[i] += res[i]
      }
    } else {
      var fileType = i.substring(i.lastIndexOf(".") + 1)
      if (!allowedFileType.has(fileType)) {
        continue
      }
      var now = fs
        .readFileSync(path.join(folder, i))
        .toString("utf8")
        .split("\n").length
      console.log(path.relative(process.cwd(), path.join(folder, i)) + " " + now)
      if (!lineCount[fileType]) lineCount[fileType] = 0
      lineCount[fileType] += now
    }
  }
  return lineCount
}

console.log(go(__dirname))

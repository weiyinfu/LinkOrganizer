/*找到项目全部的依赖 */
/*
 * 统计代码量
 */
var fs = require("fs")
var path = require("path")

var ignoreName = new Set(["node_modules", "dist", ".idea", "ElTree", "test"])
var allowedFileType = new Set(["js", "vue"])

var dependencies = new Set()
function parse(s) {
  var lines = s.split("\n")
  for (var i of lines) {
    var req = /require\s*\(\"(.+)\"\s*\)/.exec(i)
    var imp = /import\s*\"(.+)\"/.exec(i)
    var fro = /import.*from\s*\"(.+)\"/.exec(i)
    if (req) {
      var dep = req[1]
      dependencies.add(dep)
    }
    if (imp) {
      var dep = imp[1]
      dependencies.add(dep)
    }
    if (fro) {
      var dep = fro[1]
      dependencies.add(dep)
    }
  }
}
function go(folder) {
  for (var i of fs.readdirSync(folder)) {
    if (ignoreName.has(i)) continue
    if (fs.statSync(path.join(folder, i)).isDirectory()) {
      go(path.join(folder, i))
    } else {
      var fileType = i.substring(i.lastIndexOf(".") + 1)
      if (!allowedFileType.has(fileType)) {
        continue
      }
      var s = fs.readFileSync(path.join(folder, i)).toString("utf8")
      parse(s)
    }
  }
}
go(__dirname)
var deps = Array.from(dependencies).filter(x => !x.startsWith(".")).sort()
console.log(deps)

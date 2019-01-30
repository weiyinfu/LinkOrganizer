//遍历树，返回从根路径到该结点的整条路径（闭区间，最后一个元素是该结点本身）
function tranverseTree(nodeHandler, root, shouldStop) {
  var path = []
  function dfs(node) {
    path.push(node)
    nodeHandler(path, node)
    if (node.children) {
      for (var i of node.children) {
        dfs(i)
        if (shouldStop()) break
      }
    }
    path.pop()
  }
  dfs(root)
}

//为结点数据添加key
function addKey(treeData) {
  //为每个结点添加key
  var globalId = 1
  tranverseTree((nodepath, node) => (node.id = globalId++), treeData, () => false)
  return globalId
}
//只能处理具名函数，不能处理匿名函数。因为匿名函数可能有很多导致内存爆掉
function waitEnough(time, fun) {
  if (arguments.callee.map == null) {
    arguments.callee.map = {}
  }
  var ma = arguments.callee.map
  if (!ma[fun]) {
    ma[fun] = 0
  }
  var lastTime = ma[fun]
  var nowTime = new Date().getTime()
  if (nowTime - lastTime < time) {
    return false
  } else {
    ma[fun] = nowTime
    return true
  }
}
//获取元素的唯一路径，作为元素的key，用来在localStorage中存储控件的状态
function getElementPath(element) {
  if (element.id !== "") {
    //判断id属性，如果这个元素有id，则显 示//*[@id="xPath"]  形式内容
    return '//*[@id="' + element.id + '"]'
  }
  //这里需要需要主要字符串转译问题，可参考js 动态生成html时字符串和变量转译（注意引号的作用）
  if (element == document.body) {
    //递归到body处，结束递归
    return "/html/" + element.tagName.toLowerCase()
  }
  var ix = 1, //在nodelist中的位置，且每次点击初始化
    siblings = element.parentNode.childNodes //同级的子元素

  for (var i = 0, l = siblings.length; i < l; i++) {
    var sibling = siblings[i]
    //如果这个元素是siblings数组中的元素，则执行递归操作
    if (sibling == element) {
      return arguments.callee(element.parentNode) + "/" + element.tagName.toLowerCase() + "[" + ix + "]"
      //如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
    } else if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
      ix++
    }
  }
}
//根据内容下载文件
function downLoad(content, fileName) {
  var aEle = document.createElement("a"),
    blob = new Blob([content])
  aEle.download = fileName
  aEle.href = URL.createObjectURL(blob)
  aEle.click()
}
//将时间转为可读性较好的字符串

function time2string(t) {
  if (t == 0) {
    return "很久以前"
  }
  var d = new Date()
  d.setTime(t)
  var now = new Date()
  var hour = 3600 * 1000
  function sameDay() {
    if (now.getTime() - d.getTime() < 1000 * 5 * 60) {
      return "刚刚"
    }
    return `${d.getHours()}时${d.getMinutes()}分`
  }
  function yesterday() {
    return `昨天${d.getHours()}时${d.getMinutes()}分`
  }
  function lastYesterDay() {
    return `前天${d.getHours()}时${d.getMinutes()}分`
  }
  function thisWeek() {
    return `周${"日一二三四五六"[d.getDay()]}${d.getHours()}时`
  }
  function lastWeek() {
    return `上周${"日一二三四五六"[d.getDay()]}${d.getHours()}时`
  }
  function thisMonth() {
    return `${d.getDate()}日${d.getHours()}时`
  }
  function thisYear() {
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }
  function lastYear() {
    return `去年${d.getMonth() + 1}月${d.getDate()}日`
  }
  function common() {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }
  function getTodayBeg() {
    var todayBeg = new Date()
    todayBeg.setHours(0)
    todayBeg.setMinutes(0)
    todayBeg.setMilliseconds(0)
    todayBeg.setSeconds(0)
    return todayBeg
  }
  function getWeekBeg() {
    var ans = getTodayBeg()
    ans.setTime(ans.getTime() - ans.getDay() * 24 * hour)
    return ans
  }
  function getMonthBeg() {
    var ans = getTodayBeg()
    ans.setTime(ans.getTime() - ans.getDate() * 24 * hour)
    return ans
  }
  function getYearBeg() {
    var ans = getTodayBeg()
    ans.setMonth(0)
    ans.setDate(0)
    return ans
  }
  function getLastYearBeg() {
    var ans = getYearBeg()
    ans.setFullYear(ans.getFullYear() - 1)
    return ans
  }
  var todayBeg = getTodayBeg()

  if (d.getTime() > todayBeg.getTime()) {
    return sameDay()
  } else if (todayBeg.getTime() - d.getTime() < 48 * hour) {
    return yesterday()
  } else if (todayBeg.getTime() - d.getTime() < 72 * hour) {
    return lastYesterDay()
  }
  var weekBeg = getWeekBeg()
  if (weekBeg.getTime() < d.getTime()) {
    return thisWeek()
  }
  if (weekBeg.getTime() - 7 * 24 * hour < d.getTime()) {
    return lastWeek()
  }
  var monthBeg = getMonthBeg()
  if (monthBeg.getTime() < d.getTime()) {
    return thisMonth()
  }
  var yearBeg = getYearBeg()
  if (yearBeg.getTime() < d.getTime()) {
    return thisYear()
  }
  if (d.getTime() > getLastYearBeg()) {
    return lastYear()
  }
  return common()
}
function betterSpan(s) {
  var a = []
  var i = 0
  var now = ""
  var isChinese = false
  while (i < s.length) {
    var ch = s[i]
    i++
    if (/[\u4e00-\u9fa5]+/.test(ch)) {
      if (isChinese) {
        now += ch
      } else {
        if (now) a.push(`<span class='english'>${now}</span>`)
        now = ch
        isChinese = true
      }
    } else {
      if (isChinese) {
        isChinese = false
        if (now) a.push(`<span class='chinese'>${now}</span>`)
        now = ch
      } else {
        now += ch
      }
    }
  }
  if (now) a.push(`<span class='${isChinese ? "chinese" : "english"}'>${now}</span>`)
  return a.join("")
}

module.exports = {
  downLoad,
  tranverseTree,
  addKey,
  waitEnough,
  getElementPath,
  time2string,
  betterSpan
}

<template>
    <div id="wrapper"
        ref="wrapper">
        <div class="crawConsole"
            ref="console"></div>
    </div>
</template>
<script>

var url = require("url")
var querystring = require("querystring")

export default {
    data() {
        return {
            linkId: 0
        }
    },
    mounted() {
        this.linkId = this.$route.params.linkId
        var websocket = new WebSocket(this.getWsUrl(this.linkId)) //创建WebSocket对象
        //建立连接
        websocket.onopen = evt => {
            this.write("connection opened")
        }
        websocket.onclose = evt => {
            //已经关闭连接
            this.write("connection close")
        }
        websocket.onmessage = evt => {
            //收到服务器消息，使用evt.data提取
            var message = evt.data
            this.write(message)
            if (message == "over") {//已经爬完了，跳到信息页面
                this.$router.push(`/${this.getUsername()}/link/${this.linkId}`)
            } else {
                var ele = this.$refs.wrapper
                ele.scrollTop = ele.scrollHeight
            }
        }
        websocket.onerror = evt => {//产生异常
            console.log(evt)
        }
    },
    methods: {
        write(s) {
            var p = document.createElement("span")
            p.innerHTML = `<span class="startPrompt">$</span>${s}<br>`
            //关闭之后会有这个异常，所以判断一下
            if (this.$refs.console)
                this.$refs.console.appendChild(p)
        },
        getWsUrl(linkId) {
            var res = url.parse(location.href)
            var x = new url.Url()
            x.protocol = res.protocol.startsWith("https") ? "wss" : "ws"
            x.host = res.host
            x.port = res.port
            x.pathname = res.pathname + "/../wss/crawling"//使用相对路径
            x.search = "linkId=" + linkId
            return url.format(x)
        }
    }
}
</script>
<style lang="less">
@import "../common.less";
#wrapper {
  background: rgb(44, 0, 30);
  .fillParent();
  .goodScrollBar();
}
.crawConsole {
  color: white;
  font-size: 23px;
  overflow-x: hidden;
  font-family: Consolas;
  .startPrompt {
    color: #00ff00;
  }
}
</style>

<template>
  <div class="wrapper">
    <div class="login-panel"
      @click="handleLoginClick">
      <span class="title">链接管理器</span><br>
      <span style="margin-top:50px;display:block;">使用Github登录链接管理器</span>
    </div>
  </div>
</template>
    
<script >
const control = require("../js/AccessControl")
export default { 
  methods: {
    handleLoginClick() {
      control.login(false)
    }
  }
}

</script>

<style lang="less"  module>
@import "../common.less";
.wrapper {
  .fillParent();
  background-color: antiquewhite;
  box-shadow: 20px 20px 440px #2f10df inset, 30px 30px 200px #aaa4af inset, 0 0 750px #6d6e88 inset;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-panel {
  width: fit-content;
  height: fit-content;
  text-align: center;
  background: white;
  border-radius: 40px;
  box-shadow: 0 0 100px #61406e, 0 0 100px #0f0e74 inset;
  padding: 50px;
  user-select: none;
  .title {
    font-size: 35px;
    font-family: "华文新魏", "隶书", "楷体", "微软雅黑", Consolas;
  }
  &:hover {
    box-shadow: 0 0 100px #61406e inset, 0 0 100px #0f0e74 inset;
  }
}
</style>

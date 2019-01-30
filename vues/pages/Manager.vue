<template>
  <div>
    storeList<br>
    <div><span v-for="storeId in storeState"
        :key="storeId">{{storeId}}</span></div>
    <hr>
    userList<br>
    <div><span v-for="user in userList"
        :key="user.id">{{user}}</span></div>
  </div>
</template>
<script>
const access = require("../Access.js")
export default {
  data() {
    return {
      storeState: [],
      userList: [],
    }
  },
  mounted() {
    this.get(access.storeState.url).then(resp => {
      this.storeState = resp.data
    }).catch(e => { console.log(e) })
    this.get(access.userList.url).then(resp => {
      this.userList = resp.data
    }).catch(e => { console.log(e) })
  }
}
</script>
<style lang="less" module>
</style>

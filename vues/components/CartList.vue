<template>
  <div>
    <el-row v-for="row in 1+Math.floor(cardList.length/4)"
      :key="row">
      <el-col :span="24/colCount"
        v-for="col in Math.max(Math.min(cardList.length-(row-1)*colCount,colCount),0)"
        :key="col">
        <slot :data="cardList[(row-1)*colCount+col-1]"></slot>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  props: {
    cardList: {
      required: true,
      type: Array,
    },
    colCount: {
      default: 4,
      required: false,
      type: Number
    }
  }
}
</script>
<style lang="less" module>
</style>

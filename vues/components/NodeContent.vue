<template>
    <div :class="$style['node-content']"
        ref="nodeContent">
        <span>
            <i :class="'fa '+iconType" />&nbsp; {{node.label}} </span> &nbsp; &nbsp;
        <span :class="$style.url">{{node.data.url}}</span>
    </div>
</template>
<script >
export default {
    props: {
        node: { type: Object }
    },
    computed: {
        //获取标签
        isFolder() {
            return this.node.data.children ? true : false
        },
        //是否为叶子节点
        isLeaf() {
            if (this.node.data.children) {
                return false
            }
            return true
        },
        iconType() {
            if (this.isFolder) {
                var hasVisibleSon = false
                for (var child of this.node.data.children) {
                    if (child.children) {
                        hasVisibleSon = true
                        break
                    }
                }
                if (this.node.expanded && hasVisibleSon) {
                    return "fa-folder-open"
                } else {
                    return "fa-folder"
                }
            } else {
                return "fa-file"
            }
        }
    }
}
</script>
<style lang="less" module>
.node-content {
  user-select: none;
  height: 100%;
  &:focus {
    outline: 0;
  }
}
.fa-folder,
.fa-folder-open {
  color: #ffe68c;
}
.fa-file {
  color: #1a111196;
}

.is-current .url {
  font-size: 13px;
  color: #b8b0b0;
  vertical-align: middle;
  display: inline;
}
.url {
  display: none;
}
</style>

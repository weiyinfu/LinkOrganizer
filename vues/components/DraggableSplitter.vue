// 可拖动的分隔栏组件
<template>
    <div class="splitter"
        :class="{'splitter-dragging':splitterDragging}"
        :style="splitterStyle"
        draggable
        @drag="drag($event)"
        @dragstart="dragstart($event)"
        @dragend="dragend($event)"></div>
</template>
<script>
const util = require("../util.js")
export default {
    data() {
        return {
            splitterDragging: false,//是否正在拖拽
            elementPath: null//当前元素的路径，用于在localstorage缓存拖动条位置
        }
    },
    props: {
        //方向，如果是vertical，拖动条是竖着的，如果是horizontal，拖动条是横着的
        direction: {
            type: String,
            validator(value) {
                return value == "horizontal" || value == "vertical"
            }
        },
        //默认的厚度
        thick: {
            type: Number,
            default: 10
        }
    },
    computed: {
        splitterStyle() {
            if (this.direction == "horizontal") {
                return {
                    width: "100%",
                    height: this.thick + "px",
                    cursor: "h-resize"
                }
            } else {
                return {
                    width: this.thick + "px",
                    height: "100%",
                    cursor: "w-resize",
                }
            }
        }
    },
    mounted() {
        //加载之后读取缓存中的拖动条位置
        this.elementPath = util.getElementPath(this.$el)
        try {
            var splitterPos = JSON.parse(localStorage[this.elementPath])
            this.updateSplitterPos(splitterPos)
        } catch (e) {
            console.log(e)
        }
    },
    methods: {
        //已经设置了禁止拖动，但是不够，还需要禁止上传事件   
        dragstart(event) {
            this.splitterDragging = true
            event.dataTransfer.effectAllowed = "none"
        },
        dragend(event) {
            this.splitterDragging = false
            localStorage[this.elementPath] = JSON.stringify({ clientX: event.clientX,clientY: event.clientY })
        },
        drag(event) {
            event.preventDefault()
            event.stopPropagation()
            if (!util.waitEnough(200,this.drag)) return
            this.updateSplitterPos({ clientX: event.clientX,clientY: event.clientY })
        },
        /*mousePos包含clientX和clientY */
        updateSplitterPos(mousePos) {
            //两个总共的占比 
            var parent = this.$el.parentNode
            var previousSibling = this.$el.previousElementSibling
            var nextSibling = this.$el.nextElementSibling
            var parentRect = parent.getBoundingClientRect()
            var previousRect = previousSibling.getBoundingClientRect()
            var nextRect = nextSibling.getBoundingClientRect()
            var rectSizeGetter = null,mousePosGetter = null,startPos = null,setSize = null
            if (this.direction == "vertical") {
                rectSizeGetter = rect => rect.width
                mousePosGetter = mousePos => mousePos.clientX
                startPos = rect => rect.left
                setSize = (ele,sz) => { ele.style.width = sz }
            } else {
                rectSizeGetter = rect => rect.height
                mousePosGetter = mousePos => mousePos.clientY
                startPos = rect => rect.top
                setSize = (ele,sz) => { ele.style.height = sz }
            }
            var totalWidth = rectSizeGetter(previousRect) + rectSizeGetter(nextRect)
            var leftDis = mousePosGetter(mousePos) - startPos(previousRect)
            var totalWidthPercent = totalWidth / rectSizeGetter(parentRect)
            var leftPercent = leftDis / totalWidth
            if (leftPercent < 1e-5 || leftPercent > 1) return//有时候会误判，这个设置是经验值
            setSize(previousSibling,(100 * totalWidthPercent * leftPercent) + "%")
            setSize(nextSibling,(100 * totalWidthPercent * (1 - leftPercent)) + "%")
        }
    }
}
</script>
<style module lang="less">
.splitter {
  background: transparent;
  transition-duration: 500ms;
  transition-property: background;
}
.splitter:hover,
.splitter-dragging {
  background: #777777 !important;
}
</style>

<template>
    <span :style="{ width: width + 'px', height: width + 'px' }" class="icon">
        <img :src="getImage()" :style="{ 'object-fit': fit }" />
    </span>
</template>
<script>
export default {
    name: "Icon",
    props: {
        fileType: Number,
        iconName: String,
        cover: String,
        width: {
            type: Number,
            default: 32,
        },
        fit: {
            type: String,
            default: 'cover',
        },
    },
    data() {
        return {
            fileTypeMap: {
                0: { desc: "目录", icon: "folder" },
                1: { desc: "视频", icon: "video" },
                2: { desc: "音频", icon: "music" },
                3: { desc: "程序", icon: "code" },
                4: { desc: "exe", icon: "pdf" },
                5: { desc: "excel", icon: "excel" },
                6: { desc: "纯文本", icon: "txt" },
                7: { desc: "doc", icon: "word" },
                8: { desc: "图片", icon: "image" },
                9: { desc: "压缩包", icon: "zip" },
                10: { desc: "其他文件", icon: "others" },
            }
        };
    },
    methods: {
        getImage() {
            if (this.cover) {
                const cuts = this.cover.split('\\');
                const fileName = cuts[cuts.length - 1];
                const userId = cuts[cuts.length - 2];
                return `http://localhost:8080/uploads/${userId}/${fileName}`;
            }
            let icon = "unknow_icon";
            if (this.iconName) {
                icon = this.iconName;
            } else {
                const iconMap = this.fileTypeMap[this.fileType];
                if (iconMap != undefined) {
                    icon = iconMap["icon"];
                }
            }
            return require(`@/assets/icon-image/${icon}.png`);
        }
    }
}
</script>
<style lang="scss" scoped>
.icon {
    text-align: center;
    display: inline-block;
    border-radius: 3px;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
    }
}
</style>

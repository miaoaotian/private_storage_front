<template>
    <div>
        <component :is="previewComponent" :url="url"></component>
    </div>
</template>

<script>
import VideoPreview from './VideoPreview.vue';
import AudioPreview from './AudioPreview.vue';
import CodePreview from './CodePreview.vue';
import PdfPreview from './PdfPreview.vue';
import ExcelPreview from './ExcelPreview.vue';
import TextPreview from './TextPreview.vue';
import WordPreview from './WordPreview.vue';
import ImagePreview from './ImagePreview.vue';
import UnsupportedPreview from './UnsupportedPreview.vue';

export default {
    name: 'FilePreview',
    props: {
        url: {
            type: String,
        },
        type: {
            type: Number,
        },
    },
    computed: {
        previewComponent() {
            switch (this.type) {
                case 1: // 视频
                    return VideoPreview;
                case 2: // 音频
                    return AudioPreview;
                case 3: // 代码
                    return CodePreview;
                case 4: // PDF
                    return PdfPreview;
                case 5: // Excel
                    return ExcelPreview;
                case 6: // 文本文件
                    return TextPreview;
                case 7: // Word 文档
                    return WordPreview;
                case 8: // 图片
                    return ImagePreview;
                default:
                    return UnsupportedPreview;
            }
        },
    }
};
</script>

<style scoped>

</style>

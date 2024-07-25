<template>
    <div class="video-wrapper">
        <video ref="videoPlayer" muted controls crossorigin="anonymous" class="video-element"></video>
    </div>
</template>

<script>
import Hls from 'hls.js';

export default {
    name: 'VideoPreviewHLS',
    props: {
        url: {
            type: String,
            required: true
        }
    },
    mounted() {
        const video = this.$refs.videoPlayer;
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(this.url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                video.play();
            });
            hls.on(Hls.Events.ERROR, function(event, data) {
                console.error('HLS.js error:', data);
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = this.url;
            video.addEventListener('loadedmetadata', function() {
                video.play();
            });
            video.addEventListener('error', function(event) {
                console.error('Video playback error:', event);
            });
        } else {
            console.error('HLS is not supported in this browser.');
        }
    }
};
</script>

<style scoped>
.video-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}
  
.video-element {
    max-width: 100%;
    max-height: 80vh;
}
</style>

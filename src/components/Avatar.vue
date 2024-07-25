<template>
  <div class="avatar-wrapper" :style="{ width: computedWidth, height: computedWidth }">
    <img class="avatar-body" :src="computedAvatarSrc" :size="size" :fit="fit" :style="{ width: '100%', height: '100%' }"/>
  </div>
</template>


<script>
export default {
    name: 'Avatar',
    props: {
        size: {
            type: [Number, String],
            default: 'large'
        },
        fit: {
            type: String,
            default: 'cover'
        },
        avatarSrc: {
            type: String,
            default: '',
            required: true
        },
        width: {
            type: [Number, String] 
        }
    },
    computed: {
        computedWidth() {
            return this.width ? `${this.width}px` : 'auto';
        },
        computedAvatarSrc() {
            let url = this.avatarSrc;
            if(url === '') return ;
            console.log("aaa",url);
            console.log(`${url}?t3=${new Date().getTime()}`)
             return `${url}?t4=${Math.random()}`;
            // return `${this.avatarSrc}`;
        }
    }
}
</script>


<style>
.avatar-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
}
.avatar-body {
    border-radius: 50%;
}
</style>
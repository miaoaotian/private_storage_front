<template>
    <div class="img-Preview">
        <img :src="url" alt="Preview Image" class="img-body">
    </div>
</template>

<script>
export default {
    name: 'ImagePreview',
    props: {
        url: {
            type: String,
            required: true
        }
    }
};
</script>

<style scoped>
.img-Preview {
    max-height: 60vh;
}
.img-body {
    max-height: 60vh;
}
</style>

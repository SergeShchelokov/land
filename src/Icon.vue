<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 24 })
</script>
<template><img class="icon" :src="`./assets/${name}.svg`" :width="size" :height="size" alt="" aria-hidden="true" draggable="false" /></template>

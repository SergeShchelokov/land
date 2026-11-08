<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { demoViewport } from './landing-model'
const host = ref<HTMLElement>(), width = ref(1152), height = ref(577), ready = ref(false)
const viewport = computed(() => demoViewport(width.value, height.value))
let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(entries => {
    const bounds = entries[0]?.contentRect
    if (bounds && bounds.width > 0 && bounds.height > 0) { width.value = bounds.width; height.value = bounds.height }
  })
  if (host.value) observer.observe(host.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>
<template>
  <div ref="host" class="demo-embed" :aria-busy="!ready">
    <iframe class="demo-iframe" src="./demo.html" title="Интерактивный список полей и севооборот" :style="{ width: `${viewport.width}px`, height: `${viewport.height}px`, transform: `scale(${viewport.scale})` }" @load="ready = true" />
    <a class="demo-expand" href="./demo.html" target="_blank" rel="noopener" aria-label="Открыть демо в новой вкладке">Развернуть демо</a>
  </div>
</template>

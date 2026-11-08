<script setup lang="ts">
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'reka-ui'
defineProps<{ label: string; align?: 'start' | 'center' | 'end'; side?: 'top' | 'right' | 'bottom' | 'left'; modal?: boolean; contentClass?: string }>()
const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <PopoverRoot v-model:open="open" :modal="modal">
    <PopoverTrigger as-child><slot name="trigger" /></PopoverTrigger>
    <PopoverPortal>
      <PopoverContent class="ui-popover" :class="contentClass" :align="align ?? 'end'" :side="side ?? 'bottom'" :side-offset="8" :collision-padding="12" :aria-label="label">
        <slot />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

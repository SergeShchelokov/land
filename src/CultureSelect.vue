<script setup lang="ts">
import { computed } from 'vue'
import { SelectRoot, SelectTrigger, SelectValue, SelectPortal, SelectContent, SelectViewport, SelectItem, SelectItemText, SelectItemIndicator } from 'reka-ui'
import { cultures } from './model'
import Icon from './Icon.vue'
defineProps<{ invalid?: boolean; disabled?: boolean; describedBy?: string }>()
const model = defineModel<string>({ required: true })
const current = computed(() => cultures.find(item => item.id === model.value))
</script>
<template>
  <SelectRoot v-model="model" :disabled="disabled">
    <SelectTrigger class="culture-trigger field-control" aria-label="Культура" :aria-invalid="invalid || undefined" :aria-describedby="describedBy">
      <SelectValue placeholder="Выберите культуру" /><img v-if="current?.id === 'buckwheat'" src="/assets/panel-imgFrame2087328905.svg" class="selected-culture-marker" width="20" height="24" alt="" /><span v-else-if="current" class="culture-dot" :style="{ background: current.color }" /><Icon name="header-imgKeyboardArrowDown" :size="20" />
    </SelectTrigger>
    <SelectPortal><SelectContent class="culture-options" position="popper" :side-offset="4" :collision-padding="12" align="start">
      <SelectViewport><SelectItem v-for="item in cultures" :key="item.id" class="culture-option" :value="item.id">
        <span class="culture-dot" :style="{ background: item.color }" /><SelectItemText>{{ item.name }}</SelectItemText><SelectItemIndicator class="selected-tick"><Icon name="check" :size="16" /></SelectItemIndicator>
      </SelectItem></SelectViewport>
    </SelectContent></SelectPortal>
  </SelectRoot>
</template>

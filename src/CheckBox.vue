<script setup lang="ts">
import { Checkbox } from '@vuetify/v0/components'
import Icon from './Icon.vue'
defineProps<{ checked: boolean; mixed?: boolean; label: string; disabled?: boolean }>()
const emit = defineEmits<{ change: [value: boolean] }>()
</script>
<template>
  <Checkbox.Root class="checkbox-hit" :model-value="checked" :indeterminate="mixed" :disabled="disabled" :label="label" @update:model-value="emit('change', $event === true)">
    <span class="checkbox-box"><Icon v-if="mixed || checked" :name="mixed ? 'table-imgMinus' : 'table-imgCheck'" :size="12" /></span>
  </Checkbox.Root>
</template>

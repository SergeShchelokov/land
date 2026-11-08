<script setup lang="ts">
import { computed, ref, shallowRef, useId, watch } from 'vue'
import { parseDate, today, getLocalTimeZone, type DateValue } from '@internationalized/date'
import { PopoverRoot, PopoverAnchor, PopoverTrigger, PopoverPortal, PopoverContent, CalendarRoot, CalendarGrid, CalendarGridHead, CalendarGridRow, CalendarHeadCell, CalendarGridBody, CalendarCell, CalendarCellTrigger } from 'reka-ui'
import { dateISO, dateDisplay } from './model'
import Icon from './Icon.vue'
const props = defineProps<{ label: string; invalid?: boolean; describedBy?: string; disabled?: boolean; min?: string }>()
const model = defineModel<string>({ required: true })
const open = ref(false), id = useId()
const input = ref<HTMLInputElement>()
const view = shallowRef<DateValue>(today(getLocalTimeZone()))
const selected = computed(() => dateISO(model.value) ? parseDate(dateISO(model.value)!) : undefined)
const minimum = computed(() => props.min && dateISO(props.min) ? parseDate(dateISO(props.min)!) : parseDate('1900-01-01'))
const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const years = Array.from({ length: 201 }, (_, index) => 1900 + index)
watch(open, value => { if (value) view.value = selected.value ?? (minimum.value.year > 1900 ? minimum.value : today(getLocalTimeZone())) })
function choose(value: DateValue | undefined) { if (value) { model.value = dateDisplay(value.toString()); open.value = false } }
function navigate(part: 'month' | 'year', event: Event) { view.value = view.value.set({ [part]: Number((event.target as HTMLSelectElement).value) }) }
function normalize() { model.value = model.value.trim() }
</script>
<template>
  <PopoverRoot v-model:open="open">
    <PopoverAnchor as-child><div class="date-field field-control" :class="{ invalid, disabled }">
      <input :id="id" ref="input" v-model="model" :aria-label="label" :aria-invalid="invalid || undefined" :aria-describedby="describedBy" :disabled="disabled" placeholder="дд.мм.гггг" inputmode="numeric" maxlength="10" autocomplete="off" @blur="normalize" @keydown.alt.down.prevent="open = true" />
      <PopoverTrigger as-child><button type="button" class="calendar-trigger" :aria-label="`Открыть календарь: ${label.toLowerCase()}`" :disabled="disabled"><Icon name="calendar" :size="24" /></button></PopoverTrigger>
    </div></PopoverAnchor>
    <PopoverPortal><PopoverContent class="calendar-popover" align="start" :side-offset="6" :collision-padding="12" :aria-label="`Календарь: ${label}`">
      <CalendarRoot v-slot="{ grid, weekDays }" :model-value="selected" v-model:placeholder="view" locale="ru-RU" :week-starts-on="1" weekday-format="short" :min-value="minimum" :max-value="parseDate('2100-12-31')" prevent-deselect initial-focus :calendar-label="label" @update:model-value="choose">
        <div class="calendar-caption">{{ label }}<button type="button" class="icon-button" aria-label="Закрыть календарь" @click="open = false"><Icon name="panel-imgClose1" :size="20" /></button></div>
        <div class="calendar-navigation">
          <button type="button" class="icon-button" aria-label="Предыдущий месяц" :disabled="view.year <= 1900 && view.month === 1" @click="view = view.subtract({ months: 1 })"><Icon name="calendar-previous" :size="20" /></button>
          <select aria-label="Месяц" :value="view.month" @change="navigate('month', $event)"><option v-for="(month, index) in months" :key="month" :value="index + 1">{{ month }}</option></select>
          <select aria-label="Год" :value="view.year" @change="navigate('year', $event)"><option v-for="year in years" :key="year" :value="year">{{ year }}</option></select>
          <button type="button" class="icon-button" aria-label="Следующий месяц" :disabled="view.year >= 2100 && view.month === 12" @click="view = view.add({ months: 1 })"><Icon name="calendar-next" :size="20" /></button>
        </div>
        <CalendarGrid v-for="month in grid" :key="month.value.toString()"><CalendarGridHead><CalendarGridRow><CalendarHeadCell v-for="day in weekDays" :key="day">{{ day }}</CalendarHeadCell></CalendarGridRow></CalendarGridHead>
          <CalendarGridBody><CalendarGridRow v-for="(week, index) in month.rows" :key="index"><CalendarCell v-for="day in week" :key="day.toString()" :date="day"><CalendarCellTrigger as="button" type="button" class="calendar-day" :day="day" :month="month.value">{{ day.day }}</CalendarCellTrigger></CalendarCell></CalendarGridRow></CalendarGridBody>
        </CalendarGrid>
        <div class="calendar-footer"><button type="button" class="text-button" @click="model = ''; open = false">Очистить</button><button type="button" class="text-button" :disabled="today(getLocalTimeZone()).compare(minimum) < 0" @click="choose(today(getLocalTimeZone()))">Сегодня</button></div>
      </CalendarRoot>
    </PopoverContent></PopoverPortal>
  </PopoverRoot>
</template>

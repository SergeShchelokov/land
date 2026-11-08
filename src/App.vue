<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { AlertDialogRoot, AlertDialogPortal, AlertDialogOverlay, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, ToastProvider, ToastRoot, ToastTitle, ToastDescription, ToastClose, ToastViewport } from 'reka-ui'
import UiButton from './shared/UiButton.vue'
import UiPopover from './shared/UiPopover.vue'
import Icon from './Icon.vue'
import CheckBox from './CheckBox.vue'
import DateField from './DateField.vue'
import CultureSelect from './CultureSelect.vue'
import { fields, groups, cultures, initialField, cropErrors, parseStored, selectionState, type Crop, type FieldData } from './model'

const panelOpen = ref(true), activeId = ref('56'), query = ref(''), searching = ref(false)
const selected = ref(new Set<string>(['56'])), collapsed = ref(new Set(groups.slice(1))), rootCollapsed = ref(false)
const sort = ref<{ key: 'name' | 'official' | 'survey' | 'area'; direction: number }>({ key: 'name', direction: 0 })
const selectionTouched = ref(false), saving = ref(false), saveError = ref(''), loadError = ref('')
const menuField = ref<string | null>(null)
const compactQuery = window.matchMedia('(max-width:1050px)'), compact = ref(compactQuery.matches)
function updateCompact(event: MediaQueryListEvent) { compact.value = event.matches }
compactQuery.addEventListener('change', updateCompact)
const saved = ref<FieldData>(initialField('56')), working = ref<FieldData>(initialField('56'))
const draft = ref<Crop | null>(null), attempted = ref(false), deletedCrop = ref<Crop | null>(null)
const notification = ref<{ id: number; title: string; message: string } | null>(null)
const pendingAction = ref<(() => void) | null>(null), confirmOpen = ref(false)
const season = ref('Сезон 2024/2025 лето'), seasonOpen = ref(false)
const searchInput = ref<HTMLInputElement>(), panelTitle = ref<HTMLElement>()
let failedSave = false
const key = (id: string) => `smart-seed:crop-rotation:v1:${id}`
const copy = (data: FieldData): FieldData => JSON.parse(JSON.stringify(data))
const activeField = computed(() => fields.find(field => field.id === activeId.value)!)
const dirty = computed(() => !!draft.value || JSON.stringify(saved.value) !== JSON.stringify(working.value))
const errors = computed(() => draft.value && attempted.value ? cropErrors(draft.value, working.value.crops) : {})
const visible = computed(() => {
  const result = fields.filter(field => `${field.name} ${field.alias} ${field.group}`.toLocaleLowerCase('ru').includes(query.value.trim().toLocaleLowerCase('ru')))
  const { key, direction } = sort.value
  return direction ? [...result].sort((a, b) => direction * (key === 'name' ? a.name.localeCompare(b.name, 'ru') : (a[key] ?? -1) - (b[key] ?? -1))) : result
})
const visibleGroups = computed(() => query.value.trim() ? groups.filter(group => visible.value.some(field => field.group === group)) : groups)
const allState = computed(() => selectionState(visible.value.map(field => field.id), selected.value))
const visibleSelected = computed(() => visible.value.filter(field => selected.value.has(field.id)).length)
const draftIsExisting = computed(() => working.value.crops.some(crop => crop.id === draft.value?.id))
const history = computed(() => working.value.crops.filter(crop => crop.id !== draft.value?.id))
function groupFields(group: string) { return visible.value.filter(field => field.group === group) }
function groupState(group: string) { return selectionState(groupFields(group).map(field => field.id), selected.value) }
function changeSelection(ids: string[], value: boolean) {
  const next = new Set(selected.value)
  ids.forEach(id => value ? next.add(id) : next.delete(id))
  selected.value = next; selectionTouched.value = true
}
function toggleGroup(group: string) {
  const next = new Set(collapsed.value)
  next.has(group) ? next.delete(group) : next.add(group)
  collapsed.value = next
}
function toggleAllGroups() { rootCollapsed.value = false; collapsed.value = collapsed.value.size ? new Set() : new Set(groups) }
function changeSort(key: typeof sort.value.key) { sort.value = { key, direction: sort.value.key === key && sort.value.direction === 1 ? -1 : 1 } }
function announce(title: string, message = '') { notification.value = { id: Date.now(), title, message } }
function loadField(id: string, initial = false) {
  activeId.value = id; loadError.value = ''; saveError.value = ''; attempted.value = false; deletedCrop.value = null
  let hasStored = false
  try {
    const raw = localStorage.getItem(key(id))
    saved.value = raw ? parseStored(raw) : initialField(id); hasStored = !!raw
  } catch { saved.value = initialField(id); loadError.value = 'Не удалось прочитать сохранённые данные. Показан исходный пример. Сохранение заменит данные этого поля в браузере.' }
  working.value = copy(saved.value)
  draft.value = initial && id === '56' && !hasStored ? { id: crypto.randomUUID(), planted: '25.05.2021', harvested: '', culture: 'buckwheat' } : null
  panelOpen.value = true
}
loadField('56', true)
function guard(action: () => void) {
  if (saving.value) return
  if (!dirty.value) action()
  else { pendingAction.value = action; confirmOpen.value = true }
}
function discard() { const action = pendingAction.value; pendingAction.value = null; confirmOpen.value = false; action?.() }
function openField(id: string) {
  if (id === activeId.value && panelOpen.value) return
  guard(() => { loadField(id); void nextTick(() => panelTitle.value?.focus()) })
}
function closePanel() { guard(() => { panelOpen.value = false; draft.value = null; working.value = copy(saved.value); void nextTick(() => document.getElementById(`field-${activeId.value}`)?.focus()) }) }
function beginCrop(crop?: Crop) {
  if (draft.value || saving.value) return
  if (working.value.crops.length >= 200) { announce('Достигнут лимит', 'В прототипе можно добавить до 200 записей на поле.'); return }
  draft.value = crop ? { ...crop } : { id: crypto.randomUUID(), planted: '', harvested: '', culture: '' }
  attempted.value = false; saveError.value = ''
  void nextTick(() => document.querySelector<HTMLInputElement>('.crop-editor input')?.focus())
}
async function focusInvalid() { await nextTick(); document.querySelector<HTMLElement>('.crop-editor [aria-invalid="true"]')?.focus() }
function commitCrop() {
  if (!draft.value) return true
  attempted.value = true
  const issues = cropErrors(draft.value, working.value.crops)
  if (Object.keys(issues).length) { void focusInvalid(); return false }
  const item = { ...draft.value, planted: draft.value.planted.trim(), harvested: draft.value.harvested.trim() }
  const index = working.value.crops.findIndex(crop => crop.id === item.id)
  if (index < 0) working.value.crops.unshift(item); else working.value.crops[index] = item
  draft.value = null; attempted.value = false; void nextTick(() => document.getElementById('add-culture')?.focus()); return true
}
function cancelCrop() { draft.value = null; attempted.value = false; void nextTick(() => document.getElementById('add-culture')?.focus()) }
function commitFromInput(event: KeyboardEvent) { if (event.target instanceof HTMLInputElement) { event.preventDefault(); commitCrop() } }
function removeCrop(id: string) { deletedCrop.value = working.value.crops.find(crop => crop.id === id) ?? null; working.value.crops = working.value.crops.filter(crop => crop.id !== id); saveError.value = ''; void nextTick(() => document.getElementById('undo-delete')?.focus()) }
function undoDelete() { if (deletedCrop.value) working.value.crops.unshift(deletedCrop.value); deletedCrop.value = null; void nextTick(() => document.getElementById('add-culture')?.focus()) }
async function save() {
  if (saving.value || !dirty.value || !commitCrop()) return
  saving.value = true; saveError.value = ''
  await new Promise(resolve => setTimeout(resolve, 450))
  try {
    // shortcut: browser storage only; replace with the service API when its contract is approved.
    if (new URLSearchParams(location.search).get('save') === 'error' && !failedSave) { failedSave = true; throw new Error('Simulated storage failure') }
    const value = { ...working.value, hardwareId: working.value.hardwareId.trim(), fmsId: working.value.fmsId.trim() }
    localStorage.setItem(key(activeId.value), JSON.stringify(value))
    working.value = copy(value); saved.value = copy(value); loadError.value = ''; deletedCrop.value = null
    announce('Севооборот сохранён', 'Данные сохранены в этом браузере.')
  } catch { saveError.value = 'Не удалось сохранить данные. Изменения остаются в форме. Повторите попытку.' }
  finally { saving.value = false }
}
function culture(id: string) { return cultures.find(item => item.id === id)! }
function area(value: number | null) { return value === null ? '—' : value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function showSearch() { searching.value = true; void nextTick(() => searchInput.value?.focus()) }
function protectUnload(event: BeforeUnloadEvent) { if (dirty.value) { event.preventDefault(); event.returnValue = '' } }
window.addEventListener('beforeunload', protectUnload)
onBeforeUnmount(() => { window.removeEventListener('beforeunload', protectUnload); compactQuery.removeEventListener('change', updateCompact) })
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar" aria-label="Навигация сервиса">
      <a class="brand" href="#" aria-label="Умный сев — список полей" @click.prevent="announce('Список полей открыт')"><Icon name="sidebar-imgGroup9" /><span>УМНЫЙ СЕВ</span></a>
      <nav>
        <button class="nav-item active" aria-current="page" @click="rootCollapsed = false"><Icon name="sidebar-imgIcon" /><span>Список полей</span></button>
        <button v-for="item in [{ icon: 'QueryStats', text: 'Анализ сева' }, { icon: 'TextSnippet', text: 'Отчеты' }, { icon: 'SpeakerNotes', text: 'Журнал событий' }, { icon: 'Delete', text: 'Корзина' }]" :key="item.text" class="nav-item" :title="`${item.text}: вне этого прототипа`" disabled><Icon :name="`sidebar-img${item.icon}`" /><span>{{ item.text }}</span></button>
      </nav>
      <UiButton class="service-link" variant="secondary" @click="announce('Сервис полей', 'В этом прототипе доступен список полей и севооборот.')">Сервис полей</UiButton>
      <button class="nav-item settings" disabled title="Настройки: вне этого прототипа"><Icon name="sidebar-imgSettings" /><span>Настройки</span></button>
    </aside>

    <header class="app-header">
      <UiPopover v-model:open="seasonOpen" label="Выбор сезона" align="start">
        <template #trigger><button class="season-button"><Icon name="header-imgGraphicEq" /><span>{{ season }}</span><Icon name="header-imgKeyboardArrowDown" /></button></template>
        <div class="menu-label">Сезон</div><button v-for="option in ['Сезон 2024/2025 лето', 'Сезон 2025/2026 зима', 'Сезон 2025/2026 лето']" :key="option" class="menu-item" :aria-pressed="season === option" @click="season = option; seasonOpen = false">{{ option }}<span v-if="season === option" class="selected-tick"><Icon name="check" :size="16" /></span></button>
      </UiPopover>
      <div class="season-progress"><Icon name="header-imgAutoGraph" /><span>100% <span class="muted">13 434 га</span></span></div>
      <span class="header-spacer" /><span class="company">ООО АгромашТехЧеляб Сибирь</span>
      <UiPopover label="Уведомления"><template #trigger><button class="icon-button notifications" aria-label="Уведомления"><Icon name="header-imgNotifications" /><img src="/assets/header-imgDot.svg" width="6" height="6" alt="Есть уведомление" /></button></template><div class="small-popover"><strong>Уведомления</strong><p>Новых уведомлений нет.</p></div></UiPopover>
      <UiPopover label="Профиль"><template #trigger><button class="icon-button" aria-label="Профиль"><Icon name="header-imgAccountCircle" /></button></template><div class="small-popover"><strong>Демонстрационный профиль</strong><p>ООО АгромашТехЧеляб Сибирь</p></div></UiPopover>
    </header>

    <main class="workspace" :class="{ 'panel-is-open': panelOpen }">
      <section class="field-list" aria-label="Список полей" :inert="compact && panelOpen" :aria-hidden="compact && panelOpen ? true : undefined">
        <div class="list-title"><h1>Список полей</h1><div class="list-title-actions"><button class="icon-button" aria-label="Свернуть или развернуть все группы" @click="toggleAllGroups"><Icon name="toolbar-imgFieldBorder" /></button><UiPopover label="Добавление поля"><template #trigger><UiButton><Icon name="toolbar-imgAdd" />Поле<Icon name="toolbar-imgKeyboardArrowDown" :size="20" /></UiButton></template><div class="small-popover"><strong>Добавление поля</strong><p>Создание границ поля находится за пределами этого прототипа.</p></div></UiPopover></div></div>
        <div v-if="selectionTouched && selected.size" class="selection-bar" role="status"><span>Выбрано полей: <strong>{{ selected.size }}</strong><span v-if="visibleSelected !== selected.size"> · В поиске: {{ visibleSelected }}</span></span><button class="text-button" @click="selected = new Set()">Снять выбор</button></div>
        <div class="field-table-scroll">
          <table class="fields-table">
            <colgroup><col class="col-check" /><col class="col-name" /><col class="col-official" /><col class="col-survey" /><col class="col-area" /><col class="col-menu" /></colgroup>
            <thead><tr>
              <th><CheckBox :checked="allState.checked" :mixed="allState.mixed" :disabled="!visible.length" label="Выбрать все найденные поля" @change="changeSelection(visible.map(field => field.id), $event)" /></th>
              <th class="name-heading"><div v-if="searching" class="field-search"><Icon name="table-imgSearch" :size="20" /><input ref="searchInput" v-model="query" aria-label="Поиск полей" placeholder="Название или номер поля" @keydown.esc="query = ''; searching = false" /><button class="icon-button" aria-label="Закрыть поиск" @click="query = ''; searching = false"><Icon name="panel-imgClose1" :size="20" /></button></div><div v-else class="name-heading-content"><button class="sort-button" @click="changeSort('name')">Название объекта<Icon v-if="sort.key === 'name' && sort.direction" :name="sort.direction > 0 ? 'table-imgArrowUpward' : 'table-imgArrowDownward'" :size="16" /></button><button class="search-launcher" aria-label="Найти поле" @click="showSearch"><Icon name="table-imgSearch" :size="20" /><span>Поиск по полям</span></button></div></th>
              <th v-for="column in [{ key: 'official' as const, text: 'Офиц. площадь, га' }, { key: 'survey' as const, text: 'Пенетрометры, га' }, { key: 'area' as const, text: 'Расчётная, га' }]" :key="column.key" :aria-sort="sort.key === column.key && sort.direction ? (sort.direction > 0 ? 'ascending' : 'descending') : 'none'"><button class="sort-button" @click="changeSort(column.key)">{{ column.text }}<Icon v-if="sort.key === column.key && sort.direction" :name="sort.direction > 0 ? 'table-imgArrowUpward' : 'table-imgArrowDownward'" :size="16" /></button></th><th><span class="sr-only">Действия</span></th>
            </tr></thead>
            <tbody v-if="visibleGroups.length">
              <tr class="group-row root-group"><td><CheckBox :checked="allState.checked" :mixed="allState.mixed" label="Выбрать поля во всех группах" @change="changeSelection(visible.map(field => field.id), $event)" /></td><td><button class="group-toggle" :aria-expanded="!rootCollapsed || !!query" @click="rootCollapsed = !rootCollapsed"><Icon name="table-imgExpandMore" :class="{ collapsed: rootCollapsed && !query }" /><span>Саратовские поля-непаханные</span><span class="group-count">{{ visible.length }}</span></button></td><td>{{ area(visible.reduce((sum, field) => sum + field.official, 0)) }}</td><td>{{ area(visible.reduce((sum, field) => sum + (field.survey ?? 0), 0)) }}</td><td>{{ area(visible.reduce((sum, field) => sum + field.area, 0)) }}</td><td /></tr>
              <template v-for="group in visibleGroups" :key="group">
                <tr v-if="!rootCollapsed || query" class="group-row"><td><CheckBox :checked="groupState(group).checked" :mixed="groupState(group).mixed" :disabled="!groupFields(group).length" :label="`Выбрать группу ${group}`" @change="changeSelection(groupFields(group).map(field => field.id), $event)" /></td><td><button class="group-toggle subgroup" :aria-expanded="!collapsed.has(group) || !!query" @click="toggleGroup(group)"><Icon name="table-imgExpandMore" :class="{ collapsed: collapsed.has(group) && !query }" /><span :title="group">{{ group }}</span><span class="group-count">{{ groupFields(group).length }}</span></button></td><td>{{ area(groupFields(group).reduce((sum, field) => sum + field.official, 0)) }}</td><td>{{ area(groupFields(group).reduce((sum, field) => sum + (field.survey ?? 0), 0)) }}</td><td>{{ area(groupFields(group).reduce((sum, field) => sum + field.area, 0)) }}</td><td /></tr>
                <template v-if="(!rootCollapsed && !collapsed.has(group)) || query">
                  <tr v-for="field in groupFields(group)" :key="field.id" class="field-row" :class="{ 'is-active': field.id === activeId && panelOpen }"><td><CheckBox :checked="selected.has(field.id)" :label="`Выбрать поле ${field.name}`" @change="changeSelection([field.id], $event)" /></td><td><button :id="`field-${field.id}`" class="field-name" :title="field.name" :aria-pressed="field.id === activeId && panelOpen" @click="openField(field.id)"><Icon :name="`table-imgFieldColorMarker${field.marker}`" /><span>{{ field.name }}</span></button></td><td>{{ area(field.official) }}</td><td>{{ area(field.survey) }}</td><td>{{ area(field.area) }}</td><td><UiPopover :open="menuField === field.id" @update:open="menuField = $event ? field.id : null" :label="`Действия поля ${field.name}`"><template #trigger><button class="icon-button" :aria-label="`Меню поля ${field.name}`"><Icon name="table-imgMoreVert" /></button></template><button class="menu-item" @click="menuField = null; openField(field.id)">Севооборот</button></UiPopover></td></tr>
                  <tr v-if="!groupFields(group).length" class="empty-group"><td colspan="6">В этой группе пока нет полей</td></tr>
                </template>
              </template>
            </tbody>
          </table>
          <div v-if="!visible.length" class="empty-list" role="status"><Icon name="table-imgSearch" /><h2>Поля не найдены</h2><p>Измените запрос или сбросьте поиск.</p><UiButton variant="secondary" @click="query = ''">Сбросить поиск</UiButton></div>
        </div>
        <div class="list-summary">Полей: {{ visible.length }}<span>Площадь: {{ area(visible.reduce((sum, field) => sum + field.area, 0)) }} га</span></div>
      </section>

      <section v-if="panelOpen" class="rotation-panel" aria-labelledby="rotation-title" :aria-busy="saving">
        <header class="panel-header"><p>Севооборот</p><h2 id="rotation-title" ref="panelTitle" tabindex="-1" :title="activeField.alias">{{ activeField.alias }}</h2><button class="icon-button panel-close" aria-label="Закрыть севооборот" :disabled="saving" @click="closePanel"><Icon name="panel-imgClose" /></button></header>
        <form id="rotation-form" class="panel-body" novalidate @submit.prevent="save">
          <div v-if="loadError" class="notice" role="alert">{{ loadError }}</div>
          <fieldset class="id-section" :disabled="saving"><legend>Данные для сервиса СКВДУ</legend><label for="hardware-id">Аппаратный ID поля</label><input id="hardware-id" v-model="working.hardwareId" class="field-control" placeholder="Введите аппаратный ID поля" maxlength="80" autocomplete="off" /></fieldset>
          <fieldset class="id-section" :disabled="saving"><legend>Данные для FMS</legend><label for="fms-id">Идентификатор поля</label><input id="fms-id" v-model="working.fmsId" class="field-control" placeholder="Введите идентификатор поля" maxlength="80" autocomplete="off" /></fieldset>
          <section class="cultures-section" aria-labelledby="cultures-title"><div class="cultures-toolbar"><h3 id="cultures-title">Культуры на поле</h3><UiButton id="add-culture" variant="secondary" :disabled="!!draft || saving || working.crops.length >= 200" :title="draft ? 'Сначала завершите редактирование строки' : undefined" @click="beginCrop()"><Icon name="panel-imgAdd" />Добавить культуру</UiButton></div>
            <div v-if="!draft && !working.crops.length" class="empty-crops"><Icon name="sidebar-imgIcon" /><strong>На поле пока нет культур</strong><p>Добавьте первую запись в историю севооборота.</p><UiButton variant="secondary" :disabled="saving" @click="beginCrop()">Добавить первую культуру</UiButton></div>
            <div v-else class="crop-table-scroll"><table class="crops-table"><colgroup><col class="crop-date" /><col class="crop-date" /><col class="crop-culture" /><col class="crop-actions" /></colgroup><thead><tr><th scope="col">Дата посадки</th><th scope="col">Дата уборки</th><th scope="col">Культура</th><th><span class="sr-only">Действия</span></th></tr></thead><tbody>
              <tr v-if="draft" class="crop-editor" @keydown.enter="commitFromInput" @keydown.esc="cancelCrop"><td><DateField v-model="draft.planted" label="Дата посева" :disabled="saving" :invalid="!!errors.planted" :described-by="errors.planted ? 'planted-error' : undefined" /><span v-if="errors.planted" id="planted-error" class="field-error">{{ errors.planted }}</span></td><td><DateField v-model="draft.harvested" label="Дата уборки" :disabled="saving" :min="draft.planted" :invalid="!!errors.harvested" :described-by="errors.harvested ? 'harvested-error' : undefined" /><span v-if="errors.harvested" id="harvested-error" class="field-error">{{ errors.harvested }}</span></td><td><CultureSelect v-model="draft.culture" :disabled="saving" :invalid="!!errors.culture" :described-by="errors.culture ? 'culture-error' : undefined" /><span v-if="errors.culture" id="culture-error" class="field-error">{{ errors.culture }}</span></td><td><div class="row-actions"><button type="button" class="row-cancel" :disabled="saving" :aria-label="draftIsExisting ? 'Отменить редактирование культуры' : 'Отменить добавление культуры'" @click="cancelCrop"><Icon name="panel-imgClose1" :size="20" /></button><button type="button" class="row-commit" :disabled="saving" aria-label="Подтвердить культуру" @click="commitCrop"><Icon name="panel-imgDone" :size="20" /></button></div></td></tr>
              <tr v-if="errors.duplicate"><td colspan="4" class="duplicate-error" role="alert">{{ errors.duplicate }}</td></tr>
              <tr v-for="crop in history" :key="crop.id" class="crop-history"><td>{{ crop.planted }}</td><td><span v-if="crop.harvested">{{ crop.harvested }}</span><span v-else class="muted" title="Дата уборки ещё не указана">—</span></td><td><span class="history-culture">{{ culture(crop.culture).name }}<img v-if="['clover', 'barley', 'potato'].includes(crop.culture)" :src="`./assets/panel-imgCultureColor${crop.culture === 'barley' ? '1' : crop.culture === 'potato' ? '2' : ''}.svg`" width="8" height="8" alt="" /><span v-else class="culture-dot small" :style="{ background: culture(crop.culture).color }" /></span></td><td><div class="history-actions"><button type="button" class="icon-button" :disabled="!!draft || saving" :aria-label="`Редактировать: ${culture(crop.culture).name}, ${crop.planted}`" @click="beginCrop(crop)"><Icon name="action-edit" :size="16" /></button><button type="button" class="icon-button delete-button" :disabled="!!draft || saving" :aria-label="`Удалить: ${culture(crop.culture).name}, ${crop.planted}`" @click="removeCrop(crop.id)"><Icon name="action-delete" :size="16" /></button></div></td></tr>
            </tbody></table></div>
            <div v-if="deletedCrop" class="undo-notice" role="status">Запись удалена. <button id="undo-delete" type="button" class="text-button" :disabled="!!draft || saving" @click="undoDelete">Отменить удаление</button></div><p v-if="attempted && (errors.planted || errors.harvested || errors.culture)" class="validation-summary" role="alert">Проверьте выделенные поля.</p>
          </section>
          <div v-if="saveError" class="save-error" role="alert"><strong>Изменения не сохранены</strong><p>{{ saveError }}</p><button type="button" class="text-button" @click="save">Повторить сохранение</button></div>
        </form>
        <footer class="panel-footer"><span v-if="saving" class="save-status" role="status">Сохранение…</span><UiButton variant="secondary" :disabled="saving" @click="closePanel">Закрыть</UiButton><UiButton type="submit" form="rotation-form" :disabled="!dirty" :loading="saving">Сохранить</UiButton></footer>
      </section>
    </main>
    <AlertDialogRoot v-model:open="confirmOpen"><AlertDialogPortal><AlertDialogOverlay class="dialog-overlay" /><AlertDialogContent class="confirm-dialog"><AlertDialogTitle>Закрыть без сохранения?</AlertDialogTitle><AlertDialogDescription>Изменения севооборота этого поля будут потеряны.</AlertDialogDescription><div class="dialog-actions"><AlertDialogCancel as-child><UiButton variant="secondary" @click="pendingAction = null">Продолжить редактирование</UiButton></AlertDialogCancel><UiButton @click="discard">Не сохранять</UiButton></div></AlertDialogContent></AlertDialogPortal></AlertDialogRoot>
    <ToastProvider :duration="5000"><ToastRoot v-if="notification" :key="notification.id" class="toast" :open="true" @update:open="!$event && (notification = null)"><div><ToastTitle class="toast-title">{{ notification.title }}</ToastTitle><ToastDescription v-if="notification.message">{{ notification.message }}</ToastDescription></div><ToastClose class="icon-button" aria-label="Закрыть уведомление"><Icon name="panel-imgClose1" :size="20" /></ToastClose></ToastRoot><ToastViewport class="toast-viewport" label="Уведомления" /></ToastProvider>
  </div>
</template>

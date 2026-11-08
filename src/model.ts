export type Crop = { id: string; planted: string; harvested: string; culture: string }
export type FieldData = { hardwareId: string; fmsId: string; crops: Crop[] }
export const cultures = [
  { id: 'buckwheat', name: 'Гречиха', color: '#8cc63f' },
  { id: 'clover', name: 'Клевер', color: '#79b76c' },
  { id: 'barley', name: 'Ячмень', color: '#e8c13d' },
  { id: 'potato', name: 'Картофель', color: '#b28458' },
  { id: 'wheat', name: 'Пшеница озимая', color: '#d9ad35' },
  { id: 'sunflower', name: 'Подсолнечник', color: '#b6a24c' },
] as const
export const fields = [
  { id: '56', name: 'Поле 56:78:567890:345', alias: 'Поле ТУ-56', group: 'Саратовские поля-непаханные', official: 12.23, survey: 12.24, area: 12.24, marker: '' },
  { id: '57', name: 'Пшено 2', alias: 'Пшено 2', group: 'Саратовские поля-непаханные', official: 12.23, survey: 12.24, area: 12.24, marker: '1' },
  { id: '58', name: 'Пшено 3', alias: 'Пшено 3', group: 'Саратовские поля-непаханные', official: 12.23, survey: 12.24, area: 12.24, marker: '2' },
  { id: '59', name: 'Пшено 4', alias: 'Пшено 4', group: 'Саратовские поля-непаханные', official: 12.23, survey: 12.24, area: 12.24, marker: '3' },
  { id: '60', name: 'Поле без цветовой метки', alias: 'Поле без цветовой метки', group: 'Саратовские поля-непаханные', official: 12.23, survey: 12.24, area: 12.24, marker: '4' },
  { id: '61', name: 'Южный участок у лесополосы — длинное название поля', alias: 'Южный участок у лесополосы', group: 'Новая группа', official: 84.1, survey: null, area: 83.92, marker: '1' },
  { id: '62', name: 'Поле 62', alias: 'Поле 62', group: 'Новая группа', official: 24.5, survey: 24.48, area: 24.48, marker: '2' },
  { id: '63', name: 'Северное', alias: 'Северное', group: 'Пригородные поля', official: 49.8, survey: null, area: 49.73, marker: '3' },
] as const
export const groups = [...new Set(fields.map(field => field.group)), 'Группа полей 4', 'Группа полей 5', 'Группа полей 6', 'Группа полей 7', 'Группа полей 8']
export const blankField = (): FieldData => ({ hardwareId: '', fmsId: '', crops: [] })
export function initialField(id: string): FieldData {
  return id !== '56' ? blankField() : { hardwareId: '', fmsId: '', crops: [
    { id: '2020', planted: '01.04.2020', harvested: '27.08.2020', culture: 'clover' },
    { id: '2019', planted: '10.04.2019', harvested: '15.08.2019', culture: 'clover' },
    { id: '2018', planted: '01.05.2018', harvested: '01.09.2018', culture: 'barley' },
    { id: '2017', planted: '06.05.2017', harvested: '10.08.2017', culture: 'potato' },
  ] }
}
export function dateISO(value: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim())
  if (!match) return null
  const [, day, month, year] = match
  if (+year < 1900 || +year > 2100) return null
  const date = new Date(Date.UTC(+year, +month - 1, +day))
  return date.getUTCFullYear() === +year && date.getUTCMonth() === +month - 1 && date.getUTCDate() === +day ? `${year}-${month}-${day}` : null
}
export function dateDisplay(iso: string): string { return iso.split('-').reverse().join('.') }
export function cropErrors(crop: Crop, existing: Crop[] = []) {
  const errors: { planted?: string; harvested?: string; culture?: string; duplicate?: string } = {}
  const planted = dateISO(crop.planted), harvested = dateISO(crop.harvested)
  if (!planted) errors.planted = crop.planted ? 'Введите дату в формате дд.мм.гггг (1900–2100).' : 'Укажите дату посева.'
  if (crop.harvested && !harvested) errors.harvested = 'Введите существующую дату (1900–2100).'
  else if (planted && harvested && harvested < planted) errors.harvested = 'Уборка не может быть раньше посева.'
  if (!cultures.some(item => item.id === crop.culture)) errors.culture = 'Выберите культуру.'
  if (existing.some(item => item.id !== crop.id && item.culture === crop.culture && item.planted === crop.planted.trim() && item.harvested === crop.harvested.trim())) errors.duplicate = 'Такая запись уже есть в истории поля.'
  return errors
}
export function parseStored(raw: string): FieldData {
  const data: unknown = JSON.parse(raw)
  if (!data || typeof data !== 'object') throw new Error('Invalid field')
  const value = data as FieldData
  if (typeof value.hardwareId !== 'string' || value.hardwareId.length > 80 || typeof value.fmsId !== 'string' || value.fmsId.length > 80 || !Array.isArray(value.crops) || value.crops.length > 200) throw new Error('Invalid field')
  const ids = new Set<string>()
  for (const item of value.crops) {
    if (!item || ['id', 'planted', 'harvested', 'culture'].some(key => typeof item[key as keyof Crop] !== 'string') || !item.id || ids.has(item.id) || Object.keys(cropErrors(item)).length) throw new Error('Invalid crop')
    ids.add(item.id)
  }
  return { hardwareId: value.hardwareId, fmsId: value.fmsId, crops: value.crops.map(({ id, planted, harvested, culture }) => ({ id, planted, harvested, culture })) }
}
export function selectionState(ids: readonly string[], selected: ReadonlySet<string>) {
  const count = ids.filter(id => selected.has(id)).length
  return { checked: ids.length > 0 && count === ids.length, mixed: count > 0 && count < ids.length }
}

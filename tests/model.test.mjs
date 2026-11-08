import test from 'node:test'
import assert from 'node:assert/strict'
import { dateISO, cropErrors, initialField, parseStored, selectionState } from '../src/model.ts'
test('strict calendar dates, leap years and supported range', () => {
  assert.equal(dateISO('29.02.2024'), '2024-02-29')
  for (const value of ['29.02.2023', '31.04.2025', '00.12.2025', '01.13.2025', '2025-01-01', '1.1.2025', '01.01.1899']) assert.equal(dateISO(value), null)
})
test('ongoing crop allowed; invalid ordering, unknown culture and duplicates rejected', () => {
  const crop = { id: 'new', planted: '25.05.2021', harvested: '', culture: 'buckwheat' }
  assert.deepEqual(cropErrors(crop), {})
  assert.ok(cropErrors({ ...crop, harvested: '24.05.2021' }).harvested)
  assert.ok(cropErrors({ ...crop, planted: '' }).planted)
  assert.ok(cropErrors({ ...crop, culture: 'invalid' }).culture)
  assert.ok(cropErrors(crop, [{ ...crop, id: 'another' }]).duplicate)
  assert.deepEqual(cropErrors(crop, [crop]), {})
})
test('storage rejects malformed records and duplicate ids', () => {
  const field = initialField('56')
  assert.deepEqual(parseStored(JSON.stringify(field)), field)
  for (const value of [null, {}, { ...field, hardwareId: 'x'.repeat(81) }, { ...field, crops: [field.crops[0], field.crops[0]] }, { ...field, crops: [{ ...field.crops[0], planted: '31.02.2020' }] }]) assert.throws(() => parseStored(JSON.stringify(value)))
})
test('selection supports empty, mixed, full and hidden selections', () => {
  assert.deepEqual(selectionState([], new Set()), { checked: false, mixed: false })
  assert.deepEqual(selectionState(['a', 'b'], new Set(['a', 'hidden'])), { checked: false, mixed: true })
  assert.deepEqual(selectionState(['a', 'b'], new Set(['a', 'b', 'hidden'])), { checked: true, mixed: false })
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { demoViewport, leadErrors } from '../src/landing-model.ts'
test('embedded screen retains the original UI viewport and fits the Figma slot', () => {
  const view = demoViewport(1152,577)
  assert.equal(view.width,1920); assert.equal(view.scale,.6)
  assert.ok(Math.abs(view.height*view.scale-577)<.0001)
  assert.equal(demoViewport(1920,1080).height,1080)
  for(const bounds of [[0,577],[1152,0],[-1,577],[NaN,577]]) assert.throws(()=>demoViewport(...bounds))
})
test('demo request requires a valid phone, email and both consents', () => {
  const value={phone:'+7 (919) 400-38-28',email:'demo@example.test',consent:true,terms:true}
  assert.deepEqual(leadErrors(value),{})
  for(const phone of ['', '123', '+7 abc 999 9999999']) assert.ok(leadErrors({...value,phone}).phone)
  assert.ok(leadErrors({...value,email:'invalid'}).email)
  assert.ok(leadErrors({...value,consent:false}).consent)
  assert.ok(leadErrors({...value,terms:false}).terms)
})

export function demoViewport(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new Error('Demo bounds must be positive')
  const scale = width / 1920
  return { width: 1920, height: height / scale, scale }
}
export function leadErrors(value: { phone: string; email: string; consent: boolean; terms: boolean }) {
  const errors: { phone?: string; email?: string; consent?: string; terms?: string } = {}
  if (!/^\+?[\d\s()-]+$/.test(value.phone.trim()) || !/^\d{10,15}$/.test(value.phone.replace(/\D/g, ''))) errors.phone = 'Укажите телефон с кодом города или страны.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) errors.email = 'Укажите электронную почту.'
  if (!value.consent) errors.consent = 'Подтвердите согласие на обработку данных.'
  if (!value.terms) errors.terms = 'Подтвердите ознакомление с документами.'
  return errors
}

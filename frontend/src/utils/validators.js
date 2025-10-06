// Helpers de validación comunes (tarjeta, CVC, CP, etc.)
export const onlyDigits = (s = '') => s.replace(/\D+/g, '')

export const luhnCheck = (num = '') => {
  const s = onlyDigits(num)
  if (!s) return false
  let sum = 0,
    dbl = false
  for (let i = s.length - 1; i >= 0; i--) {
    let d = parseInt(s[i], 10)
    if (dbl) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    dbl = !dbl
  }
  return sum % 10 === 0
}

// === Helpers de inputs (debajo de formatCardNumber) ===
export const blockNonNumericKeys = (e) => {
  // Evita 'e', '+', '-', '.' en inputs numéricos
  if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault()
}

// MM/AA → solo dígitos + auto “/” tras 2
export const formatExpiry = (raw) => {
  const s = onlyDigits(raw).slice(0, 4)
  if (s.length <= 2) return s
  return `${s.slice(0, 2)}/${s.slice(2)}`
}

// CVC → 3 dígitos (4 si AMEX)
export const formatCVC = (raw, brand) =>
  onlyDigits(raw).slice(0, brand === 'AMEX' ? 4 : 3)

export const detectBrand = (num = '') => {
  const s = onlyDigits(num)
  if (/^4\d{12,18}$/.test(s)) return 'VISA'
  if (/^5[1-5]\d{14}$/.test(s) || /^2(2[2-9]|[3-6]\d|7[01])\d{12}$/.test(s))
    return 'MASTERCARD'
  if (/^3[47]\d{13}$/.test(s)) return 'AMEX'
  return 'CARD'
}

export const isValidExpiry = (v = '') => {
  const m = v.match(/^(\d{2})[\/\-](\d{2}|\d{4})$/)
  if (!m) return false
  let [_, mm, yy] = m
  const month = parseInt(mm, 10)
  const year = yy.length === 2 ? 2000 + parseInt(yy, 10) : parseInt(yy, 10)
  if (month < 1 || month > 12) return false
  const now = new Date()
  const end = new Date(year, month, 0, 23, 59, 59)
  return end >= new Date(now.getFullYear(), now.getMonth(), 1)
}

export const isValidCVC = (cvc = '', brand = 'CARD') => {
  const s = onlyDigits(cvc)
  return brand === 'AMEX' ? /^\d{4}$/.test(s) : /^\d{3}$/.test(s)
}

export const isValidPostal = (code = '', country = '') => {
  const c = (country || '').toUpperCase()
  if (c === 'ES') return /^\d{5}$/.test(code)
  if (c === 'PT') return /^\d{4}-?\d{3}$/.test(code)
  if (c === 'FR') return /^\d{5}$/.test(code)
  if (c === 'IT') return /^\d{5}$/.test(code)
  if (c === 'US') return /^\d{5}(-\d{4})?$/.test(code)
  return code.trim().length >= 3
}

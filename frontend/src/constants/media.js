// Importa tu placeholder
import avatarPlaceholder from '../assets/images/avatar/placeholderAvatar.webp'
import api from '../api'

export const AVATAR_PLACEHOLDER = avatarPlaceholder

// Devuelve una URL válida para <img src>, prefijando el baseURL del backend si es relativa
export const avatarSrc = (avatar) => {
  if (!avatar) return AVATAR_PLACEHOLDER
  if (/^https?:\/\//i.test(avatar) || avatar.startsWith('data:')) return avatar
  const base = (api?.defaults?.baseURL || '').replace(/\/+$/, '')
  const path = avatar.startsWith('/') ? avatar : `/${avatar}`
  return `${base}${path}`
}

import avatarPlaceholder from '../assets/images/avatar/placeholderAvatar.webp'
import api from '../api'

export const AVATAR_PLACEHOLDER = avatarPlaceholder

// Devuelv una URL valid para asegurar rel placeholder del avatar correcto
export const avatarSrc = (avatar) => {
  if (!avatar) return AVATAR_PLACEHOLDER
  if (/^https?:\/\//i.test(avatar) || avatar.startsWith('data:')) return avatar
  const base = (api?.defaults?.baseURL || '').replace(/\/+$/, '')
  const path = avatar.startsWith('/') ? avatar : `/${avatar}`
  return `${base}${path}`
}

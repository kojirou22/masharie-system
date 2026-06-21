import { cookies } from 'next/headers'

type FlashType = 'success' | 'error'

const FLASH_COOKIE = 'masharie_flash'

export async function setFlash(type: FlashType, message: string) {
  const store = await cookies()
  store.set(FLASH_COOKIE, encodeURIComponent(JSON.stringify({ type, message })), {
    path: '/',
    maxAge: 30,
    sameSite: 'lax',
  })
}

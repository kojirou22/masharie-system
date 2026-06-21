'use client'

import { CheckCircle2, X, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

type Flash = {
  type: 'success' | 'error'
  message: string
}

const FLASH_COOKIE = 'masharie_flash'

function readFlashCookie(): Flash | null {
  const cookie = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${FLASH_COOKIE}=`))

  if (!cookie) return null

  document.cookie = `${FLASH_COOKIE}=; path=/; max-age=0; SameSite=Lax`

  try {
    return JSON.parse(decodeURIComponent(cookie.slice(FLASH_COOKIE.length + 1))) as Flash
  } catch {
    return null
  }
}

export function FlashMessage() {
  const [flash, setFlash] = useState<Flash | null>(null)

  useEffect(() => {
    let dismissTimeout: number | undefined
    const readTimeout = window.setTimeout(() => {
      const nextFlash = readFlashCookie()
      setFlash(nextFlash)

      if (nextFlash) {
        dismissTimeout = window.setTimeout(() => setFlash(null), 5000)
      }
    }, 0)

    return () => {
      window.clearTimeout(readTimeout)
      if (dismissTimeout) window.clearTimeout(dismissTimeout)
    }
  }, [])

  if (!flash) return null

  const isSuccess = flash.type === 'success'
  const Icon = isSuccess ? CheckCircle2 : XCircle

  return (
    <div className="fixed left-4 right-4 top-20 z-50 mx-auto max-w-xl sm:left-auto sm:right-6" role="alert">
      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 text-sm shadow-xl backdrop-blur ${
          isSuccess
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}
      >
        <Icon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
        <p className="min-w-0 flex-1 font-medium leading-6">{flash.message}</p>
        <button
          type="button"
          aria-label="Dismiss notification"
          className="rounded-full p-1 opacity-75 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={() => setFlash(null)}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

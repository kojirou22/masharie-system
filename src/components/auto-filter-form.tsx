'use client'

import Form from 'next/form'
import type { ReactNode } from 'react'
import { useRef } from 'react'

export function AutoFilterForm({
  action,
  children,
  className,
}: {
  action: string
  children: ReactNode
  className?: string
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function submitForm(delay = 0) {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      formRef.current?.requestSubmit()
    }, delay)
  }

  function handleAutoSubmit(target: EventTarget) {
    if (target instanceof Element && target.closest('[data-no-auto-submit]')) {
      return
    }

    const isTypingInput = target instanceof HTMLInputElement && ['number', 'search', 'text'].includes(target.type)
    submitForm(isTypingInput ? 300 : 0)
  }

  return (
    <Form
      ref={formRef}
      action={action}
      replace
      scroll={false}
      className={className}
      onChange={(event) => handleAutoSubmit(event.target)}
      onInput={(event) => handleAutoSubmit(event.target)}
    >
      {children}
      <button
        type="submit"
        className="inline-flex h-11 touch-manipulation items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 sm:hidden"
      >
        Apply filters
      </button>
    </Form>
  )
}

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

  return (
    <Form
      ref={formRef}
      action={action}
      replace
      scroll={false}
      className={className}
      onChange={(event) => {
        const target = event.target
        const isTypingInput = target instanceof HTMLInputElement && ['number', 'search', 'text'].includes(target.type)

        submitForm(isTypingInput ? 300 : 0)
      }}
    >
      {children}
    </Form>
  )
}

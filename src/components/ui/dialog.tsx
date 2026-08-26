'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export function DialogContent({ className = '', ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/55 backdrop-blur-[2px]" />
      <DialogPrimitive.Content
        className={`fixed left-1/2 top-1/2 z-50 w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text)] shadow-2xl outline-none ${className}`}
        {...props}
      />
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="flex flex-col gap-2" {...props} />
}

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className = '', ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={`text-base font-semibold tracking-[-0.02em] ${className}`} {...props} />
))
DialogTitle.displayName = 'DialogTitle'

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className = '', ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={`text-sm leading-6 text-[var(--muted)] ${className}`} {...props} />
))
DialogDescription.displayName = 'DialogDescription'

export function DialogFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="mt-6 flex justify-end gap-2" {...props} />
}

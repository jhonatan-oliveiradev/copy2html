'use client'

import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'

export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger

export function AlertDialogContent({ className = '', ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 bg-black/55 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <AlertDialogPrimitive.Content
        className={`fixed left-1/2 top-1/2 z-50 w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text)] shadow-2xl outline-none ${className}`}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  )
}

export function AlertDialogHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="flex flex-col gap-2" {...props} />
}

export const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className = '', ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={`text-base font-semibold tracking-[-0.02em] ${className}`} {...props} />
))
AlertDialogTitle.displayName = 'AlertDialogTitle'

export const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className = '', ...props }, ref) => (
  <AlertDialogPrimitive.Description ref={ref} className={`text-sm leading-6 text-[var(--muted)] ${className}`} {...props} />
))
AlertDialogDescription.displayName = 'AlertDialogDescription'

export function AlertDialogFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="mt-6 flex justify-end gap-2" {...props} />
}

export const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className = '', ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={`inline-flex min-h-9 items-center justify-center rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-subtle)] ${className}`}
    {...props}
  />
))
AlertDialogCancel.displayName = 'AlertDialogCancel'

export const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className = '', ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={`inline-flex min-h-9 items-center justify-center rounded-md bg-[var(--accent)] px-3 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-dark)] ${className}`}
    {...props}
  />
))
AlertDialogAction.displayName = 'AlertDialogAction'

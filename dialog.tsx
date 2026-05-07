import React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialogContext() {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog")
  }
  return context
}

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </DialogContext.Provider>
  )
}

interface DialogTriggerProps {
  children: React.ReactNode
  onClick?: () => void
}

function DialogTrigger({ children, onClick }: DialogTriggerProps) {
  return <div onClick={onClick}>{children}</div>
}

interface DialogPortalProps {
  children: React.ReactNode
}

function DialogPortal({ children }: DialogPortalProps) {
  const { open } = useDialogContext()
  if (!open) return null
  return <>{children}</>
}

interface DialogOverlayProps {
  className?: string
  children?: React.ReactNode
}

function DialogOverlay({ className, children }: DialogOverlayProps) {
  const { onOpenChange } = useDialogContext()
  
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      onClick={() => onOpenChange(false)}
    >
      {children}
    </div>
  )
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

function DialogContent({ className, children }: DialogContentProps) {
  const { open, onOpenChange } = useDialogContext()
  
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    }
    
    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [open, onOpenChange])
  
  if (!open) return null
  
  return (
    <DialogPortal>
      <DialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative z-50 w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] dark:border-slate-800 dark:bg-slate-900",
            className
          )}
        >
          {children}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none dark:ring-offset-slate-950 dark:focus:ring-slate-300"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    </DialogPortal>
  )
}

interface DialogHeaderProps {
  className?: string
  children: React.ReactNode
}

function DialogHeader({ className, children }: DialogHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
      {children}
    </div>
  )
}

interface DialogTitleProps {
  className?: string
  children: React.ReactNode
}

function DialogTitle({ className, children }: DialogTitleProps) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    >
      {children}
    </h2>
  )
}

interface DialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

function DialogDescription({ className, children }: DialogDescriptionProps) {
  return (
    <p className={cn("text-sm text-slate-500 dark:text-slate-400", className)}>
      {children}
    </p>
  )
}

interface DialogFooterProps {
  className?: string
  children: React.ReactNode
}

function DialogFooter({ className, children }: DialogFooterProps) {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    >
      {children}
    </div>
  )
}

interface DialogCloseProps {
  children: React.ReactNode
  onClick?: () => void
}

function DialogClose({ children, onClick }: DialogCloseProps) {
  const { onOpenChange } = useDialogContext()
  
  const handleClick = () => {
    onOpenChange(false)
    onClick?.()
  }
  
  return <div onClick={handleClick}>{children}</div>
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
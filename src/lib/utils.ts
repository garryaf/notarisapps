import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ActionResult type from design doc
export type ActionResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
  code?: string
}

// Helper to create success result
export function success<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

// Helper to create error result
export function error<T = never>(message: string, code?: string): ActionResult<T> {
  return { success: false, error: message, code }
}

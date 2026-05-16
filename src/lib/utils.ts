import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractStudentId(email: string | undefined): string | null {
  if (!email) return null
  if (!email.endsWith('@isb.nu.edu.pk')) return null
  return email.split('@')[0].toLowerCase()
}

export function formatRollNumber(id: string | null): string {
  if (!id) return ''
  // Example: i253107 -> 25I-3107
  const match = id.match(/^i(\d{2})(\d{4})$/)
  if (match) {
    return `${match[1]}I-${match[2]}`
  }
  return id.toUpperCase()
}

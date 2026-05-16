'use client'

import { createClient } from '@/lib/supabase/client'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string) {
  if (!base64String) return new Uint8Array(0)
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return
  }

  // Safety check: Don't run if the key is missing from .env
  if (!VAPID_PUBLIC_KEY) {
    console.warn('Push Notifications: VAPID Public Key is missing from .env')
    return
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    
    // Check if permission is already granted
    if (Notification.permission === 'denied') return

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase.from('push_subscriptions').upsert({
        email: user.email,
        subscription: subscription.toJSON()
      }, { onConflict: 'email' })
    }
  } catch (error) {
    console.error('Error subscribing to push:', error)
  }
}

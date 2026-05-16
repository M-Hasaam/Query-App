import webpush from 'web-push'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY

export async function sendPushNotification(subscription: any, payload: { title: string; body: string }) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('Cannot send push: VAPID keys are missing from .env')
    return { success: false, error: 'Keys missing' }
  }

  try {
    webpush.setVapidDetails(
      'mailto:support@isb.nu.edu.pk',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    )
    
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error }
  }
}

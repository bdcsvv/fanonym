import { supabase } from './supabase'

type NotificationType = 
  | 'chat_new'
  | 'chat_accepted'
  | 'chat_expired'
  | 'payment_request'
  | 'payment_received'
  | 'topup_approved'
  | 'topup_rejected'
  | 'withdraw_success'
  | 'withdraw_rejected'
  | 'free_chat'
  | 'rating_received'
  | 'verification_approved'
  | 'verification_rejected'

export async function sendNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}) {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    link: link || null,
    is_read: false,
  })

  if (error) {
    console.error('Failed to send notification:', error)
  }
}

/**
 * Email service for sending transactional emails
 * Uses Resend as the email provider
 */

import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Default sender email - update this with your verified domain
const DEFAULT_FROM = process.env.EMAIL_FROM || 'InstaAI <noreply@instaai.trendzone.tech>'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html, text, from = DEFAULT_FROM } = options

  // If no API key, log and skip (useful for development)
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not set, skipping email send')
    console.log('Would have sent email:', { to, subject })
    return { success: true, skipped: true }
  }

  try {
    const result = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    })

    console.log('✅ Email sent successfully:', { to, subject, id: result.data?.id })
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    throw error
  }
}

/**
 * Send invitation email to a new user
 */
export async function sendInvitationEmail(params: {
  to: string
  inviteeName?: string
  inviterName: string
  invitationUrl: string
  expiresAt: Date
}) {
  const { to, inviteeName, inviterName, invitationUrl, expiresAt } = params
  
  const formattedDate = expiresAt.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  const subject = `${inviterName} hat dich zu InstaAI eingeladen`
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Einladung zu InstaAI</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 40px 20px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🚀 InstaAI</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">AI-powered Instagram Content Tool</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hallo${inviteeName ? ` ${inviteeName}` : ''}! 👋</h2>
    
    <p style="color: #4b5563; margin: 0 0 20px 0;">
      <strong>${inviterName}</strong> hat dich eingeladen, InstaAI zu nutzen – das KI-gestützte Tool für professionelle Instagram-Inhalte.
    </p>
    
    <p style="color: #4b5563; margin: 0 0 30px 0;">
      Mit InstaAI kannst du:
    </p>
    
    <ul style="color: #4b5563; margin: 0 0 30px 0; padding-left: 20px;">
      <li style="margin-bottom: 10px;">🎨 KI-generierte Bilder erstellen</li>
      <li style="margin-bottom: 10px;">🎬 Professionelle Videos produzieren</li>
      <li style="margin-bottom: 10px;">✍️ Perfekte Captions & Hashtags generieren</li>
      <li style="margin-bottom: 10px;">📅 Beiträge planen und organisieren</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${invitationUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Einladung annehmen
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0;">
      Dieser Link ist gültig bis zum <strong>${formattedDate}</strong>.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      Falls du den Button nicht klicken kannst, kopiere diesen Link in deinen Browser:<br>
      <a href="${invitationUrl}" style="color: #6366f1; word-break: break-all;">${invitationUrl}</a>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">© ${new Date().getFullYear()} InstaAI. Alle Rechte vorbehalten.</p>
  </div>
</body>
</html>
  `

  return sendEmail({
    to,
    subject,
    html,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(params: {
  to: string
  userName?: string
  resetUrl: string
  expiresAt: Date
}) {
  const { to, userName, resetUrl, expiresAt } = params
  
  const formattedDate = expiresAt.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const subject = 'Passwort zurücksetzen – InstaAI'
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Passwort zurücksetzen</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 40px 20px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔐 InstaAI</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Passwort zurücksetzen</p>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hallo${userName ? ` ${userName}` : ''}!</h2>
    
    <p style="color: #4b5563; margin: 0 0 20px 0;">
      Du hast angefordert, dein Passwort zurückzusetzen. Klicke auf den Button unten, um ein neues Passwort zu erstellen.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Passwort zurücksetzen
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0;">
      Dieser Link ist gültig bis <strong>${formattedDate}</strong>.
    </p>
    
    <p style="color: #ef4444; font-size: 14px; margin: 20px 0 0 0;">
      ⚠️ Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail einfach.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      Falls du den Button nicht klicken kannst, kopiere diesen Link in deinen Browser:<br>
      <a href="${resetUrl}" style="color: #6366f1; word-break: break-all;">${resetUrl}</a>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">© ${new Date().getFullYear()} InstaAI. Alle Rechte vorbehalten.</p>
  </div>
</body>
</html>
  `

  return sendEmail({
    to,
    subject,
    html,
  })
}

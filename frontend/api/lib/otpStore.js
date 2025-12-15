// Supabase-based OTP store for serverless environments
import { supabase } from './supabase.js'

const OTP_EXPIRY_MINUTES = 5

export async function setOTP(email, data) {
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()
  
  // Delete any existing OTPs for this email
  await supabase
    .from('otp_codes')
    .delete()
    .eq('email', email.toLowerCase())
  
  // Insert new OTP
  const { error } = await supabase
    .from('otp_codes')
    .insert({
      email: email.toLowerCase(),
      otp: data.otp,
      name: data.name,
      destination: data.destination || null,
      destination_code: data.destinationCode || null,
      receive_updates: data.receiveUpdates || false,
      expires_at: expiresAt,
      verified: false,
    })
  
  if (error) {
    console.error('Error storing OTP:', error)
    throw new Error('Failed to store OTP')
  }
  
  // Clean up expired OTPs (async, don't wait)
  supabase
    .from('otp_codes')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .then(() => {}) // Fire and forget
    .catch(() => {}) // Ignore cleanup errors
}

export async function getOTP(email) {
  const { data, error } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('verified', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  if (error) {
    console.error('Error retrieving OTP:', error)
    return null
  }
  
  if (!data) return null
  
  // Return in expected format
  return {
    otp: data.otp,
    name: data.name,
    destination: data.destination,
    destinationCode: data.destination_code,
    receiveUpdates: data.receive_updates,
    expiresAt: new Date(data.expires_at).getTime(),
  }
}

export async function deleteOTP(email) {
  await supabase
    .from('otp_codes')
    .delete()
    .eq('email', email.toLowerCase())
}

export async function markOTPVerified(email) {
  await supabase
    .from('otp_codes')
    .update({ verified: true })
    .eq('email', email.toLowerCase())
    .eq('verified', false)
}


import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOtpEmail(to, otp) {
  try {
    await transporter.sendMail({
      from: `"UPI Quiz" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: 'Your verification code',
      text: `Your OTP is ${otp}. Valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e40af;">Your Verification Code</h2>
          <p>Your OTP code is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e40af; margin: 0;">${otp}</p>
          </div>
          <p style="color: #6b7280;">This code is valid for 5 minutes.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    })
    console.log(`OTP email sent to ${to}`)
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email')
  }
}


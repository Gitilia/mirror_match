import nodemailer from "nodemailer"

let transporter: nodemailer.Transporter | null = null

async function getTransporter() {
  if (transporter) return transporter

  // In development, use Ethereal or console transport
  if (process.env.NODE_ENV === "development") {
    // Try to use Ethereal for testing
    try {
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })
      return transporter
    } catch {
      // Fallback to console transport
      transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: "unix",
        buffer: true,
      })
      return transporter
    }
  }

  // Production: use SMTP
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  return transporter
}

export async function sendNewPhotoEmail(
  recipientEmail: string,
  recipientName: string,
  photoId: string,
  uploaderName: string
) {
  const emailTransporter = await getTransporter()
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const photoUrl = `${baseUrl}/photos/${photoId}`

  const mailOptions = {
    from: process.env.SMTP_FROM || "MirrorMatch <noreply@mirrormatch.com>",
    to: recipientEmail,
    subject: "New Photo Ready to Guess!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">MirrorMatch</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #667eea; margin-top: 0;">New Photo Uploaded!</h2>
            <p>Hi ${recipientName},</p>
            <p><strong>${uploaderName}</strong> has uploaded a new photo for you to guess!</p>
            <p style="margin: 30px 0;">
              <a href="${photoUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Photo & Guess</a>
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Good luck! 🎯
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${recipientName},

${uploaderName} has uploaded a new photo for you to guess!

View the photo and submit your guess here: ${photoUrl}

Good luck!
    `.trim(),
  }

  try {
    const info = await emailTransporter.sendMail(mailOptions)
    
    if (process.env.NODE_ENV === "development") {
      console.log("Email sent (dev mode):")
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info) || "Check console")
      console.log("To:", recipientEmail)
      console.log("Subject:", mailOptions.subject)
    }
    
    return info
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

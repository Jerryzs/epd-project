import nodemailer from 'nodemailer'
import db from '../../../libs/db'

import type { NextApiRequest, NextApiResponse } from 'next'

const EMAIL_PLAIN =
  'Hello! Your email address is being used to create an account on MyTask, and the verification code is: %s. If you did not request a verification code, please disregard this email. Thank you. '

const EMAIL_HTML =
  '<div style="max-width:720px;margin:0 auto;font-size:1rem;font-family:Verdana,Tahoma,Arial,sans-serif"><p>Hello!</p><p>Your email address is being used to create an account on MyTask, and the verification code is:</p><div style="display:inline-block;padding:8px 14px 8px 16px;text-align:center;font-size:1.15rem;font-weight:700;background-color:#ddd;border-radius:12px;letter-spacing:2px">%s</div><p>If you did not request a verification code, please disregard this email.</p><p>Thank you.</p></div>'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<API.BaseResponse>
): Promise<void> => {
  if (req.method === 'GET') {
    const email =
      req.query.email !== undefined ? String(req.query.email) : undefined

    if (email === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please enter an email address.',
        data: null,
      })
    }

    if (email.match($0.regex.email) === null) {
      return res.status(400).json({
        success: false,
        message: 'Email address is invalid.',
        data: null,
      })
    }

    const code = $0.getRandomId(6, '1234567890')

    const now = () => Math.floor(Date.now() / 1000)

    try {
      const result = await db.query<{ expire: number }[]>(
        `SELECT \`expire\` FROM \`verification_code\` WHERE \`user\` = ?`,
        email
      )

      if (result.length !== 0) {
        const diff = now() + 215 - result[0].expire
        if (diff < 0) {
          return res.status(400).json({
            success: false,
            message: `Please try again after ${-diff} seconds.`,
            data: null,
          })
        }
      }
    } catch (e) {
      console.log(e)
      return res.status(500).json({
        success: false,
        message: 'Server error.',
        data: null,
      })
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_SMTP_USER,
        pass: process.env.MAIL_SMTP_PASS,
      },
    })

    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'MyTask Verification Code',
        text: EMAIL_PLAIN.replace('%s', code),
        html: EMAIL_HTML.replace('%s', code),
      })
    } catch (e) {
      console.log(e)
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification code.',
        data: null,
      })
    }

    try {
      const expiration = now() + 305

      await db.query(
        `DELETE FROM \`verification_code\` WHERE \`user\` = ?`,
        email
      )

      await db.query(
        `INSERT INTO \`verification_code\` (\`code\`, \`user\`, \`expire\`) VALUES ('${code}', ?, ${expiration})`,
        email
      )
    } catch (e) {
      console.log(e)
      return res.status(500).json({
        success: false,
        message: 'Server error.',
        data: null,
      })
    }

    return res.status(200).json({
      success: true,
      message: '',
      data: null,
    })
  }

  return res.status(405).json({
    success: false,
    message: 'Not allowed.',
    data: null,
  })
}

export default handler

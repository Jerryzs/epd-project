import nodemailer from 'nodemailer'
import db from '../../../libs/db'

import type { NextApiRequest, NextApiResponse } from 'next'

import EMAIL_PLAIN from '../../../templates/api/auth/verify/email.txt'
import EMAIL_HTML from '../../../templates/api/auth/verify/email.html'

const SUBJECT = 'MyTasks Verification Code'

const EXPIRY_TIME = 305
const RETRY_AFTER = 90

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
        'SELECT `expire` FROM `verification` WHERE `user` = ?',
        email
      )

      if (result.length !== 0) {
        const diff = now() + (EXPIRY_TIME - RETRY_AFTER) - result[0].expire
        if (diff < 0) {
          db.end()
          return res.status(400).json({
            success: false,
            message: `Please try again after ${-diff} seconds.`,
            data: null,
          })
        }
      }
    } catch (e) {
      console.error(e)
      db.end()
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
        subject: SUBJECT,
        text: EMAIL_PLAIN.replace('%s', code),
        html: EMAIL_HTML.replace('%s', code),
      })
    } catch (e) {
      console.error(e)
      db.end()
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification code.',
        data: null,
      })
    }

    try {
      const expiration = now() + EXPIRY_TIME

      await db.query('DELETE FROM `verification` WHERE `user` = ?', email)

      await db.query(
        'INSERT INTO `verification` (`code`, `user`, `expire`) VALUES (?, ?, ?)',
        [code, email, expiration]
      )
    } catch (e) {
      console.error(e)
      db.end()
      return res.status(500).json({
        success: false,
        message: 'Server error.',
        data: null,
      })
    }

    db.end()
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

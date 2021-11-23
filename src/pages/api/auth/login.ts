import bcrypt from 'bcryptjs'
import db from '../../../libs/db'
import session from '../../../libs/session'

import type { NextApiRequest, NextApiResponse } from 'next'

type Form = {
  user: string
  password: string
}

type User = {
  id: string
}

type Pass = {
  password: string
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<API.BaseResponse>
): Promise<void> => {
  if (req.method === 'POST') {
    const body = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as Partial<Form>

    const { user, password } = body

    if (user === undefined || password === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body',
        data: null,
      })
    }

    let id = user

    const ue = (
      await db.query<User[]>(
        `SELECT \`id\` FROM \`user\` WHERE \`email\` = ?`,
        user
      )
    )[0]

    if (ue !== undefined) id = ue.id

    const data = (
      await db.query<Pass[]>(
        `SELECT \`password\` FROM \`pass\` WHERE \`user\` = ?`,
        id
      )
    )[0]

    if (data === undefined) {
      return res.status(400).json({
        success: false,
        message: 'User or password is incorrect.',
        data: null,
      })
    }

    const match = await bcrypt.compare(password, data.password)

    if (!match) {
      return res.status(400).json({
        success: false,
        message: 'User or password is incorrect.',
        data: null,
      })
    }

    const sid = await session.create(id)

    res.setHeader('Set-Cookie', session.cookie(sid))

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

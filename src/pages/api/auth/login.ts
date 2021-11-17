import bcrypt from 'bcryptjs'
import db from '../../../libs/db'
import session from '../../../libs/session'

import type { NextApiRequest, NextApiResponse } from 'next'

type Form = {
  user: string
  password: string
}

type User = {
  id: number
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

    let id: number = parseInt(user)

    if (isNaN(id)) {
      id = (
        await db.query<User[]>(
          `SELECT \`id\` FROM \`user\` WHERE \`email\` = ?`,
          user
        )
      )[0]?.id
    }

    if (id === undefined) {
      return res.status(400).json({
        success: false,
        message: 'User or password does not exist.',
        data: null,
      })
    }

    const pass = (
      await db.query<Pass[]>(
        `SELECT \`password\` FROM \`pass\` WHERE \`user\` = ?`,
        id
      )
    )[0]?.password

    if (pass === undefined) {
      return res.status(500).json({
        success: false,
        message: 'Unexpected error occured.',
        data: null,
      })
    }

    const match = await bcrypt.compare(password, pass)

    if (!match) {
      return res.status(400).json({
        success: false,
        message: 'User or password does not exist.',
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

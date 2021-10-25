import bcrypt from 'bcryptjs'
import db from '../../../libs/db'
import session from '../../../libs/session'

import type { NextApiRequest, NextApiResponse } from 'next'

type Form = {
  user: string
  password: string
}

type Result = {
  id: number
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

    const id = parseInt(user)

    let result
    if (!isNaN(id))
      result = (
        await db.query<Result[]>(
          `SELECT \`id\`, \`password\` FROM \`user\` WHERE \`id\` = ?`,
          id
        )
      )[0]
    else
      result = (
        await db.query<Result[]>(
          `SELECT \`id\`, \`password\` FROM \`user\` WHERE \`email\` = ?`,
          user
        )
      )[0]

    if (result === undefined) {
      return res.status(400).json({
        success: false,
        message: 'User or password does not exist.',
        data: null,
      })
    }

    const match = await bcrypt.compare(password, result.password)

    if (!match) {
      return res.status(400).json({
        success: false,
        message: 'User or password does not exist.',
        data: null,
      })
    }

    const sid = await session.create(result.id)

    return res.status(200).setHeader('Set-Cookie', session.cookie(sid)).json({
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

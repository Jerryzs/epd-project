import db from '../../../libs/db'
import session from '../../../libs/session'

import type { NextApiRequest, NextApiResponse } from 'next'

type User = {
  name: string
  email: string
  role: 'student' | 'teacher'
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<API.BaseResponse<API.UserGET>>
): Promise<void> => {
  const sid = req.cookies.__sid

  if (req.method === 'GET') {
    if (sid === undefined) {
      return res.status(200).json({
        success: true,
        message: 'No session id.',
        data: {
          id: -1,
        },
      })
    }

    let id

    try {
      id = await session.validate(sid)
    } catch (e) {
      return res.status(200).json({
        success: true,
        message: String(e),
        data: {
          id: -1,
        },
      })
    }

    const user = (
      await db.query<User[]>(
        `SELECT \`name\`, \`email\`, \`role\` FROM \`user\` WHERE \`id\` = ${id}`
      )
    )[0]

    if (user === undefined) {
      return res.status(400).json({
        success: false,
        message: 'User not found. Maybe the user has been deleted?',
        data: null,
      })
    }

    return res
      .status(200)
      .setHeader('Set-Cookie', session.cookie(sid))
      .json({
        success: true,
        message: '',
        data: {
          id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
  }

  return res.status(405).json({
    success: false,
    message: 'Not allowed.',
    data: null,
  })
}

export default handler

import db from '../../../libs/db'
import session from '../../../libs/session'

import type { NextApiRequest, NextApiResponse } from 'next'

type Body = {
  id: string
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<API.BaseResponse<API.Classroom.RosterGET>>
): Promise<void> => {
  const query = req.query

  const body = req.body
    ? ((typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body) as Partial<Body>)
    : undefined

  const id = query.id ?? body?.id

  if (id === undefined || id === '') {
    return res.status(400).json({
      success: false,
      message: 'Missing classroom id.',
      data: null,
    })
  }

  const sid = req.cookies.__sid
  let user: string

  try {
    user = await session.validate(sid)
  } catch (e) {
    db.end()
    console.error(e)
    return res.status(403).json({
      success: false,
      message: 'Forbidden.',
      data: null,
    })
  }

  const classroom = (
    await db.query<Classroom[]>('SELECT * FROM `classroom` WHERE `id` = ?', id)
  )[0]

  if (classroom === undefined) {
    db.end()
    return res.status(400).json({
      success: false,
      message: 'Classroom does not exist.',
      data: null,
    })
  }

  if (req.method === 'GET') {
    const links = await db.query<DB.Link[]>(
      'SELECT * FROM `link` WHERE `classroom` = ?',
      id
    )

    if (links.length === 0) {
      db.end()
      return res.status(400).json({
        success: false,
        message: 'Classroom roster not found.',
        data: null,
      })
    }

    if (links.every((link) => link.user !== user)) {
      db.end()
      return res.status(400).json({
        success: false,
        message: 'Requesting user not a member of the classroom.',
        data: null,
      })
    }

    const members = await db.query<User[]>(
      'SELECT * FROM `user` WHERE `id` IN (' +
        links.map((link) => `'${link.user}'`).join(',') +
        ')'
    )

    const invitations = await db.query<
      Pick<DB.Invitation, 'recipient' | 'user'>[]
    >('SELECT `recipient`, `user` FROM `invitation` WHERE `classroom` = ?', [
      id,
    ])

    db.end()
    return res.status(200).json({
      success: true,
      message: '',
      data: {
        classroom,
        members,
        invitations,
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

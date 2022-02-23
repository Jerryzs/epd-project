import db from '../../../libs/db'
import session from '../../../libs/session'

import type { NextApiRequest, NextApiResponse } from 'next'

type Body = {
  id: string
  name: string
  instructor: string
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<API.BaseResponse<API.Classroom.RosterGET>>
): Promise<void> => {
  const query = req.query as Pick<Partial<Body>, 'id'>

  const body = req.body
    ? ((typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body) as Partial<Body>)
    : undefined

  const sid = req.cookies.__sid
  let user: string

  try {
    user = await session.validate(sid)
  } catch (e) {
    db.end()
    return res.status(403).json({
      success: false,
      message: 'Forbidden.',
      data: null,
    })
  }

  if (req.method === 'GET') {
    const id = query.id ?? body?.id

    if (id === undefined || id === '') {
      return res.status(400).json({
        success: false,
        message: 'Missing classroom id.',
        data: null,
      })
    }

    const classroom = (
      await db.query<Classroom[]>(
        'SELECT * FROM `classroom` WHERE `id` = ?',
        id
      )
    )[0]

    if (classroom === undefined) {
      db.end()
      return res.status(404).json({
        success: false,
        message: 'Classroom does not exist.',
        data: null,
      })
    }

    const links = await db.query<DB.Link[]>(
      'SELECT * FROM `link` WHERE `classroom` = ?',
      id
    )

    if (links.length === 0) {
      db.end()
      return res.status(400).json({
        success: false,
        message: 'Classroom is empty.',
        data: null,
      })
    }

    if (links.every((link) => link.user !== user)) {
      db.end()
      return res.status(403).json({
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

  if (req.method === 'POST') {
    const { name, instructor } = body ?? {}

    if (
      name === undefined ||
      name === '' ||
      instructor === undefined ||
      instructor === ''
    ) {
      db.end()
      return res.status(400).json({
        success: false,
        message: 'Missing name or instructor.',
        data: null,
      })
    }

    const userInfo = await db.query<User[]>(
      'SELECT * FROM `user` WHERE `id` = ?',
      user
    )

    if (userInfo[0].role !== 'teacher') {
      db.end()
      return res.status(403).json({
        success: false,
        message: 'Only teachers are allowed to create classrooms.',
        data: null,
      })
    }

    const id = await (async () => {
      for (;;) {
        const id = $0.getRandomId(8)
        const result = await db.query<Classroom[]>(
          'SELECT 1 FROM `classroom` WHERE `id` = ?',
          id
        )
        if (result.length === 0) return id
      }
    })()

    await db.query(
      'INSERT INTO `classroom` (`id`, `name`, `instructor_name`) VALUES (?, ?, ?)',
      [id, name, instructor]
    )

    const links = await db.query<DB.Link[]>(
      'SELECT * FROM `link` WHERE `user` = ?',
      user
    )

    const endLinks = links.filter((link) => !link.next)

    if (endLinks.length !== 1) {
      // TODO: data corrupted (?) and need fixed
      db.end()
      return res.status(418).json({
        success: false,
        message: '',
        data: null,
      })
    }

    await db.query(
      'INSERT INTO `link` (`user`, `classroom`, `prev`) VALUES (?, ?, ?)',
      [user, id, endLinks[0].classroom]
    )

    await db.query('UPDATE `link` SET `next` = ? WHERE `classroom` = ?', [
      id,
      endLinks[0].classroom,
    ])

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

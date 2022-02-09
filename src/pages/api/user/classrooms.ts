import db from '../../../libs/db'
import session from '../../../libs/session'

import type { NextApiRequest, NextApiResponse } from 'next'

export type Classroom = DB.Classroom & Pick<DB.Link, 'instruction'>
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<API.BaseResponse<API.User.ClassroomsGET>>
): Promise<void> => {
  const sid = req.cookies.__sid

  let id
  try {
    id = await session.validate(sid)
  } catch (e) {
    db.end()
    return res.status(403).json({
      success: false,
      message: 'Forbidden.',
      data: null,
    })
  }

  if (req.method === 'GET') {
    const classrooms = $0.linkedSort<Classroom, number>(
      await db.query(
        'SELECT `classroom`.*, `link`.`prev`, `link`.`next`, `link`.`instruction` FROM `link` INNER JOIN `classroom` ON `link`.`classroom` = `classroom`.`id` WHERE `user` = ?',
        [id]
      )
    )

    const invitations = await db.query<
      (Pick<DB.Classroom, 'id' | 'name'> & Pick<DB.Invitation, 'user'>)[]
    >(
      'SELECT `classroom`.`id`, `classroom`.`name`, `invitation`.`user` FROM `user` INNER JOIN `invitation` ON `user`.`id` = `invitation`.`recipient` OR `user`.`email` = `invitation`.`recipient` INNER JOIN `classroom` ON `classroom`.`id` = `invitation`.`classroom` WHERE `user`.`id` = ?',
      [id]
    )

    db.end()
    return res.status(200).json({
      success: true,
      message: '',
      data: {
        classrooms,
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

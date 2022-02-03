import db from '../../../libs/db'
import session from '../../../libs/session'

import type { NextApiRequest, NextApiResponse } from 'next'

type Link = {
  id: number
  user: number
  classroom: number
}

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
    console.error(e)
    return res.status(403).json({
      success: false,
      message: e as string,
      data: null,
    })
  }

  if (req.method === 'GET') {
    const links = (
      await db.query<Link[]>(`SELECT * FROM \`link\` WHERE \`user\` = ?`, id)
    ).map((link) => link.classroom)

    let classrooms: Classroom[] = []
    if (links.length !== 0) {
      classrooms = await db.query<Classroom[]>(
        `SELECT * FROM \`classroom\` WHERE \`id\` IN (${links
          .map((id) => `'${id}'`)
          .join(',')})`
      )
    }

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

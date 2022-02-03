import type { MysqlError } from 'mysql'
import db from '../../../libs/db'
import session from '../../../libs/session'
import { createInstruction, instructionExists } from '../instruction'

import type { NextApiRequest, NextApiResponse } from 'next'

type Body = {
  classroom: string
  recipient: string
  action: string
  instruction: string
}

const ALLOWED_ROLES = new Set(['teacher'])

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<API.BaseResponse>
): Promise<void> => {
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
    console.error(e)
    return res.status(403).json({
      success: false,
      message: 'Forbidden.',
      data: null,
    })
  }

  if (req.method === 'POST') {
    const { classroom, recipient, action, instruction } = body ?? {}

    // default action: create invite
    if (action === undefined || action === '') {
      if (
        classroom === undefined ||
        classroom === '' ||
        recipient === undefined ||
        recipient === ''
      ) {
        db.end()
        return res.status(400).json({
          success: false,
          message: 'Missing classroom or recipient.',
          data: null,
        })
      }

      const userInfo = (
        await db.query<{ role: string; name: string }[]>(
          'SELECT `role`, `name` FROM `user` WHERE `id` = ?',
          user
        )
      )[0]

      if (!ALLOWED_ROLES.has(userInfo.role)) {
        db.end()
        return res.status(403).json({
          success: false,
          message: 'User does not have the privilege to invite other users.',
          data: null,
        })
      }
      const link = await db.query<unknown[]>(
        'SELECT 1 FROM `link` WHERE `user` = ? AND `classroom` = ?',
        [user, classroom]
      )

      if (link.length === 0) {
        db.end()
        return res.status(403).json({
          success: false,
          message: 'User does not belong in this classroom.',
          data: null,
        })
      }

      const check = await db.query<unknown[]>(
        'SELECT 1 FROM `link` INNER JOIN `user` ON `link`.`user` = `user`.`id` WHERE `link`.`classroom` = ? AND (`user`.`id` = ? OR `user`.`email` = ?)',
        [classroom, recipient, recipient]
      )

      if (check.length !== 0) {
        db.end()
        return res.status(400).json({
          success: false,
          message: 'Recipient is already in this classroom.',
          data: null,
        })
      }

      try {
        await db.query(
          'INSERT INTO `invitation` (`classroom`, `recipient`, `user`) VALUES (?, ?, ?)',
          [classroom, recipient, userInfo.name]
        )
      } catch (e) {
        db.end()
        console.error(e)
        if ((e as MysqlError).code === 'ER_DUP_ENTRY') {
          return res.status(400).json({
            success: false,
            message: 'This person has already been invited.',
            data: null,
          })
        } else {
          return res.status(500).json({
            success: false,
            message: 'Internal error.',
            data: null,
          })
        }
      }

      db.end()
      return res.status(200).json({
        success: true,
        message: '',
        data: null,
      })
    }

    // accept invitation
    if (action === 'accept') {
      if (classroom === undefined || classroom === '') {
        db.end()
        return res.status(400).json({
          success: false,
          message: 'Missing classroom.',
          data: null,
        })
      }

      const check = await db.query<Pick<DB.Invitation, 'recipient'>[]>(
        'SELECT `invitation`.`recipient` FROM `user` INNER JOIN `invitation` ON `invitation`.`recipient` = `user`.`id` OR `invitation`.`recipient` = `user`.`email` WHERE `user`.`id` = ? AND `invitation`.`classroom` = ?',
        [user, classroom]
      )

      if (check.length === 0) {
        db.end()
        return res.status(400).json({
          success: false,
          message: 'You have not been invited to this classroom.',
          data: null,
        })
      }

      let ins = instruction
      if (ins === undefined || ins === '') {
        ;[ins] = await createInstruction()
      } else if (!instructionExists(ins)) {
        db.end()
        return res.status(400).json({
          success: false,
          message: 'Instruction does not exist.',
          data: null,
        })
      }

      try {
        const lastLink = await db.query<Pick<DB.Link, 'classroom'>[]>(
          'SELECT `classroom` FROM `link` WHERE `user` = ? AND `next` IS NULL',
          [user]
        )

        if (lastLink.length !== 1) {
          // TODO
          db.end()
          return res.status(500).json({
            success: false,
            message: 'Link data error: requires manual audit.',
            data: null,
          })
        }

        const prev = lastLink[0].classroom

        await db.query(
          'UPDATE `link` SET `next` = ? WHERE `classroom` = ? AND `user` = ?',
          [classroom, prev, user]
        )

        await db.query(
          'INSERT INTO `link` (`user`, `classroom`, `prev`, `instruction`) VALUES (?, ?, ?, ?)',
          [user, classroom, prev, ins]
        )
      } catch (e) {
        db.end()
        console.error(e)
        return res.status(500).json({
          success: false,
          message: 'Failed to add the user to the classroom.',
          data: null,
        })
      }

      try {
        await db.query(
          'DELETE FROM `invitation` WHERE `classroom` = ? AND `recipient` = ?',
          [classroom, check[0].recipient]
        )
      } catch (e) {
        db.end()
        console.error(e)
        return res.status(500).json({
          success: false,
          message: 'Failed to clean up the invitation.',
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

    // delete invitation
    if (action === 'delete') {
      if (classroom === undefined || classroom === '') {
        db.end()
        return res.status(400).json({
          success: false,
          message: 'Missing classroom.',
          data: null,
        })
      }

      const own = await db.query<Pick<DB.Invitation, 'recipient'>[]>(
        'SELECT `invitation`.`recipient` AS "recipient" FROM `user` INNER JOIN `invitation` ON `invitation`.`recipient` = `user`.`id` OR `invitation`.`recipient` = `user`.`email` WHERE `user`.`id` = ? AND `invitation`.`classroom` = ?',
        [user, classroom]
      )

      if (own.length === 0) {
        if (recipient === undefined || recipient === '') {
          db.end()
          return res.status(400).json({
            success: false,
            message: 'Missing recipient.',
            data: null,
          })
        }

        const check = await db.query<unknown[]>(
          'SELECT 1 FROM `user` INNER JOIN `link` ON `link`.`user` = `user`.`id` WHERE `user`.`id` = ? AND `link`.`classroom` = ? AND `user`.`role` IN (' +
            Array.from(ALLOWED_ROLES)
              .map((role) => `'${role}'`)
              .join(', ') +
            ')',
          [user, classroom]
        )

        if (check.length === 0) {
          db.end()
          return res.status(403).json({
            success: false,
            message: 'You do not have the permission to delete invitations.',
            data: null,
          })
        }
      }

      try {
        await db.query(
          'DELETE FROM `invitation` WHERE `classroom` = ? AND `recipient` = ?',
          [classroom, own[0]?.recipient ?? recipient]
        )
      } catch (e) {
        db.end()
        console.error(e)
        return res.status(500).json({
          success: false,
          message: 'Failed to delete invitation.',
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
  }

  return res.status(405).json({
    success: false,
    message: 'Not allowed.',
    data: null,
  })
}

export default handler

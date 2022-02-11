import db from '../../../libs/db'
import session from '../../../libs/session'

import type { NextApiRequest, NextApiResponse } from 'next'

const ID_LENGTH = 6
const SUB_ID_MAX = 4294967295 // sql unsigned int max value

type Query = {
  id: DB.Instruction['id']
}

type Form = {
  sub_id: DB.Instruction['sub_id']
  instruction: DB.Instruction['instruction']
  status: DB.Instruction['status']
}

const generateSubId = () => Math.floor(Math.random() * (SUB_ID_MAX + 1))

const instructionExists = async (id: string): Promise<boolean> => {
  const results = await db.query<DB.Instruction[]>(
    'SELECT 1 FROM `instruction` WHERE `id` = ?',
    id
  )
  return results.length !== 0
}

const createInstruction = async (task = ''): Promise<[string, number]> => {
  for (;;) {
    try {
      const id = $0.getRandomId(ID_LENGTH)
      const subId = generateSubId()
      await db.query(
        "INSERT INTO `instruction` (`id`, `sub_id`, `instruction`, `status`) VALUES (?, ?, ?, 'current')",
        [id, subId, task]
      )
      return [id, subId]
    } catch (e) {
      continue
    }
  }
}

const allowed = async (
  id: DB.Instruction['id'],
  user: DB.User['id'] | undefined,
  role?: DB.User['role'] | undefined
): Promise<boolean> => {
  const link = await db.query<Pick<DB.Link, 'user' | 'classroom'>[]>(
    'SELECT `user`, `classroom` FROM `link` WHERE `instruction` = ?',
    [id]
  )

  if (link.length) {
    if (!user) {
      return false
    }

    const row = link[0]
    const classroom = row.classroom

    let userRole: DB.User['role'] | undefined
    if (user == row.user) userRole = 'student'
    else {
      const info = await db.query<Pick<DB.User, 'role'>[]>(
        'SELECT 1 FROM `user` INNER JOIN `link` ON `user`.`id` = `link`.`user` WHERE `user`.`id` = ? AND `user`.`role` = ? AND `link`.`classroom` = ?',
        [user, 'teacher', classroom]
      )
      if (info.length) userRole = 'teacher'
    }

    if (!userRole) return false
    if (role && role !== userRole) return false
  }

  return true
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    API.BaseResponse<API.InstructionGET | API.InstructionPOST>
  >
): Promise<void> => {
  const { __sid } = req.cookies
  const { id } = req.query as Query

  const user = await session.validate(__sid).catch(() => void 0)

  try {
    if (req.method === 'GET') {
      const result = await db.query<DB.Instruction[]>(
        'SELECT * FROM `instruction` WHERE `id` = ?',
        id
      )

      if (!result.length) {
        db.end()
        return res.status(404).json({
          success: false,
          message: 'Instruction not found.',
          data: null,
        })
      }

      if (!(await allowed(id, user))) {
        db.end()
        return res.status(403).json({
          success: false,
          message: 'User does not have access permission.',
          data: null,
        })
      }

      const ordered = $0.linkedSort(result, 'sub_id')

      db.end()
      return res.status(200).json({
        success: true,
        message: '',
        data: {
          instructions: ordered,
        },
      })
    }

    if (req.method === 'POST') {
      const body = req.body
        ? ((typeof req.body === 'string'
            ? JSON.parse(req.body)
            : req.body) as Partial<Form>)
        : undefined

      const { instruction, status, sub_id } = body ?? {}

      if (!id) {
        // create instruction set
        const [randId, randSubId] = await createInstruction(instruction)

        db.end()
        return res.status(200).json({
          success: true,
          message: '',
          data: {
            id: randId,
            sub_id: randSubId,
          },
        })
      } else if (!instruction) {
        // change instruction status
        if (
          id === undefined ||
          id === '' ||
          sub_id === undefined ||
          isNaN(sub_id)
        ) {
          db.end()
          return res.status(400).json({
            success: false,
            message: 'Missing id or sub_id.',
            data: null,
          })
        }

        if (
          status === undefined ||
          !['todo', 'current', 'done'].includes(status)
        ) {
          db.end()
          return res.status(400).json({
            success: false,
            message: 'Invalid status.',
            data: null,
          })
        }

        if (!(await allowed(id, user))) {
          return res.status(403).json({
            success: false,
            message: 'User does not have permission to update status.',
            data: null,
          })
        }

        await db.query(
          'UPDATE `instruction` SET `status` = ? WHERE `id` = ? AND `sub_id` = ?',
          [status, id, sub_id]
        )
      } else if (!sub_id) {
        // insert new instruction
        if (!(await allowed(id, user, 'teacher'))) {
          return res.status(403).json({
            success: false,
            message: 'User does not have permission to add instruction.',
            data: null,
          })
        }

        const randSubId = generateSubId()

        await db.query(
          'INSERT INTO `instruction` (`id`, `sub_id`, `prev`, `instruction`) SELECT `id`, ?, `sub_id`, ? FROM `instruction` WHERE `id` = ? AND `next` IS NULL',
          [randSubId, instruction, id]
        )
        await db.query(
          'UPDATE `instruction` SET `next` = ? WHERE `id` = ? AND `sub_id` <> ? AND `next` IS NULL',
          [randSubId, id, randSubId]
        )

        db.end()
        return res.status(200).json({
          success: true,
          message: '',
          data: {
            id,
            sub_id: randSubId,
          },
        })
      } else {
        // update instruction text
        if (!(await allowed(id, user, 'teacher'))) {
          return res.status(403).json({
            success: false,
            message: 'User does not have permission to update instruction.',
            data: null,
          })
        }

        try {
          await db.query(
            'UPDATE `instruction` SET `instruction` = ? WHERE `id` = ? AND `sub_id` = ?',
            [instruction, id, sub_id]
          )
        } catch (e) {
          db.end()
          console.error(e)
          return res.status(400).json({
            success: false,
            message:
              'Instruction cannot be updated. (perhaps the id is incorrect?)',
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
  } catch (e) {
    db.end()
    console.error(e)
    return res.status(500).json({
      success: false,
      message: String(e),
      data: null,
    })
  }

  return res.status(405).json({
    success: false,
    message: 'Not allowed.',
    data: null,
  })
}

export { createInstruction, instructionExists }

export default handler

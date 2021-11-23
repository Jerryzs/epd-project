import db from '../../libs/db'

import type { NextApiRequest, NextApiResponse } from 'next'

const ID_LENGTH = 6
const ID_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'

type Row = {
  id: string
  instruction: string
  done: number
}

const instructionExists = async (id: string): Promise<boolean> => {
  const results = await db.query<Row[]>(
    `SELECT *
    FROM \`instruction\`
    WHERE \`id\` = ?`,
    id
  )
  return results.length !== 0
}

const createInstruction = async (task = ''): Promise<string> => {
  let randId: string

  do {
    randId = $0.getRandomId(ID_LENGTH, ID_CHARS)
  } while (!instructionExists(randId))

  await db.query(
    `INSERT
    INTO \`instruction\` (\`id\`, \`instruction\`)
    VALUES (?, ?)`,
    [randId, task]
  )

  return randId
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    API.BaseResponse<API.InstructionGET | API.InstructionPOST>
  >
): Promise<void> => {
  const id = String(req.query.id ?? '').toLowerCase()

  try {
    if (req.method === 'GET') {
      const result = (
        await db.query<Row[]>(
          `SELECT * FROM \`instruction\` WHERE \`id\` = ?`,
          id
        )
      )[0]

      if (result === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Instruction not found.',
          data: null,
        })
      } else {
        return res.status(200).json({
          success: true,
          message: '',
          data: result,
        })
      }
    }

    if (req.method === 'POST') {
      const { status, instruction } = JSON.parse(req.body ?? '')

      if (id === '') {
        const randId = await createInstruction(instruction)

        return res.status(200).json({
          success: true,
          message: '',
          data: {
            id: randId,
          },
        })
      }

      try {
        if (status !== undefined && status in ['todo', 'current', 'done']) {
          await db.query(
            `UPDATE \`instruction\` SET \`status\` = ? WHERE \`id\` = ?`,
            [status, id]
          )
        } else {
          await db.query(
            `UPDATE \`instruction\` SET \`instruction\` = ? WHERE \`id\` = ?`,
            [instruction, id]
          )
        }
      } catch (e) {
        return res.status(400).json({
          success: false,
          message:
            'Instruction cannot be updated. (perhaps the id is incorrect?)',
          data: null,
        })
      }

      return res.status(200).json({
        success: true,
        message: '',
        data: null,
      })
    }
  } catch (e) {
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

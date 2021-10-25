import db from '../../libs/db'

import type { NextApiRequest, NextApiResponse } from 'next'

const ID_LENGTH = 6

type Row = {
  id: string
  instruction: string
  done: number
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
      if (id.match(/^[a-z0-9]{6}$/) === null) {
        return res.status(400).json({
          success: false,
          message: 'id format incorrect',
          data: null,
        })
      }

      const result = await db.query<Row[]>(
        `SELECT * FROM \`instruction\` WHERE \`id\` = ?`,
        id
      )

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'id not found',
          data: null,
        })
      } else {
        return res.status(200).json({
          success: true,
          message: '',
          data: {
            instruction: result[0].instruction,
            done: result[0].done === 0 ? 0 : 1,
          },
        })
      }
    }

    if (req.method === 'POST') {
      const { done, instruction: ins } = JSON.parse(req.body ?? '')

      if (id === '') {
        let existing: Row[]
        let randId: string

        do {
          randId = (() => {
            let id = ''
            const set = 'abcdefghijklmnopqrstuvwxyz0123456789'
            const len = set.length
            for (let i = 0; i < ID_LENGTH; i++) {
              id += set.charAt(Math.floor(Math.random() * len))
            }
            return id
          })()

          existing = await db.query<Row[]>(
            `SELECT * FROM \`instruction\` WHERE \`id\` = '${randId}'`
          )
        } while (existing.length !== 0)

        await db.query(
          `INSERT INTO \`instruction\` (\`id\`, \`instruction\`) VALUES ('${randId}', ?)`,
          ins
        )

        return res.status(200).json({
          success: true,
          message: '',
          data: {
            id: randId,
          },
        })
      }

      if (id.match(/^[a-z0-9]{6}$/) === null) {
        return res.status(400).json({
          success: false,
          message: 'id format incorrect',
          data: null,
        })
      }

      if (done !== undefined && done in [0, 1]) {
        await db.query(
          `UPDATE \`instruction\` SET \`done\` = ${done} WHERE \`id\` = ?`,
          id
        )
      } else {
        await db.query(
          `UPDATE \`instruction\` SET \`instruction\` = ? WHERE \`id\` = ?`,
          [ins, id]
        )
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

export default handler

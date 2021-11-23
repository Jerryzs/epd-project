import db from '../../../libs/db'
import session from '../../../libs/session'

import { createInstruction, instructionExists } from '../instruction'

import type { NextApiRequest, NextApiResponse } from 'next'

type Link = {
  user: string
  classroom: string
  instruction: string
}

type Body = {
  id: string
  user: string
  instruction: string
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<API.BaseResponse<API.Classroom.RosterGET>>
): Promise<void> => {
  const query = req.query

  const body = (
    typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  ) as Partial<Body>

  const id = query.id ?? body.id

  if (id === undefined || id === '') {
    return res.status(400).json({
      success: false,
      message: 'Missing classroom id.',
      data: null,
    })
  }

  const sid = req.cookies.__sid
  let ssuser: string

  try {
    ssuser = await session.validate(sid)
  } catch (e) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden.',
      data: null,
    })
  }

  const classroom = (
    await db.query<Classroom[]>(
      `
      SELECT *
      FROM \`classroom\`
      WHERE \`id\` = ?`,
      id
    )
  )[0]

  if (classroom === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Classroom does not exist.',
      data: null,
    })
  }

  if (req.method === 'GET') {
    const links = await db.query<Link[]>(
      `
      SELECT *
      FROM \`link\`
      WHERE \`classroom\` = ?`,
      id
    )

    if (links.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Classroom roster not found.',
        data: null,
      })
    }

    if (links.every((link) => link.user !== ssuser)) {
      return res.status(400).json({
        success: false,
        message: 'Requesting user not a member of the classroom.',
        data: null,
      })
    }

    const members = await db.query<User[]>(
      `
      SELECT *
      FROM \`user\`
      WHERE \`id\` IN (${links.map((link) => link.user).join(',')})`
    )

    return res.status(200).json({
      success: true,
      message: '',
      data: {
        classroom,
        members,
      },
    })
  }

  if (req.method === 'POST') {
    let instruction = body.instruction

    if (instruction === undefined || instruction === '') {
      instruction = await createInstruction()
    } else if (!instructionExists(instruction)) {
      return res.status(400).json({
        success: false,
        message: 'Instruction does not exist.',
        data: null,
      })
    }

    if (body.user === undefined) {
      await db.query(
        `INSERT
        INTO \`link\` (\`user\`, \`classroom\`, \`instruction\`)
        VALUES (?, ?, ?)`,
        [ssuser, classroom.id, instruction]
      )
    }

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

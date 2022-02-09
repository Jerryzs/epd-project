import db from '../../../libs/db'

import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<API.BaseResponse<API.UserGET>>
): Promise<void> => {
  const sid = req.cookies.__sid

  if (req.method === 'GET') {
    if (sid === undefined) {
      db.end()
      return res.status(200).json({
        success: true,
        message: 'No session to logout of.',
        data: null,
      })
    }

    await db.query('DELETE FROM `session` WHERE `id` = ?', sid)

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

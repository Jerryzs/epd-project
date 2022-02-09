import db from './db'

const SESSION_AGE = 604800
const SESID_CHARS = 'abcdefghijklmnopqrstuvwxyz1234567890-_='

type Session = {
  id: string
  user: string
  expire: number
  platform: string
}

const session = {
  age: SESSION_AGE,

  validate: async (sid: string): Promise<string> => {
    if (sid === undefined || sid === '') {
      throw 'No session.'
    }

    const session = (
      await db.query<Session[]>('SELECT * FROM `session` WHERE `id` = ?', sid)
    )[0]

    if (session === undefined) {
      throw 'Session is invalid.'
    }

    if (session.expire < Date.now() / 1000) {
      await db.query('DELETE FROM `session` WHERE `id` = ?', sid)
      throw 'Session expired.'
    }

    const expire = Math.floor(Date.now() / 1000) + SESSION_AGE

    await db.query('UPDATE `session` SET `expire` = ? WHERE `id` = ?', [
      expire,
      sid,
    ])

    return session.user
  },

  create: async (user: string): Promise<string> => {
    const sid = $0.getRandomId(32, SESID_CHARS)
    const expire = Math.floor(Date.now() / 1000) + SESSION_AGE

    await db.query(
      'INSERT INTO `session` (`id`, `user`, `expire`) VALUES (?, ?, ?)',
      [sid, user, expire]
    )

    return sid
  },

  cookie: (sid: string): string => {
    return `__sid=${sid}; Max-Age=${session.age}; Path=/; Secure; HttpOnly`
  },
}

export default session

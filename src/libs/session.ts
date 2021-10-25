import db from './db'

const SESSION_AGE = 604800

type Session = {
  id: string
  user: number
  expire: number
  platform: string
}

const session = {
  age: SESSION_AGE,

  validate: async (sid: string): Promise<number> => {
    const session = (
      await db.query<Session[]>(
        `SELECT * FROM \`session\` WHERE \`id\` = ?`,
        sid
      )
    )[0]

    if (session === undefined) {
      throw 'Session is invalid.'
    }

    if (session.expire < Date.now() / 1000) {
      await db.query(`DELETE FROM \`session\` WHERE \`id\` = ?`, sid)
      throw 'Session expired.'
    }

    await db.query(
      `UPDATE \`session\`
      SET \`expire\` = ${Math.floor(Date.now() / 1000) + SESSION_AGE}
      WHERE \`id\` = ?`,
      sid
    )

    return session.user
  },

  create: async (user: number): Promise<string> => {
    const sid = $0.getRandomId(32)
    const expire = Math.floor(Date.now() / 1000) + SESSION_AGE

    await db.query(
      `INSERT
      INTO \`session\` (\`id\`, \`user\`, \`expire\`)
      VALUES ('${sid}', ${user}, ${expire})`
    )

    return sid
  },

  cookie: (sid: string): string => {
    return `__sid=${sid}; Max-Age=${session.age}; Path=/; Secure; HttpOnly`
  },
}

export default session

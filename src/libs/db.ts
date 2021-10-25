import ServerlessMySQL from 'serverless-mysql'

const mysql = ServerlessMySQL({
  config: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: parseInt(process.env.DB_PORT ?? ''),
  },
})

const db = {
  mysql,

  query: async <T = unknown>(
    q: string,
    values: (string | number)[] | string | number = []
  ): Promise<T> => {
    try {
      const results = await mysql.query<T>(q, values)
      await mysql.end()
      return results
    } catch (e) {
      console.error(e)
      throw 'Internal error.'
    }
  },
}

export default db

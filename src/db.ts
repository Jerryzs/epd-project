import mysql from 'serverless-mysql'

export const db = mysql({
  config: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: parseInt(process.env.DB_PORT ?? ''),
  },
})

export async function query<T = unknown>(
  q: string,
  values: (string | number)[] | string | number = []
): Promise<T> {
  try {
    const results = await db.query<T>(q, values)
    await db.end()
    return results
  } catch (e) {
    throw Error((e as Error).message)
  }
}

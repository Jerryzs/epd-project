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

export default mysql

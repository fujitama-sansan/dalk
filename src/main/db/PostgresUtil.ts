export type PrismaConnectionOptions = {
  host: string
  port: number
  user: string
  password: string
  database: string
  options: {
    schema: string
    connect_timeout?: number
    socket_timeout?: number
    statement_timeout?: number
  }
}
const buildPostgresConnectionString = (conf: PrismaConnectionOptions): string => {
  const query = new URLSearchParams(
    Object.entries(conf.options).map(([key, value]) => [key, String(value)])
  ).toString()
  return `postgresql://${conf.user}:${encodeURIComponent(conf.password)}@${conf.host}:${conf.port}/${conf.database}?${query}`
}

export const PostgresUtil = {
  buildPostgresConnectionString
}

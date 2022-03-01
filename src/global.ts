const url = process.env.NEXT_PUBLIC_URL ?? ''
const shortUrl = process.env.NEXT_PUBLIC_SHORT_URL ?? url
const sameServer = !!process.env.SAME_SERVER

const RANDOM_CHARS = 'abcdefghijklmnopqrstuvwxyz1234567890'

const getApi = (url: string) => ({
  instruction: {
    index: url + '/api/instruction',
  },
  user: {
    get: url + '/api/user',
    classrooms: url + '/api/user/classrooms',
  },
  auth: {
    login: url + '/api/auth/login',
    logout: url + '/api/auth/logout',
    register: url + '/api/auth/register',
    verify: url + '/api/auth/verify',
  },
  classroom: {
    index: url + '/api/classroom',
    invite: url + '/api/classroom/invite',
  },
})

const GlobalObject = {
  url,
  shortUrl,

  api: getApi(url),

  regex: {
    email:
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    password: /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
  },

  fetch: async <T extends JSONObject | null = null>(
    url: RequestInfo,
    init?: RequestInit
  ): Promise<T> =>
    await fetch(url, init)
      .then(
        async (res): Promise<[API.BaseResponse<T>, number]> => [
          await res.json(),
          res.status,
        ]
      )
      .then(([res, status]) => {
        if (!res.success) {
          throw [status, res.message]
        }
        return res.data as T
      }),

  isApiError: (e: unknown): e is API.Error =>
    Array.isArray(e) &&
    e.length === 2 &&
    typeof e[0] === 'number' &&
    typeof e[1] === 'string',

  getRandomId: (len: number, chars = RANDOM_CHARS): string => {
    let code = ''
    for (let i = 0; i < len; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  },

  auth: (user?: API.UserGET): user is User => {
    return user !== undefined && user.id !== null
  },

  noAuth: (user?: API.UserGET): user is NoUser => {
    return user !== undefined && user.id === null
  },

  linkedSort: <T, U extends string | number>(
    list: LinkedList<T, U>,
    keyName = 'id'
  ): T[] => {
    if (list.length < 2) return list.slice()

    const ordered: typeof list = []

    const dict: { [key: string | number]: typeof list[0] } = {}
    let first: U | null = null
    let last: U | null = null

    for (const item of list) {
      if (!item.prev)
        if (!first) first = item[keyName]
        else throw 'duplicate null prev value'
      if (!item.next)
        if (!last) last = item[keyName]
        else throw 'duplicate null next value'
      const id = item[keyName]
      if (id !== null) dict[id] = item
      else throw 'id value is null, check key name entered'
    }

    if (first === null || last === null) throw 'missing end'

    for (
      let curr: typeof dict[U] | false = dict[first];
      curr;
      curr = curr.next !== null && dict[curr.next]
    ) {
      ordered.push(curr)
    }

    return ordered
  },

  fparams: (
    params: NodeJS.Dict<string | string[]> | undefined
  ): NodeJS.Dict<string> | undefined => {
    if (!params) return
    const formatted: NodeJS.Dict<string> = {}
    for (const [n, p] of Object.entries(params))
      formatted[n] = typeof p === 'string' ? p : p?.[0]
    return formatted
  },

  toServerURL: (url: string): string =>
    sameServer ? url.replace(GlobalObject.url, 'http://localhost:3000') : url,

  __dangerouslySetUrl: (url: string): void => void [url],
}

if (process.env.NODE_ENV === 'development') {
  Object.assign(GlobalObject, {
    __dangerouslySetUrl: (url: string): void => {
      Object.assign(GlobalObject, {
        url,
        api: getApi(url),
      })
    },
  })
}

export default GlobalObject

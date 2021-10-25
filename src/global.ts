const url = process.env.NEXT_PUBLIC_URL ?? ''

const RANDOM_CHARS = 'abcdefghijklmnopqrstuvwxyz1234567890-_='

const GlobalObject = {
  url,

  api: {
    instruction: url + '/api/instruction',
  },

  fetch: async <T extends JSONObject | null = null>(
    url: RequestInfo,
    init?: RequestInit
  ): Promise<T> =>
    await fetch(url, init)
      .then(async (res): Promise<API.BaseResponse<T>> => await res.json())
      .then((res) => {
        if (!res.success) {
          throw Error(res.message)
        }
        return res.data as T
      }),

  getRandomId: (len: number, chars = RANDOM_CHARS): string => {
    let code = ''
    for (let i = 0; i < len; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  },

  auth: (user?: API.UserGET): user is User => {
    return user !== undefined && user.id !== -1
  },

  noAuth: (user?: API.UserGET): user is NoUser => {
    return user !== undefined && user.id === -1
  },
}

export default GlobalObject

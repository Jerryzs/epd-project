const url = process.env.NEXT_PUBLIC_URL ?? ''

const RANDOM_CHARS = 'abcdefghijklmnopqrstuvwxyz1234567890-_='

const GlobalObject = {
  url,

  api: {
    instruction: url + '/api/instruction',
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
      roster: url + '/api/classroom/roster',
      invite: url + '/api/classroom/invite',
    },
  },

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
      .then(async (res): Promise<API.BaseResponse<T>> => await res.json())
      .then((res) => {
        if (!res.success) {
          throw res.message
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
    return user !== undefined && user.id !== null
  },

  noAuth: (user?: API.UserGET): user is NoUser => {
    return user !== undefined && user.id === null
  },
}

export default GlobalObject

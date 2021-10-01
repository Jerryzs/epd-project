const url = process.env.NEXT_PUBLIC_URL ?? ''

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
}

export default GlobalObject

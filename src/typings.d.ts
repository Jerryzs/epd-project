import GlobalObject from './global'

declare global {
  const $0: typeof GlobalObject

  type JSONPrimitive = string | number | boolean | null
  type JSONValue = JSONPrimitive | JSONObject | JSONArray
  type JSONObject = { [member: string]: JSONValue }
  type JSONArray = Array<JSONValue>

  namespace API {
    interface BaseResponse<T extends JSONObject | null = null> {
      success: boolean
      message: string
      data: T | null
    }
  }
}

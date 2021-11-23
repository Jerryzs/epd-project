import GlobalObject from './global'

declare global {
  const $0: typeof GlobalObject

  type JSONPrimitive = string | number | boolean | null
  type JSONValue = JSONPrimitive | JSONObject | JSONArray
  type JSONObject = { [member: string]: JSONValue }
  type JSONArray = Array<JSONValue>

  type User = {
    id: string
    name: string
    email: string
    role: 'student' | 'teacher'
  }

  type NoUser = {
    id: null
  }

  namespace API {
    interface BaseResponse<T extends JSONObject | null = null> {
      success: boolean
      message: string
      data: T | null
    }

    type InstructionGET = {
      instruction: string
      done: 0 | 1
    }

    type InstructionPOST = {
      id: string
    }

    type UserGET = User | NoUser
  }
}

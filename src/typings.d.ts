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

  type Classroom = {
    id: string
    name: string
    instructor_name: string
  }

  namespace API {
    interface BaseResponse<T extends JSONObject | null = null> {
      success: boolean
      message: string
      data: T | null
    }

    type Error = [number, string]

    type InstructionGET = {
      id: string
      instruction: string
      status: 'todo' | 'current' | 'done'
    }

    type InstructionPOST = {
      id: string
    }

    type UserGET = User | NoUser

    namespace User {
      type ClassroomsGET = {
        classrooms: Classroom[]
      }
    }

    namespace Classroom {
      type RosterGET = {
        classroom: Classroom
        members: User[]
      }
    }
  }
}

import GlobalObject from './global'

declare global {
  const $0: typeof GlobalObject

  type JSONPrimitive = string | number | boolean | null
  type JSONValue = JSONPrimitive | JSONObject | JSONArray
  type JSONObject = { [member: string]: JSONValue }
  type JSONArray = Array<JSONValue>

  type User = Pick<DB.User, 'id' | 'email' | 'name' | 'role'>

  type NoUser = {
    id: null
  }

  type Classroom = DB.Classroom

  type LinkedList<T, U extends string | number> = (T & {
    prev: U | null
    next: U | null
    [key: string]: U | null
  })[]

  namespace API {
    interface BaseResponse<T extends JSONObject | null = null> {
      success: boolean
      message: string
      data: T | null
    }

    type Error = [number, string]

    type InstructionGET = {
      instructions: DB.Instruction[]
    }

    type InstructionPOST = Pick<DB.Instruction, 'id' | 'sub_id'>

    type UserGET = User | NoUser

    namespace User {
      type ClassroomsGET = {
        classrooms: Classroom[]
        invitations: (Pick<DB.Classroom, 'id' | 'name'> &
          Pick<DB.Invitation, 'user'>)[]
      }
    }

    namespace Classroom {
      type RosterGET = {
        classroom: Classroom
        members: User[]
        invitations: Pick<DB.Invitation, 'recipient' | 'user'>[]
      }
    }
  }

  namespace DB {
    type Instruction = {
      id: string
      sub_id: number
      prev: number | null
      next: number | null
      instruction: string
      status: 'todo' | 'current' | 'done'
    }

    type User = {
      id: string
      name: string
      email: string
      role: 'student' | 'teacher'
    }

    type Classroom = {
      id: string
      name: string
      instructor_name: string
    }

    type Link = {
      user: string
      classroom: string
      next: string | null
      prev: string | null
      instruction: string | null
    }

    type Invitation = {
      classroom: string
      recipient: string
      user: string
    }
  }

  declare module '*.txt' {
    const content: string
    export default content
  }

  declare module '*.html' {
    const content: string
    export default content
  }
}

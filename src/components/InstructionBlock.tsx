import { useEffect, useMemo, useRef, useState } from 'react'
import styles from '../styles/components/InstructionBlock.module.scss'

import type { ChangeEvent, KeyboardEvent, MouseEvent, ReactNode } from 'react'
import type { SWRResponse } from 'swr'

const NPID = '__NEWINSTRUCTIONPLACEHOLDER__'

const InstructionBlock = ({
  className = '',
  editable = false,
  swr,
  timeout = 2000,
  onStatusChange,
  onSave,
  onCurrentChange,
  onNew,
}: {
  className?: string
  editable?: boolean
  swr?: SWRResponse<API.InstructionGET, API.BaseResponse<null>>
  timeout?: number
  onStatusChange?: (
    id: string,
    sub_id: number,
    status: DB.Instruction['status']
  ) => void | Promise<void>
  onSave?: (
    id: string,
    sub_id: number,
    instruction: string
  ) => void | Promise<void>
  onCurrentChange?: (index: number) => void | Promise<void>
  onNew?: (instruction: string) => void | Promise<void>
}): JSX.Element => {
  const { data, mutate } = swr ?? {
    data: {
      instructions: [] as Omit<DB.Instruction, 'prev' | 'next'>[],
    },
    mutate: () => Promise.resolve(),
  }

  const uId = useMemo(() => $0.getRandomId(6), [])

  const saveTimeout = useRef<NodeJS.Timeout>()

  const [_content, _setContent] = useState(data?.instructions ?? [])
  const [empty, _setEmpty] = useState(
    data?.instructions.map(({ instruction }) => instruction === '') ?? []
  )
  const [current, setCurrent] = useState(-1)
  const [pause, setPause] = useState(false)
  const [showing, setShowing] = useState(false)

  const content = !editable
    ? _content
    : _content.concat([
        {
          id: NPID + (_content[0]?.id ?? ''),
          sub_id: 0,
          instruction: '',
          status: 'todo',
        },
      ])

  const setContent = (index: number, obj: Partial<DB.Instruction>) =>
    _setContent((content) => {
      const arr = content.slice()
      arr[index] = { ...arr[index], ...obj }
      return arr
    })

  const setEmpty = (index: number, value: boolean) =>
    _setEmpty((empty) => {
      const arr = empty.slice()
      arr[index] = value
      return arr
    })

  const focus = (el: HTMLElement | null) => {
    const fakeInput = document.createElement('input')
    fakeInput.setAttribute('type', 'text')
    fakeInput.setAttribute('readonly', 'true')
    fakeInput.style.position = 'absolute'
    fakeInput.style.opacity = '0'
    fakeInput.style.height = '0'
    fakeInput.style.fontSize = '16px'

    document.body.prepend(fakeInput)

    fakeInput.focus({ preventScroll: true })

    setTimeout(() => {
      el?.focus()
      fakeInput.remove()
    }, 100)
  }

  const save = (index: number, text: string, final = false) => {
    const { id, sub_id } = content[index]
    let promise: Promise<void> | void | undefined
    if (id.includes(NPID)) {
      promise = onNew?.(text.trim())
    } else {
      promise = onSave?.(id, sub_id, text.trim())
    }
    Promise.allSettled([promise]).finally(() => {
      if (final) {
        mutate()
        if (current === index) setCurrent(-1)
      }
    })
  }

  const resizeTextArea = (el: HTMLTextAreaElement) => {
    el.style.height = '5px'
    el.style.height = el.scrollHeight + 4 + 'px'
  }

  useEffect(() => {
    if (current === -1) {
      if (!data?.instructions.length) {
        return
      }
      _setContent(data.instructions)
      _setEmpty(data.instructions.map(({ instruction }) => instruction === ''))
    }
  }, [data])

  useEffect(() => {
    onCurrentChange?.(current)
    if (current !== -1) {
      const { id, sub_id } = content[current]
      const el = document.getElementById(
        `textarea_${uId}${id}${sub_id}`
      ) as HTMLTextAreaElement | null
      if (el) {
        focus(el)
        el.setSelectionRange(el.value.length, el.value.length)
        resizeTextArea(el)
      }
    }
  }, [current])

  const handleEditClick = (
    index: number,
    e: MouseEvent<HTMLAnchorElement>
  ): void => {
    e.preventDefault()
    setEmpty(index, false)
    setCurrent(index)
  }

  const handlePlaceholderFocus = (index: number): void => {
    setEmpty(index, false)
    setCurrent(index)
  }

  const handleContentClick = (
    index: number,
    e: MouseEvent<HTMLAnchorElement>
  ): void => {
    e.preventDefault()
    const { id, sub_id, status } = content[index]
    if (!pause && current !== index) {
      setPause(true)
      const promises: unknown[] = []
      // mark done
      if (status === 'current') {
        const todoIndex = content.findIndex(({ status }) => status === 'todo')
        if (todoIndex !== -1 && !content[todoIndex].id.includes(NPID)) {
          const todo = content[todoIndex]
          promises.push(onStatusChange?.(todo.id, todo.sub_id, 'current'))
          setContent(todoIndex, { status: 'current' })
        }
        promises.push(onStatusChange?.(id, sub_id, 'done'))
        setContent(index, { status: 'done' })
        setShowing(true)
      }
      // revert done action
      if (status === 'done') {
        const currIndex = content.findIndex(
          ({ status }) => status === 'current'
        )
        if (currIndex !== -1 && currIndex < index) {
          promises.push(onStatusChange?.(id, sub_id, 'todo'))
          setContent(index, { status: 'todo' })
        } else {
          promises.push(onStatusChange?.(id, sub_id, 'current'))
          setContent(index, { status: 'current' })
          if (currIndex !== -1) {
            const curr = content[currIndex]
            promises.push(onStatusChange?.(curr.id, curr.sub_id, 'todo'))
            setContent(currIndex, { status: 'todo' })
          }
        }
      }
      if (promises.length) {
        Promise.allSettled(promises).finally(
          () => void mutate().finally(() => setPause(false))
        )
      } else {
        setPause(false)
      }
    }
  }

  const handleContentKeyPress = (
    index: number,
    e: KeyboardEvent<HTMLAnchorElement>
  ) => {
    const { status } = content[index]
    if (e.key === 'Enter' && status === 'current') {
      const next = e.currentTarget.parentElement?.nextSibling?.firstChild as
        | HTMLAnchorElement
        | null
        | undefined
      next?.focus()
    }
  }

  const handleTextAreaInput = (
    index: number,
    e: ChangeEvent<HTMLTextAreaElement>
  ): void => {
    const target = e.target

    if (current === index) {
      if (saveTimeout.current === undefined) {
        saveTimeout.current = setTimeout(() => {
          saveTimeout.current = undefined
          const text = target.value
          if (text && index < _content.length) {
            save(index, text)
          }
        }, timeout)
      }
    }

    resizeTextArea(target)
  }

  const handleTextAreaKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  const handleTextAreaBlur = (index: number): void => {
    const { id, sub_id } = content[index]
    const textarea = document.getElementById(
      `textarea_${uId}${id}${sub_id}`
    ) as HTMLTextAreaElement | null
    const text = textarea?.value
    saveTimeout.current = undefined
    if (text) {
      if (index < _content.length) {
        setContent(index, { instruction: text })
      }
      save(index, text, true)
    } else {
      setCurrent(-1)
      setEmpty(index, true)
    }
  }

  return (
    <div
      className={`${className} ${styles.wrapper} ${
        editable ? styles.editable : ''
      }`.trim()}
    >
      {content.map(({ id, sub_id, instruction, status }, index) => (
        <div key={`instruction_${id}${sub_id}`} className={styles.instruction}>
          {current !== index ? (
            <a
              className={`${styles.text} ${styles[status]} ${
                showing ? styles.showing : ''
              } ${id.includes(NPID) ? styles.new : ''}`.trim()}
              href={
                status === 'done'
                  ? `/${id}?undo=${sub_id}`
                  : status === 'current'
                  ? `/${id}?done=${sub_id}`
                  : undefined
              }
              tabIndex={status === 'todo' || id.includes(NPID) ? -1 : 0}
              onClick={handleContentClick.bind(null, index)}
              onKeyPress={handleContentKeyPress.bind(null, index)}
              onMouseLeave={(e) => e.currentTarget.blur()}
              onBlur={setShowing.bind(null, false)}
            >
              {instruction
                .split('\n')
                .reduce(
                  (arr, s, i) =>
                    i === 0
                      ? arr.concat([s])
                      : arr.concat([<br key={`br_${id}${sub_id}${i}`} />, s]),
                  [] as ReactNode[]
                )}
            </a>
          ) : (
            <textarea
              id={`textarea_${uId}${id}${sub_id}`}
              rows={1}
              className={styles.input}
              onInput={handleTextAreaInput.bind(null, index)}
              onBlur={handleTextAreaBlur.bind(null, index)}
              onKeyDown={handleTextAreaKeyDown.bind(null, index)}
              defaultValue={instruction}
            />
          )}

          {(id.includes(NPID) && current === index) ||
          empty[index] === false ? undefined : (
            <a
              className={styles.placeholder}
              href={`/${id.substring(NPID.length)}?new=true`}
              onFocus={handlePlaceholderFocus.bind(null, index)}
              onClick={(e) => {
                e.preventDefault()
                e.currentTarget.focus()
              }}
            >
              Enter an instruction...
            </a>
          )}

          {!editable || id.includes(NPID) ? undefined : (
            <a
              className={styles.editIcon}
              href={`/${id}?edit=${sub_id}`}
              style={{
                color: current === index ? '#ff0000' : '#000000',
              }}
              onClick={handleEditClick.bind(null, index)}
            >
              <i className='bi bi-pencil-square'></i>
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

export default InstructionBlock

import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import styles from '../styles/components/InstructionField.module.scss'

import type { MouseEvent } from 'react'
import type { SWRResponse } from 'swr'

const InstructionField = ({
  initial = '',
  swr,
  alwaysEditable = false,
  timeout = 2000,
  onSave,
  onStateChange,
}: {
  initial?: string
  swr?: SWRResponse<API.InstructionGET, API.BaseResponse<null>>
  alwaysEditable?: boolean
  timeout?: number
  onSave?: (text: string) => void
  onStateChange?: (editState: boolean) => void
}): JSX.Element => {
  const input = useRef<HTMLDivElement>(null)
  const final = useRef<string>()
  const saveTimeout = useRef<NodeJS.Timeout>()

  const [content, setContent] = useState(initial)
  const [empty, setEmpty] = useState(content === '')
  const [edit, setEdit] = useState(alwaysEditable)

  const { data, mutate } = swr ?? {
    data: { instruction: content },
    mutate: () => Promise.resolve(),
  }

  const focus = () => {
    const fakeInput = document.createElement('input')
    fakeInput.setAttribute('type', 'text')
    fakeInput.setAttribute('readonly', 'true')
    fakeInput.style.position = 'absolute'
    fakeInput.style.opacity = '0'
    fakeInput.style.height = '0'
    fakeInput.style.fontSize = '16px'

    document.body.prepend(fakeInput)

    fakeInput.focus()

    setTimeout(() => {
      input.current?.focus()
      fakeInput.remove()
    }, 1000)
  }

  useEffect(() => {
    if (alwaysEditable) input.current?.focus()
  }, [])

  useEffect(() => {
    if (!edit) {
      const text = data?.instruction ?? ''
      setContent(text)
      setEmpty(text === '')
    }
  }, [data])

  useEffect(() => {
    onStateChange?.(edit)

    if (edit) {
      input.current?.focus()
    }
  }, [edit])

  const handleEditClick = (e: MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault()
    setEdit(true)
  }

  const handlePlaceholderClick = (): void => {
    setEdit(true)
    if (alwaysEditable) {
      focus()
    }
  }

  const handleContentInput = (e: ChangeEvent<HTMLDivElement>): void => {
    if (edit) {
      setEmpty((e.target.textContent ?? e.target.innerText ?? '') === '')

      if (alwaysEditable && saveTimeout.current !== undefined) {
        clearTimeout(saveTimeout.current)
        saveTimeout.current = undefined
      }

      if (saveTimeout.current === undefined) {
        saveTimeout.current = setTimeout(() => {
          const text = (
            final.current ??
            e.target.textContent ??
            e.target.innerText ??
            ''
          ).trim()
          onSave?.(text)
          if (!edit) {
            mutate()
          }
          saveTimeout.current = undefined
        }, timeout)
      }
    }
  }

  const handleContentKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  const handleContentBlur = (e: FocusEvent<HTMLDivElement>): void => {
    if (alwaysEditable) setTimeout(() => e.target.focus(), 100)
    else {
      final.current =
        input.current?.textContent ?? input.current?.innerText ?? ''
      setEdit(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      {alwaysEditable ? undefined : (
        <a
          href='#'
          style={{
            color: edit ? '#ff0000' : '#000000',
          }}
          onClick={handleEditClick}
        >
          <i className='bi bi-pencil-square'></i>
        </a>
      )}

      {!empty ? undefined : (
        <div className={styles.placeholder} onClick={handlePlaceholderClick}>
          Enter the instruction...
        </div>
      )}

      <div
        ref={input}
        className={styles.input}
        contentEditable={edit}
        suppressContentEditableWarning
        onInput={handleContentInput}
        onBlur={handleContentBlur}
        onKeyDown={handleContentKeyDown}
      >
        {content}
      </div>
    </div>
  )
}

export default InstructionField

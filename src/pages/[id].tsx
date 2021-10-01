import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { NextSeo } from 'next-seo'
import styles from '../styles/pages/instruction.module.scss'

import type { MouseEvent } from 'react'
import type { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = String(params?.id ?? '')
  const { instruction } = await $0.fetch<API.InstructionGET>(
    `${$0.api.instruction}?id=${id}`
  )
  return {
    props: {
      id,
      instruction,
    },
  }
}

const Instruction = ({
  id,
  instruction,
}: {
  id: string
  instruction: string
}): JSX.Element => {
  const container = useRef<HTMLDivElement>(null)

  const [content, setContent] = useState('')
  const [edit, setEdit] = useState(false)

  const { data, mutate } = useSWR<API.InstructionGET>(
    `${$0.api.instruction}?id=${id}`,
    $0.fetch,
    {
      refreshInterval: 1000,
      fallbackData: { instruction },
      isPaused: () => edit,
    }
  )

  useEffect(() => {
    if (!edit) {
      setContent(data?.instruction ?? '')
    }
  }, [data])

  useEffect(() => {
    if (edit && container.current !== null) {
      window.getSelection()?.selectAllChildren(container.current)
    }

    if (!edit) {
      window.getSelection()?.removeAllRanges()
      mutate()
    }
  }, [edit])

  const handleEditClick = (e: MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault()
    setEdit(true)
  }

  let update: undefined | NodeJS.Timeout
  const handleContentInput = (e: ChangeEvent<HTMLDivElement>): void => {
    if (update === undefined) {
      update = setTimeout(() => {
        const text = (e.target.textContent ?? e.target.innerText ?? '').trim()
        fetch(`${$0.api.instruction}?id=${id}`, {
          method: 'POST',
          body: JSON.stringify({ instruction: text }),
        })
        update = undefined
      }, 2000)
    }
  }

  const handleContentKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      container.current?.blur()
    }
  }

  const handleContentBlur = (): void => {
    setEdit(false)
  }

  return (
    <>
      <NextSeo title={id} />

      <div className={styles.wrapper}>
        <div className={styles.instruction}>
          <a
            href='#'
            style={{
              color: edit ? '#ff0000' : '#000000',
            }}
            onClick={handleEditClick}
          >
            <i className='bi bi-pencil-square'></i>
          </a>
          <div
            ref={container}
            contentEditable={edit}
            suppressContentEditableWarning
            onInput={handleContentInput}
            onBlur={handleContentBlur}
            onKeyDown={handleContentKeyDown}
          >
            {content}
          </div>
        </div>
      </div>
    </>
  )
}

export default InstructionPage

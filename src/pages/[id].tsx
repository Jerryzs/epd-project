import { KeyboardEvent, useEffect, useRef, useState } from 'react'
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
  const { data, mutate } = useSWR<API.InstructionGET>(
    `${$0.api.instruction}?id=${id}`,
    $0.fetch,
    {
      refreshInterval: 1000,
      fallbackData: { instruction },
    }
  )

  const container = useRef<HTMLDivElement>(null)

  const [awaitSave, setAwaitSave] = useState(false)
  const [edit, setEdit] = useState(false)

  useEffect(() => {
    if (edit && container.current !== null) {
      window.getSelection()?.selectAllChildren(container.current)
    }
  }, [edit])

  useEffect(() => {
    if (awaitSave) {
      const text =
        container.current?.textContent ?? container.current?.innerText ?? ''
      fetch(`${$0.api.instruction}?id=${id}`, {
        method: 'POST',
        body: JSON.stringify({ instruction: text }),
      })
      window.getSelection()?.removeAllRanges()
      setAwaitSave(false)
      setEdit(false)
      mutate()
    }
  }, [awaitSave])

  const handleEditClick = (e: MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault()
    setEdit(true)
  }

  const handleContentKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      container.current?.blur()
    }
  }

  const handleContentBlur = (): void => {
    setAwaitSave(true)
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
            onBlur={handleContentBlur}
            onKeyDown={handleContentKeyDown}
          >
            {data?.instruction ?? ''}
          </div>
        </div>
      </div>
    </>
  )
}

export default Instruction

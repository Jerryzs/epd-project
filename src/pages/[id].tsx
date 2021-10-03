import { useState } from 'react'
import useSWR from 'swr'
import { NextSeo } from 'next-seo'
import InstructionField from '../components/InstructionField'
import styles from '../styles/pages/instruction.module.scss'

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

const InstructionPage = ({
  id,
  instruction,
}: {
  id: string
  instruction: string
}): JSX.Element => {
  const [edit, setEdit] = useState(false)

  const insSWR = useSWR<API.InstructionGET>(
    `${$0.api.instruction}?id=${id}`,
    $0.fetch,
    {
      refreshInterval: 1000,
      fallbackData: { instruction },
      isPaused: () => edit,
    }
  )

  return (
    <>
      <NextSeo title={id.toUpperCase()} />

      <div className={styles.wrapper}>
        <InstructionField
          swr={insSWR}
          onSave={(text) => {
            fetch(`${$0.api.instruction}?id=${id}`, {
              method: 'POST',
              body: JSON.stringify({ instruction: text }),
            })
          }}
          onStateChange={setEdit}
        />

        <div className={styles.share}>
          Share your instruction with students using the link
          <a href={`${$0.url}/${id}`}>
            {`${$0.url}/`}
            <b>{id.toUpperCase()}</b>
          </a>
        </div>
      </div>
    </>
  )
}

export default InstructionPage

import { useState } from 'react'
import useSWR from 'swr'
import { NextSeo } from 'next-seo'
import InstructionBlock from '../components/InstructionBlock'
import styles from '../styles/pages/instruction.module.scss'

import type { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { id } = $0.fparams(params) ?? {}
  try {
    const { instructions } = await $0.fetch<API.InstructionGET>(
      `${$0.toServerURL($0.api.instruction.index)}?id=${id}`
    )
    return {
      props: {
        id,
        instructions,
      },
    }
  } catch (e) {
    if ($0.isApiError(e) && e[0] === 404) return { notFound: true }
    throw e
  }
}

const InstructionPage = ({
  id,
  instructions,
}: API.InstructionGET & {
  id: DB.Instruction['id']
}): JSX.Element => {
  const [current, setCurrent] = useState(-1)

  const insSWR = useSWR<API.InstructionGET>(
    `${$0.api.instruction.index}?id=${id}`,
    $0.fetch,
    {
      refreshInterval: 1000,
      fallbackData: { instructions },
      isPaused: () => current !== -1,
    }
  )

  return (
    <>
      <NextSeo title={id.toUpperCase()} />

      <div className={`${styles.wrapper} container`}>
        <div className={styles.instructions}>
          <InstructionBlock
            editable
            swr={insSWR}
            onStatusChange={async (id, sub_id, status) => {
              await fetch(`${$0.api.instruction.index}?id=${id}`, {
                method: 'POST',
                body: JSON.stringify({ sub_id, status }),
              })
            }}
            onSave={async (id, sub_id, instruction) => {
              await fetch(`${$0.api.instruction.index}?id=${id}`, {
                method: 'POST',
                body: JSON.stringify({ sub_id, instruction }),
              })
            }}
            onCurrentChange={setCurrent}
            onNew={async (instruction) => {
              await fetch(`${$0.api.instruction.index}?id=${id}`, {
                method: 'POST',
                body: JSON.stringify({ instruction }),
              })
            }}
          />
        </div>

        <div className={styles.share}>
          Share your instruction with students at
          <br />
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

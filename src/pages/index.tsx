import { useRouter } from 'next/dist/client/router'
import { NextSeo } from 'next-seo'
import InstructionBlock from '../components/InstructionBlock'

import type { NextPage } from 'next'

const Home: NextPage = () => {
  const router = useRouter()

  const handleNew = (instruction: string): void => {
    if (instruction !== '') {
      $0.fetch<API.InstructionPOST>($0.api.instruction.index, {
        method: 'POST',
        body: JSON.stringify({ instruction }),
      }).then((res) => {
        router.replace(`/${res.id}`, undefined)
      })
    }
  }

  return (
    <>
      <NextSeo title='Create' />

      <div className='container'>
        <InstructionBlock editable onNew={handleNew} />
      </div>
    </>
  )
}

export default Home

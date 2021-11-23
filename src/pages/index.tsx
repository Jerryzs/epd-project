import { useRouter } from 'next/dist/client/router'
import { NextSeo } from 'next-seo'
import InstructionField from '../components/InstructionField'

import type { NextPage } from 'next'

const Home: NextPage = () => {
  const router = useRouter()

  const handleSave = (text: string): void => {
    if (text !== '') {
      $0.fetch<API.InstructionPOST>($0.api.instruction, {
        method: 'POST',
        body: JSON.stringify({ instruction: text }),
      }).then((res) => {
        router.replace(`/${res.id}`, undefined, { shallow: true })
      })
    }
  }

  return (
    <>
      <NextSeo title='Create' />

      <div className='container'>
        <InstructionField alwaysEditable timeout={2500} onSave={handleSave} />
      </div>
    </>
  )
}

export default Home

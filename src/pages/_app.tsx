import '../styles/global.scss'

import useSWR from 'swr'
import { DefaultSeo } from 'next-seo'
import MainLayout from '../components/MainLayout'

import type { AppProps } from 'next/app'
import type { DefaultSeoProps } from 'next-seo'

const SEO: DefaultSeoProps = {
  titleTemplate: '%s - MyTask',
}

if (typeof window !== 'undefined') {
  window.bootstrap = require('bootstrap')
}

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const { data } = useSWR<API.UserGET>($0.api.user, $0.fetch)

  return (
    <>
      <DefaultSeo {...SEO} />
      <MainLayout>
        <Component user={data} {...pageProps} />
      </MainLayout>
    </>
  )
}

export default MyApp

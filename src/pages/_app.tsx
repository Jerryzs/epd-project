import '../styles/global.scss'

import { useEffect } from 'react'
import useSWR from 'swr'
import { DefaultSeo } from 'next-seo'

import type { AppProps } from 'next/app'
import type { DefaultSeoProps } from 'next-seo'

const SEO: DefaultSeoProps = {
  titleTemplate: '%s - MyTasks',
}

if (typeof window !== 'undefined') {
  window.bootstrap = require('bootstrap')
}

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const { data } = useSWR<API.UserGET>($0.api.user.get, $0.fetch)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      $0.__dangerouslySetUrl(window.location.origin)
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      })
    }
  }, [])

  return (
    <>
      <DefaultSeo {...SEO} />
      <Component user={data} {...pageProps} />
    </>
  )
}

export default MyApp

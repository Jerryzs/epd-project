import '../styles/global.scss'

import MainLayout from '../components/MainLayout'

import type { AppProps } from 'next/app'

if (typeof window !== 'undefined') {
  window.bootstrap = require('bootstrap')
}

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </>
  )
}

export default MyApp

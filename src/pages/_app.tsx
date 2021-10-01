import type { AppProps } from 'next/app'

if (typeof window !== 'undefined') {
  window.bootstrap = require('bootstrap')
}

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return <Component {...pageProps} />
}

export default MyApp

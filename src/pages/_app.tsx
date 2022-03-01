import '../styles/global.scss'

import 'typeface-fredoka-one'

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

    const debounce = (fn: (...params: unknown[]) => void) => {
      let frame: number

      return (...params: unknown[]) => {
        if (frame) {
          cancelAnimationFrame(frame)
        }

        frame = requestAnimationFrame(() => {
          fn(...params)
        })
      }
    }

    const storeScroll = () => {
      document.documentElement.dataset.scroll = String(
        Math.floor(window.scrollY)
      )
    }

    document.addEventListener('scroll', debounce(storeScroll), {
      passive: true,
    })

    storeScroll()
  }, [])

  return (
    <>
      <DefaultSeo {...SEO} />
      <Component user={data} {...pageProps} />
    </>
  )
}

export default MyApp

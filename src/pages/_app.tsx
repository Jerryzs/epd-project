import '../styles/global.scss'

import 'typeface-fredoka-one'

import { useEffect } from 'react'
import useSWR from 'swr'
import Head from 'next/head'
import { DefaultSeo } from 'next-seo'

import type { AppProps } from 'next/app'
import type { DefaultSeoProps } from 'next-seo'
import type { ReactFragment } from 'react'

const SEO: DefaultSeoProps = {
  titleTemplate: '%s - MyTasks',
}

const MANIFEST_ICONS: ReactFragment = (
  <>
    <link
      rel='apple-touch-icon'
      sizes='57x57'
      href='/icons/apple-touch-icon-57x57.png'
    />
    <link
      rel='apple-touch-icon'
      sizes='60x60'
      href='/icons/apple-touch-icon-60x60.png'
    />
    <link
      rel='apple-touch-icon'
      sizes='72x72'
      href='/icons/apple-touch-icon-72x72.png'
    />
    <link
      rel='apple-touch-icon'
      sizes='76x76'
      href='/icons/apple-touch-icon-76x76.png'
    />
    <link
      rel='apple-touch-icon'
      sizes='114x114'
      href='/icons/apple-touch-icon-114x114.png'
    />
    <link
      rel='apple-touch-icon'
      sizes='120x120'
      href='/icons/apple-touch-icon-120x120.png'
    />
    <link
      rel='apple-touch-icon'
      sizes='144x144'
      href='/icons/apple-touch-icon-144x144.png'
    />
    <link
      rel='apple-touch-icon'
      sizes='152x152'
      href='/icons/apple-touch-icon-152x152.png'
    />
    <link
      rel='apple-touch-icon'
      sizes='180x180'
      href='/icons/apple-touch-icon-180x180.png'
    />
    <link
      rel='icon'
      type='image/png'
      sizes='32x32'
      href='/icons/favicon-32x32.png'
    />
    <link
      rel='icon'
      type='image/png'
      sizes='194x194'
      href='/icons/favicon-194x194.png'
    />
    <link
      rel='icon'
      type='image/png'
      sizes='192x192'
      href='/icons/android-chrome-192x192.png'
    />
    <link
      rel='icon'
      type='image/png'
      sizes='16x16'
      href='/icons/favicon-16x16.png'
    />
    <link rel='mask-icon' href='/icons/safari-pinned-tab.svg' color='#5bbad5' />
    <link rel='manifest' href='/manifest.webmanifest' />
    <meta name='msapplication-TileColor' content='#00aba9' />
    <meta name='theme-color' content='#ffffff' />
  </>
)

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
      <Head>
        {MANIFEST_ICONS}
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        />
      </Head>
      <DefaultSeo {...SEO} />
      <Component user={data} {...pageProps} />
    </>
  )
}

export default MyApp

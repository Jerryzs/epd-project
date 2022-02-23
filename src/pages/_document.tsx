import { Html, Head, Main, NextScript } from 'next/document'

const MyDocument = (): JSX.Element => {
  return (
    <Html lang='en'>
      <Head>
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
        <link
          rel='mask-icon'
          href='/icons/safari-pinned-tab.svg'
          color='#5bbad5'
        />
        <link rel='manifest' href='/manifest.webmanifest' />
        <meta name='msapplication-TileColor' content='#00aba9' />
        <meta name='theme-color' content='#7cccfd' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default MyDocument

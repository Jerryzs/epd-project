import { useState } from 'react'
import { useRouter } from 'next/router'
import { useSWRConfig } from 'swr'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import styles from '../styles/pages/login.module.scss'

import type { FormEvent } from 'react'

const Login = ({ user }: { user: API.UserGET }): JSX.Element => {
  const router = useRouter()
  const { mutate } = useSWRConfig()

  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if ($0.auth(user)) {
    user.role === 'student'
      ? router.replace('/me')
      : router.replace('/classroom')
  }

  const handleLoginSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    $0.fetch($0.api.auth.login, {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form)),
    })
      .then(async () => {
        await mutate($0.api.user.get)
      })
      .catch((e) => {
        if ($0.isApiError(e)) {
          const [, msg] = e
          setMessage(msg)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <>
      <NextSeo title='Login' nofollow />

      <div className={`${styles.wrapper} container`}>
        <div className={styles.loginBox}>
          <span>Login</span>
          {message === null ? undefined : (
            <div className={`${styles.error} alert alert-danger`} role='alert'>
              {message}
            </div>
          )}
          <form
            method='POST'
            action={$0.api.auth.login}
            onSubmit={handleLoginSubmit}
          >
            <input
              className='form-control'
              name='user'
              type='text'
              placeholder='User ID / Email Address'
              autoComplete='username'
              required
            />
            <input
              className='form-control'
              name='password'
              type='password'
              placeholder='Password'
              autoComplete='current-password'
              required
            />
            <button className='btn btn-primary' type='submit'>
              {!loading ? (
                'Continue'
              ) : (
                <div className={`${styles.spinner} spinner-grow`} role='status'>
                  <span className='visually-hidden'>Loading...</span>
                </div>
              )}
            </button>
          </form>
          <Link href='/register' prefetch={false}>
            <a className='text-decoration-none text-muted'>
              I don&#39;t have an account
            </a>
          </Link>
        </div>
      </div>
    </>
  )
}

export default Login

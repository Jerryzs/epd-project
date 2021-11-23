import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useSWRConfig } from 'swr'
import mailcheck from 'mailcheck'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import styles from '../styles/pages/login.module.scss'

import type { ChangeEvent, FormEvent, MouseEvent } from 'react'
import type { GetServerSideProps } from 'next'

type ServerSideProps = {
  email: string | null
  state: 0 | 1
  error: string | null
}

mailcheck.defaultDomains.push('winchesterthurston.org')

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const email = query.email !== undefined ? String(query.email) : undefined

  const props: ServerSideProps = {
    email: null,
    state: 0,
    error: null,
  }

  if (email !== undefined) {
    props.email = email

    try {
      await $0.fetch(`${$0.api.auth.verify}?email=${encodeURIComponent(email)}`)
      props.state = 1
    } catch (e) {
      props.error = e as string
    }
  }

  return {
    props,
  }
}

const Register = ({
  user,
  email,
  state: init,
  error,
}: {
  user: API.UserGET
} & ServerSideProps): JSX.Element => {
  const router = useRouter()
  const { mutate } = useSWRConfig()

  const mailcheckTimeout = useRef<NodeJS.Timeout>()

  const [loading, setLoading] = useState(false)
  const [state, setState] = useState(init)
  const [wait, setWait] = useState(60)
  const [emailInput, setEmailInput] = useState(email ?? '')
  const [suggestion, setSuggestion] = useState<MailcheckModule.ISuggestion>()
  const [message, setMessage] = useState<string | null>(error)

  if ($0.auth(user)) {
    router.replace('/dashboard')
  }

  useEffect(() => {
    const count = setInterval(() => {
      setWait((wait) => (wait > 0 ? wait - 1 : wait))
    }, 1000)

    return () => {
      clearInterval(count)
    }
  }, [])

  useEffect(() => {
    setState(init)
    if (init === 1) {
      setWait(60)
    }
  }, [init])

  useEffect(() => {
    setMessage(error)
  }, [error])

  const verify = (email: string): void => {
    $0.fetch(`${$0.api.auth.verify}?email=${encodeURIComponent(email)}`)
      .then(() => {
        setState(1)
      })
      .catch((e) => {
        setMessage(e as string)
      })
      .finally(() => {
        setLoading(false)
        setWait(60)
      })
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmailInput(e.target.value)
    if (mailcheckTimeout.current === undefined)
      mailcheckTimeout.current = setTimeout(async () => {
        setEmailInput((email) => {
          setSuggestion(mailcheck.run({ email }))
          return email
        })
        mailcheckTimeout.current = undefined
      }, 1000)
  }

  const handleEmailSuggestionClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (suggestion !== undefined) {
      setEmailInput(suggestion.full)
      setSuggestion(undefined)
    }
  }

  const handleEmailSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    verify(emailInput)
  }

  const handleResendClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    verify(emailInput)
    setWait(60)
  }

  const handleChangeEmailClick = () => {
    setState(0)
  }

  const handleRegisterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    $0.fetch($0.api.auth.register, {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form)),
    })
      .then(async () => {
        await mutate($0.api.user.get)
      })
      .catch((e) => {
        setMessage(e as string)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <>
      <NextSeo title='Register' nofollow />

      <div className={`${styles.wrapper} container`}>
        <div className={styles.loginBox}>
          <span>Register</span>
          {message === null ? undefined : (
            <div className={`${styles.error} alert alert-danger`} role='alert'>
              {message}
            </div>
          )}

          {state === 0 ? (
            <form method='GET' onSubmit={handleEmailSubmit}>
              <input
                required
                className='form-control'
                name='email'
                type='email'
                placeholder='Email Address'
                autoComplete='off'
                value={emailInput}
                onChange={handleEmailChange}
              />
              {suggestion === undefined ? undefined : (
                <div className={styles.emailSuggestion}>
                  {'Did you mean '}
                  <a href='#' onClick={handleEmailSuggestionClick}>
                    {suggestion.address}@<b>{suggestion.domain}</b>
                  </a>
                  {'?'}
                </div>
              )}
              <button
                disabled={loading}
                className='btn btn-primary'
                type='submit'
              >
                {!loading ? (
                  'Continue'
                ) : (
                  <div
                    className={`${styles.spinner} spinner-grow`}
                    role='status'
                  >
                    <span className='visually-hidden'>Loading...</span>
                  </div>
                )}
              </button>
            </form>
          ) : (
            <form method='POST' onSubmit={handleRegisterSubmit}>
              <input
                readOnly
                className='form-control'
                name='email'
                value={emailInput}
              />
              <input
                required
                className='form-control'
                name='code'
                type='text'
                pattern='\d*'
                placeholder='Verification Code'
                autoComplete='off'
              />
              <div className={styles.verifyActions}>
                <a
                  href={`/register?email=${emailInput}`}
                  className='btn btn-secondary btn-sm'
                  style={{
                    pointerEvents: !loading && wait === 0 ? 'auto' : 'none',
                  }}
                  onClick={handleResendClick}
                >
                  {wait === 0 ? 'Resend Code' : `Retry in ${wait} Seconds`}
                </a>
                {/* disabled because href only intended for noscript */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href='/register'
                  className='btn btn-secondary btn-sm'
                  style={{
                    pointerEvents: !loading ? 'auto' : 'none',
                  }}
                  onClick={handleChangeEmailClick}
                >
                  Change Email
                </a>
              </div>
              <input
                required
                className='form-control'
                name='name'
                type='text'
                placeholder='Name'
                autoComplete='off'
              />
              <div className={styles.role}>
                <input
                  required
                  className='btn-check'
                  id='student-role'
                  type='radio'
                  name='role'
                  value='student'
                  autoComplete='off'
                />
                <label
                  className='btn btn-outline-success'
                  htmlFor='student-role'
                >
                  Student
                </label>
                <input
                  required
                  className='btn-check'
                  id='teacher-role'
                  type='radio'
                  name='role'
                  value='teacher'
                  autoComplete='off'
                />
                <label
                  className='btn btn-outline-success'
                  htmlFor='teacher-role'
                >
                  Teacher
                </label>
              </div>
              <input
                required
                className='form-control'
                name='password'
                type='password'
                placeholder='New Password'
                autoComplete='off'
                pattern={$0.regex.password.source}
              />
              <input
                required
                className='form-control'
                name='confirmation'
                type='password'
                placeholder='Confirm Password'
                autoComplete='off'
              />
              <button className='btn btn-primary' type='submit'>
                {!loading ? (
                  'Create Account'
                ) : (
                  <div
                    className={`${styles.spinner} spinner-grow`}
                    role='status'
                  >
                    <span className='visually-hidden'>Loading...</span>
                  </div>
                )}
              </button>
            </form>
          )}
          <Link href='/login' prefetch={false}>
            <a className='text-decoration-none text-muted'>
              Login with existing account
            </a>
          </Link>
        </div>
      </div>
    </>
  )
}

export default Register

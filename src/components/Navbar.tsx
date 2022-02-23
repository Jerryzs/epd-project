import { mutate } from 'swr'
import Link from 'next/link'
import styles from '../styles/components/Navbar.module.scss'

import type { MouseEvent } from 'react'

const Navbar = ({
  user,
  className = '',
  container = 'container',
}: {
  user: User
  className?: string
  container?: string
}): JSX.Element => {
  const handleSignOutClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    $0.fetch($0.api.auth.logout).then(() => mutate($0.api.user.get))
  }

  return (
    <nav
      className={`${className} ${styles.wrapper} navbar navbar-light fixed-top`.trim()}
    >
      <div className={container}>
        <a className='navbar-brand' href='#'>
          MyTasks
        </a>
        <div className='d-flex'>
          {$0.auth(user) ? (
            <>
              {user.role === 'student' ? (
                <Link href='/me'>
                  <a className='btn btn-outline-primary btn-sm'>My Home</a>
                </Link>
              ) : (
                <Link href='/classroom'>
                  <a className='btn btn-outline-primary btn-sm'>
                    My Classrooms
                  </a>
                </Link>
              )}
              <a
                href={`/api/auth/logout?redirect=${encodeURIComponent(
                  window.location.href
                )}`}
                className='btn btn-outline-primary btn-sm'
                onClick={handleSignOutClick}
              >
                Sign Out
              </a>
            </>
          ) : (
            <Link href='/login'>
              <a className='btn btn-outline-primary btn-sm'>Sign In</a>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

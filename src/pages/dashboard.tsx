import { useRouter } from 'next/router'
import { useSWRConfig } from 'swr'
import { NextSeo } from 'next-seo'

import type { MouseEvent } from 'react'

const Dashboard = ({ user }: { user?: API.UserGET }): JSX.Element | null => {
  const router = useRouter()
  const { mutate } = useSWRConfig()

  if (user === undefined) {
    return null
  }

  if ($0.noAuth(user)) {
    router.replace('/login')
    return null
  }

  const handleLogoutClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    $0.fetch($0.api.auth.logout).then(async () => {
      await mutate($0.api.user)
      router.replace('/login')
    })
  }

  return (
    <>
      <NextSeo title='Dashboard' noindex nofollow />

      <div>
        <div>
          Hello {user.name} (
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)})
        </div>
        <a href='#' onClick={handleLogoutClick}>
          Logout
        </a>
      </div>
    </>
  )
}

export default Dashboard

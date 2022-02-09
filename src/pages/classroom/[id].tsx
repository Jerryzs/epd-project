import { useMemo, useRef } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import LinearLoader from '../../components/LinearLoader'
import Modal, { showModal, hideModal } from '../../components/Modal'
import InvitationStatus from '../../components/InvitationStatus'
import styles from '../../styles/pages/classroom/classroom.module.scss'

import type { FormEvent, MouseEvent } from 'react'

const Classroom = ({
  user,
}: {
  user: API.UserGET
}): JSX.Element | string | null => {
  const router = useRouter()

  const { id, member, invitation } = router.query as {
    id: string | undefined
    member: string | undefined
    invitation: string | undefined
  }

  const { data, error, mutate } = useSWR<API.Classroom.RosterGET, string>(
    `${$0.api.classroom.index}?id=${id}`,
    $0.fetch
  )

  const uid = useMemo<string>(() => $0.getRandomId(6), [])

  const inviteModal = useRef<HTMLDivElement>(null)

  const handleInviteClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    showModal(inviteModal.current)
  }

  const handleInviteFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    e.currentTarget.reset()
    hideModal(inviteModal.current)
    $0.fetch($0.api.classroom.invite, {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form)),
    })
      .then(() => {
        mutate()
      })
      .catch((e) => {
        if ($0.isApiError(e)) {
          const [, msg] = e
          alert(msg)
        }
      })
  }

  const handleInviteDelete = async (recipient: string) => {
    if (data?.classroom === undefined) {
      return
    }

    try {
      await $0.fetch($0.api.classroom.invite, {
        method: 'POST',
        body: JSON.stringify({
          classroom: data.classroom.id,
          recipient,
          action: 'delete',
        }),
      })
    } catch (e) {
      if ($0.isApiError(e)) {
        const [, msg] = e
        alert(msg)
      }
    }

    await mutate()
    router.back()
  }

  const currMember =
    data && member
      ? data.members.find((mem) => mem.id === member) ?? false
      : undefined

  const currInvitation =
    data && invitation
      ? data.invitations.find((inv) => inv.recipient === invitation) ?? false
      : undefined

  if ($0.noAuth(user)) {
    router.replace('/login')
    return null
  }

  if ($0.auth(user) && user.role !== 'teacher') {
    router.replace('/me')
    return null
  }

  if (error !== undefined) {
    return error
  }

  return (
    <>
      <NextSeo title={data?.classroom.name ?? 'Classroom'} noindex />

      <div className={styles.wrapper}>
        <div className={styles.header}>
          {data === undefined ? (
            <LinearLoader width='320px' height='2.25rem' innerHeight='1.5rem' />
          ) : (
            <>
              <div className={styles.classroom}>{data.classroom.name}</div>
              <a
                className={styles.invite}
                href='?invite=1'
                onClick={handleInviteClick}
              >
                Invite
              </a>
            </>
          )}
        </div>
        <div className={styles.left}>
          {data === undefined
            ? Array.from(Array(5).keys()).map((index) => (
                <div
                  key={`placeholder_member_${index}`}
                  className={styles.name}
                >
                  <LinearLoader
                    width='200px'
                    height='1.5rem'
                    innerHeight='1rem'
                  />
                </div>
              ))
            : [
                data.members.map((mem, index) =>
                  mem.id === user.id ? undefined : (
                    <Link
                      key={`classmember_${index}`}
                      href={`/classroom/${id}?member=${encodeURIComponent(
                        mem.id
                      )}`}
                      replace={member !== undefined || invitation !== undefined}
                    >
                      <a
                        className={
                          mem !== undefined && mem.id === member
                            ? styles.active
                            : undefined
                        }
                      >
                        <div className={styles.name}>{mem.name}</div>
                      </a>
                    </Link>
                  )
                ),
                data.invitations.map((inv, index) => (
                  <Link
                    key={`invitation_${index}`}
                    href={`/classroom/${id}?invitation=${encodeURIComponent(
                      inv.recipient
                    )}`}
                    replace={member !== undefined || invitation !== undefined}
                  >
                    <a
                      className={`${styles.pending} ${
                        invitation !== undefined && inv.recipient === invitation
                          ? styles.active
                          : ''
                      }`.trim()}
                    >
                      <div className={styles.name}>{inv.recipient}</div>
                    </a>
                  </Link>
                )),
              ]}
        </div>
        <div className={styles.main}>
          {currMember ? (
            currMember.id
          ) : currInvitation ? (
            <InvitationStatus
              sender={currInvitation.user}
              recipient={currInvitation.recipient}
              onDelete={handleInviteDelete}
            />
          ) : null}
        </div>
      </div>
      <Modal ref={inviteModal}>
        <form
          className={styles.modal}
          method='POST'
          action={$0.api.classroom.invite}
          onSubmit={handleInviteFormSubmit}
        >
          <input hidden readOnly name='classroom' value={data?.classroom.id} />
          <div className='mb-2'>
            <label className='form-label' htmlFor={`${uid}_recipient`}>
              Recipient&apos;s Email or User ID
            </label>
            <input
              id={`${uid}_recipient`}
              className='form-control'
              placeholder='john.doe@school.org'
              name='recipient'
              required
              autoComplete='off'
            />
          </div>
          <div className={styles.formButtons}>
            <button
              type='button'
              className='btn btn-light'
              onClick={() => hideModal(inviteModal.current)}
            >
              Close
            </button>
            <button className='btn btn-primary' type='submit'>
              Invite
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default Classroom

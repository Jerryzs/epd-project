import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import stringify from 'fast-json-stable-stringify'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import { ReactSortable } from 'react-sortablejs'
import Modal, { showModal, hideModal } from '../../components/Modal'
import styles from '../../styles/pages/classroom/index.module.scss'

import type { FormEvent, MouseEvent } from 'react'

type Invitation = API.User.ClassroomsGET['invitations'][0]

type Item = Invitation | DB.Classroom | { id: 'new' }

const isInvitation = (item: Item): item is Invitation =>
  (item as Invitation).user !== undefined

const isClassroom = (item: Item): item is DB.Classroom =>
  !isInvitation(item) && (item as DB.Classroom).name !== undefined

const ClassroomIndex = ({
  user,
}: {
  user: API.UserGET
}): JSX.Element | null => {
  const router = useRouter()

  const uid = useMemo<string>(() => $0.getRandomId(6), [])

  const newModal = useRef<HTMLDivElement>(null)

  const { data: cdata, mutate } = useSWR<API.User.ClassroomsGET>(
    $0.api.user.classrooms,
    $0.fetch,
    {
      fallbackData: {
        classrooms: [],
        invitations: [],
      },
    }
  )

  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    const data = cdata
      ? Array<Item>(...cdata.invitations, ...cdata.classrooms, { id: 'new' })
      : []
    if (stringify(data) !== stringify(items)) {
      setItems(data)
    }
  }, [cdata])

  const handleInvitationDeclineClick = (
    classroom: string,
    e: MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault()
    $0.fetch($0.api.classroom.invite, {
      method: 'POST',
      body: JSON.stringify({
        classroom,
        action: 'delete',
      }),
    }).then(() => {
      mutate()
    })
  }

  const handleInvitationAcceptClick = (
    classroom: string,
    e: MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault()
    $0.fetch($0.api.classroom.invite, {
      method: 'POST',
      body: JSON.stringify({
        classroom,
        action: 'accept',
      }),
    }).then(() => {
      mutate()
    })
  }

  const handleNewClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    showModal(newModal.current)
  }

  const handleModalFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    e.currentTarget.reset()
    hideModal(newModal.current)
    $0.fetch($0.api.classroom.index, {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form)),
    }).then(() => {
      mutate()
    })
  }

  if (user === undefined) {
    return null
  }

  if ($0.noAuth(user)) {
    router.replace('/login')
    return null
  }

  if ($0.auth(user) && user.role !== 'teacher') {
    router.replace('/me')
    return null
  }

  return (
    <>
      <NextSeo title='Classrooms' />

      <div className={styles.wrapper}>
        <div className={styles.title}>My Classrooms</div>
        <div>
          <ReactSortable
            className={styles.classrooms}
            list={items}
            setList={setItems}
            group='classrooms'
            animation={200}
            filter='.ignore'
            onMove={(e) => e.related.className.indexOf('ignore') === -1}
            onSort={() => void 0}
          >
            {items?.map((item) =>
              isInvitation(item) ? (
                <div
                  key={item.id}
                  className={`${styles.box} ${styles.classroom} ${styles.invitation} ignore`}
                >
                  <div className={styles.classroomName}>{item.name}</div>
                  <div className='lh-1 mt-2 text-muted'>
                    You are invited to join this classroom by <b>{item.user}</b>
                    .
                  </div>
                  <div className={`${styles.bottomText} btn-group`}>
                    <a
                      className='btn btn-danger'
                      href='#'
                      onClick={handleInvitationDeclineClick.bind(null, item.id)}
                    >
                      Decline
                    </a>
                    <a
                      className='btn btn-success'
                      href='#'
                      onClick={handleInvitationAcceptClick.bind(null, item.id)}
                    >
                      Accept
                    </a>
                  </div>
                </div>
              ) : isClassroom(item) ? (
                <Link
                  key={item.id}
                  href={`/classroom/${item.id}`}
                  prefetch={false}
                >
                  <a>
                    <div className={`${styles.box} ${styles.classroom}`}>
                      <div className={styles.classroomName}>{item.name}</div>
                      <div className={styles.bottomText}>
                        {item.instructor_name}
                      </div>
                    </div>
                  </a>
                </Link>
              ) : (
                /* link only for noscript users */
                /* eslint-disable-next-line @next/next/no-html-link-for-pages */
                <a
                  key={item.id}
                  className='ignore'
                  href='/classroom/new'
                  onClick={handleNewClick}
                >
                  <div className={`${styles.box} ${styles.classroomNew}`}>
                    <div>
                      <i className='bi bi-plus-lg'></i>
                    </div>
                  </div>
                </a>
              )
            )}
          </ReactSortable>
        </div>
      </div>
      <Modal ref={newModal} className={styles.modal}>
        <form
          method='POST'
          action={$0.api.classroom.index}
          onSubmit={handleModalFormSubmit}
        >
          <div className='mb-2'>
            <label className='form-label' htmlFor={`${uid}_name`}>
              Class
            </label>
            <input
              id={`${uid}_name`}
              className='form-control'
              placeholder='Algebra 1 (A)'
              name='name'
              required
              autoComplete='off'
            />
          </div>
          <div className='mb-2'>
            <label className='form-label' htmlFor={`${uid}_instructor`}>
              Instructor
            </label>
            <input
              id={`${uid}_instructor`}
              className='form-control'
              placeholder='Mr. John Doe'
              name='instructor'
              required
              autoComplete='off'
            />
          </div>
          <div className={styles.formButtons}>
            <button
              type='button'
              className='btn btn-light'
              onClick={() => hideModal(newModal.current)}
            >
              Close
            </button>
            <button className='btn btn-primary' type='submit'>
              Create
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default ClassroomIndex

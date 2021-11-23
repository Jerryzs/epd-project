import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import styles from '../../styles/pages/classroom/index.module.scss'

const ClassroomIndex = ({
  user,
}: {
  user: API.UserGET
}): JSX.Element | null => {
  const router = useRouter()

  const { data: cdata } = useSWR<API.User.ClassroomsGET>(
    $0.api.user.classrooms,
    $0.fetch
  )

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
        <div className={styles.classrooms}>
          {cdata === undefined
            ? 'Loading...'
            : [
                cdata.classrooms.map((classroom, index) => (
                  <Link
                    key={`class_${index}`}
                    href={`/classroom/${classroom.id}`}
                    prefetch={false}
                  >
                    <a>
                      <div className={`${styles.box} ${styles.classroom}`}>
                        <div className={styles.classroomName}>
                          {classroom.name}
                        </div>
                        <div className={styles.classroomInstructors}>
                          {classroom.instructor_name
                            .split(',')
                            .flatMap((line, index) => [
                              line.trim(),
                              <br key={`names_linebreak_${index}`} />,
                            ])}
                        </div>
                      </div>
                    </a>
                  </Link>
                )),
                // link only for noscript users
                // eslint-disable-next-line @next/next/no-html-link-for-pages
                <a key='new_classroom' href='/classroom/new'>
                  <div className={`${styles.box} ${styles.classroomNew}`}>
                    <div>
                      <i className='bi bi-plus-lg'></i>
                    </div>
                  </div>
                </a>,
              ]}
        </div>
      </div>
    </>
  )
}

export default ClassroomIndex

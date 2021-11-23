import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import LinearLoader from '../../components/LinearLoader'
import styles from '../../styles/pages/classroom/classroom.module.scss'

const Classroom = ({
  user,
}: {
  user: API.UserGET
}): JSX.Element | string | null => {
  const router = useRouter()

  const { id, student } = router.query as {
    id: string | undefined
    student: string | undefined
  }

  const { data, error } = useSWR<API.Classroom.RosterGET, string>(
    `${$0.api.classroom.roster}?id=${id}`,
    $0.fetch
  )

  if ($0.noAuth(user)) {
    router.replace('/login')
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
          <div className={styles.classroom}>
            {data === undefined ? (
              <LinearLoader
                width='320px'
                height='2.25rem'
                innerHeight='1.5rem'
              />
            ) : (
              data.classroom.name
            )}
          </div>
        </div>
        <div className={styles.left}>
          {data === undefined
            ? Array.from(Array(5).keys()).map((index) => (
                <div
                  key={`placeholder_student_${index}`}
                  className={styles.name}
                >
                  <LinearLoader
                    width='200px'
                    height='1.5rem'
                    innerHeight='1rem'
                  />
                </div>
              ))
            : data.members.map((member, index) => {
                if (member.role === 'teacher') return
                return (
                  <Link
                    key={`classmember_${index}`}
                    href={`/classroom/${id}?student=${member.id}`}
                    replace={student !== undefined}
                  >
                    <a
                      className={
                        student !== undefined && member.id === student
                          ? styles.active
                          : undefined
                      }
                    >
                      <div className={styles.name}>{member.name}</div>
                    </a>
                  </Link>
                )
              })}
        </div>
        <div className={styles.main}>{student}</div>
      </div>
    </>
  )
}

export default Classroom

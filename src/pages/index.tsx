import { useRouter } from 'next/dist/client/router'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import InstructionBlock from '../components/InstructionBlock'
import Footer from '../components/Footer'
import styles from '../styles/pages/index.module.scss'

import type { MouseEvent } from 'react'

const Home = ({ user }: { user: User }): JSX.Element => {
  const router = useRouter()

  const handleNew = (instruction: string): void => {
    if (instruction !== '') {
      $0.fetch<API.InstructionPOST>($0.api.instruction.index, {
        method: 'POST',
        body: JSON.stringify({ instruction }),
      }).then((res) => {
        router.replace(`/${res.id}`, undefined)
      })
    }
  }

  const handleToTopClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollTo(0, 0)
  }

  return (
    <>
      <NextSeo title='MyTasks Home' titleTemplate='%s' />

      <div className={styles.wrapper}>
        <Navbar user={user} container='container-xl' />
        <div className={styles.fullpage}>
          <div className={styles.background}></div>
          <div className={styles.heading}>
            <div className={styles.textBlock}>
              <h1>The future of education</h1>
              <h2>is here&#x2026;</h2>
            </div>
            <div className='container-xl'>
              <div className={styles.iMaker}>
                <InstructionBlock
                  preventResize
                  className={styles.iInput}
                  editable
                  onNew={handleNew}
                />
              </div>
            </div>
            <div className={styles.textBlock}>
              <Link href='/register'>
                <a className={`${styles.setup} btn btn-outline-dark btn-lg`}>
                  Sign up for an account
                </a>
              </Link>
            </div>
          </div>
          <div className={styles.bottom}>
            <i className='bi bi-chevron-compact-down'></i>
          </div>
        </div>
        <div className={`${styles.content} container-xl my-5`}>
          <div className={`${styles.info} clearfix`}>
            <figure className='figure float-sm-end'>
              <img
                className='figure-img'
                src='/assets/images/index/ed-tech.jpg'
                alt='A teacher working with a student one-on-one.'
              />
              <figcaption className='figure-caption'>
                Credit: David Baillot. Used under CC 3.0 BY-NC.
              </figcaption>
            </figure>
            <h2>
              What is <em>the future</em>?
            </h2>
            <p>
              We re-imagine the future of education to be inclusive of everyone
              and support them with equal access to education opportunities.
              Unfortunately, students with learning differences often receive
              inadequate support or accommodation at their institutions. In
              order to offset this situation, we target our services directly
              towards educators and even the individual students themselves.
              With our services, we strive to help students with difficulties
              navigate their schooling environment and maintain close
              connections with their teachers.
            </p>
          </div>
          <div className={`${styles.info} clearfix`}>
            <figure className='figure float-sm-start'>
              <img
                className='figure-img'
                src='/assets/images/index/e-learning.jpg'
                alt='A series of computer setups in a school computer lab.'
              />
              <figcaption className='figure-caption'>
                Credit: Francesca Launaro. Used under CC 3.0 BY-SA.
              </figcaption>
            </figure>
            <h2>
              What <em>services</em> do we provide?
            </h2>
            <p>
              We provide a range of services to help students, especially those
              with learning differences. We have carefully designed a task
              management system in which teachers may assign series of tasks for
              their students to complete. The tasks are intended to be small,
              easily achievable goals that pave the path towards bigger
              assignments. The system also employs a clean and accessible user
              interface that encourages easily-distracted students to stay
              attentive to their tasks on hand.
            </p>
            <p>
              What makes our services unique is not only our focus on
              accessibility but also our vision of a teacher-driven experience
              for students. Often students do not receive their needed support
              because their teachers are not trained to accommodate such needs;
              in fact, the knowledge required to facilitate such accommodations
              is so complex that it comprises numerous fields of study distinct
              from just education. Our platform practically serves as a bridge
              between students and teachers, and our services are designed to
              constrain and advise teachers to act in ways that best fulfill the
              needs of their students.
            </p>
          </div>
          <div className={`${styles.info} clearfix`}>
            <figure className='figure float-sm-end'>
              <img
                className='figure-img'
                src='/assets/images/index/school.jpg'
                alt='A table surrounded by chairs in a meeting room.'
              />
            </figure>
            <h2>
              Who are <em>we</em>?
            </h2>
            <p>
              We use the word “we” to refer to not only the creator of this
              platform but also everyone who supported the development of our
              services. In order to make our services as helpful and friendly as
              possible, we have consulted experts and professionals in
              disciplines from special education to entertainment technology.
              The word “we” embodies the collective effort of all those people
              who wish for a better, more inclusive learning environment for
              future generations.
            </p>
          </div>
          <div className={styles.promo}>
            <h2>Try our services now&#x2026;</h2>
            <p>
              <span>
                {'enter an instruction '}
                <a href='#' onClick={handleToTopClick}>
                  at the top of this page
                </a>
              </span>
              <span>
                {' or '}
                <Link href='/register'>
                  <a>sign up for an account</a>
                </Link>
                .
              </span>
            </p>
          </div>
        </div>
      </div>

      <Footer className='container-xl' />
    </>
  )
}

export default Home

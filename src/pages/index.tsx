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
                alt=''
              />
              <figcaption className='figure-caption'>
                Credit: David Baillot, UCSD Jacobs School of Engineering. Used
                under CC 3.0 BY-NC.
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
              navigate their schooling environment and maintain close connection
              with their teachers.
            </p>
          </div>
          <div className={`${styles.info} clearfix`}>
            <figure className='figure float-sm-start'>
              <img
                className='figure-img'
                src='/assets/images/index/e-learning.jpg'
                alt=''
              />
              <figcaption className='figure-caption'>
                Credit: Francesca Launaro. Used under CC 3.0 BY-SA.
              </figcaption>
            </figure>
            <h2>
              What <em>services</em> do we provide?
            </h2>
            <p>
              We provide a range of services to help students with learning
              differences. First, we have carefully designed a task management
              system in which teachers may assign series of tasks for their
              students to complete. The tasks are intended to be small, easily
              achievable goals that pave the path towards a bigger
              accomplishment. The system also employs a clean and accessible
              user interface that encourages easily-distracted students to stay
              attentive to their tasks on-hand.
            </p>
          </div>
          <div className={styles.promo}>
            <h2>Try our services now&#x2026;</h2>
            <p>
              {'enter an instruction '}
              <a href='#' onClick={handleToTopClick}>
                at the top of this page
              </a>
              {' or '}
              <Link href='/register'>
                <a>sign up for an account</a>
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <Footer className='container-xl' />
    </>
  )
}

export default Home

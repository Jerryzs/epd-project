import type { NextComponentType } from 'next'

const MainLayout: NextComponentType = ({ children }) => {
  return <div className='container'>{children}</div>
}

export default MainLayout

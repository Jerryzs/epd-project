const Footer = ({ className }: { className?: string }): JSX.Element => {
  return (
    <div className={className ?? 'container'}>
      <div className='my-5 text-center text-muted'>
        Copyright &copy; 2021-{new Date().getUTCFullYear()} Siyuan Zhang. <br />
        All rights reserved.
      </div>
    </div>
  )
}

export default Footer

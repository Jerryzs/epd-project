import ContentLoader from 'react-content-loader'

const LinearLoader = ({
  width,
  height,
  innerHeight,
  center = false,
}: {
  width: string
  height: string
  innerHeight?: string
  center?: boolean
}): JSX.Element => {
  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        alignItems: center ? 'center' : 'end',
      }}
    >
      <ContentLoader
        width='100%'
        height={innerHeight ?? height}
        alignmentBaseline='middle'
        backgroundColor='rgb(0,0,0)'
        foregroundColor='rgb(0,0,0)'
        backgroundOpacity={0.06}
        foregroundOpacity={0.12}
      >
        <rect x='0' y='0' rx='3' ry='3' width='100%' height='100%' />
      </ContentLoader>
    </div>
  )
}

export default LinearLoader

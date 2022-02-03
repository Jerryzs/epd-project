import { forwardRef, useEffect } from 'react'

import type { ForwardedRef, ReactNode } from 'react'

const Modal = (
  {
    className = '',
    title = undefined,
    children,
  }: {
    className?: string
    title?: ReactNode
    children?: ReactNode
  },
  ref: ForwardedRef<HTMLDivElement>
): JSX.Element => {
  useEffect(() => {
    if (ref === null || typeof ref === 'function' || ref.current === null) {
      return
    }
    const modal = new window.bootstrap.Modal(ref.current)
    return () => modal.dispose()
  })

  return (
    <div ref={ref} className={`${className} modal`.trim()} tabIndex={-1}>
      <div className='modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down'>
        <div className='modal-content'>
          <div className='modal-body'>
            {title === undefined ? undefined : (
              <h5 className='modal-title' style={{ marginBottom: '0.75rem' }}>
                {title}
              </h5>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export const getModal = (
  element: string | Element | null | undefined
): bootstrap.Modal | null => {
  return element ? window.bootstrap.Modal.getInstance(element) : null
}

export const showModal = (
  element: string | Element | null | undefined
): void => {
  getModal(element)?.show()
}

export const hideModal = (
  element: string | Element | null | undefined
): void => {
  getModal(element)?.hide()
}

export default forwardRef(Modal)

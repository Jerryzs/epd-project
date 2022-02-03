import { useRef } from 'react'
import Modal, { showModal, hideModal } from './Modal'

import type { MouseEvent } from 'react'

const InvitationStatus = ({
  sender,
  recipient,
  onDelete,
}: {
  sender: string
  recipient: string
  onDelete?:
    | ((recipient: string) => void)
    | ((recipient: string) => Promise<void>)
}): JSX.Element => {
  const confirmModal = useRef<HTMLDivElement>(null)

  const handleDeleteClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    showModal(confirmModal.current)
  }

  const handleCancelClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    hideModal(confirmModal.current)
  }

  const handleConfirmClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    onDelete?.(recipient)?.finally(() => {
      hideModal(confirmModal.current)
    })
  }

  return (
    <>
      <div>
        <div className='text-success mb-2'>
          The user <span className='text-body'>{recipient}</span> has been
          invited by <span className='text-body'>{sender}</span>.
        </div>
        <a
          className='btn btn-danger btn-sm'
          href='#delete'
          onClick={handleDeleteClick}
        >
          Delete Invitation
        </a>
      </div>
      <Modal ref={confirmModal}>
        Are you sure you want to delete this invitation?
        <div className='mt-2 text-end'>
          <a
            className='btn btn-light'
            href='#delete-cancel'
            onClick={handleCancelClick}
          >
            Cancel
          </a>
          <a
            className='btn btn-danger ms-3'
            href='#delete-confirm'
            onClick={handleConfirmClick}
          >
            Delete
          </a>
        </div>
      </Modal>
    </>
  )
}

export default InvitationStatus

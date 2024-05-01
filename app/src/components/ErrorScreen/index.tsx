import { Button } from 'components/Button'
import { useCallback, useEffect, type FC } from 'react'

export interface ErrorMessage {
  name: string
  message: string
}

const getErrorMessage = (error: ErrorMessage) => {
  if (error.name === 'ChunkLoadError') {
    return 'An error occurred while loading the page. Please try again.'
  }

  try {
    JSON.parse(error.message)
    return 'An error occurred please check the console for more details.'
  } catch (e) {
    return error.message
  }
}

export const ErrorScreen: FC<{
  error: {
    name: string
    message: string
  }
  onResetError?: () => void
}> = ({ onResetError, error }) => {
  // eslint-disable-next-line no-console
  console.log(error)

  const errorMessage = getErrorMessage(error)

  const resetErrorBoundary = useCallback(() => {
    if (onResetError) {
      onResetError()
    }
  }, [onResetError])

  /**
   * Refresh the browser if the user gets an error message to say they are offline,
   * but then goes back online.
   */
  useEffect(() => {
    const handleOnline = () => {
      window.location.reload()
    }
    window.addEventListener('online', handleOnline)
    document.addEventListener('click', resetErrorBoundary)

    return () => {
      window.removeEventListener('online', handleOnline)
      document.removeEventListener('click', resetErrorBoundary)
    }
  }, [resetErrorBoundary])

  const isChunkLoadError = error.name === 'ChunkLoadError'

  useEffect(() => {
    if (isChunkLoadError) {
      window.location.reload()
    }
  }, [isChunkLoadError])

  // call the resetErroBoundary to clear the error state

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div data-testid="error-message">{errorMessage}</div>

      <div className="mt-4 space-x-4">
        <Button
          onClick={() => {
            resetErrorBoundary()
            //   navigate('/', { replace: true })
            window.location.reload()
          }}
        >
          Back Home
        </Button>

        <Button onClick={() => {}}>Log out</Button>
      </div>
    </div>
  )
}

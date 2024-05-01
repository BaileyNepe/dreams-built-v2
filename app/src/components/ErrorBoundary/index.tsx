import { Component, type ReactNode } from 'react'
import { type ErrorMessage } from '../ErrorScreen'

type Props = {
  fallback: (error: ErrorMessage, resetError: () => void) => ReactNode
  children: ReactNode
}

type State = {
  error?: ErrorMessage
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: undefined }
    this.resetError = this.resetError.bind(this)
  }

  componentDidCatch(error: Error): void {
    // Log or store the error
    // eslint-disable-next-line no-console
    console.error(error)
    this.setState({ error })
  }

  // Reset the error state to clear the error
  resetError() {
    this.setState({ error: undefined })
  }

  render(): ReactNode {
    const { error } = this.state
    const { fallback, children } = this.props
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return error ? fallback(error, this.resetError) : children
  }
}

export default ErrorBoundary

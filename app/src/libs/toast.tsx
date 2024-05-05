import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const notify = (
  message: string,
  options: {
    type?: 'info' | 'success' | 'warning' | 'error'
  } = {},
) => toast[options.type ?? 'success'](message)

export const ToastProvider = () => (
  <ToastContainer
    autoClose={5000}
    hideProgressBar={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="dark"
  />
)

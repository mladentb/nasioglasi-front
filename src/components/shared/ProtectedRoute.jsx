import { Navigate } from 'react-router-dom'
import useAuthStore from '@/store/auth'

export default function ProtectedRoute({ children }) {
  const { token } = useAuthStore()

  if (!token) {
    return <Navigate to="/prijava" replace />
  }

  return children
}

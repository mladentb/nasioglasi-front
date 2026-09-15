import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import MaintenanceOverlay from '@/components/shared/MaintenanceOverlay'
import useAuthStore from '@/store/auth'
import { siteApi } from '@/api/endpoints'

// Pages
import HomePage from '@/pages/HomePage'
import SearchPage from '@/pages/search/SearchPage'
import ListingDetailPage from '@/pages/listings/ListingDetailPage'
import CategoryPage from '@/pages/listings/CategoryPage'
import ListingOrCategoryPage from '@/pages/listings/ListingOrCategoryPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import VerifyPhonePage from '@/pages/auth/VerifyPhonePage'
import NewListingPage from '@/pages/listings/NewListingPage'
import EditListingPage from '@/pages/listings/EditListingPage'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminAdmins from '@/pages/admin/AdminAdmins'
import AdminListings from '@/pages/admin/AdminListings'
import AdminReports from '@/pages/admin/AdminReports'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminPayments from '@/pages/admin/AdminPayments'
import MyListingsPage from '@/pages/listings/MyListingsPage'
import FavoritesPage from '@/pages/listings/FavoritesPage'
import MessagesPage from '@/pages/messages/MessagesPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import UserProfilePage from '@/pages/profile/UserProfilePage'

export default function App() {
  const { fetchUser, token, user } = useAuthStore()
  const [maintenance, setMaintenance] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (token) await fetchUser()
      try {
        const res = await siteApi.status()
        setMaintenance(res.data)
      } catch {
        // API down - don't block
      }
      setLoaded(true)
    }
    init()
  }, [])

  if (!loaded) return null

  // Show maintenance page for non-admin users
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  if (maintenance?.maintenance_mode && !isAdmin) {
    return (
      <BrowserRouter>
        <Routes>
          {/* Allow login so admins can get in */}
          <Route path="/prijava" element={<LoginPage />} />
          <Route path="*" element={<MaintenanceOverlay message={maintenance.maintenance_message} />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/pretraga" element={<SearchPage />} />
          <Route path="/kategorija/:slug" element={<CategoryPage />} />
          <Route path="/kategorija/:slug/:child" element={<ListingOrCategoryPage />} />
          <Route path="/korisnik/:id" element={<UserProfilePage />} />
          <Route path="/prijava" element={<LoginPage />} />
          <Route path="/registracija" element={<RegisterPage />} />

          {/* Protected */}
          <Route path="/novi-oglas" element={<ProtectedRoute><NewListingPage /></ProtectedRoute>} />
          <Route path="/uredi-oglas/:id" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
          <Route path="/moji-oglasi" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
          <Route path="/favoriti" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/poruke" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/verifikacija-telefona" element={<ProtectedRoute><VerifyPhonePage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/oglasi" element={<ProtectedRoute><AdminListings /></ProtectedRoute>} />
          <Route path="/admin/prijave" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/korisnici" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/uplate" element={<ProtectedRoute><AdminPayments /></ProtectedRoute>} />
          <Route path="/admin/administratori" element={<ProtectedRoute><AdminAdmins /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './app/AdminLayout'
import GenrePage from './features/genres/GenrePage'
import TagPage from './features/tags/TagPage'
import DashboardPage from './features/dashboard/DashboardPage'
import DirectorPage from './features/directors/DirectorPage'
import ProductionHousePage from './features/production_house/ProductionHousePage'
import FilmPage from './features/films/FilmPage'
import DetailsPage from './features/films/DetailsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="films" element={<FilmPage />} />
        <Route path="films/:id" element={<DetailsPage />} />
        <Route path="genres" element={<GenrePage />} />
        <Route path="tags" element={<TagPage />} />
        <Route path="directors" element={<DirectorPage />} />
        <Route path="production-house" element={<ProductionHousePage />} />
      </Route>
      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
            Not found
          </div>
        }
      />
    </Routes>
  )
}

export default App

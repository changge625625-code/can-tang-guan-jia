import { useState, useCallback } from 'react'
import { useFontMode } from './hooks/useFontMode'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import RecordPage from './pages/RecordPage'
import HistoryPage from './pages/HistoryPage'
import MealPage from './pages/MealPage'
import MealDetailPage from './pages/MealDetailPage'
import SettingsPage from './pages/SettingsPage'
import type { TabKey } from './types'

type Route =
  | { page: 'home' }
  | { page: 'record' }
  | { page: 'history' }
  | { page: 'meal' }
  | { page: 'meal-detail'; params: { id: number } }
  | { page: 'settings' }

function App() {
  const [route, setRoute] = useState<Route>({ page: 'home' })
  const [fontMode, setFontMode] = useFontMode()

  const currentTab: TabKey | null =
    route.page === 'home' ? 'home'
    : route.page === 'record' ? 'record'
    : route.page === 'meal' ? 'meal'
    : null

  const handleNavigate = useCallback((page: string, params?: any) => {
    if (page === 'home') setRoute({ page: 'home' })
    else if (page === 'record') setRoute({ page: 'record' })
    else if (page === 'meal') setRoute({ page: 'meal' })
    else if (page === 'history') setRoute({ page: 'history' })
    else if (page === 'meal-detail') setRoute({ page: 'meal-detail', params })
    else if (page === 'settings') setRoute({ page: 'settings' })
  }, [])

  const handleTab = useCallback((tab: TabKey) => {
    setRoute({ page: tab } as Route)
  }, [])

  return (
    <div className="app-shell" style={{ position: 'relative', minHeight: '100dvh' }}>
      {route.page === 'home' && <HomePage onNavigate={handleNavigate} />}
      {route.page === 'record' && <RecordPage onNavigate={handleNavigate} />}
      {route.page === 'history' && <HistoryPage onNavigate={handleNavigate} />}
      {route.page === 'meal' && <MealPage onNavigate={handleNavigate} />}
      {route.page === 'meal-detail' && <MealDetailPage params={route.params} onNavigate={handleNavigate} />}
      {route.page === 'settings' && <SettingsPage onNavigate={handleNavigate} fontMode={fontMode} setFontMode={setFontMode} />}

      <BottomNav active={currentTab} onNavigate={handleTab} />
    </div>
  )
}

export default App

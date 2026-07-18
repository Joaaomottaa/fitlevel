import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from '@/stores/auth'
import { useGame } from '@/stores/game'
import { BottomNav, Toaster, aplicarTema, temaAtual } from '@/components/ui'
import Landing from '@/pages/Landing'
import { Login, Register, Recover } from '@/pages/Auth'
import Onboarding from '@/pages/Onboarding'
import Home from '@/pages/Home'
import Checkin from '@/pages/Checkin'
import Jornada from '@/pages/Jornada'
import MinhaSaude from '@/pages/MinhaSaude'
import Missoes from '@/pages/Missoes'
import AvatarPage from '@/pages/AvatarPage'
import Conquistas from '@/pages/Conquistas'
import Loja from '@/pages/Loja'
import Chat from '@/pages/Chat'
import Nutricao from '@/pages/Nutricao'
import Social from '@/pages/Social'
import Competicoes from '@/pages/Competicoes'
import Menu from '@/pages/Menu'
import Perfil from '@/pages/Perfil'
import Evolucao from '@/pages/Evolucao'

function Protegida({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const profile = useGame((s) => s.profile)
  const loc = useLocation()
  if (loading) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <div className="text-4xl animate-bounce">🧬</div>
      </div>
    )
  }
  if (!user) return <Navigate to="/" replace />
  if (!profile && loc.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

const COM_NAV = ['/home', '/jornada', '/social', '/menu', '/saude', '/missoes', '/avatar', '/conquistas', '/loja', '/chat', '/nutricao', '/competicoes', '/perfil', '/evolucao']

export default function App() {
  const { user, init } = useAuth()
  const initFor = useGame((s) => s.initFor)
  const mode = useAuth((s) => s.mode)
  const loc = useLocation()

  useEffect(() => {
    aplicarTema(temaAtual())
    init()
  }, [init])

  useEffect(() => {
    if (user) initFor(user.id, mode === 'demo')
  }, [user, mode, initFor])

  const mostrarNav = user && COM_NAV.includes(loc.pathname)

  return (
    <div className="min-h-screen app-bg">
      <Toaster />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/cadastro" element={user ? <Navigate to="/onboarding" replace /> : <Register />} />
        <Route path="/recuperar" element={<Recover />} />
        <Route path="/onboarding" element={<Protegida><Onboarding /></Protegida>} />
        <Route path="/home" element={<Protegida><Home /></Protegida>} />
        <Route path="/checkin" element={<Protegida><Checkin /></Protegida>} />
        <Route path="/jornada" element={<Protegida><Jornada /></Protegida>} />
        <Route path="/saude" element={<Protegida><MinhaSaude /></Protegida>} />
        <Route path="/missoes" element={<Protegida><Missoes /></Protegida>} />
        <Route path="/avatar" element={<Protegida><AvatarPage /></Protegida>} />
        <Route path="/conquistas" element={<Protegida><Conquistas /></Protegida>} />
        <Route path="/loja" element={<Protegida><Loja /></Protegida>} />
        <Route path="/chat" element={<Protegida><Chat /></Protegida>} />
        <Route path="/nutricao" element={<Protegida><Nutricao /></Protegida>} />
        <Route path="/social" element={<Protegida><Social /></Protegida>} />
        <Route path="/competicoes" element={<Protegida><Competicoes /></Protegida>} />
        <Route path="/menu" element={<Protegida><Menu /></Protegida>} />
        <Route path="/perfil" element={<Protegida><Perfil /></Protegida>} />
        <Route path="/evolucao" element={<Protegida><Evolucao /></Protegida>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {mostrarNav && <BottomNav />}
    </div>
  )
}

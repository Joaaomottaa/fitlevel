import { create } from 'zustand'
import { supabase, supabaseConfigured } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string
  nome?: string
}

interface AuthState {
  user: AuthUser | null
  mode: 'supabase' | 'demo' | null
  loading: boolean
  init: () => Promise<void>
  register: (email: string, senha: string, nome: string) => Promise<string | null>
  login: (email: string, senha: string) => Promise<string | null>
  loginGoogle: () => Promise<string | null>
  loginDemo: () => void
  recover: (email: string) => Promise<string | null>
  logout: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  mode: null,
  loading: true,

  init: async () => {
    // sessão demo sobrevive a refresh
    if (localStorage.getItem('fitlevel-demo') === '1') {
      set({ user: { id: 'demo', email: 'demo@evo.app', nome: 'Alex Demo' }, mode: 'demo', loading: false })
      return
    }
    if (!supabase) {
      set({ loading: false })
      return
    }
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) {
      const u = data.session.user
      set({ user: { id: u.id, email: u.email ?? '', nome: u.user_metadata?.nome }, mode: 'supabase' })
    }
    supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        set({ user: { id: session.user.id, email: session.user.email ?? '', nome: session.user.user_metadata?.nome }, mode: 'supabase' })
      } else if (localStorage.getItem('fitlevel-demo') !== '1') {
        set({ user: null, mode: null })
      }
    })
    set({ loading: false })
  },

  register: async (email, senha, nome) => {
    if (!supabase) return 'Supabase não configurado — use o Modo Demo ou adicione a chave no .env'
    const { error } = await supabase.auth.signUp({ email, password: senha, options: { data: { nome } } })
    if (error) return traduzErro(error.message)
    return null
  },

  login: async (email, senha) => {
    if (!supabase) return 'Supabase não configurado — use o Modo Demo ou adicione a chave no .env'
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) return traduzErro(error.message)
    return null
  },

  loginGoogle: async () => {
    if (!supabase) return 'Supabase não configurado'
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) return 'Google OAuth ainda não configurado no Supabase — use e-mail/senha ou o Modo Demo'
    return null
  },

  loginDemo: () => {
    localStorage.setItem('fitlevel-demo', '1')
    set({ user: { id: 'demo', email: 'demo@evo.app', nome: 'Alex Demo' }, mode: 'demo', loading: false })
  },

  recover: async (email) => {
    if (!supabase) return 'Supabase não configurado'
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
    if (error) return traduzErro(error.message)
    return null
  },

  logout: async () => {
    localStorage.removeItem('fitlevel-demo')
    if (supabase) await supabase.auth.signOut()
    set({ user: null, mode: null })
  },
}))

function traduzErro(msg: string): string {
  if (msg.includes('Invalid login')) return 'E-mail ou senha incorretos'
  if (msg.includes('already registered')) return 'Este e-mail já está cadastrado'
  if (msg.includes('at least 6')) return 'A senha precisa de pelo menos 6 caracteres'
  if (msg.includes('valid email')) return 'Digite um e-mail válido'
  return msg
}

export { supabaseConfigured }

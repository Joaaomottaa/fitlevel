import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, Zap } from 'lucide-react'
import { useAuth } from '@/stores/auth'
import { useToast } from '@/components/ui'

function AuthShell({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-400/30">
            <Zap size={22} fill="currentColor" />
          </div>
          <span className="text-2xl font-black grad-text">FitLevel</span>
        </Link>
        <div className="card !p-6">
          <h1 className="text-xl font-black mb-4">{titulo}</h1>
          {children}
        </div>
      </div>
    </div>
  )
}

function GoogleBtn() {
  const loginGoogle = useAuth((s) => s.loginGoogle)
  const toast = useToast((s) => s.push)
  return (
    <button
      className="btn-ghost w-full"
      onClick={async () => {
        const erro = await loginGoogle()
        if (erro) toast(erro, 'erro')
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
      Continuar com Google
    </button>
  )
}

export function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuth((s) => s.login)
  const loginDemo = useAuth((s) => s.loginDemo)
  const toast = useToast((s) => s.push)
  const nav = useNavigate()

  const entrar = async () => {
    setLoading(true)
    const erro = await login(email, senha)
    setLoading(false)
    if (erro) toast(erro, 'erro')
    else nav('/home')
  }

  return (
    <AuthShell titulo="Bem-vindo de volta! 👋">
      <div className="flex flex-col gap-3">
        <input className="input" placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && entrar()} />
        <button className="btn-primary" disabled={loading || !email || !senha} onClick={entrar}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
        <GoogleBtn />
        <div className="flex justify-between text-sm font-bold">
          <Link to="/recuperar" className="text-cyan-500">Esqueci a senha</Link>
          <Link to="/cadastro" className="text-emerald-500">Criar conta</Link>
        </div>
        <button onClick={loginDemo} className="text-sm font-bold text-violet-500 pt-1 flex items-center justify-center gap-1.5 w-full"><Eye size={15} /> Entrar em modo demo</button>
      </div>
    </AuthShell>
  )
}

export function Register() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useAuth((s) => s.register)
  const login = useAuth((s) => s.login)
  const toast = useToast((s) => s.push)
  const nav = useNavigate()

  const criar = async () => {
    setLoading(true)
    const erro = await register(email, senha, nome)
    if (erro) {
      setLoading(false)
      toast(erro, 'erro')
      return
    }
    // login direto após cadastro (se confirmação de e-mail estiver desativada)
    await login(email, senha)
    setLoading(false)
    toast('Conta criada! 🎉')
    nav('/onboarding')
  }

  return (
    <AuthShell titulo="Crie sua conta 🚀">
      <div className="flex flex-col gap-3">
        <input className="input" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input className="input" placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" placeholder="Senha (mín. 6 caracteres)" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <button className="btn-primary" disabled={loading || !nome || !email || senha.length < 6} onClick={criar}>
          {loading ? 'Criando…' : 'Criar conta grátis'}
        </button>
        <GoogleBtn />
        <p className="text-[11px] font-semibold text-slate-400 text-center">
          Ao criar a conta você concorda com o uso dos seus dados de saúde para personalizar sua experiência (LGPD).
        </p>
        <Link to="/login" className="text-sm font-bold text-emerald-500 text-center">Já tenho conta</Link>
      </div>
    </AuthShell>
  )
}

export function Recover() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const recover = useAuth((s) => s.recover)
  const toast = useToast((s) => s.push)

  return (
    <AuthShell titulo="Recuperar senha 🔑">
      {enviado ? (
        <p className="font-bold text-emerald-500">E-mail enviado! Verifique sua caixa de entrada. 📬</p>
      ) : (
        <div className="flex flex-col gap-3">
          <input className="input" placeholder="Seu e-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button
            className="btn-primary"
            disabled={!email}
            onClick={async () => {
              const erro = await recover(email)
              if (erro) toast(erro, 'erro')
              else setEnviado(true)
            }}
          >
            Enviar link de recuperação
          </button>
          <Link to="/login" className="text-sm font-bold text-slate-400 text-center">Voltar</Link>
        </div>
      )}
    </AuthShell>
  )
}

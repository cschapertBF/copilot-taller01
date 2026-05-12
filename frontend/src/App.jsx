import { useEffect, useMemo, useState } from 'react'
import './App.css'

const SESSION_STORAGE_KEY = 'auth-session'
const LOGIN_HASH = '#/login'
const WELCOME_HASH = '#/welcome'
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function getRouteFromHash(hash = window.location.hash) {
  return hash === WELCOME_HASH ? 'welcome' : 'login'
}

function readStoredSession() {
  const storedSession = sessionStorage.getItem(SESSION_STORAGE_KEY)

  if (!storedSession) {
    return null
  }

  try {
    return JSON.parse(storedSession)
  } catch {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

function App() {
  const [session, setSession] = useState(() => readStoredSession())
  const [route, setRoute] = useState(() => getRouteFromHash())
  const [formData, setFormData] = useState({ username: 'admin', password: 'admin123' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromHash())
    }

    if (!window.location.hash) {
      window.location.hash = session ? WELCOME_HASH : LOGIN_HASH
    } else if (!session && window.location.hash === WELCOME_HASH) {
      window.location.hash = LOGIN_HASH
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [session])

  useEffect(() => {
    if (route === 'welcome' && !session) {
      window.location.hash = LOGIN_HASH
    }
  }, [route, session])

  const sessionSummary = useMemo(() => {
    if (!session) {
      return []
    }

    return [
      { label: 'Usuario', value: session.username },
      { label: 'Token type', value: session.tokenType },
      { label: 'Expira en', value: `${session.expiresIn} segundos` },
    ]
  }, [session])

  const handleInputChange = ({ target: { name, value } }) => {
    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const payload = await response.json()

      if (!response.ok) {
        setErrorMessage(payload.detail ?? 'No fue posible iniciar sesión.')
        return
      }

      const nextSession = {
        username: formData.username,
        accessToken: payload.access_token,
        refreshToken: payload.refresh_token,
        tokenType: payload.token_type,
        expiresIn: payload.expires_in,
      }

      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession))
      setSession(nextSession)
      window.location.hash = WELCOME_HASH
    } catch {
      setErrorMessage('No fue posible conectar con el backend.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    setSession(null)
    setErrorMessage('')
    window.location.hash = LOGIN_HASH
  }

  return (
    <main className="app-shell">
      <section className="card">
        <span className="eyebrow">Autenticación JWT</span>
        <h1>{route === 'welcome' && session ? 'Bienvenido' : 'Iniciar sesión'}</h1>
        <p className="lead">
          {route === 'welcome' && session
            ? 'Tu sesión fue creada usando el servicio de login del backend.'
            : 'Ingresa tus credenciales para obtener un token y guardar la sesión en el navegador.'}
        </p>

        {route === 'welcome' && session ? (
          <>
            <dl className="session-details">
              {sessionSummary.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="token-box">
              <span>Access token</span>
              <code>{session.accessToken}</code>
            </div>

            <button type="button" className="primary-button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Usuario
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                autoComplete="username"
                required
              />
            </label>

            <label>
              Contraseña
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="current-password"
                required
              />
            </label>

            {errorMessage ? (
              <p className="feedback error" role="alert">
                {errorMessage}
              </p>
            ) : (
              <p className="feedback">Credenciales por defecto: admin / admin123</p>
            )}

            <button type="submit" className="primary-button" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}

export default App

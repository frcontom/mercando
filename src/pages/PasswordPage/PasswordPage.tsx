import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import LockIcon from '@mui/icons-material/Lock'
import BackspaceIcon from '@mui/icons-material/Backspace'
import { login } from '@/store'
import './PasswordPage.scss'

const PIN_LENGTH = 4

export default function PasswordPage() {
  const navigate = useNavigate()
  const [digits, setDigits] = useState<string[]>([])
  const [error, setError] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const handleKey = useCallback((key: string) => {
    if (error) setError(false)
    if (digits.length >= PIN_LENGTH) return

    const next = [...digits, key]
    setDigits(next)

    if (next.length === PIN_LENGTH) {
      const pin = next.join('')
      if (login(pin)) {
        navigate('/dashboard', { replace: true })
      } else {
        setError(true)
        setTimeout(() => setDigits([]), 400)
      }
    }
  }, [digits, error, navigate])

  const handleDelete = useCallback(() => {
    if (error) setError(false)
    setDigits(prev => prev.slice(0, -1))
  }, [error])

  return (
    <div ref={rootRef} className={`password-root${error ? ' password-error' : ''}`}>
      <div className="password-lock-icon">
        <LockIcon fontSize="inherit" />
      </div>

      <div className="password-dots">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div key={i} className={`password-dot${i < digits.length ? ' filled' : ''}`} />
        ))}
      </div>

      <div className="password-numpad">
        {['1','2','3','4','5','6','7','8','9'].map(k => (
          <button key={k} className="password-key" onClick={() => handleKey(k)}>
            {k}
          </button>
        ))}
        <div className="password-key" />
        <button className="password-key" onClick={() => handleKey('0')}>0</button>
        <button className="password-key" onClick={handleDelete}>
          {digits.length > 0 ? <BackspaceIcon /> : undefined}
        </button>
      </div>
    </div>
  )
}

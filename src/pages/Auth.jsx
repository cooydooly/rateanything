import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'

function AuthForm({ mode, onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const isLogin = mode === 'login'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('닉네임과 비밀번호를 입력해주세요.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요.')
      return
    }
    setLoading(true)

    if (isLogin) {
      const { data, error: err } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.trim())
        .single()

      if (err || !data) {
        setError('존재하지 않는 닉네임이에요.')
        setLoading(false)
        return
      }

      if (data.password !== btoa(password)) {
        setError('비밀번호가 틀렸어요.')
        setLoading(false)
        return
      }

      onSuccess(data)
      nav('/')
    } else {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.trim())
        .single()

      if (existing) {
        setError('이미 사용 중인 닉네임이에요.')
        setLoading(false)
        return
      }

      const { data, error: err } = await supabase
        .from('users')
        .insert({ username: username.trim(), password: btoa(password) })
        .select()
        .single()

      if (err) {
        setError('오류가 발생했어요. 다시 시도해주세요.')
        setLoading(false)
        return
      }

      onSuccess(data)
      nav('/')
    }
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '80vh', display:'flex', alignItems:'center', justifyContent:'center',
      padding:'20px',
    }}>
      <div style={{
        width:'100%', maxWidth:380,
        background:'var(--surface)', borderRadius:'var(--radius)',
        border:'0.5px solid var(--border)', padding:'32px',
        animation:'fadeUp 0.3s ease',
      }}>
        <div style={{ marginBottom:28, textAlign:'center' }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, marginBottom:6 }}>
            Rate<span style={{ color:'var(--brand)' }}>Anything</span>
          </div>
          <p style={{ fontSize:14, color:'var(--text2)' }}>
            {isLogin ? '다시 만나서 반가워요 👋' : '뭐든지 찍고 별점 매기는 곳 ⭐'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:'var(--text2)', display:'block', marginBottom:5 }}>
              닉네임
            </label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="예: 리뷰왕철수"
              autoFocus
              style={{
                width:'100%', padding:'10px 12px', fontSize:14,
                border:'0.5px solid var(--border)', borderRadius:'var(--radius-sm)',
                background:'var(--bg)', color:'var(--text)',
                outline:'none', transition:'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--brand)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:'var(--text2)', display:'block', marginBottom:5 }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isLogin ? '비밀번호' : '6자 이상'}
              style={{
                width:'100%', padding:'10px 12px', fontSize:14,
                border:'0.5px solid var(--border)', borderRadius:'var(--radius-sm)',
                background:'var(--bg)', color:'var(--text)',
                outline:'none', transition:'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--brand)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{
              fontSize:13, color:'#CC2E25',
              background:'#FFF0EF', borderRadius:'var(--radius-sm)',
              padding:'8px 12px',
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop:4,
              background:'var(--brand)', color:'white', border:'none',
              borderRadius:'var(--radius-sm)', padding:'11px',
              fontSize:14, fontWeight:600,
              opacity: loading ? 0.7 : 1,
              fontFamily:'Syne, sans-serif',
            }}
          >
            {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:13, color:'var(--text2)', marginTop:20 }}>
          {isLogin ? '계정이 없나요? ' : '이미 계정이 있나요? '}
          <Link
            to={isLogin ? '/signup' : '/login'}
            style={{ color:'var(--brand)', fontWeight:500 }}
          >
            {isLogin ? '회원가입' : '로그인'}
          </Link>
        </p>
      </div>
    </main>
  )
}

export function Login({ onLogin }) {
  return <AuthForm mode="login" onSuccess={onLogin} />
}

export function Signup({ onLogin }) {
  return <AuthForm mode="signup" onSuccess={onLogin} />
}

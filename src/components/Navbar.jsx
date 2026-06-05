import { Link, useNavigate } from 'react-router-dom'

export default function Navbar({ user, onLogout }) {
  const nav = useNavigate()

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(247,246,243,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '0.5px solid var(--border)',
    }}>
      <div style={{
        maxWidth: 640, margin: '0 auto',
        padding: '0 16px',
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, letterSpacing:'-0.5px' }}>
          Rate<span style={{ color:'var(--brand)' }}>Anything</span>
        </Link>

        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {user ? (
            <>
              <button
                onClick={() => nav('/upload')}
                style={{
                  background:'var(--brand)', color:'white', border:'none',
                  borderRadius:'var(--radius-sm)', padding:'7px 14px',
                  fontSize:13, fontWeight:500, display:'flex', alignItems:'center', gap:5,
                }}
              >
                + 리뷰 올리기
              </button>
              <div style={{
                fontSize:13, color:'var(--text2)',
                background:'var(--surface)', border:'0.5px solid var(--border)',
                borderRadius:'var(--radius-sm)', padding:'7px 12px',
                cursor:'pointer',
              }} onClick={onLogout}>
                {user.username} · 로그아웃
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                fontSize:13, color:'var(--text2)',
                background:'var(--surface)', border:'0.5px solid var(--border)',
                borderRadius:'var(--radius-sm)', padding:'7px 14px',
              }}>로그인</Link>
              <Link to="/signup" style={{
                fontSize:13, color:'white',
                background:'var(--brand)', border:'none',
                borderRadius:'var(--radius-sm)', padding:'7px 14px',
                fontWeight:500,
              }}>회원가입</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

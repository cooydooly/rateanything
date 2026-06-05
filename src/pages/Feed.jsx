import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import PostCard from '../components/PostCard'

export default function Feed({ currentUser }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('new')

  useEffect(() => {
    fetchPosts()
  }, [sort])

  const fetchPosts = async () => {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select(`
        *,
        comments:comments(count)
      `)

    if (sort === 'new') query = query.order('created_at', { ascending: false })
    else if (sort === 'hot') query = query.order('likes', { ascending: false })
    else if (sort === 'top') query = query.order('avg_rating', { ascending: false })

    const { data, error } = await query
    if (!error) {
      setPosts((data || []).map(p => ({
        ...p,
        comment_count: p.comments?.[0]?.count || 0,
      })))
    }
    setLoading(false)
  }

  const tabs = [
    { key: 'new', label: '최신순' },
    { key: 'hot', label: '인기순' },
    { key: 'top', label: '별점순' },
  ]

  return (
    <main style={{ maxWidth:640, margin:'0 auto', padding:'24px 16px' }}>
      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setSort(t.key)}
            style={{
              padding:'7px 16px', fontSize:13, fontWeight:500,
              borderRadius:'var(--radius-sm)',
              border: sort===t.key ? 'none' : '0.5px solid var(--border)',
              background: sort===t.key ? 'var(--text)' : 'var(--surface)',
              color: sort===t.key ? 'white' : 'var(--text2)',
              transition:'all 0.15s',
            }}
          >{t.label}</button>
        ))}
        <button
          onClick={fetchPosts}
          style={{
            marginLeft:'auto', padding:'7px 12px', fontSize:13,
            border:'0.5px solid var(--border)', borderRadius:'var(--radius-sm)',
            background:'var(--surface)', color:'var(--text2)',
          }}
        >↻ 새로고침</button>
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text3)' }}>
          <div style={{
            width:32, height:32, border:'2px solid var(--border)',
            borderTopColor:'var(--brand)', borderRadius:'50%',
            animation:'spin 0.8s linear infinite',
            margin:'0 auto 12px',
          }} />
          <p style={{ fontSize:14 }}>불러오는 중...</p>
        </div>
      ) : posts.length === 0 ? (
        <div style={{
          textAlign:'center', padding:'60px 20px',
          background:'var(--surface)', borderRadius:'var(--radius)',
          border:'0.5px solid var(--border)',
        }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📸</div>
          <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:18, marginBottom:6 }}>
            아직 리뷰가 없어요
          </p>
          <p style={{ fontSize:14, color:'var(--text2)' }}>첫 번째 리뷰를 올려보세요!</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {posts.map(post => (
            <PostCard key={post.id} post={post} currentUser={currentUser} />
          ))}
        </div>
      )}
    </main>
  )
}

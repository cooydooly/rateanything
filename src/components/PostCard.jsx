import { useState } from 'react'
import { supabase } from '../supabase'
import StarRating from './StarRating'

export default function PostCard({ post, currentUser, onUpdate }) {
  const [comments, setComments] = useState(post.comments || [])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes || 0)

  const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr)) / 1000
    if (diff < 60) return '방금'
    if (diff < 3600) return `${Math.floor(diff/60)}분 전`
    if (diff < 86400) return `${Math.floor(diff/3600)}시간 전`
    return `${Math.floor(diff/86400)}일 전`
  }

  const initials = (name) => name?.slice(0,2).toUpperCase() || '??'

  const avatarColor = (name) => {
    const colors = [
      ['#FFEDE8','#CC3A1E'],['#E8F0FF','#2952CC'],['#E8FFF0','#1E8C47'],
      ['#F5E8FF','#7A28CC'],['#FFF8E8','#CC8C1E'],['#FFE8F5','#CC1E7A'],
    ]
    const i = (name?.charCodeAt(0) || 0) % colors.length
    return colors[i]
  }

  const handleLike = async () => {
    setLiked(!liked)
    const delta = liked ? -1 : 1
    setLikeCount(c => c + delta)
    await supabase.from('posts').update({ likes: likeCount + delta }).eq('id', post.id)
  }

  const loadComments = async () => {
    if (showComments) { setShowComments(false); return }
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    setComments(data || [])
    setShowComments(true)
  }

  const submitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser) return
    setSubmitting(true)
    const { data, error } = await supabase.from('comments').insert({
      post_id: post.id,
      user_id: currentUser.id,
      username: currentUser.username,
      content: newComment.trim(),
    }).select().single()
    if (!error && data) {
      setComments(c => [...c, data])
      setNewComment('')
    }
    setSubmitting(false)
  }

  const [bg, fg] = avatarColor(post.username)

  return (
    <article style={{
      background: 'var(--surface)',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      animation: 'fadeUp 0.35s ease forwards',
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px' }}>
        <div style={{
          width:38, height:38, borderRadius:'50%',
          background: bg, color: fg,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:13, fontWeight:600, flexShrink:0,
          fontFamily:'Syne, sans-serif',
        }}>{initials(post.username)}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:500 }}>{post.username}</div>
          <div style={{ fontSize:11, color:'var(--text3)' }}>{timeAgo(post.created_at)}</div>
        </div>
      </div>

      {/* Image */}
      {post.image_url && (
        <div style={{ width:'100%', aspectRatio:'4/3', overflow:'hidden', background:'var(--surface2)' }}>
          <img
            src={post.image_url}
            alt={post.title}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          />
        </div>
      )}

      {/* Body */}
      <div style={{ padding:'14px 16px' }}>
        <div style={{ fontSize:16, fontWeight:600, marginBottom:8, fontFamily:'Syne, sans-serif' }}>
          {post.title}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <StarRating value={Math.round(post.avg_rating || post.rating)} readonly size={18} />
          <span style={{ fontSize:14, fontWeight:600 }}>
            {Number(post.avg_rating || post.rating).toFixed(1)}
          </span>
          {post.rating_count > 1 && (
            <span style={{ fontSize:12, color:'var(--text3)' }}>({post.rating_count}명 평가)</span>
          )}
        </div>
        {post.review && (
          <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.65, marginBottom:12 }}>
            {post.review}
          </p>
        )}

        {/* Actions */}
        <div style={{
          display:'flex', gap:4,
          paddingTop:12, borderTop:'0.5px solid var(--border)',
        }}>
          <button
            onClick={handleLike}
            style={{
              display:'flex', alignItems:'center', gap:5,
              background: liked ? '#FFF0EF' : 'transparent',
              color: liked ? 'var(--brand)' : 'var(--text2)',
              border: '0.5px solid',
              borderColor: liked ? 'var(--brand)' : 'var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding:'6px 12px', fontSize:13, fontWeight:500,
              transition:'all 0.15s',
            }}
          >
            ♥ {likeCount > 0 ? likeCount : '좋아요'}
          </button>
          <button
            onClick={loadComments}
            style={{
              display:'flex', alignItems:'center', gap:5,
              background:'transparent', color:'var(--text2)',
              border:'0.5px solid var(--border)',
              borderRadius:'var(--radius-sm)',
              padding:'6px 12px', fontSize:13, fontWeight:500,
              transition:'all 0.15s',
            }}
          >
            💬 {post.comment_count > 0 ? `${post.comment_count}개` : '댓글'}
          </button>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{ padding:'0 16px 14px', borderTop:'0.5px solid var(--border)' }}>
          <div style={{ paddingTop:12, display:'flex', flexDirection:'column', gap:8 }}>
            {comments.length === 0 && (
              <p style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:'8px 0' }}>
                첫 댓글을 달아봐요!
              </p>
            )}
            {comments.map(c => {
              const [cbg, cfg] = avatarColor(c.username)
              return (
                <div key={c.id} style={{ display:'flex', gap:8 }}>
                  <div style={{
                    width:28, height:28, borderRadius:'50%',
                    background:cbg, color:cfg,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:10, fontWeight:600, flexShrink:0,
                    fontFamily:'Syne, sans-serif',
                  }}>{initials(c.username)}</div>
                  <div style={{
                    background:'var(--surface2)', borderRadius:'0 var(--radius-sm) var(--radius-sm) var(--radius-sm)',
                    padding:'7px 10px', flex:1,
                  }}>
                    <div style={{ fontSize:12, fontWeight:500, marginBottom:2 }}>{c.username}</div>
                    <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.5 }}>{c.content}</div>
                  </div>
                </div>
              )
            })}
          </div>
          {currentUser && (
            <form onSubmit={submitComment} style={{ display:'flex', gap:8, marginTop:10 }}>
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="댓글 달기..."
                style={{
                  flex:1, padding:'8px 12px', fontSize:13,
                  border:'0.5px solid var(--border)', borderRadius:'var(--radius-sm)',
                  background:'var(--surface)', color:'var(--text)',
                  outline:'none',
                }}
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                style={{
                  background:'var(--brand)', color:'white', border:'none',
                  borderRadius:'var(--radius-sm)', padding:'8px 14px',
                  fontSize:13, fontWeight:500,
                  opacity: submitting || !newComment.trim() ? 0.5 : 1,
                }}
              >{submitting ? '...' : '전송'}</button>
            </form>
          )}
        </div>
      )}
    </article>
  )
}

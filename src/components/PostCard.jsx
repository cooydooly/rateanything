import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import StarRating from './StarRating'

export default function PostCard({ post, currentUser, onDelete }) {
  const [comments, setComments] = useState(post.comments || [])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes || 0)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(post.title)
  const [editReview, setEditReview] = useState(post.review || '')
  const [editRating, setEditRating] = useState(post.rating)
  const [currentPost, setCurrentPost] = useState(post)
  const [saving, setSaving] = useState(false)
  const [communityRating, setCommunityRating] = useState(null)
  const [communityCount, setCommunityCount] = useState(0)
  const [myRating, setMyRating] = useState(0)
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const isOwner = currentUser && currentUser.id === post.user_id

  useEffect(() => {
    fetchCommunityRating()
  }, [])

  const fetchCommunityRating = async () => {
    const { data } = await supabase
      .from('ratings')
      .select('rating, user_id')
      .eq('post_id', post.id)
    if (data && data.length > 0) {
      const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
      setCommunityRating(avg)
      setCommunityCount(data.length)
      if (currentUser) {
        const mine = data.find(r => r.user_id === currentUser.id)
        if (mine) setMyRating(mine.rating)
      }
    }
  }

  const handleCommunityRating = async (value) => {
    if (!currentUser) return
    setRatingSubmitting(true)
    setMyRating(value)
    await supabase.from('ratings').upsert({
      post_id: post.id,
      user_id: currentUser.id,
      rating: value,
    }, { onConflict: 'post_id,user_id' })
    await fetchCommunityRating()
    setRatingSubmitting(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('이 리뷰를 삭제할까요?')) return
    setDeleting(true)
    if (post.image_url) {
      const fileName = post.image_url.split('/').pop()
      await supabase.storage.from('post-images').remove([fileName])
    }
    await supabase.from('posts').delete().eq('id', post.id)
    onDelete?.(post.id)
  }

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || editRating === 0) return
    setSaving(true)
    const { data, error } = await supabase
      .from('posts')
      .update({ title: editTitle.trim(), review: editReview.trim(), rating: editRating, avg_rating: editRating })
      .eq('id', post.id)
      .select()
      .single()
    if (!error && data) {
      setCurrentPost(data)
      setEditing(false)
    }
    setSaving(false)
  }

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

  const [bg, fg] = avatarColor(currentPost.username)

  return (
    <article style={{
      background: 'var(--surface)',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      animation: 'fadeUp 0.35s ease forwards',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px' }}>
        <div style={{
          width:38, height:38, borderRadius:'50%',
          background: bg, color: fg,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:13, fontWeight:600, flexShrink:0,
          fontFamily:'Syne, sans-serif',
        }}>{initials(currentPost.username)}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:500 }}>{currentPost.username}</div>
          <div style={{ fontSize:11, color:'var(--text3)' }}>{timeAgo(currentPost.created_at)}</div>
        </div>
        {isOwner && !editing && (
          <div style={{ display:'flex', gap:6 }}>
            <button
              onClick={() => setEditing(true)}
              style={{ background:'transparent', border:'none', color:'var(--text3)', fontSize:13, cursor:'pointer', padding:'4px 8px', borderRadius:'var(--radius-sm)' }}
              onMouseEnter={e => { e.target.style.color='var(--text)'; e.target.style.background='var(--surface2)' }}
              onMouseLeave={e => { e.target.style.color='var(--text3)'; e.target.style.background='transparent' }}
            >✏️ 수정</button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ background:'transparent', border:'none', color:'var(--text3)', fontSize:13, cursor:'pointer', padding:'4px 8px', borderRadius:'var(--radius-sm)' }}
              onMouseEnter={e => { e.target.style.color='#CC2E25'; e.target.style.background='#FFF0EF' }}
              onMouseLeave={e => { e.target.style.color='var(--text3)'; e.target.style.background='transparent' }}
            >{deleting ? '삭제 중...' : '🗑 삭제'}</button>
          </div>
        )}
      </div>

      {currentPost.image_url && (
        <div style={{ width:'100%', aspectRatio:'4/3', overflow:'hidden', background:'var(--surface2)' }}>
          <img src={currentPost.image_url} alt={currentPost.title}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        </div>
      )}

      <div style={{ padding:'14px 16px' }}>
        {editing ? (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
              style={{ width:'100%', padding:'9px 12px', fontSize:15, fontWeight:600, border:'0.5px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--bg)', color:'var(--text)', outline:'none', fontFamily:'Syne, sans-serif' }}
              onFocus={e => e.target.style.borderColor='var(--brand)'}
              onBlur={e => e.target.style.borderColor='var(--border)'} />
            <StarRating value={editRating} onChange={setEditRating} size={24} />
            <textarea value={editReview} onChange={e => setEditReview(e.target.value)} rows={3}
              style={{ width:'100%', padding:'9px 12px', fontSize:14, border:'0.5px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--bg)', color:'var(--text)', outline:'none', resize:'vertical', lineHeight:1.6 }}
              onFocus={e => e.target.style.borderColor='var(--brand)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
              placeholder="리뷰 내용..." />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setEditing(false)}
                style={{ flex:1, padding:'8px', fontSize:13, border:'0.5px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--surface)', color:'var(--text2)' }}>취소</button>
              <button onClick={handleSaveEdit} disabled={saving || !editTitle.trim()}
                style={{ flex:2, padding:'8px', fontSize:13, fontWeight:600, border:'none', borderRadius:'var(--radius-sm)', background:'var(--brand)', color:'white', opacity: saving ? 0.7 : 1 }}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:10, fontFamily:'Syne, sans-serif' }}>{currentPost.title}</div>
            <div style={{ display:'flex', gap:12, marginBottom:12, padding:'10px 12px', background:'var(--surface2)', borderRadius:'var(--radius-sm)' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, color:'var(--text3)', marginBottom:4 }}>게시자 별점</div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <StarRating value={Math.round(currentPost.rating)} readonly size={16} />
                  <span style={{ fontSize:13, fontWeight:600 }}>{Number(currentPost.rating).toFixed(1)}</span>
                </div>
              </div>
              <div style={{ width:'0.5px', background:'var(--border)' }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, color:'var(--text3)', marginBottom:4 }}>
                  커뮤니티 별점 {communityCount > 0 && `(${communityCount}명)`}
                </div>
                {currentUser && !isOwner ? (
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <StarRating value={myRating} onChange={handleCommunityRating} size={16} />
                    <span style={{ fontSize:13, fontWeight:600, color: communityRating ? 'var(--text)' : 'var(--text3)' }}>
                      {communityRating ? communityRating.toFixed(1) : '?'}
                    </span>
                    {ratingSubmitting && <span style={{ fontSize:11, color:'var(--text3)' }}>저장 중...</span>}
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <StarRating value={Math.round(communityRating || 0)} readonly size={16} />
                    <span style={{ fontSize:13, fontWeight:600, color: communityRating ? 'var(--text)' : 'var(--text3)' }}>
                      {communityRating ? communityRating.toFixed(1) : '-'}
                    </span>
                    {!currentUser && <span style={{ fontSize:11, color:'var(--text3)' }}>로그인 후 평가 가능</span>}
                  </div>
                )}
              </div>
            </div>
            {currentPost.review && (
              <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.65, marginBottom:12 }}>{currentPost.review}</p>
            )}
          </>
        )}

        {!editing && (
          <div style={{ display:'flex', gap:4, paddingTop:12, borderTop:'0.5px solid var(--border)' }}>
            <button onClick={handleLike}
              style={{ display:'flex', alignItems:'center', gap:5, background: liked ? '#FFF0EF' : 'transparent', color: liked ? 'var(--brand)' : 'var(--text2)', border:'0.5px solid', borderColor: liked ? 'var(--brand)' : 'var(--border)', borderRadius:'var(--radius-sm)', padding:'6px 12px', fontSize:13, fontWeight:500, transition:'all 0.15s' }}>
              ♥ {likeCount > 0 ? likeCount : '좋아요'}
            </button>
            <button onClick={loadComments}
              style={{ display:'flex', alignItems:'center', gap:5, background:'transparent', color:'var(--text2)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'6px 12px', fontSize:13, fontWeight:500, transition:'all 0.15s' }}>
              💬 {post.comment_count > 0 ? `${post.comment_count}개` : '댓글'}
            </button>
          </div>
        )}
      </div>

      {showComments && !editing && (
        <div style={{ padding:'0 16px 14px', borderTop:'0.5px solid var(--border)' }}>
          <div style={{ paddingTop:12, display:'flex', flexDirection:'column', gap:8 }}>
            {comments.length === 0 && (
              <p style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:'8px 0' }}>첫 댓글을 달아봐요!</p>
            )}
            {comments.map(c => {
              const [cbg, cfg] = avatarColor(c.username)
              return (
                <div key={c.id} style={{ display:'flex', gap:8 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:cbg, color:cfg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, flexShrink:0, fontFamily:'Syne, sans-serif' }}>
                    {initials(c.username)}
                  </div>
                  <div style={{ background:'var(--surface2)', borderRadius:'0 var(--radius-sm) var(--radius-sm) var(--radius-sm)', padding:'7px 10px', flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:500, marginBottom:2 }}>{c.username}</div>
                    <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.5 }}>{c.content}</div>
                  </div>
                </div>
              )
            })}
          </div>
          {currentUser && (
            <form onSubmit={submitComment} style={{ display:'flex', gap:8, marginTop:10 }}>
              <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="댓글 달기..."
                style={{ flex:1, padding:'8px 12px', fontSize:13, border:'0.5px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--surface)', color:'var(--text)', outline:'none' }} />
              <button type="submit" disabled={submitting || !newComment.trim()}
                style={{ background:'var(--brand)', color:'white', border:'none', borderRadius:'var(--radius-sm)', padding:'8px 14px', fontSize:13, fontWeight:500, opacity: submitting || !newComment.trim() ? 0.5 : 1 }}>
                {submitting ? '...' : '전송'}
              </button>
            </form>
          )}
        </div>
      )}
    </article>
  )
}

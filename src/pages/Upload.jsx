import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import StarRating from '../components/StarRating'

export default function Upload({ currentUser }) {
  const nav = useNavigate()
  const fileRef = useRef()
  const [title, setTitle] = useState('')
  const [review, setReview] = useState('')
  const [rating, setRating] = useState(0)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  if (!currentUser) {
    return (
      <main style={{ maxWidth:500, margin:'60px auto', padding:'0 16px', textAlign:'center' }}>
        <p style={{ fontSize:16, color:'var(--text2)', marginBottom:16 }}>
          리뷰를 올리려면 로그인이 필요해요.
        </p>
        <button
          onClick={() => nav('/login')}
          style={{
            background:'var(--brand)', color:'white', border:'none',
            borderRadius:'var(--radius-sm)', padding:'10px 24px',
            fontSize:14, fontWeight:500,
          }}
        >로그인하러 가기</button>
      </main>
    )
  }

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    if (rating === 0) { setError('별점을 선택해주세요.'); return }
    setLoading(true)
    setError('')

    let image_url = null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}_${currentUser.id}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('post-images')
        .upload(fileName, imageFile)

      if (upErr) {
        setError('이미지 업로드 실패. Storage 버킷 설정을 확인해주세요.')
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName)
      image_url = urlData.publicUrl
    }

    const { error: insertErr } = await supabase.from('posts').insert({
      user_id: currentUser.id,
      username: currentUser.username,
      title: title.trim(),
      review: review.trim(),
      rating,
      avg_rating: rating,
      rating_count: 1,
      likes: 0,
      image_url,
    })

    if (insertErr) {
      setError('업로드 실패: ' + insertErr.message)
      setLoading(false)
      return
    }

    nav('/')
  }

  return (
    <main style={{ maxWidth:560, margin:'0 auto', padding:'28px 16px' }}>
      <h1 style={{
        fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:24,
        marginBottom:24,
      }}>새 리뷰 올리기</h1>

      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>

        {/* Image Upload */}
        <div>
          <label style={{ fontSize:13, fontWeight:500, color:'var(--text2)', display:'block', marginBottom:8 }}>
            사진 (선택)
          </label>
          {preview ? (
            <div style={{ position:'relative' }}>
              <img
                src={preview}
                style={{
                  width:'100%', aspectRatio:'4/3', objectFit:'cover',
                  borderRadius:'var(--radius)', border:'0.5px solid var(--border)',
                  display:'block',
                }}
              />
              <button
                type="button"
                onClick={() => { setPreview(null); setImageFile(null) }}
                style={{
                  position:'absolute', top:10, right:10,
                  background:'rgba(0,0,0,0.6)', color:'white',
                  border:'none', borderRadius:20, width:28, height:28,
                  fontSize:16, display:'flex', alignItems:'center', justifyContent:'center',
                }}
              >×</button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                width:'100%', aspectRatio:'3/2',
                border: `1.5px dashed ${dragOver ? 'var(--brand)' : 'var(--border-strong)'}`,
                borderRadius:'var(--radius)',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                gap:8, cursor:'pointer',
                background: dragOver ? '#FFF5F4' : 'var(--surface)',
                transition:'all 0.15s',
              }}
            >
              <span style={{ fontSize:36 }}>📷</span>
              <p style={{ fontSize:14, color:'var(--text2)', fontWeight:500 }}>
                사진을 클릭하거나 드래그해서 올려요
              </p>
              <p style={{ fontSize:12, color:'var(--text3)' }}>JPG, PNG, GIF · 최대 5MB</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display:'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>

        {/* Title */}
        <div>
          <label style={{ fontSize:13, fontWeight:500, color:'var(--text2)', display:'block', marginBottom:6 }}>
            제목 *
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="예: 오늘 점심 편의점 삼각김밥"
            style={{
              width:'100%', padding:'11px 14px', fontSize:14,
              border:'0.5px solid var(--border)', borderRadius:'var(--radius-sm)',
              background:'var(--surface)', color:'var(--text)', outline:'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--brand)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Rating */}
        <div>
          <label style={{ fontSize:13, fontWeight:500, color:'var(--text2)', display:'block', marginBottom:8 }}>
            별점 *
          </label>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <StarRating value={rating} onChange={setRating} size={32} />
            {rating > 0 && (
              <span style={{ fontSize:16, fontWeight:600, fontFamily:'Syne,sans-serif' }}>
                {['', '별로예요 😞', '그냥 그래요 😐', '괜찮아요 🙂', '좋아요 😊', '최고예요 🤩'][rating]}
              </span>
            )}
          </div>
        </div>

        {/* Review */}
        <div>
          <label style={{ fontSize:13, fontWeight:500, color:'var(--text2)', display:'block', marginBottom:6 }}>
            리뷰 (선택)
          </label>
          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            placeholder="솔직한 생각을 남겨봐요. 짧아도 괜찮아요."
            rows={4}
            style={{
              width:'100%', padding:'11px 14px', fontSize:14,
              border:'0.5px solid var(--border)', borderRadius:'var(--radius-sm)',
              background:'var(--surface)', color:'var(--text)', outline:'none',
              resize:'vertical', lineHeight:1.6,
            }}
            onFocus={e => e.target.style.borderColor = 'var(--brand)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {error && (
          <div style={{
            fontSize:13, color:'#CC2E25', background:'#FFF0EF',
            borderRadius:'var(--radius-sm)', padding:'10px 14px',
          }}>{error}</div>
        )}

        <div style={{ display:'flex', gap:10 }}>
          <button
            type="button"
            onClick={() => nav('/')}
            style={{
              flex:1, padding:'12px', fontSize:14,
              border:'0.5px solid var(--border)', borderRadius:'var(--radius-sm)',
              background:'var(--surface)', color:'var(--text2)',
            }}
          >취소</button>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex:2, padding:'12px', fontSize:14, fontWeight:700,
              border:'none', borderRadius:'var(--radius-sm)',
              background:'var(--brand)', color:'white',
              opacity: loading ? 0.7 : 1,
              fontFamily:'Syne, sans-serif',
            }}
          >
            {loading ? '올리는 중...' : '리뷰 올리기 ↗'}
          </button>
        </div>
      </form>
    </main>
  )
}

# RateAnything 🌟

뭐든지 찍고 별점 매기는 커뮤니티. 편의점 커피도, 오늘 하늘도, 5년된 의자도 OK.

## 기술 스택
- **Frontend**: React + Vite
- **Backend/DB**: Supabase (PostgreSQL)
- **스타일**: CSS Variables (커스텀)
- **라우팅**: React Router v6

---

## 시작하기

### 1. Supabase 프로젝트 만들기
1. https://supabase.com 접속 → 무료 계정 생성
2. New Project 생성
3. `supabase_schema.sql` 내용을 **SQL Editor**에서 실행
4. **Storage** 탭 → New Bucket → 이름: `post-images`, Public: ✅

### 2. 환경변수 설정
```bash
cp .env.example .env
```
`.env` 파일을 열고:
- `VITE_SUPABASE_URL`: Project Settings > API > Project URL
- `VITE_SUPABASE_ANON_KEY`: Project Settings > API > anon public key

### 3. 실행
```bash
npm install
npm run dev
```
→ http://localhost:5173 에서 확인

---

## 기능
- ✅ 회원가입 / 로그인 (닉네임 + 비밀번호)
- ✅ 사진 업로드 + 별점 + 리뷰 작성
- ✅ 피드 (최신순 / 인기순 / 별점순)
- ✅ 좋아요
- ✅ 댓글 작성

## 향후 추가할 수 있는 것
- [ ] 카테고리 태그
- [ ] 검색
- [ ] 프로필 페이지
- [ ] 별점 재투표 기능
- [ ] 알림

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './index.css'
import Navbar from './components/Navbar'
import Feed from './pages/Feed'
import Upload from './pages/Upload'
import { Login, Signup } from './pages/Auth'

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ra_user')) } catch { return null }
  })

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('ra_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('ra_user')
  }

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Feed currentUser={user} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
        <Route path="/upload" element={<Upload currentUser={user} />} />
      </Routes>
    </BrowserRouter>
  )
}

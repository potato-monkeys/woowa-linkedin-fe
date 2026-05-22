import { useState } from 'react'

export default function Sidebar({
  user,
  requestCount,
  onEditProfile,
  onLogout,
  activeTab,
  setActiveTab,
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const navItems = [
    {
      id: 'home',
      label: '홈',
      badge: null,
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'requests',
      label: '요청',
      badge: requestCount,
      badgeColor: 'orange',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: 'messages',
      label: '쪽지',
      badge: 3, // Reference image shows green badge 3 for 쪽지
      badgeColor: 'green',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: 'mypage',
      label: '마이페이지',
      badge: null,
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ]

  const handleTabClick = (item) => {
    if (item.id === 'mypage') {
      onEditProfile()
    } else {
      setActiveTab(item.id)
    }
  }

  return (
    <aside className="app-sidebar">
      {/* Top logo & visual network graphic */}
      <div className="sidebar-brand">
        <h1 className="brand-logo-text">크루링</h1>
        <div className="brand-graphic">
          <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 30L35 15" stroke="#ccc" strokeWidth="1.5" strokeDasharray="2 2" />
            <path d="M35 15L50 22" stroke="#ccc" strokeWidth="1.5" strokeDasharray="2 2" />
            <path d="M20 30L50 22" stroke="#ccc" strokeWidth="1.5" strokeDasharray="2 2" />
            
            {/* Left node - orange */}
            <circle cx="20" cy="30" r="4" fill="#ff9f7a" />
            {/* Top node - green with white smile */}
            <circle cx="35" cy="15" r="6" fill="#3ba776" />
            <circle cx="33" cy="14" r="0.7" fill="#fff" />
            <circle cx="37" cy="14" r="0.7" fill="#fff" />
            <path d="M33 17C33.5 18 36.5 18 37 17" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" />
            {/* Right node - blue */}
            <circle cx="50" cy="22" r="4.5" fill="#6ba8ff" />
          </svg>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isItemActive = activeTab === item.id || (item.id === 'mypage' && activeTab === 'profile-modal-open')
          return (
            <button
              key={item.id}
              className={`sidebar-nav-btn ${isItemActive ? 'is-active' : ''}`}
              type="button"
              onClick={() => handleTabClick(item)}
            >
              <span className="btn-icon-wrapper">{item.icon}</span>
              <span className="btn-label">{item.label}</span>
              {item.badge ? (
                <span className={`btn-badge badge-${item.badgeColor}`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>

      {/* User profile dropdown drawer */}
      <div className="sidebar-profile-wrapper">
        <button
          className="sidebar-profile-trigger"
          type="button"
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        >
          <div className="sidebar-avatar">
            {user.emoji || '😎'}
          </div>
          <span className="sidebar-nickname">{user.nickname || '해나'}</span>
          <svg
            className={`sidebar-arrow-icon ${isProfileMenuOpen ? 'is-open' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isProfileMenuOpen ? (
          <>
            <div className="sidebar-dropdown-backdrop" onClick={() => setIsProfileMenuOpen(false)} />
            <div className="sidebar-dropdown-menu">
              <button
                className="dropdown-item"
                type="button"
                onClick={() => {
                  onEditProfile()
                  setIsProfileMenuOpen(false)
                }}
              >
                프로필 수정
              </button>
              <hr className="dropdown-divider" />
              <button
                className="dropdown-item logout-btn"
                type="button"
                onClick={() => {
                  onLogout()
                  setIsProfileMenuOpen(false)
                }}
              >
                나가기
              </button>
            </div>
          </>
        ) : null}
      </div>
    </aside>
  )
}

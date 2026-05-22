import { useState } from 'react'

export default function Navbar({
  user,
  requestCount,
  onEditProfile,
  onLogout,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
  }

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        {/* Left Side: Brand Logo and Navigation Tabs */}
        <div className="navbar-left">
          <div className="navbar-brand" onClick={() => handleTabClick('home')} style={{ cursor: 'pointer' }}>
            <h1 className="brand-logo-text">크루링</h1>
            <div className="brand-graphic">
              <svg width="45" height="30" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 30L35 15" stroke="#ccc" strokeWidth="1.5" strokeDasharray="2 2" />
                <path d="M35 15L50 22" stroke="#ccc" strokeWidth="1.5" strokeDasharray="2 2" />
                <path d="M20 30L50 22" stroke="#ccc" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx="20" cy="30" r="4" fill="#ff9f7a" />
                <circle cx="35" cy="15" r="6" fill="#3ba776" />
                <circle cx="33" cy="14" r="0.7" fill="#fff" />
                <circle cx="37" cy="14" r="0.7" fill="#fff" />
                <path d="M33 17C33.5 18 36.5 18 37 17" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" />
                <circle cx="50" cy="22" r="4.5" fill="#6ba8ff" />
              </svg>
            </div>
          </div>

          <nav className="navbar-nav">
            <button
              className={`navbar-nav-btn ${activeTab === 'home' ? 'is-active' : ''}`}
              type="button"
              onClick={() => handleTabClick('home')}
            >
              홈
            </button>
            <button
              className={`navbar-nav-btn ${activeTab === 'requests' ? 'is-active' : ''}`}
              type="button"
              onClick={() => handleTabClick('requests')}
            >
              요청
              {requestCount > 0 ? (
                <span className="navbar-badge badge-orange">{requestCount}</span>
              ) : null}
            </button>
          </nav>
        </div>

        {/* Right Side: Search Bar, Message Box, Profile Dropdown */}
        <div className="navbar-right">
          {/* Search bar inside the navbar */}
          <div className="navbar-search">
            <span className="navbar-search-icon">🔍</span>
            <input
              type="search"
              placeholder="크루 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Messages inbox button */}
          <button
            className={`navbar-action-btn messages-btn ${activeTab === 'messages' ? 'is-active' : ''}`}
            type="button"
            onClick={() => handleTabClick(activeTab === 'messages' ? 'home' : 'messages')}
            aria-label="쪽지함"
          >
            <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="navbar-badge badge-green">3</span>
          </button>

          {/* Profile trigger and dropdown menu */}
          <div className="navbar-profile-wrapper">
            <button
              className="navbar-profile-trigger"
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <div className="navbar-avatar">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt={`${user.nickname || '내'} 프로필`} />
                ) : (
                  user.emoji || '😎'
                )}
              </div>
              <span className="navbar-nickname">{user.nickname || '해나'}</span>
              <svg
                className={`navbar-arrow-icon ${isProfileMenuOpen ? 'is-open' : ''}`}
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
                <div className="navbar-dropdown-backdrop" onClick={() => setIsProfileMenuOpen(false)} />
                <div className="navbar-dropdown-menu">
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {
                      onEditProfile()
                      setIsProfileMenuOpen(false)
                    }}
                  >
                    정보 수정
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
                    로그아웃
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

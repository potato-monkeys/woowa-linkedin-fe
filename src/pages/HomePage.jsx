import { useState } from 'react'
import ActivityLog from '../components/home/ActivityLog.jsx'
import MissionBanner from '../components/home/MissionBanner.jsx'
import Sidebar from '../components/home/Sidebar.jsx'
import NetworkGraph from '../components/home/NetworkGraph.jsx'
import ProfileModal from '../components/home/ProfileModal.jsx'
import DailySwipeOverlay from '../components/home/DailySwipeOverlay.jsx'
import RequestsPanel from '../components/home/RequestsPanel.jsx'
import StatsPanel from '../components/home/StatsPanel.jsx'
import {
  activityTone,
  crews,
  currentUserFallback,
  initialRelations,
  initialRequests,
} from '../data/mockData.js'

const getStoredUser = () => {
  try {
    const storedUser = window.localStorage.getItem('crewling-user')
    return storedUser ? JSON.parse(storedUser) : currentUserFallback
  } catch {
    return currentUserFallback
  }
}

export default function HomePage({ onNavigate }) {
  const [user, setUser] = useState(getStoredUser)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [relations, setRelations] = useState(initialRelations)
  const [requests, setRequests] = useState(initialRequests)
  const [selectedCrewId, setSelectedCrewId] = useState('tommy')
  const [toast, setToast] = useState('')
  
  // Daily swipe event completed check
  const todayStr = new Date().toISOString().split('T')[0];
  const [isDailySwipeCompleted, setIsDailySwipeCompleted] = useState(() => {
    try {
      const completedDate = window.localStorage.getItem('crewling-daily-swipe-date');
      return completedDate === todayStr;
    } catch {
      return false;
    }
  });

  const handleCompleteDailySwipe = () => {
    try {
      window.localStorage.setItem('crewling-daily-swipe-date', todayStr);
    } catch (e) {}
    setIsDailySwipeCompleted(true);
  };

  const handleAcceptCrewFromSwipe = (crew) => {
    const tone = crew.tone || 'green';
    setRelations((currentRelations) => {
      const exists = currentRelations.some((relation) => relation.crewId === crew.id)
      if (!exists) {
        return [...currentRelations, { crewId: crew.id, weight: 2, activity: '커피', tone }]
      }
      return currentRelations.map((relation) =>
        relation.crewId === crew.id
          ? {
              ...relation,
              weight: Math.min(relation.weight + 1, 5),
            }
          : relation,
      )
    })
    setSelectedCrewId(crew.id)
    showToast(`${crew.name} 크루와 새로운 연결이 생겼어요!`)
  }

  // Navigation Tabs State
  const [activeTab, setActiveTab] = useState('home') // 'home', 'requests', 'messages'
  const [subTab, setSubTab] = useState('graph') // 'graph' (인맥 지도)
  const [searchQuery, setSearchQuery] = useState('')

  const connectedCount = Math.min(3, 2 + initialRequests.length - requests.length)

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const handleLogout = () => {
    window.localStorage.removeItem('crewling-user')
    onNavigate('/login')
  }

  const handleSaveProfile = (nextUser) => {
    setUser(nextUser)
    window.localStorage.setItem('crewling-user', JSON.stringify(nextUser))
    setIsProfileModalOpen(false)
    showToast('프로필을 저장했어요.')
  }

  const handleRequest = (crewId, activity) => {
    const crew = crews.find((item) => item.id === crewId)
    setSelectedCrewId(crewId)
    showToast(`${crew.name}에게 ${activity} 요청을 보냈어요.`)
  }

  const handleAccept = (request) => {
    const tone = activityTone[request.activity] ?? 'green'
    const crew = crews.find((item) => item.id === request.crewId)

    setRequests((currentRequests) => currentRequests.filter((item) => item.id !== request.id))
    setRelations((currentRelations) => {
      const exists = currentRelations.some((relation) => relation.crewId === request.crewId)

      if (!exists) {
        return [...currentRelations, { crewId: request.crewId, weight: 2, activity: request.activity, tone }]
      }

      return currentRelations.map((relation) =>
        relation.crewId === request.crewId
          ? {
              ...relation,
              weight: Math.min(relation.weight + 1, 5),
              activity: request.activity,
              tone,
            }
          : relation,
      )
    })
    setSelectedCrewId(request.crewId)
    showToast(`${crew.name}와 ${request.activity} 연결이 반영됐어요.`)
  }

  const handleReject = (requestId) => {
    setRequests((currentRequests) => currentRequests.filter((item) => item.id !== requestId))
    showToast('요청을 정리했어요.')
  }

  // Filter relations or crews by search query if applicable
  const filteredRelations = searchQuery
    ? relations.filter((rel) => {
        const crew = crews.find((c) => c.id === rel.crewId)
        return crew?.name.toLowerCase().includes(searchQuery.toLowerCase())
      })
    : relations

  // Active Main/Menu tab mapping
  const handleNavbarTabChange = (tabId) => {
    setActiveTab(tabId)
    if (tabId === 'recommend') {
      setSubTab('recommend')
    } else if (tabId === 'home') {
      setSubTab('graph')
    }
  }

  return (
    <div className="dashboard-app-container">
      {!isDailySwipeCompleted ? (
        <DailySwipeOverlay
          onAcceptCrew={handleAcceptCrewFromSwipe}
          onComplete={handleCompleteDailySwipe}
        />
      ) : null}

      {/* Left Sidebar */}
      <Sidebar
        user={user}
        requestCount={requests.length}
        onEditProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="dashboard-main-content">
        {/* Top Header Row from Mockup */}
        <header className="dashboard-header-row">
          <div className="header-titles">
            <h1 className="header-title">나의 크루 네트워크</h1>
            <p className="header-subtitle">함께한 활동이 쌓일수록 관계 지도가 선명해져요</p>
          </div>
          
          <div className="header-actions">
            {/* Search Input */}
            <label className="header-search">
              <span className="search-icon">🔍</span>
              <input
                type="search"
                placeholder="크루 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
            
            {/* Connection badge status */}
            <div className="today-connection-badge">
              <span className="badge-star">★</span> 오늘의 연결 {connectedCount}/3
            </div>
            
            {/* Notification Bell */}
            <button className="header-notification-btn" type="button" aria-label="알림">
              <svg className="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="bell-dot" />
            </button>
          </div>
        </header>

        {activeTab === 'messages' ? (
          /* Messages Inbox View */
          <section className="inbox-view-container">
            <div className="inbox-card side-card">
              <div className="side-card-header">
                <h2>✉️ 쪽지함</h2>
                <span className="unread-pill">99+</span>
              </div>
              <div className="inbox-messages-list">
                <div className="inbox-item active">
                  <div className={`inbox-avatar node-${crews.find(c => c.id === 'tommy')?.tone || 'green'}`}>
                    {crews.find(c => c.id === 'tommy')?.emoji}
                  </div>
                  <div className="inbox-body">
                    <strong>토미</strong>
                    <p>리팩터링 미션 내일 시간 되시나요? 커피 한잔 해요!</p>
                  </div>
                  <span className="inbox-time">10분 전</span>
                </div>
                <div className="inbox-item">
                  <div className={`inbox-avatar node-${crews.find(c => c.id === 'pobi')?.tone || 'blue'}`}>
                    {crews.find(c => c.id === 'pobi')?.emoji}
                  </div>
                  <div className="inbox-body">
                    <strong>포비</strong>
                    <p>안녕하세요! 밥약 신청 수락해주셔서 감사합니다.</p>
                  </div>
                  <span className="inbox-time">3시간 전</span>
                </div>
                <div className="inbox-item">
                  <div className={`inbox-avatar node-${crews.find(c => c.id === 'jeje')?.tone || 'green'}`}>
                    {crews.find(c => c.id === 'jeje')?.emoji}
                  </div>
                  <div className="inbox-body">
                    <strong>제제</strong>
                    <p>술 미션 장소 공유해 드립니다!</p>
                  </div>
                  <span className="inbox-time">어제</span>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* Home Dashboard View */
          <div className="home-dashboard-layout">
            <div className="dashboard-main-grid">
              {/* Left Stage: Graph & Stats */}
              <div className="dashboard-stage-area">
                <NetworkGraph
                  relations={filteredRelations}
                  selectedCrewId={selectedCrewId}
                  onSelectCrew={setSelectedCrewId}
                  onRequest={handleRequest}
                />
                <StatsPanel relationsCount={relations.length} />
              </div>

              {/* Right Rail: Requests only */}
              <aside className="dashboard-right-rail">
                {/* Received Requests Panel */}
                <RequestsPanel
                  requests={requests}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              </aside>
            </div>
          </div>
        )}
      </main>

      {toast ? <div className="activity-toast">{toast}</div> : null}
      {isProfileModalOpen ? (
        <ProfileModal
          user={user}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleSaveProfile}
        />
      ) : null}
    </div>
  )
}

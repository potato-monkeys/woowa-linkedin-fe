import { useState, useEffect } from 'react'
import ActivityLog from '../components/home/ActivityLog.jsx'
import MissionBanner from '../components/home/MissionBanner.jsx'
import Navbar from '../components/home/Navbar.jsx'
import NetworkGraph from '../components/home/NetworkGraph.jsx'
import ProfileModal from '../components/home/ProfileModal.jsx'
import DailySwipeOverlay from '../components/home/DailySwipeOverlay.jsx'
import RequestsPanel from '../components/home/RequestsPanel.jsx'
import StatsPanel from '../components/home/StatsPanel.jsx'

import { userApi } from '../api/user.js'
import { relationApi } from '../api/relation.js'
import { recommendationApi } from '../api/recommendation.js'
import { swipeApi } from '../api/swipe.js'
import { messageApi } from '../api/message.js'

import {
  activityTone,
  crews as mockCrews,
  currentUserFallback,
  initialRelations as mockRelations,
  initialRequests as mockRequests,
} from '../data/mockData.js'

// --- HELPER MAPPERS FOR ROBUST API BINDINGS ---
const mapCrewFromServer = (serverCrew, index) => {
  const tones = ['green', 'coral', 'blue', 'yellow']
  const emojis = ['😊', '😁', '🤓', '😄', '😎', '🥳', '🤔', '😴', '🤖', '🦊']
  
  const angle = (index * 2 * Math.PI) / 8
  const defaultX = Math.round(50 + 30 * Math.cos(angle))
  const defaultY = Math.round(50 + 30 * Math.sin(angle))

  return {
    id: serverCrew.id || serverCrew.userId || String(index),
    name: serverCrew.nickname || serverCrew.name || '크루',
    nickname: serverCrew.nickname || serverCrew.name || '크루',
    emoji: serverCrew.emoji || emojis[index % emojis.length],
    cohort: serverCrew.cohort || '6기',
    track: serverCrew.track || (index % 2 === 0 ? '프론트엔드' : '백엔드'),
    bio: serverCrew.introduction || serverCrew.bio || '함께 공부하고 있어요.',
    note: serverCrew.note || '새로운 크루와 대화해보세요!',
    x: serverCrew.x !== undefined ? serverCrew.x : defaultX,
    y: serverCrew.y !== undefined ? serverCrew.y : defaultY,
    tone: serverCrew.tone || tones[index % tones.length],
    score: serverCrew.score || 0,
    activities: serverCrew.activities || [],
  }
}

const mapRelationFromServer = (serverRel) => {
  const activityTypes = ['follow', 'message', 'coffee', 'meal', 'drink']
  const type = serverRel.type?.toLowerCase() || 'message'
  const activityMap = {
    follow: '팔로우',
    message: '쪽지',
    coffee: '커피',
    meal: '밥',
    drink: '술',
  }
  const toneMap = {
    follow: 'blue',
    message: 'blue',
    coffee: 'green',
    meal: 'yellow',
    drink: 'green',
  }

  return {
    crewId: serverRel.crewId || serverRel.targetId || serverRel.partnerId || '',
    weight: serverRel.weight || 1,
    activity: serverRel.activity || activityMap[type] || '쪽지',
    tone: serverRel.tone || toneMap[type] || 'blue',
    type: type,
  }
}

const mapRequestFromServer = (serverReq) => {
  const activityMap = {
    FOLLOW: '팔로우',
    MESSAGE: '쪽지',
    COFFEE: '커피',
    MEAL: '밥',
    DRINK: '술',
  }

  const rawActivity = serverReq.activity || serverReq.activityType || 'COFFEE'
  const activity = activityMap[rawActivity] || rawActivity

  return {
    id: serverReq.id || String(Math.random()),
    crewId: serverReq.senderId || serverReq.crewId || '',
    activity: activity,
    time: serverReq.createdAt ? formatTime(serverReq.createdAt) : '방금 전',
  }
}

const mapRoomFromServer = (serverRoom, index, crews) => {
  const partnerId = serverRoom.partnerId || serverRoom.partner?.id || ''
  const partner = crews.find((c) => c.id === partnerId) || serverRoom.partner || {}
  return {
    partnerId: partnerId,
    name: partner.nickname || partner.name || '알 수 없는 크루',
    emoji: partner.emoji || '👤',
    tone: partner.tone || 'green',
    lastMessage: serverRoom.lastMessage?.content || serverRoom.lastMessage || '대화가 없습니다.',
    time: serverRoom.lastMessage?.createdAt || serverRoom.updatedAt
      ? formatTime(serverRoom.lastMessage?.createdAt || serverRoom.updatedAt)
      : '',
    unreadCount: serverRoom.unreadCount || 0,
  }
}

const mapMessageFromServer = (serverMsg) => {
  return {
    id: serverMsg.id || String(Math.random()),
    senderId: serverMsg.senderId || '',
    receiverId: serverMsg.receiverId || '',
    content: serverMsg.content || '',
    time: serverMsg.createdAt ? new Date(serverMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '방금 전',
  }
}

function formatTime(dateStr) {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}시간 전`
    return `${Math.floor(diffHours / 24)}일 전`
  } catch (e) {
    return '방금 전'
  }
}

export default function HomePage({ onNavigate }) {
  const [user, setUser] = useState(currentUserFallback)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [crewsList, setCrewsList] = useState([])
  const [relations, setRelations] = useState([])
  const [requests, setRequests] = useState([])
  const [selectedCrewId, setSelectedCrewId] = useState('tommy')
  const [toast, setToast] = useState('')

  // Message Inbox states
  const [rooms, setRooms] = useState([])
  const [activeRoomPartnerId, setActiveRoomPartnerId] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  
  // Daily swipe event completed check
  const todayStr = new Date().toISOString().split('T')[0]
  const [isDailySwipeCompleted, setIsDailySwipeCompleted] = useState(() => {
    try {
      const completedDate = window.localStorage.getItem('crewling-daily-swipe-date')
      return completedDate === todayStr
    } catch {
      return false
    }
  })
  const [swipeCandidates, setSwipeCandidates] = useState([])

  const handleCompleteDailySwipe = () => {
    try {
      window.localStorage.setItem('crewling-daily-swipe-date', todayStr)
    } catch (e) {}
    setIsDailySwipeCompleted(true)
  }

  // --- API DATA FETCHING ---
  const refreshAllData = async () => {
    try {
      // 1. Fetch Profile
      const me = await userApi.getMe()
      setUser({
        id: me.id || me.userId || 'me',
        nickname: me.nickname || me.name || '해나',
        bio: me.introduction || me.bio || '프론트엔드와 커피 산책을 좋아해요',
        emoji: me.emoji || '😎',
      })
    } catch (e) {
      console.error('Failed to load user profile, redirecting to login:', e)
      window.localStorage.removeItem('crewling-token')
      onNavigate('/login')
      return
    }

    // 2. Fetch all crews
    let allCrews = []
    try {
      const response = await userApi.getCrews()
      if (Array.isArray(response)) {
        allCrews = response
      }
    } catch (e) {
      console.warn('getCrews failed, fallback to mock:', e)
    }
    if (allCrews.length === 0) {
      allCrews = mockCrews
    }
    const mappedCrews = allCrews.map((c, idx) => mapCrewFromServer(c, idx))
    setCrewsList(mappedCrews)

    // 3. Fetch Relations
    let fetchedRelations = []
    try {
      const response = await relationApi.getRelations()
      if (Array.isArray(response)) {
        fetchedRelations = response
      }
    } catch (e) {
      console.warn('getRelations failed, fallback to mock:', e)
    }
    if (fetchedRelations.length === 0) {
      fetchedRelations = mockRelations
    }
    setRelations(fetchedRelations.map((r) => mapRelationFromServer(r)))

    // 4. Fetch Requests
    let fetchedRequests = []
    try {
      const response = await relationApi.getReceivedRequests()
      if (Array.isArray(response)) {
        fetchedRequests = response
      }
    } catch (e) {
      console.warn('getReceivedRequests failed, fallback to mock:', e)
    }
    if (fetchedRequests.length === 0) {
      fetchedRequests = mockRequests
    }
    setRequests(fetchedRequests.map(mapRequestFromServer))

    // 5. Fetch Swipe Candidates if not completed
    if (!isDailySwipeCompleted) {
      let recommendations = []
      try {
        const response = await recommendationApi.getRecommendations()
        if (Array.isArray(response)) {
          recommendations = response
        }
      } catch (e) {
        console.warn('getRecommendations failed:', e)
      }
      
      let candidateCrews = recommendations.slice(0, 3).map((r, idx) => mapCrewFromServer(r, idx))
      if (candidateCrews.length === 0) {
        candidateCrews = ['luna', 'pobi', 'hari'].map((id) => mappedCrews.find((c) => c.id === id)).filter(Boolean)
      }
      setSwipeCandidates(candidateCrews)
    }

    // 6. Fetch Rooms
    try {
      const fetchedRooms = await messageApi.getRooms()
      if (Array.isArray(fetchedRooms)) {
        setRooms(fetchedRooms.map((r, idx) => mapRoomFromServer(r, idx, mappedCrews)))
      }
    } catch (e) {
      console.warn('getRooms failed:', e)
    }
  }

  useEffect(() => {
    refreshAllData()
  }, [isDailySwipeCompleted])

  // --- FETCH MESSAGES FOR ACTIVE ROOM ---
  useEffect(() => {
    if (!activeRoomPartnerId) return

    let active = true
    async function loadMessages() {
      try {
        const msgs = await messageApi.getMessages(activeRoomPartnerId)
        if (active && Array.isArray(msgs)) {
          setChatMessages(msgs.map(mapMessageFromServer))
        }
      } catch (e) {
        console.warn('getMessages failed:', e)
      }
    }
    loadMessages()
    return () => {
      active = false
    }
  }, [activeRoomPartnerId])

  // --- MESSAGE SEND HANDLING ---
  const handleSendMessage = async (content) => {
    if (!content.trim() || !activeRoomPartnerId) return
    try {
      await messageApi.sendMessage({ receiverId: activeRoomPartnerId, content })
      
      // Reload message thread
      const msgs = await messageApi.getMessages(activeRoomPartnerId)
      setChatMessages(msgs.map(mapMessageFromServer))
      
      // Reload rooms to update last message preview
      const fetchedRooms = await messageApi.getRooms()
      if (Array.isArray(fetchedRooms)) {
        setRooms(fetchedRooms.map((r, idx) => mapRoomFromServer(r, idx, crewsList)))
      }

      // Reload relations because messaging adds MESSAGE(2점) weight
      const rels = await relationApi.getRelations()
      if (Array.isArray(rels)) {
        setRelations(rels.map((r) => mapRelationFromServer(r)))
      }
    } catch (e) {
      console.error(e)
      showToast('쪽지 발송에 실패했습니다.')
    }
  }

  // --- SWIPE EVENTS FROM OVERLAY ---
  const handleAcceptCrewFromSwipe = async (crew) => {
    try {
      await swipeApi.createSwipe({
        targetId: crew.id,
        action: 'PROPOSE',
        activityType: 'COFFEE',
      })
      showToast(`${crew.name} 크루에게 커피 약속 제안을 보냈어요!`)
      // Refresh relations
      const rels = await relationApi.getRelations()
      if (Array.isArray(rels)) {
        setRelations(rels.map((r) => mapRelationFromServer(r)))
      }
    } catch (e) {
      console.error(e)
      showToast('약속 제안 전송에 실패했습니다.')
    }
  }

  const handleRejectCrewFromSwipe = async (crew) => {
    try {
      await swipeApi.createSwipe({
        targetId: crew.id,
        action: 'PASS',
      })
    } catch (e) {
      console.error(e)
    }
  }

  // Navigation Tabs State
  const [activeTab, setActiveTab] = useState('home') // 'home', 'requests', 'messages'
  const [searchQuery, setSearchQuery] = useState('')

  const connectedCount = Math.min(3, relations.length)

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const handleLogout = () => {
    window.localStorage.removeItem('crewling-token')
    window.localStorage.removeItem('crewling-user')
    onNavigate('/login')
  }

  const handleSaveProfile = async (nextUser) => {
    try {
      const updated = await userApi.updateMe({
        nickname: nextUser.nickname,
        introduction: nextUser.bio,
      })

      const mappedUser = {
        nickname: updated.nickname || nextUser.nickname,
        bio: updated.introduction || updated.bio || nextUser.bio,
        emoji: updated.emoji || user.emoji || '😎',
      }

      setUser(mappedUser)
      window.localStorage.setItem('crewling-user', JSON.stringify(mappedUser))
      setIsProfileModalOpen(false)
      showToast('프로필을 저장했어요.')
    } catch (e) {
      console.error(e)
      showToast('프로필 수정에 실패했습니다.')
    }
  }

  const handleRequest = async (crewId, activity) => {
    if (activity === '쪽지') {
      setActiveTab('messages')
      setActiveRoomPartnerId(crewId)
      return
    }

    try {
      const typeMap = {
        커피: 'COFFEE',
        밥: 'MEAL',
        술: 'DRINK',
      }
      await swipeApi.createSwipe({
        targetId: crewId,
        action: 'PROPOSE',
        activityType: typeMap[activity] || 'COFFEE',
      })
      const crewName = crewsList.find((c) => c.id === crewId)?.name || '크루'
      showToast(`${crewName}에게 ${activity} 요청을 보냈어요.`)
      
      // Refresh requests and relations
      const rels = await relationApi.getRelations()
      if (Array.isArray(rels)) {
        setRelations(rels.map((r) => mapRelationFromServer(r)))
      }
    } catch (e) {
      console.error(e)
      showToast('요청 발송에 실패했습니다.')
    }
  }

  const handleAccept = async (request) => {
    try {
      await relationApi.acceptRequest(request.id)
      
      // Reload received requests
      const reqs = await relationApi.getReceivedRequests()
      setRequests(reqs.map(mapRequestFromServer))
      
      // Reload relations
      const rels = await relationApi.getRelations()
      setRelations(rels.map((r) => mapRelationFromServer(r)))
      
      const crew = crewsList.find((item) => item.id === request.crewId)
      showToast(`${crew?.name || '크루'}와 ${request.activity} 연결이 반영됐어요.`)
    } catch (e) {
      console.error(e)
      showToast('요청 수락에 실패했습니다.')
    }
  }

  const handleReject = async (requestId) => {
    try {
      await relationApi.rejectRequest(requestId)
      
      // Reload requests
      const reqs = await relationApi.getReceivedRequests()
      setRequests(reqs.map(mapRequestFromServer))
      
      showToast('요청을 정리했어요.')
    } catch (e) {
      console.error(e)
      showToast('요청 거절에 실패했습니다.')
    }
  }

  // Filter relations or crews by search query if applicable
  const filteredRelations = searchQuery
    ? relations.filter((rel) => {
        const crew = crewsList.find((c) => c.id === rel.crewId)
        return crew?.name.toLowerCase().includes(searchQuery.toLowerCase())
      })
    : relations

  const activePartner = crewsList.find((c) => c.id === activeRoomPartnerId)

  return (
    <div className="dashboard-app-container">
      {!isDailySwipeCompleted && swipeCandidates.length > 0 ? (
        <DailySwipeOverlay
          candidates={swipeCandidates}
          onAcceptCrew={handleAcceptCrewFromSwipe}
          onRejectCrew={handleRejectCrewFromSwipe}
          onComplete={handleCompleteDailySwipe}
        />
      ) : null}

      {/* Top Navbar */}
      <Navbar
        user={user}
        requestCount={requests.length}
        onEditProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="dashboard-main-content">
        {/* Top Header Row */}
        <header className="dashboard-header-row">
          <div className="header-titles">
            <h1 className="header-title">나의 크루 네트워크</h1>
            <p className="header-subtitle">함께한 활동이 쌓일수록 관계 지도가 선명해져요</p>
          </div>
          
          <div className="header-actions">
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
          /* Messages Inbox View - Live Interactive Messenger Split View */
          <section className="inbox-view-container" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start', maxWidth: '960px', margin: '0 auto' }}>
            {/* Left Column: Chat rooms list */}
            <div className="inbox-card side-card" style={{ padding: '20px' }}>
              <div className="side-card-header" style={{ marginBottom: '16px' }}>
                <h2>✉️ 쪽지함</h2>
                {rooms.some((r) => r.unreadCount > 0) && (
                  <span className="unread-pill">
                    {rooms.reduce((acc, r) => acc + r.unreadCount, 0)}
                  </span>
                )}
              </div>
              <div className="inbox-messages-list" style={{ maxHeight: '440px', overflowY: 'auto' }}>
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <div
                      key={room.partnerId}
                      className={`inbox-item ${activeRoomPartnerId === room.partnerId ? 'active' : ''}`}
                      onClick={() => setActiveRoomPartnerId(room.partnerId)}
                      style={{ padding: '12px' }}
                    >
                      <div className={`inbox-avatar node-${room.tone}`} style={{ width: '38px', height: '38px', fontSize: '18px' }}>
                        {room.emoji}
                      </div>
                      <div className="inbox-body">
                        <strong>{room.name}</strong>
                        <p style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '130px',
                        }}>
                          {room.lastMessage}
                        </p>
                      </div>
                      <span className="inbox-time">{room.time}</span>
                    </div>
                  ))
                ) : (
                  <p className="empty-requests" style={{ textAlign: 'center', padding: '30px 0' }}>아직 대화방이 없습니다.</p>
                )}
              </div>
            </div>

            {/* Right Column: Chat Conversation Bubble Thread */}
            <div className="chat-thread-card" style={{
              background: 'white',
              border: '1px solid #edf2f7',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              height: '520px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)',
            }}>
              {activePartner ? (
                <>
                  {/* Chat Header */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #edf2f7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <div className={`inbox-avatar node-${activePartner.tone}`} style={{ width: '36px', height: '36px', fontSize: '18px' }}>
                      {activePartner.emoji}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>{activePartner.name}</h3>
                      <p style={{ margin: 0, fontSize: '11px', color: '#a0aec0' }}>{activePartner.cohort} · {activePartner.track}</p>
                    </div>
                  </div>

                  {/* Message History bubble list */}
                  <div style={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}>
                    {chatMessages.length > 0 ? (
                      chatMessages.map((msg, index) => {
                        const isMessageFromMe = msg.senderId === 'me' || (msg.senderId !== activePartner.id)

                        return (
                          <div
                            key={msg.id || index}
                            style={{
                              display: 'flex',
                              justifyContent: isMessageFromMe ? 'flex-end' : 'flex-start',
                              width: '100%',
                            }}
                          >
                            <div style={{
                              maxWidth: '70%',
                              padding: '10px 14px',
                              borderRadius: isMessageFromMe ? '14px 14px 0 14px' : '14px 14px 14px 0',
                              backgroundColor: isMessageFromMe ? '#3ba776' : '#f1f5f9',
                              color: isMessageFromMe ? 'white' : '#1e293b',
                              fontSize: '13px',
                              lineHeight: '1.4',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                            }}>
                              <div style={{ wordBreak: 'break-all' }}>{msg.content}</div>
                              <div style={{
                                fontSize: '9px',
                                textAlign: 'right',
                                color: isMessageFromMe ? 'rgba(255,255,255,0.7)' : '#a0aec0',
                                marginTop: '4px',
                              }}>
                                {msg.time}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', fontSize: '13px' }}>
                        첫 대화를 보내서 인맥 가중치를 늘려보세요! 💬
                      </div>
                    )}
                  </div>

                  {/* Send Input Form */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      const form = e.currentTarget
                      const input = form.elements.namedItem('content')
                      const text = input.value.trim()
                      if (text) {
                        await handleSendMessage(text)
                        input.value = ''
                      }
                    }}
                    style={{
                      padding: '16px 20px',
                      borderTop: '1px solid #edf2f7',
                      display: 'flex',
                      gap: '10px',
                    }}
                  >
                    <input
                      name="content"
                      type="text"
                      placeholder="메시지를 입력하세요..."
                      autoComplete="off"
                      style={{
                        flexGrow: 1,
                        padding: '10px 14px',
                        border: '1px solid #edf2f7',
                        borderRadius: '99px',
                        outline: 'none',
                        fontSize: '13px',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '8px 16px',
                        background: '#3ba776',
                        color: 'white',
                        border: 'none',
                        borderRadius: '99px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px',
                      }}
                    >
                      전송
                    </button>
                  </form>
                </>
              ) : (
                <div style={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a0aec0',
                  gap: '10px',
                  padding: '40px',
                }}>
                  <span style={{ fontSize: '32px' }}>💬</span>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>대화방을 선택하여 대화를 나눠보세요.</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', textAlign: 'center' }}>대화가 늘어날수록 인맥 지도의 가중치가 2점씩 늘어납니다.</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          /* Home Dashboard View */
          <div className="home-dashboard-layout">
            <div className="dashboard-main-grid">
              {/* Left Stage: Graph & Stats */}
              <div className="dashboard-stage-area">
                <NetworkGraph
                  crews={crewsList}
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
                  crews={crewsList}
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

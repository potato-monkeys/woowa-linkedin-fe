import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'

const GRAPH_WIDTH = 760
const GRAPH_HEIGHT = 500

const currentUserFallback = {
  nickname: '해나',
  bio: '프론트엔드와 커피 산책을 좋아해요',
}

const crews = [
  {
    id: 'tommy',
    name: '토미',
    emoji: '😊',
    cohort: '6기',
    track: '프론트엔드',
    bio: '커피챗과 리팩터링 이야기를 좋아해요',
    note: '이번 미션에서 비슷한 고민을 하고 있어요',
    x: 50,
    y: 17,
    tone: 'green',
    score: 72,
    activities: ['커피 1회', '밥 2회'],
  },
  {
    id: 'luna',
    name: '루나',
    emoji: '😁',
    cohort: '6기',
    track: '프론트엔드',
    bio: '프론트엔드와 산책을 좋아해요',
    note: '같은 미션을 했지만 아직 밥 기록은 없어요',
    x: 23,
    y: 34,
    tone: 'coral',
    score: 54,
    activities: ['쪽지 2회'],
  },
  {
    id: 'pobi',
    name: '포비',
    emoji: '🤓',
    cohort: '6기',
    track: '백엔드',
    bio: '테스트 코드와 조용한 대화를 좋아해요',
    note: '요청을 수락하면 첫 오프라인 연결이 생겨요',
    x: 18,
    y: 66,
    tone: 'blue',
    score: 28,
    activities: ['쪽지 1회'],
  },
  {
    id: 'hari',
    name: '하리',
    emoji: '😄',
    cohort: '6기',
    track: '프론트엔드',
    bio: '운동, 독서, 가벼운 회고를 좋아해요',
    note: '최근에 같은 리뷰어 피드백을 받았어요',
    x: 42,
    y: 82,
    tone: 'yellow',
    score: 35,
    activities: ['밥 1회'],
  },
  {
    id: 'river',
    name: '리버',
    emoji: '😎',
    cohort: '6기',
    track: '백엔드',
    bio: '백엔드와 프론트 연결 지점을 파고들어요',
    note: '같은 스터디에 있지만 아직 활동 기록이 적어요',
    x: 82,
    y: 38,
    tone: 'blue',
    score: 41,
    activities: ['팔로우'],
  },
  {
    id: 'jeje',
    name: '제제',
    emoji: '🥳',
    cohort: '6기',
    track: '풀스택',
    bio: '맛집 공유와 회고 대화를 좋아해요',
    note: '밥 요청으로 관계 점수를 올리기 좋아요',
    x: 73,
    y: 72,
    tone: 'green',
    score: 47,
    activities: ['커피 1회'],
  },
]

const initialRelations = [
  { crewId: 'tommy', weight: 4, activity: '커피', tone: 'green', type: 'coffee' },
  { crewId: 'luna', weight: 3, activity: '쪽지', tone: 'coral', type: 'message' },
  { crewId: 'pobi', weight: 2, activity: '쪽지', tone: 'blue', type: 'message' },
  { crewId: 'hari', weight: 2, activity: '밥', tone: 'yellow', type: 'meal' },
  { crewId: 'river', weight: 3, activity: '팔로우', tone: 'blue', type: 'follow' },
  { crewId: 'jeje', weight: 3, activity: '술', tone: 'green', type: 'drink' },
]

const secondaryLinks = [
  { source: 'luna', target: 'tommy', type: 'coffee', weight: 2 },
  { source: 'pobi', target: 'jeje', type: 'message', weight: 1 },
  { source: 'hari', target: 'river', type: 'meal', weight: 2 },
  { source: 'jeje', target: 'river', type: 'follow', weight: 1 },
]

const initialRequests = [
  { id: 'request-pobi', crewId: 'pobi', activity: '커피', time: '2시간 전' },
  { id: 'request-jeje', crewId: 'jeje', activity: '밥', time: '5시간 전' },
]

const activityTone = {
  쪽지: 'blue',
  커피: 'green',
  밥: 'yellow',
}

const relationColors = {
  follow: '#4ade80',
  message: '#60a5fa',
  coffee: '#fbbf24',
  meal: '#fb923c',
  drink: '#e879f9',
}

const getStoredUser = () => {
  try {
    const storedUser = window.localStorage.getItem('crewling-user')
    return storedUser ? JSON.parse(storedUser) : currentUserFallback
  } catch {
    return currentUserFallback
  }
}

function Sidebar({ user, requestCount, onEditProfile, onLogout }) {
  const navItems = [
    { label: '홈', badge: null, active: true },
    { label: '추천', badge: null },
    { label: '요청', badge: requestCount },
    { label: '쪽지', badge: 3 },
    { label: '마이페이지', badge: null },
  ]

  return (
    <aside className="app-sidebar">
      <div>
        <div className="app-logo">
          <span className="app-logo-mark" />
          <strong>크루링</strong>
        </div>

        <nav className="app-nav" aria-label="크루링 메뉴">
          {navItems.map((item) => (
            <button className={item.active ? 'is-active' : ''} type="button" key={item.label}>
              <span>{item.label}</span>
              {item.badge ? <em>{item.badge}</em> : null}
            </button>
          ))}
        </nav>
      </div>

      <div className="profile-switcher">
        <div className="profile-avatar">{user.nickname.slice(0, 1)}</div>
        <div>
          <strong>{user.nickname}</strong>
          <span>{user.bio || '나의 지도'}</span>
        </div>
        <div className="profile-actions">
          <button type="button" onClick={onEditProfile}>
            수정
          </button>
          <button type="button" onClick={onLogout} aria-label="로그아웃">
            나가기
          </button>
        </div>
      </div>
    </aside>
  )
}

function Header({ connectedCount }) {
  return (
    <header className="dashboard-header">
      <div>
        <h1>나의 크루 네트워크</h1>
        <p>함께한 활동이 쌓일수록 관계 지도가 선명해져요</p>
      </div>

      <div className="header-actions">
        <label className="search-field">
          <span>검색</span>
          <input type="search" placeholder="크루 검색" />
        </label>
        <div className="connection-chip">
          <span>오늘의 연결</span>
          <strong>{connectedCount}/3</strong>
        </div>
      </div>
    </header>
  )
}

function NetworkGraph({
  relations,
  selectedCrewId,
  onSelectCrew,
  onRequest,
}) {
  const svgRef = useRef(null)
  const simulationRef = useRef(null)
  const graphNodesRef = useRef([])
  const graphLinksRef = useRef([])
  const [draggingNodeId, setDraggingNodeId] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [graph, setGraph] = useState({ nodes: [], links: [] })
  const [viewport, setViewport] = useState({ x: 0, y: 0, k: 1 })
  const [panStart, setPanStart] = useState(null)
  const selectedCrew = crews.find((crew) => crew.id === selectedCrewId)

  const graphData = useMemo(() => {
    const nodes = [
      {
        id: 'me',
        name: '나',
        emoji: '😎',
        isMe: true,
        connections: relations.length,
        x: GRAPH_WIDTH * 0.5,
        y: GRAPH_HEIGHT * 0.55,
      },
      ...crews.map((crew) => ({
        ...crew,
        connections: relations.filter((relation) => relation.crewId === crew.id).length + 1,
        x: (crew.x / 100) * GRAPH_WIDTH,
        y: (crew.y / 100) * GRAPH_HEIGHT,
      })),
    ]
    const links = [
      ...relations.map((relation) => ({
        source: 'me',
        target: relation.crewId,
        type: relation.type,
        weight: relation.weight,
      })),
      ...secondaryLinks,
    ]

    return { nodes, links }
  }, [relations])

  useEffect(() => {
    let frameId = null
    const nodes = graphData.nodes.map((node) => ({ ...node }))
    const links = graphData.links.map((link) => ({ ...link }))

    graphNodesRef.current = nodes
    graphLinksRef.current = links

    const simulation = forceSimulation(nodes)
      .force(
        'link',
        forceLink(links)
          .id((node) => node.id)
          .distance((link) => 100 - link.weight * 10)
          .strength(0.34),
      )
      .force('charge', forceManyBody().strength(-350))
      .force(
        'collide',
        forceCollide()
          .radius((node) => (node.isMe ? 56 : 45))
          .strength(0.95)
          .iterations(3),
      )
      .force('center', forceCenter(GRAPH_WIDTH / 2, GRAPH_HEIGHT / 2))
      .force('x', forceX(GRAPH_WIDTH / 2).strength((node) => (node.isMe ? 0.08 : 0.025)))
      .force('y', forceY(GRAPH_HEIGHT / 2).strength((node) => (node.isMe ? 0.08 : 0.025)))
      .alpha(1)
      .alphaDecay(0.018)
      .velocityDecay(0.26)

    simulation.on('tick', () => {
      if (frameId) return

      frameId = window.requestAnimationFrame(() => {
        frameId = null
        setGraph({
          nodes: nodes.map((node) => ({ ...node })),
          links: links.map((link) => ({
            ...link,
            source: { ...link.source },
            target: { ...link.target },
          })),
        })
      })
    })

    simulationRef.current = simulation

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      simulation.stop()
    }
  }, [graphData])

  const getGraphPoint = (event) => {
    const svg = svgRef.current
    if (!svg) return { x: GRAPH_WIDTH / 2, y: GRAPH_HEIGHT / 2 }

    const rect = svg.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * GRAPH_WIDTH
    const y = ((event.clientY - rect.top) / rect.height) * GRAPH_HEIGHT

    return {
      x: (x - viewport.x) / viewport.k,
      y: (y - viewport.y) / viewport.k,
    }
  }

  const handleNodePointerDown = (event, nodeId) => {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDraggingNodeId(nodeId)
    const node = graphNodesRef.current.find((item) => item.id === nodeId)
    const point = getGraphPoint(event)

    if (node) {
      node.fx = point.x
      node.fy = point.y
      simulationRef.current?.alphaTarget(0.42).restart()
    }
  }

  const handlePointerMove = (event) => {
    if (draggingNodeId) {
      const node = graphNodesRef.current.find((item) => item.id === draggingNodeId)
      const point = getGraphPoint(event)

      if (node) {
        node.fx = Math.min(GRAPH_WIDTH - 34, Math.max(34, point.x))
        node.fy = Math.min(GRAPH_HEIGHT - 38, Math.max(38, point.y))
        simulationRef.current?.alphaTarget(0.42).restart()
      }
      return
    }

    if (panStart) {
      setViewport((currentViewport) => ({
        ...currentViewport,
        x: panStart.viewport.x + event.clientX - panStart.x,
        y: panStart.viewport.y + event.clientY - panStart.y,
      }))
    }
  }

  const handlePointerUp = (event) => {
    if (draggingNodeId) {
      const node = graphNodesRef.current.find((item) => item.id === draggingNodeId)

      if (node) {
        node.fx = null
        node.fy = null
      }
      simulationRef.current?.alphaTarget(0)
    }

    if (panStart) {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    }

    setDraggingNodeId(null)
    setPanStart(null)
  }

  const handleStagePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setPanStart({
      x: event.clientX,
      y: event.clientY,
      viewport,
    })
  }

  const handleWheel = (event) => {
    event.preventDefault()
    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const pointerX = ((event.clientX - rect.left) / rect.width) * GRAPH_WIDTH
    const pointerY = ((event.clientY - rect.top) / rect.height) * GRAPH_HEIGHT
    const nextK = Math.min(2.2, Math.max(0.72, viewport.k * (event.deltaY > 0 ? 0.92 : 1.08)))
    const graphX = (pointerX - viewport.x) / viewport.k
    const graphY = (pointerY - viewport.y) / viewport.k

    setViewport({
      k: nextK,
      x: pointerX - graphX * nextK,
      y: pointerY - graphY * nextK,
    })
  }

  return (
    <section className="graph-panel force-graph-panel" aria-labelledby="graph-title">
      <div className="graph-stage force-graph-stage">
        <div className="graph-title-row">
          <div>
            <h2 id="graph-title">관계 그래프</h2>
            <p>드래그하면 충돌 힘이 다시 계산되고, 간선은 실시간으로 따라와요</p>
          </div>
          <span>{Math.round(viewport.k * 100)}%</span>
        </div>

        <svg
          ref={svgRef}
          className="force-graph-svg"
          viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          role="img"
          aria-label="크루 관계 force 그래프"
          onPointerDown={handleStagePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
        >
          <defs>
            <linearGradient id="meNodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.70 0.20 350)" />
              <stop offset="100%" stopColor="oklch(0.70 0.18 300)" />
            </linearGradient>
            <filter id="cuteNodeShadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="oklch(0.70 0.20 350)" floodOpacity="0.18" />
            </filter>
          </defs>

          <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.k})`}>
            <g className="force-links">
              {graph.links.map((link, index) => (
                <motion.line
                  key={`${link.source.id}-${link.target.id}-${index}`}
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                  stroke={relationColors[link.type]}
                  strokeWidth={Math.max(2, link.weight * 2)}
                  strokeLinecap="round"
                  strokeDasharray={link.type === 'follow' ? '5 5' : '0'}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.7 }}
                  transition={{ duration: 0.5 }}
                />
              ))}
            </g>

            <g className="force-nodes">
              {graph.nodes.map((node) => (
                <motion.g
                  className={`force-node ${node.isMe ? 'is-me' : ''} ${
                    selectedCrewId === node.id ? 'is-selected' : ''
                  } ${draggingNodeId === node.id ? 'is-dragging' : ''}`}
                  key={node.id}
                  transform={`translate(${node.x} ${node.y})`}
                  onPointerDown={(event) => handleNodePointerDown(event, node.id)}
                  onPointerEnter={() => setHoveredNode(node)}
                  onPointerLeave={() => setHoveredNode(null)}
                  onClick={(event) => {
                    event.stopPropagation()
                    onSelectCrew(node.isMe ? null : node.id)
                  }}
                  whileHover={{ rotate: 10, scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                >
                  <circle
                    r={node.isMe ? 28 : 22}
                    fill={node.isMe ? 'url(#meNodeGradient)' : '#ffffff'}
                    stroke={node.isMe ? 'oklch(0.70 0.20 350)' : 'oklch(0.82 0.10 330)'}
                    strokeWidth={node.isMe ? 5 : 4}
                    filter="url(#cuteNodeShadow)"
                  />
                  <motion.text
                    className="node-emoji"
                    textAnchor="middle"
                    dominantBaseline="central"
                    animate={node.isMe ? { rotate: [0, 8, -8, 0] } : undefined}
                    transition={node.isMe ? { duration: 2, repeat: Infinity } : undefined}
                  >
                    {node.emoji}
                  </motion.text>
                  <text className="node-label" y={node.isMe ? 44 : 36} textAnchor="middle">
                    {node.name}
                  </text>
                </motion.g>
              ))}
            </g>
          </g>
        </svg>

        <AnimatePresence>
          {hoveredNode ? (
            <motion.div
              className="force-tooltip"
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              style={{
                left: `${Math.min(82, Math.max(12, ((hoveredNode.x * viewport.k + viewport.x) / GRAPH_WIDTH) * 100 + 2))}%`,
                top: `${Math.min(84, Math.max(14, ((hoveredNode.y * viewport.k + viewport.y) / GRAPH_HEIGHT) * 100 - 4))}%`,
              }}
            >
              <strong>{hoveredNode.name}</strong>
              <span>{hoveredNode.isMe ? '중앙 노드' : `${hoveredNode.cohort} · ${hoveredNode.track}`}</span>
              <em>연결 {hoveredNode.connections}</em>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {selectedCrew ? (
          <motion.div
            className="crew-popover force-profile-card"
            initial={{ opacity: 0, scale: 0.95, x: 12 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <div className={`popover-avatar node-${selectedCrew.tone}`}>
                {selectedCrew.emoji}
              </div>
              <div>
                <h3>{selectedCrew.name}</h3>
                <p>
                  {selectedCrew.cohort} · {selectedCrew.track}
                </p>
                <strong>관계 점수 {selectedCrew.score}</strong>
              </div>
            </div>
            <p>{selectedCrew.note}</p>
            <div className="quick-actions">
              <button type="button" onClick={() => onRequest(selectedCrew.id, '쪽지')}>
                쪽지
              </button>
              <button type="button" onClick={() => onRequest(selectedCrew.id, '커피')}>
                커피
              </button>
              <button type="button" onClick={() => onRequest(selectedCrew.id, '밥')}>
                밥
              </button>
            </div>
          </motion.div>
        ) : null}
      </div>

      <div className="network-stats" aria-label="이번 주 네트워크 요약">
        <div>
          <span>이번 주 새 연결</span>
          <strong>5</strong>
        </div>
        <div>
          <span>가장 많은 활동</span>
          <strong>밥</strong>
        </div>
        <div>
          <span>아직 가까워질 크루</span>
          <strong>18</strong>
        </div>
      </div>
    </section>
  )
}

function RecommendationCard({ crew, onNext, onRequest }) {
  return (
    <section className="side-card recommendation-card" aria-labelledby="recommend-title">
      <div className="side-card-header">
        <h2 id="recommend-title">오늘의 크루 추천</h2>
        <button type="button" onClick={onNext}>
          더보기
        </button>
      </div>

      <div className={`recommend-visual visual-${crew.tone}`}>
        <span>{crew.name.slice(0, 1)}</span>
      </div>

      <h3>{crew.name}</h3>
      <p>{crew.bio}</p>
      <div className="reason-box">{crew.note}</div>

      <div className="recommend-actions">
        <button type="button" onClick={onNext}>
          넘기기
        </button>
        <button type="button" onClick={() => onRequest(crew.id, '쪽지')}>
          쪽지
        </button>
        <button type="button" onClick={() => onRequest(crew.id, '커피')}>
          커피
        </button>
        <button type="button" onClick={() => onRequest(crew.id, '밥')}>
          밥
        </button>
      </div>
    </section>
  )
}

function RequestsPanel({ requests, onAccept, onReject }) {
  return (
    <section className="side-card requests-card" aria-labelledby="requests-title">
      <div className="side-card-header">
        <h2 id="requests-title">받은 요청</h2>
        <button type="button">더보기</button>
      </div>

      <div className="request-list">
        {requests.length ? (
          requests.map((request) => {
            const crew = crews.find((item) => item.id === request.crewId)

            return (
              <article className="request-item" key={request.id}>
                <div className={`request-avatar node-${crew.tone}`}>{crew.name.slice(0, 1)}</div>
                <div>
                  <strong>
                    {crew.name} · {request.activity} 요청
                  </strong>
                  <span>{request.time}</span>
                </div>
                <button type="button" onClick={() => onAccept(request)}>
                  수락
                </button>
                <button type="button" onClick={() => onReject(request.id)} aria-label={`${crew.name} 요청 거절`}>
                  ×
                </button>
              </article>
            )
          })
        ) : (
          <p className="empty-requests">지금은 확인할 요청이 없어요.</p>
        )}
      </div>
    </section>
  )
}

function ProfileModal({ user, onClose, onSave }) {
  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextUser = {
      nickname: formData.get('nickname')?.trim() || user.nickname,
      bio: formData.get('bio')?.trim() || user.bio,
    }

    onSave(nextUser)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">My Profile</p>
            <h2 id="profile-modal-title">프로필 수정</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="프로필 수정 닫기">
            ×
          </button>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            <span>닉네임</span>
            <input name="nickname" type="text" defaultValue={user.nickname} />
          </label>
          <label>
            <span>한 줄 소개</span>
            <textarea name="bio" defaultValue={user.bio || ''} rows="3" />
          </label>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              취소
            </button>
            <button type="submit">저장</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default function HomePage({ onNavigate }) {
  const [user, setUser] = useState(getStoredUser)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [relations, setRelations] = useState(initialRelations)
  const [requests, setRequests] = useState(initialRequests)
  const [selectedCrewId, setSelectedCrewId] = useState('tommy')
  const [recommendIndex, setRecommendIndex] = useState(1)
  const [toast, setToast] = useState('')

  const recommendedCrew = crews[recommendIndex % crews.length]
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

  return (
    <main className="dashboard-shell">
      <Sidebar
        user={user}
        requestCount={requests.length}
        onEditProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      <section className="dashboard-main">
        <Header connectedCount={connectedCount} />

        <div className="dashboard-content">
          <NetworkGraph
            relations={relations}
            selectedCrewId={selectedCrewId}
            onSelectCrew={setSelectedCrewId}
            onRequest={handleRequest}
          />

          <aside className="right-rail">
            <RecommendationCard
              crew={recommendedCrew}
              onNext={() => setRecommendIndex((index) => index + 1)}
              onRequest={handleRequest}
            />
            <RequestsPanel requests={requests} onAccept={handleAccept} onReject={handleReject} />
          </aside>
        </div>
      </section>

      {toast ? <div className="activity-toast">{toast}</div> : null}
      {isProfileModalOpen ? (
        <ProfileModal user={user} onClose={() => setIsProfileModalOpen(false)} onSave={handleSaveProfile} />
      ) : null}
    </main>
  )
}

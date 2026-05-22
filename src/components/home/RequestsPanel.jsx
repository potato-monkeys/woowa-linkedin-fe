import { crews } from '../../data/mockData.js'

export default function RequestsPanel({ requests, onAccept, onReject }) {
  const getActivityIcon = (activity) => {
    switch (activity) {
      case '커피':
        return <span className="request-activity-badge coffee">☕</span>
      case '밥':
        return <span className="request-activity-badge meal">🍴</span>
      case '쪽지':
        return <span className="request-activity-badge message">💬</span>
      default:
        return null
    }
  }

  return (
    <section className="side-card requests-card" aria-labelledby="requests-title">
      <div className="side-card-header">
        <h2 id="requests-title">받은 요청</h2>
        <button type="button" className="more-link">
          더보기 &gt;
        </button>
      </div>

      <div className="request-list">
        {requests.length ? (
          requests.map((request) => {
            const crew = crews.find((item) => item.id === request.crewId)
            if (!crew) return null

            return (
              <article className="request-item" key={request.id}>
                {/* Emoji avatar badge */}
                <div className={`request-avatar request-avatar-emoji node-${crew.tone || 'green'}`}>
                  {crew.emoji}
                </div>
                
                <div className="request-info">
                  <div className="request-text-row">
                    {getActivityIcon(request.activity)}
                    <strong className="request-title-text">
                      {crew.name} <span className="divider">·</span> <span className="activity-type">{request.activity} 요청</span>
                    </strong>
                  </div>
                  <span className="request-time">{request.time}</span>
                </div>

                <div className="request-actions">
                  <button className="accept-btn" type="button" onClick={() => onAccept(request)}>
                    수락
                  </button>
                  <button
                    className="reject-btn"
                    type="button"
                    onClick={() => onReject(request.id)}
                    aria-label={`${crew.name} 요청 거절`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
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

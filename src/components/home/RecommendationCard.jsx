export default function RecommendationCard({ crew, onNext, onRequest, isFullWidth = false }) {
  return (
    <section className={`side-card recommendation-card ${isFullWidth ? 'is-full-width' : ''}`} aria-labelledby="recommend-title">
      <div className="side-card-header">
        <h2 id="recommend-title">오늘의 크루 추천</h2>
        <button type="button" className="more-link" onClick={onNext}>
          더보기 &gt;
        </button>
      </div>

      {/* Recommended crew photo banner */}
      <div className="recommend-photo-wrapper">
        <img
          className="recommend-photo"
          src={crew.avatar}
          alt={`${crew.name} 사진`}
        />
      </div>

      <div className="recommend-profile-info">
        <h3 className="recommend-name">{crew.name}</h3>
        <p className="recommend-bio">{crew.bio}</p>
      </div>

      {/* Green notice badge box */}
      <div className="recommend-note-badge">
        <svg className="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span className="badge-text">{crew.note}</span>
      </div>

      {/* Premium 4-action card button row */}
      <div className="recommend-actions-grid">
        <button className="action-btn pass-btn" type="button" onClick={onNext}>
          <div className="action-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <span>넘기기</span>
        </button>

        <button className="action-btn message-btn" type="button" onClick={() => onRequest(crew.id, '쪽지')}>
          <div className="action-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span>쪽지</span>
        </button>

        <button className="action-btn coffee-btn" type="button" onClick={() => onRequest(crew.id, '커피')}>
          <div className="action-box">
            <span className="action-emoji">☕</span>
          </div>
          <span>커피</span>
        </button>

        <button className="action-btn meal-btn" type="button" onClick={() => onRequest(crew.id, '밥')}>
          <div className="action-box">
            <span className="action-emoji">🍴</span>
          </div>
          <span>밥</span>
        </button>
      </div>
    </section>
  )
}

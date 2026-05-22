import { useState } from 'react'

export default function MissionBanner({ connectedCount }) {
  const [isChallenged, setIsChallenged] = useState(false)
  const rate = Math.round((connectedCount / 3) * 100)

  return (
    <div className="mission-banner">
      <div className="mission-content">
        <span className="mission-party-emoji">🎉</span>
        <div className="mission-text-group">
          <h2 className="mission-title">오늘의 미션: 새로운 크루 3명과 밥약 잡기!</h2>
          <p className="mission-rate">
            달성률: <strong>{rate}%</strong> ({rate === 100 ? '완료! 대단해요 👏' : '화이팅...'})
          </p>
        </div>
      </div>
      <button
        className={`mission-challenge-btn ${isChallenged ? 'is-active' : ''}`}
        type="button"
        onClick={() => setIsChallenged(!isChallenged)}
      >
        <span className="fire-emoji">🔥</span>
        {isChallenged ? '도전 중!' : '도전하기'}
      </button>
    </div>
  )
}

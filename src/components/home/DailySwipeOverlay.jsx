import { useState } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react'
import { crews } from '../../data/mockData.js'

export default function DailySwipeOverlay({ onAcceptCrew, onComplete }) {
  const candidates = [
    crews.find((c) => c.id === 'luna'),
    crews.find((c) => c.id === 'pobi'),
    crews.find((c) => c.id === 'hari'),
  ].filter(Boolean)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [exitDirection, setExitDirection] = useState(null) // 'left', 'right', or null

  const currentCrew = candidates[currentIndex]

  // Swiping motion values
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5])

  // Floating text indicators
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  const handleSwipe = (accepted) => {
    if (accepted) {
      onAcceptCrew(currentCrew)
    }

    // Go to next card
    if (currentIndex + 1 < candidates.length) {
      setCurrentIndex((prev) => prev + 1)
      x.set(0) // reset motion value
      setExitDirection(null)
    } else {
      // Completed all 3!
      onComplete()
    }
  }

  const triggerButtonAction = (accepted) => {
    setExitDirection(accepted ? 'right' : 'left')
    // Animate card to side first, then advance index
    setTimeout(() => {
      handleSwipe(accepted)
    }, 250)
  }

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 120) {
      handleSwipe(true)
    } else if (info.offset.x < -120) {
      handleSwipe(false)
    }
  }

  if (!currentCrew) return null

  // Background style tone helper
  const getToneStyles = (tone) => {
    switch (tone) {
      case 'green':
        return { bg: '#eefbf3', border: '#3ba776', color: '#3ba776' }
      case 'coral':
        return { bg: '#fff3ee', border: '#ff9f7a', color: '#ff9f7a' }
      case 'blue':
        return { bg: '#edf5ff', border: '#6ba8ff', color: '#6ba8ff' }
      case 'yellow':
        return { bg: '#fffbeb', border: '#ffd66b', color: '#ffd66b' }
      default:
        return { bg: '#f8fafc', border: '#e2e8f0', color: '#4a5568' }
    }
  }

  const toneStyle = getToneStyles(currentCrew.tone)

  return (
    <div className="daily-swipe-overlay" role="dialog" aria-modal="true" aria-labelledby="swipe-title">
      <div className="swipe-header-area">
        <span className="swipe-badge">EVENT</span>
        <h2 id="swipe-title">오늘의 크루 소개팅 💖</h2>
        <p className="swipe-subtitle">
          매일 3명의 크루를 스와이프로 만나보세요!
          <br />
          수락/거절 결정을 모두 마쳐야 크루링 서비스를 시작할 수 있습니다.
        </p>

        {/* Progress indicators */}
        <div className="swipe-progress">
          {candidates.map((_, idx) => (
            <div
              key={idx}
              className={`progress-dot ${idx === currentIndex ? 'active' : ''} ${
                idx < currentIndex ? 'completed' : ''
              }`}
            />
          ))}
          <span className="progress-text">
            {currentIndex + 1} / {candidates.length}
          </span>
        </div>
      </div>

      <div className="swipe-card-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCrew.id}
            className="swipe-card-item"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity }}
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              x: exitDirection === 'left' ? -400 : exitDirection === 'right' ? 400 : 0,
              rotate: exitDirection === 'left' ? -20 : exitDirection === 'right' ? 20 : 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              transition: { duration: 0.2 },
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            {/* Visual swipe hints */}
            <motion.div className="swipe-badge-feedback like" style={{ opacity: likeOpacity }}>
              LIKE
            </motion.div>
            <motion.div className="swipe-badge-feedback nope" style={{ opacity: nopeOpacity }}>
              NOPE
            </motion.div>

            {/* Emoji Avatar with tone colors */}
            <div
              className="swipe-avatar-circle"
              style={{
                backgroundColor: toneStyle.bg,
                borderColor: toneStyle.border,
                borderWidth: '3px',
                borderStyle: 'solid',
              }}
            >
              {currentCrew.emoji}
            </div>

            {/* Crew Info */}
            <div className="swipe-card-body">
              <span className="swipe-crew-tag" style={{ color: toneStyle.border, backgroundColor: toneStyle.bg }}>
                {currentCrew.cohort} · {currentCrew.track}
              </span>
              <h3 className="swipe-crew-name">{currentCrew.name}</h3>
              <p className="swipe-crew-bio">{currentCrew.bio}</p>

              {/* Note tip box */}
              <div className="swipe-crew-note">
                <span className="note-emoji">💡</span>
                <p className="note-text">{currentCrew.note}</p>
              </div>
            </div>

            <div className="swipe-action-hint">
              ← 왼쪽으로 넘기면 거절 | 오른쪽으로 넘기면 수락 →
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Manual Action Buttons (X & Heart) */}
      <div className="swipe-action-buttons">
        <button
          className="swipe-btn reject-btn"
          type="button"
          onClick={() => triggerButtonAction(false)}
          aria-label="넘기기 (거절)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <button
          className="swipe-btn accept-btn"
          type="button"
          onClick={() => triggerButtonAction(true)}
          aria-label="수락 (관계 연결)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

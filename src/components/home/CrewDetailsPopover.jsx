import { motion } from 'motion/react'

export default function CrewDetailsPopover({ selectedCrew, onRequest }) {
  if (!selectedCrew) return null

  return (
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
  )
}

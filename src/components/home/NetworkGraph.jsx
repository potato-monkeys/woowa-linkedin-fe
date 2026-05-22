import CrewDetailsPopover from './CrewDetailsPopover.jsx'
import NetworkGraphCanvas from './NetworkGraphCanvas.jsx'

const LEVEL_MAP = {
  UNKNOWN: { label: '모르는 사이', color: '#cbd5e1', range: '0~3', emoji: '👀' },
  AWKWARD: { label: '어색한 사이', color: '#60a5fa', range: '4~9', emoji: '💬' },
  GETTING_CLOSER: { label: '친해지는 중', color: '#3ba776', range: '10~19', emoji: '☕' },
  VERY_CLOSE: { label: '꽤 친함', color: '#fb923c', range: '20~39', emoji: '🍜' },
  POTATO_ALLIANCE: { label: '감자 동맹', color: '#e879f9', range: '40+', emoji: '🥔' }
}

export default function NetworkGraph({
  crews,
  edges,
  currentUserId,
  searchQuery,
  selectedCrewId,
  onSelectCrew,
  onRequest,
}) {
  const selectedCrew = crews.find((crew) => crew.id === selectedCrewId)

  return (
    <section className="graph-panel force-graph-panel" aria-labelledby="graph-title">
      <div className="graph-container-relative" style={{ position: 'relative' }}>
        <NetworkGraphCanvas
          crews={crews}
          edges={edges}
          currentUserId={currentUserId}
          searchQuery={searchQuery}
          selectedCrewId={selectedCrewId}
          onSelectCrew={onSelectCrew}
        />

        {/* Legend Guide overlay */}
        <div className="graph-legend-guide" style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #edf2f7',
          borderRadius: '12px',
          padding: '12px 14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 10,
          pointerEvents: 'auto',
          minWidth: '150px',
        }}>
          <h4 style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#718096', fontWeight: '700', letterSpacing: '-0.2px' }}>관계 단계 가이드</h4>
          {Object.values(LEVEL_MAP).map((lvl) => (
            <div key={lvl.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', lineHeight: '1' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: lvl.color,
                display: 'inline-block',
                boxShadow: `0 0 4px ${lvl.color}`
              }} />
              <span style={{ fontWeight: '600', color: '#2d3748' }}>{lvl.emoji} {lvl.label}</span>
              <span style={{ color: '#a0aec0', fontSize: '10px', marginLeft: 'auto', fontWeight: '500' }}>{lvl.range}점</span>
            </div>
          ))}
        </div>

        <CrewDetailsPopover selectedCrew={selectedCrew} onRequest={onRequest} />
      </div>
    </section>
  )
}

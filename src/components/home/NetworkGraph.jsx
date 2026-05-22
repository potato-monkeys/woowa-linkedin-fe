import CrewDetailsPopover from './CrewDetailsPopover.jsx'
import NetworkGraphCanvas from './NetworkGraphCanvas.jsx'

export default function NetworkGraph({
  crews,
  relations,
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
          relations={relations}
          selectedCrewId={selectedCrewId}
          onSelectCrew={onSelectCrew}
        />

        <CrewDetailsPopover selectedCrew={selectedCrew} onRequest={onRequest} />
      </div>
    </section>
  )
}

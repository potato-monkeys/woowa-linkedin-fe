import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { GRAPH_HEIGHT, GRAPH_WIDTH, relationColors, secondaryLinks } from '../../data/mockData.js'

export default function NetworkGraphCanvas({
  crews,
  relations,
  selectedCrewId,
  onSelectCrew,
}) {
  const svgRef = useRef(null)
  const simulationRef = useRef(null)
  const graphNodesRef = useRef([])
  const graphLinksRef = useRef([])
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const [draggingNodeId, setDraggingNodeId] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [graph, setGraph] = useState({ nodes: [], links: [] })
  const [viewport, setViewport] = useState({ x: 0, y: 0, k: 1 })
  const [panStart, setPanStart] = useState(null)

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
        anchorX: GRAPH_WIDTH * 0.5,
        anchorY: GRAPH_HEIGHT * 0.55,
      },
      ...crews.map((crew) => ({
        ...crew,
        connections: relations.filter((relation) => relation.crewId === crew.id).length + 1,
        x: (crew.x / 100) * GRAPH_WIDTH,
        y: (crew.y / 100) * GRAPH_HEIGHT,
        anchorX: (crew.x / 100) * GRAPH_WIDTH,
        anchorY: (crew.y / 100) * GRAPH_HEIGHT,
      })),
    ]
    const nodeIds = new Set(nodes.map((node) => node.id))
    const links = [
      ...relations
        .filter((relation) => nodeIds.has(relation.crewId))
        .map((relation) => ({
          source: 'me',
          target: relation.crewId,
          type: relation.type,
          weight: relation.weight,
        })),
      ...secondaryLinks.filter(
        (link) => nodeIds.has(link.source) && nodeIds.has(link.target)
      ),
    ]

    return { nodes, links }
  }, [relations, crews])

  useEffect(() => {
    let frameId = null
    let isMounted = true
    const nodes = graphData.nodes.map((node) => ({ ...node }))
    const links = graphData.links.map((link) => ({ ...link }))

    graphNodesRef.current = nodes
    graphLinksRef.current = links

    const simulation = forceSimulation(nodes)
      .force(
        'link',
        forceLink(links)
          .id((node) => node.id)
          .distance((link) => 124 - link.weight * 12)
          .strength(0.22),
      )
      .force('charge', forceManyBody().strength(-240))
      .force(
        'collide',
        forceCollide()
          .radius((node) => (node.isMe ? 42 : 35))
          .strength(0.42)
          .iterations(1),
      )
      .force('x', forceX((node) => node.anchorX).strength((node) => (node.isMe ? 0.08 : 0.038)))
      .force('y', forceY((node) => node.anchorY).strength((node) => (node.isMe ? 0.08 : 0.038)))
      .alpha(1)
      .alphaTarget(0.004)
      .alphaDecay(0.022)
      .velocityDecay(0.18)
      .stop()

    const publishGraph = () => {
      setGraph({
        nodes: nodes.map((node) => ({ ...node })),
        links: links.map((link) => ({
          ...link,
          source: { ...link.source },
          target: { ...link.target },
        })),
      })
    }

    const animate = () => {
      simulation.tick()

      if (isMounted) {
        setGraph({
          nodes: nodes.map((node) => ({ ...node })),
          links: links.map((link) => ({
            ...link,
            source: { ...link.source },
            target: { ...link.target },
          })),
        })
        frameId = window.requestAnimationFrame(animate)
      }
    }

    simulationRef.current = simulation
    simulation.tick(4)
    publishGraph()
    frameId = window.requestAnimationFrame(animate)

    return () => {
      isMounted = false
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
      dragOffsetRef.current = {
        x: node.x - point.x,
        y: node.y - point.y,
      }
      node.fx = node.x
      node.fy = node.y
      simulationRef.current?.alphaTarget(0.16).restart()
    }
  }

  const handlePointerMove = (event) => {
    if (draggingNodeId) {
      const node = graphNodesRef.current.find((item) => item.id === draggingNodeId)
      const point = getGraphPoint(event)

      if (node) {
        node.fx = Math.min(GRAPH_WIDTH - 34, Math.max(34, point.x + dragOffsetRef.current.x))
        node.fy = Math.min(GRAPH_HEIGHT - 38, Math.max(38, point.y + dragOffsetRef.current.y))
        simulationRef.current?.alphaTarget(0.16).restart()
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
      simulationRef.current?.alphaTarget(0.004)
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
  const getLinkBadge = (type) => {
    switch (type) {
      case 'coffee':
        return { emoji: '☕', color: '#ff9f7a', bg: '#ffe9df' }
      case 'meal':
        return { emoji: '🍴', color: '#ffd66b', bg: '#fff4c7' }
      case 'message':
        return { emoji: '💬', color: '#3ba776', bg: '#dff4ea' }
      case 'follow':
        return { emoji: '👀', color: '#6ba8ff', bg: '#e4f0ff' }
      case 'drink':
        return { emoji: '🍺', color: '#e879f9', bg: '#ffe9df' }
      default:
        return null
    }
  }

  return (
    <div className="graph-stage force-graph-stage">
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
          <filter id="cuteNodeShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#3ba776" floodOpacity="0.08" />
          </filter>
        </defs>

        <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.k})`}>
          {/* 1. Connection lines */}
          <g className="force-links">
            {graph.links.map((link, index) => {
              const strokeColor = relationColors[link.type] || '#ccc'
              return (
                <motion.line
                  key={`${link.source.id}-${link.target.id}-${index}`}
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                  stroke={strokeColor}
                  strokeWidth={Math.max(2, link.weight * 2)}
                  strokeLinecap="round"
                  strokeDasharray={link.type === 'follow' ? '5 5' : '0'}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.75 }}
                  transition={{ duration: 0.5 }}
                />
              )
            })}
          </g>

          {/* 2. Connection midpoint badges */}
          <g className="force-badges">
            {graph.links.map((link, index) => {
              const badge = getLinkBadge(link.type)
              if (!badge || typeof link.source.x !== 'number' || typeof link.target.x !== 'number') return null
              const midX = (link.source.x + link.target.x) / 2
              const midY = (link.source.y + link.target.y) / 2
              return (
                <g key={`badge-${link.source.id}-${link.target.id}-${index}`} transform={`translate(${midX} ${midY})`}>
                  <circle
                    r="10"
                    fill="#ffffff"
                    stroke={badge.color}
                    strokeWidth="1.5"
                    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.06))' }}
                  />
                  <text
                    fontSize="9"
                    textAnchor="middle"
                    dominantBaseline="central"
                    y="0.5"
                  >
                    {badge.emoji}
                  </text>
                </g>
              )
            })}
          </g>

          {/* 3. Nodes */}
          <g className="force-nodes">
            {graph.nodes.map((node) => {
              const strokeColor = node.isMe
                ? '#3ba776'
                : node.tone === 'green'
                ? '#3ba776'
                : node.tone === 'coral'
                ? '#ff9f7a'
                : node.tone === 'blue'
                ? '#6ba8ff'
                : node.tone === 'yellow'
                ? '#ffd66b'
                : '#e8e1d6'

              const radius = node.isMe ? 30 : 24

              const getBgColorForTone = (tone, isMe) => {
                if (isMe) return '#eefbf3'
                switch (tone) {
                  case 'green':
                    return '#eefbf3'
                  case 'coral':
                    return '#fff3ee'
                  case 'blue':
                    return '#edf5ff'
                  case 'yellow':
                    return '#fffbeb'
                  default:
                    return '#f8fafc'
                }
              }

              return (
                <g
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
                >
                  <motion.circle
                    r={radius}
                    fill={getBgColorForTone(node.tone, node.isMe)}
                    stroke={strokeColor}
                    strokeWidth={node.isMe ? 4 : 3}
                    filter="url(#cuteNodeShadow)"
                    animate={{
                      scale: draggingNodeId === node.id ? 1.08 : hoveredNode?.id === node.id ? 1.05 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                  />
                  <text
                    fontSize={node.isMe ? "22" : "18"}
                    textAnchor="middle"
                    dominantBaseline="central"
                    y="0.5"
                  >
                    {node.emoji}
                  </text>
                  <text
                    className={`node-label ${node.isMe ? 'is-me-label' : ''}`}
                    y={node.isMe ? 44 : 36}
                    textAnchor="middle"
                    fill={node.isMe ? '#3ba776' : '#242424'}
                    fontWeight="600"
                    fontSize="13"
                  >
                    {node.name}
                  </text>
                </g>
              )
            })}
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
    </div>
  )
}


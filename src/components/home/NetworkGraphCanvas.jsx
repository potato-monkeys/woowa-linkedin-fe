import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { GRAPH_HEIGHT, GRAPH_WIDTH, relationColors, secondaryLinks } from '../../data/mockData.js'

const getLevelInfo = (level, weight) => {
  const lvl = String(level || '').toUpperCase()
  const score = Number(weight || 0)

  if (lvl.includes('ALLIANCE') || lvl.includes('POTATO') || score >= 40) {
    return { level: 'POTATO_ALLIANCE', label: '감자 동맹', color: '#e879f9', emoji: '🥔', bg: '#fae8ff' }
  }
  if (lvl.includes('VERY_CLOSE') || lvl.includes('CLOSE') || (score >= 20 && score < 40)) {
    return { level: 'VERY_CLOSE', label: '꽤 친함', color: '#fb923c', emoji: '🍜', bg: '#fff4e6' }
  }
  if (lvl.includes('GETTING_CLOSER') || lvl.includes('CLOSER') || (score >= 10 && score < 20)) {
    return { level: 'GETTING_CLOSER', label: '친해지는 중', color: '#3ba776', emoji: '☕', bg: '#eefbf3' }
  }
  if (lvl.includes('AWKWARD') || (score >= 4 && score < 10)) {
    return { level: 'AWKWARD', label: '어색한 사이', color: '#60a5fa', emoji: '💬', bg: '#edf5ff' }
  }
  return { level: 'UNKNOWN', label: '모르는 사이', color: '#cbd5e1', emoji: '👀', bg: '#f1f5f9' }
}

export default function NetworkGraphCanvas({
  crews,
  edges = [],
  currentUserId,
  searchQuery,
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
    const myId = String(currentUserId || 'me')

    // Normalize edges
    const normalizedEdges = (edges || []).map(edge => ({
      ...edge,
      source: String(edge.source || ''),
      target: String(edge.target || ''),
      weight: Number(edge.weight || 1),
    }))

    // Find depth 1 neighbor IDs (nodes directly connected to me)
    const depth1Set = new Set()
    normalizedEdges.forEach(edge => {
      if (edge.source === myId) {
        depth1Set.add(edge.target)
      } else if (edge.target === myId) {
        depth1Set.add(edge.source)
      }
    })

    // Find depth 2 neighbor IDs (nodes connected to depth 1, excluding me and depth 1)
    const depth2Set = new Set()
    normalizedEdges.forEach(edge => {
      const s = edge.source
      const t = edge.target
      if (s !== myId && t !== myId) {
        if (depth1Set.has(s) && !depth1Set.has(t)) {
          depth2Set.add(t)
        } else if (depth1Set.has(t) && !depth1Set.has(s)) {
          depth2Set.add(s)
        }
      }
    })

    // Allowed nodes include me, depth 1, and depth 2
    const allowedNodeIds = new Set([myId, ...depth1Set, ...depth2Set])

    // Filter and map nodes
    const filteredNodes = crews
      .filter(crew => allowedNodeIds.has(String(crew.id)))
      .map((crew, index) => {
        const isMe = String(crew.id) === myId
        const connectionsCount = normalizedEdges.filter(
          edge => (edge.source === String(crew.id) || edge.target === String(crew.id)) &&
                  allowedNodeIds.has(edge.source) && allowedNodeIds.has(edge.target)
        ).length

        // Spreading out around center as default position
        const angle = (index * 2 * Math.PI) / 8
        const defaultX = Math.round(50 + 30 * Math.cos(angle))
        const defaultY = Math.round(50 + 30 * Math.sin(angle))
        const rawX = crew.x !== undefined ? crew.x : defaultX
        const rawY = crew.y !== undefined ? crew.y : defaultY

        return {
          ...crew,
          id: String(crew.id),
          isMe,
          connections: connectionsCount,
          x: isMe ? GRAPH_WIDTH * 0.5 : (rawX / 100) * GRAPH_WIDTH,
          y: isMe ? GRAPH_HEIGHT * 0.55 : (rawY / 100) * GRAPH_HEIGHT,
          anchorX: isMe ? GRAPH_WIDTH * 0.5 : (rawX / 100) * GRAPH_WIDTH,
          anchorY: isMe ? GRAPH_HEIGHT * 0.55 : (rawY / 100) * GRAPH_HEIGHT,
        }
      })

    // Prepend 'me' node if it's not already in the list
    const hasMeNode = filteredNodes.some(n => n.isMe)
    if (!hasMeNode) {
      filteredNodes.unshift({
        id: myId,
        name: '나',
        emoji: '😎',
        isMe: true,
        connections: depth1Set.size,
        x: GRAPH_WIDTH * 0.5,
        y: GRAPH_HEIGHT * 0.55,
        anchorX: GRAPH_WIDTH * 0.5,
        anchorY: GRAPH_HEIGHT * 0.55,
      })
    }

    // Filter and map links
    const filteredLinks = normalizedEdges
      .filter(edge => allowedNodeIds.has(edge.source) && allowedNodeIds.has(edge.target))
      .map(edge => {
        const isPrimary = edge.source === myId || edge.target === myId
        return {
          id: edge.id || `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          weight: edge.weight,
          level: edge.level,
          levelDescription: edge.levelDescription,
          isPrimary,
        }
      })

    // Apply search filter if query is present
    let finalNodes = filteredNodes
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      finalNodes = filteredNodes.filter(
        node => node.isMe || (node.name || '').toLowerCase().includes(query)
      )
    }

    const finalNodeIds = new Set(finalNodes.map(n => n.id))
    const finalLinks = filteredLinks.filter(
      link => finalNodeIds.has(link.source) && finalNodeIds.has(link.target)
    )

    return { nodes: finalNodes, links: finalLinks }
  }, [crews, edges, currentUserId, searchQuery])

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
          .distance((link) => Math.max(48, 130 - link.weight * 1.5))
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

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const handleWheel = (event) => {
      event.preventDefault()
      const rect = svg.getBoundingClientRect()
      const pointerX = ((event.clientX - rect.left) / rect.width) * GRAPH_WIDTH
      const pointerY = ((event.clientY - rect.top) / rect.height) * GRAPH_HEIGHT

      setViewport((prevViewport) => {
        const nextK = Math.min(2.2, Math.max(0.72, prevViewport.k * (event.deltaY > 0 ? 0.92 : 1.08)))
        const graphX = (pointerX - prevViewport.x) / prevViewport.k
        const graphY = (pointerY - prevViewport.y) / prevViewport.k

        return {
          k: nextK,
          x: pointerX - graphX * nextK,
          y: pointerY - graphY * nextK,
        }
      })
    }

    svg.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      svg.removeEventListener('wheel', handleWheel)
    }
  }, [])
  // getLinkBadge is removed as we now use getLevelInfo helper.

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
              const levelInfo = getLevelInfo(link.level, link.weight)
              const thickness = Math.min(8, Math.max(2, link.weight * 0.15 + 1.5))
              return (
                <motion.line
                  key={`${link.source.id}-${link.target.id}-${index}`}
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                  stroke={levelInfo.color}
                  strokeWidth={thickness}
                  strokeLinecap="round"
                  strokeDasharray={levelInfo.level === 'UNKNOWN' ? '5 5' : '0'}
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
              const levelInfo = getLevelInfo(link.level, link.weight)
              if (typeof link.source.x !== 'number' || typeof link.target.x !== 'number') return null
              const midX = (link.source.x + link.target.x) / 2
              const midY = (link.source.y + link.target.y) / 2
              return (
                <g key={`badge-${link.source.id}-${link.target.id}-${index}`} transform={`translate(${midX} ${midY})`}>
                  <circle
                    r="11"
                    fill="#ffffff"
                    stroke={levelInfo.color}
                    strokeWidth="2"
                    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.08))' }}
                  />
                  <text
                    fontSize="11"
                    textAnchor="middle"
                    dominantBaseline="central"
                    y="0.5"
                  >
                    {levelInfo.emoji}
                  </text>
                  {/* Small badge showing numerical score */}
                  <g transform="translate(9, -9)">
                    <rect
                      x="-8"
                      y="-6"
                      width="16"
                      height="11"
                      rx="3"
                      fill="#333333"
                      opacity="0.8"
                    />
                    <text
                      fill="#ffffff"
                      fontSize="7"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                      y="-0.5"
                    >
                      {link.weight}
                    </text>
                  </g>
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


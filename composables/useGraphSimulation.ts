import type { GraphNode, GraphLink, GraphData } from '~/utils/graph-data'

// D3 module types (lazy-loaded)
interface D3Modules {
  d3Force: typeof import('d3-force')
  d3Selection: typeof import('d3-selection')
  d3Zoom: typeof import('d3-zoom')
  d3Drag: typeof import('d3-drag')
}

export function useGraphSimulation() {
  const isLoading = ref(false)
  const displayStats = reactive({ nodes: 0, links: 0 })

  // D3 internals
  let d3Modules: D3Modules | null = null
  let simulation: any = null
  let svgSel: any = null
  let g: any = null
  let zoomBehavior: any = null
  let linkGroup: any = null
  let nodeGroup: any = null
  const svgInitialized = ref(false)
  let currentData: GraphData | null = null

  // --- Lazy D3 module loading (once) ---
  async function loadD3(): Promise<D3Modules> {
    if (d3Modules) return d3Modules
    const [d3Force, d3Selection, d3Zoom, d3Drag] = await Promise.all([
      import('d3-force'),
      import('d3-selection'),
      import('d3-zoom'),
      import('d3-drag'),
    ])
    d3Modules = { d3Force, d3Selection, d3Zoom, d3Drag }
    return d3Modules
  }

  // --- Node radius ---
  function nodeRadius(node: GraphNode): number {
    const minR = 6
    const maxR = 14
    const maxConn = currentData?.maxConnections ?? 1
    return minR + ((node.connectionCount || 0) / maxConn) * (maxR - minR)
  }

  function linkStrokeColor(d: GraphLink): string {
    if (d.type === 'cross-category') return 'var(--macaron-svg-guide)'
    return 'var(--macaron-border)'
  }

  function linkStrokeWidth(d: GraphLink): number {
    if (d.type === 'tag') {
      const w = d.weight ?? 1
      if (w >= 3) return 1.8
      if (w === 2) return 1.2
      return 0.8
    }
    if (d.type === 'cross-category') return 1.5
    return 1
  }

  function linkDashArray(d: GraphLink): string {
    if (d.type === 'cross-category') return '6,3'
    if (d.type === 'tag') return '2,4'
    return 'none'
  }

  // --- One-time SVG setup ---
  async function initSVG(container: HTMLElement): Promise<void> {
    const d3 = await loadD3()
    const { select } = d3.d3Selection
    const { zoom: zoomFn } = d3.d3Zoom

    const width = container.clientWidth
    const height = container.clientHeight

    svgSel = select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height])
      .style('cursor', 'grab')

    svgSel.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'var(--macaron-graph-bg)')

    const defs = svgSel.append('defs')
    const filter = defs.append('filter')
      .attr('id', 'node-shadow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%')
    filter.append('feDropShadow')
      .attr('dx', 0).attr('dy', 1)
      .attr('stdDeviation', 2)
      .attr('flood-color', 'rgba(0,0,0,0.1)')

    g = svgSel.append('g')

    zoomBehavior = zoomFn()
      .scaleExtent([0.3, 4])
      .on('zoom', (event: any) => {
        g.attr('transform', event.transform)
      })
    svgSel.call(zoomBehavior)

    linkGroup = g.append('g').attr('class', 'links')
    nodeGroup = g.append('g').attr('class', 'nodes')

    svgInitialized.value = true
  }

  // --- Incremental graph update ---
  async function updateGraph(
    data: GraphData,
    container: HTMLElement,
    callbacks: {
      onNodeHover: (event: MouseEvent, node: GraphNode) => void
      onNodeMove: (event: MouseEvent) => void
      onNodeLeave: () => void
      onNodeClick: (node: GraphNode) => void
      onBackgroundClick: () => void
    },
  ): Promise<void> {
    const d3 = await loadD3()
    const { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } = d3.d3Force
    const { select } = d3.d3Selection
    const { drag: dragFn } = d3.d3Drag

    currentData = data
    const width = container.clientWidth
    const height = container.clientHeight

    if (data.nodes.length === 0) {
      linkGroup.selectAll('path').remove()
      nodeGroup.selectAll('g').remove()
      if (simulation) simulation.stop()
      displayStats.nodes = 0
      displayStats.links = 0
      return
    }

    displayStats.nodes = data.nodes.length
    displayStats.links = data.links.length

    // Links: enter/update/exit
    const linkKey = (d: GraphLink) => {
      const s = typeof d.source === 'string' ? d.source : d.source.id
      const t = typeof d.target === 'string' ? d.target : d.target.id
      return `${s}-${t}`
    }

    linkGroup.selectAll('path')
      .data(data.links, linkKey)
      .join(
        (enter: any) => enter.append('path')
          .attr('fill', 'none')
          .attr('stroke', (d: GraphLink) => linkStrokeColor(d))
          .attr('stroke-width', (d: GraphLink) => linkStrokeWidth(d))
          .attr('stroke-dasharray', (d: GraphLink) => linkDashArray(d))
          .attr('opacity', 0),
        (update: any) => update,
        (exit: any) => exit.transition().duration(300).attr('opacity', 0).remove(),
      )
      .transition().duration(300)
      .attr('opacity', 0.5)
      .attr('stroke', (d: GraphLink) => linkStrokeColor(d))
      .attr('stroke-width', (d: GraphLink) => linkStrokeWidth(d))
      .attr('stroke-dasharray', (d: GraphLink) => linkDashArray(d))

    // Nodes: enter/update/exit
    const nodeKey = (d: GraphNode) => d.id

    const nodeElements = nodeGroup.selectAll('g')
      .data(data.nodes, nodeKey)
      .join(
        (enter: any) => {
          const group = enter.append('g').style('cursor', 'pointer')
          group.append('circle')
            .attr('r', 0)
            .attr('fill', (d: GraphNode) => d.color)
            .attr('stroke', 'var(--macaron-card)')
            .attr('stroke-width', 2)
            .attr('filter', 'url(#node-shadow)')
            .attr('opacity', 0)
          group.append('text')
            .text((d: GraphNode) => d.label)
            .attr('font-size', 11)
            .attr('dx', (d: GraphNode) => nodeRadius(d) + 4)
            .attr('dy', 4)
            .attr('fill', 'var(--macaron-text)')
            .attr('opacity', 0)
            .style('pointer-events', 'none')
            .style('user-select', 'none')
          return group
        },
        (update: any) => update,
        (exit: any) => exit.transition().duration(300)
          .select('circle').attr('r', 0).attr('opacity', 0)
          .selection().remove(),
      )

    nodeElements.select('circle')
      .transition().duration(300)
      .attr('r', (d: GraphNode) => nodeRadius(d))
      .attr('opacity', 1)
      .attr('fill', (d: GraphNode) => d.color)

    nodeElements.select('text')
      .attr('dx', (d: GraphNode) => nodeRadius(d) + 4)

    // Interactions
    const adjacency = data.adjacencyMap

    nodeElements
      .on('mouseenter', (event: MouseEvent, d: GraphNode) => {
        select(event.currentTarget as SVGGElement).select('text').attr('opacity', 1)

        const neighbors = adjacency.get(d.id) || new Set<string>()

        linkGroup.selectAll('path')
          .attr('opacity', (l: GraphLink) => {
            const s = typeof l.source === 'string' ? l.source : l.source.id
            const t = typeof l.target === 'string' ? l.target : l.target.id
            return s === d.id || t === d.id ? 0.8 : 0.15
          })
          .attr('stroke-width', (l: GraphLink) => {
            const s = typeof l.source === 'string' ? l.source : l.source.id
            const t = typeof l.target === 'string' ? l.target : l.target.id
            return s === d.id || t === d.id ? Math.max(3, linkStrokeWidth(l) + 1.5) : linkStrokeWidth(l)
          })

        nodeElements.select('circle')
          .attr('opacity', (n: GraphNode) => {
            if (n.id === d.id) return 1
            return neighbors.has(n.id) ? 1 : 0.25
          })

        callbacks.onNodeHover(event, d)
      })
      .on('mousemove', (event: MouseEvent) => callbacks.onNodeMove(event))
      .on('mouseleave', () => {
        nodeElements.select('text').attr('opacity', 0)
        linkGroup.selectAll('path')
          .attr('opacity', 0.5)
          .attr('stroke-width', (l: GraphLink) => linkStrokeWidth(l))
        nodeElements.select('circle').attr('opacity', 1)
        callbacks.onNodeLeave()
      })
      .on('click', (_event: MouseEvent, d: GraphNode) => callbacks.onNodeClick(d))

    // Drag
    const drag = dragFn<SVGElement, GraphNode>()
      .on('start', (event: any, d: GraphNode) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event: any, d: GraphNode) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event: any, d: GraphNode) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = undefined
        d.fy = undefined
      })
    nodeElements.call(drag)

    // Background click
    svgSel.on('click', (event: MouseEvent) => {
      if (event.target === svgSel.node() || (event.target as Element)?.tagName === 'rect') {
        callbacks.onBackgroundClick()
      }
    })

    // Force simulation
    if (simulation) simulation.stop()

    simulation = forceSimulation(data.nodes)
      .force('link', forceLink(data.links).id((d: any) => d.id).distance((d: any) => {
        if (d.type === 'tag') {
          const w = d.weight ?? 1
          return w >= 3 ? 70 : w === 2 ? 90 : 110
        }
        return 80
      }))
      .force('charge', forceManyBody().strength(-200))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide<GraphNode>().radius((d: GraphNode) => nodeRadius(d) + 4))

    simulation.on('tick', () => {
      linkGroup.selectAll('path').attr('d', (d: any) => {
        const dx = (d.target.x || 0) - (d.source.x || 0)
        const dy = (d.target.y || 0) - (d.source.y || 0)
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.2
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`
      })
      nodeGroup.selectAll('g').attr('transform', (d: GraphNode) => `translate(${d.x || 0},${d.y || 0})`)
    })
  }

  // --- Zoom reset ---
  function resetZoom(): void {
    if (!svgSel || !zoomBehavior || !d3Modules) return
    const { zoomIdentity } = d3Modules.d3Zoom
    svgSel.transition().duration(500).call(zoomBehavior.transform, zoomIdentity)
  }

  // --- Simulation reset ---
  function resetSimulation(): void {
    if (!currentData || !simulation) return
    for (const node of currentData.nodes) {
      node.x = undefined
      node.y = undefined
      node.fx = undefined
      node.fy = undefined
    }
    simulation.alpha(1).restart()
  }

  // --- Resize handler ---
  function handleResize(): void {
    if (!svgSel || !currentData || !d3Modules) return
    const container = svgSel.node()?.parentElement
    if (!container) return
    const width = container.clientWidth
    const height = container.clientHeight
    svgSel.attr('viewBox', [0, 0, width, height])

    const { forceCenter } = d3Modules.d3Force
    simulation.force('center', forceCenter(width / 2, height / 2))
    simulation.alpha(0.1).restart()
  }

  // --- Search highlight ---
  function applySearchHighlight(query: string): void {
    if (!nodeGroup) return
    const q = query.toLowerCase().trim()

    nodeGroup.selectAll('g').select('circle')
      .attr('stroke', (d: GraphNode) => {
        if (!q) return 'var(--macaron-card)'
        return matchesSearch(d, q) ? 'var(--macaron-cta)' : 'var(--macaron-card)'
      })
      .attr('stroke-width', (d: GraphNode) => {
        if (!q) return 2
        return matchesSearch(d, q) ? 3 : 2
      })
  }

  function matchesSearch(node: GraphNode, query: string): boolean {
    if (node.label.toLowerCase().includes(query)) return true
    if (node.categoryLabel.toLowerCase().includes(query)) return true
    if (node.tags.some(t => t.toLowerCase().includes(query))) return true
    return false
  }

  // --- Destroy ---
  function destroy(): void {
    if (simulation) {
      simulation.stop()
      simulation = null
    }
    d3Modules = null
    svgInitialized.value = false
  }

  return {
    isLoading,
    displayStats,
    loadD3,
    initSVG,
    updateGraph,
    resetZoom,
    resetSimulation,
    handleResize,
    applySearchHighlight,
    destroy,
    svgInitialized,
  }
}

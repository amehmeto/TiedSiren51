/**
 * TicketGraph - A graph data structure for ticket dependencies
 *
 * Provides a clean separation between:
 * 1. The graph structure (nodes, edges)
 * 2. Validation (cycles, dangling refs, bidirectional consistency)
 * 3. Queries (blockers, dependencies, critical path)
 *
 * This module is renderer-agnostic - it knows nothing about Mermaid or ASCII output.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * @typedef {'initiative' | 'epic' | 'bug' | 'feature'} TicketType
 * @typedef {'todo' | 'in_progress' | 'done'} TicketStatus
 */

/**
 * @typedef {Object} TicketNode
 * @property {string} id - Unique identifier (repo#number format)
 * @property {string} repo - Repository name
 * @property {number} number - Issue number
 * @property {string} title - Ticket title
 * @property {TicketType} type - Ticket type
 * @property {TicketStatus} status - Current status
 * @property {number} [storyPoints] - Story points estimate
 * @property {number} [parentEpic] - Parent epic number (for grouping)
 * @property {string[]} [labels] - Labels from GitHub
 */

/**
 * @typedef {Object} Edge
 * @property {string} from - Source node ID
 * @property {string} to - Target node ID
 * @property {'depends_on' | 'blocks'} type - Edge type (direction of relationship)
 */

/**
 * @typedef {Object} BidirectionalFix
 * @property {number[]} [addBlocks] - Issue numbers to add to blocks
 * @property {number[]} [addDependsOn] - Issue numbers to add to depends_on
 */

/**
 * @typedef {Object} ValidationError
 * @property {'cycle' | 'dangling_ref' | 'self_reference' | 'bidirectional_mismatch'} type
 * @property {string} message
 * @property {string[]} nodes - Node IDs involved
 * @property {BidirectionalFix} [fix] - Fix info for bidirectional mismatches
 */

// ============================================================================
// TicketGraph Class
// ============================================================================

export class TicketGraph {
  constructor() {
    /** @type {Map<string, TicketNode>} */
    this.nodes = new Map()

    /** @type {Edge[]} */
    this.edges = []

    /** @type {Map<string, Set<string>>} - Adjacency list: node -> nodes it depends on */
    this._dependsOn = new Map()

    /** @type {Map<string, Set<string>>} - Reverse adjacency: node -> nodes that depend on it */
    this._blockedBy = new Map()
  }

  // ==========================================================================
  // Graph Construction
  // ==========================================================================

  /**
   * Add a node to the graph
   * @param {TicketNode} node
   */
  addNode(node) {
    this.nodes.set(node.id, node)
    if (!this._dependsOn.has(node.id)) {
      this._dependsOn.set(node.id, new Set())
    }
    if (!this._blockedBy.has(node.id)) {
      this._blockedBy.set(node.id, new Set())
    }
  }

  /**
   * Add a dependency edge: `from` depends on `to`
   * @param {string} from - Node that has the dependency
   * @param {string} to - Node that is depended upon
   */
  addDependency(from, to) {
    this.edges.push({ from, to, type: 'depends_on' })

    if (!this._dependsOn.has(from)) {
      this._dependsOn.set(from, new Set())
    }
    this._dependsOn.get(from).add(to)

    if (!this._blockedBy.has(to)) {
      this._blockedBy.set(to, new Set())
    }
    this._blockedBy.get(to).add(from)
  }

  /**
   * Check if a node exists in the graph
   * @param {string} id
   * @returns {boolean}
   */
  hasNode(id) {
    return this.nodes.has(id)
  }

  /**
   * Get a node by ID
   * @param {string} id
   * @returns {TicketNode | undefined}
   */
  getNode(id) {
    return this.nodes.get(id)
  }

  // ==========================================================================
  // Queries
  // ==========================================================================

  /**
   * Get all nodes that this node depends on (direct dependencies)
   * @param {string} id
   * @returns {string[]}
   */
  getDependencies(id) {
    return [...(this._dependsOn.get(id) || [])]
  }

  /**
   * Get all nodes that depend on this node (direct blockers)
   * @param {string} id
   * @returns {string[]}
   */
  getBlockedBy(id) {
    return [...(this._blockedBy.get(id) || [])]
  }

  /**
   * Get all transitive dependencies (everything this node depends on, recursively)
   * @param {string} id
   * @returns {string[]}
   */
  getTransitiveDependencies(id) {
    const visited = new Set()
    const stack = [id]

    while (stack.length > 0) {
      const current = stack.pop()
      for (const dep of this._dependsOn.get(current) || []) {
        if (!visited.has(dep)) {
          visited.add(dep)
          stack.push(dep)
        }
      }
    }

    return [...visited]
  }

  /**
   * Get all transitive blockers (everything that depends on this node, recursively)
   * @param {string} id
   * @returns {string[]}
   */
  getTransitiveBlockers(id) {
    const visited = new Set()
    const stack = [id]

    while (stack.length > 0) {
      const current = stack.pop()
      for (const blocker of this._blockedBy.get(current) || []) {
        if (!visited.has(blocker)) {
          visited.add(blocker)
          stack.push(blocker)
        }
      }
    }

    return [...visited]
  }

  /**
   * Get root nodes (nodes with no dependencies within the graph)
   * @returns {string[]}
   */
  getRoots() {
    return [...this.nodes.keys()].filter((id) => {
      const deps = this._dependsOn.get(id) || new Set()
      // Only count deps that exist in the graph
      return [...deps].filter((d) => this.nodes.has(d)).length === 0
    })
  }

  /**
   * Get leaf nodes (nodes that nothing depends on)
   * @returns {string[]}
   */
  getLeaves() {
    return [...this.nodes.keys()].filter((id) => {
      const blockers = this._blockedBy.get(id) || new Set()
      return [...blockers].filter((b) => this.nodes.has(b)).length === 0
    })
  }

  /**
   * Get orphan nodes (nodes with no dependencies AND nothing depends on them)
   * @returns {string[]}
   */
  getOrphans() {
    return [...this.nodes.keys()].filter((id) => {
      const deps = this._dependsOn.get(id) || new Set()
      const blockers = this._blockedBy.get(id) || new Set()
      const hasDeps = [...deps].some((d) => this.nodes.has(d))
      const hasBlockers = [...blockers].some((b) => this.nodes.has(b))
      return !hasDeps && !hasBlockers
    })
  }

  /**
   * Compute depth of each node from roots (BFS)
   * @returns {Map<string, number>}
   */
  computeDepths() {
    const depths = new Map()
    const roots = this.getRoots()
    const queue = roots.map((id) => ({ id, depth: 0 }))

    while (queue.length > 0) {
      const { id, depth } = queue.shift()

      if (depths.has(id) && depths.get(id) <= depth) continue
      depths.set(id, depth)

      // Find nodes that depend on this one (children in the dependency tree)
      for (const child of this._blockedBy.get(id) || []) {
        if (this.nodes.has(child)) {
          queue.push({ id: child, depth: depth + 1 })
        }
      }
    }

    return depths
  }

  /**
   * Topological sort of the graph (dependencies first)
   * @returns {string[] | null} - Sorted node IDs, or null if cycle detected
   */
  topologicalSort() {
    const visited = new Set()
    const temp = new Set()
    const result = []

    const visit = (id) => {
      if (temp.has(id)) return false // Cycle detected
      if (visited.has(id)) return true

      temp.add(id)

      for (const dep of this._dependsOn.get(id) || []) {
        if (this.nodes.has(dep) && !visit(dep)) {
          return false
        }
      }

      temp.delete(id)
      visited.add(id)
      result.push(id)
      return true
    }

    for (const id of this.nodes.keys()) {
      if (!visited.has(id) && !visit(id)) {
        return null // Cycle detected
      }
    }

    return result
  }

  /**
   * Find the critical path (longest path through the graph)
   * @returns {{ path: string[], length: number }}
   */
  getCriticalPath() {
    const sorted = this.topologicalSort()
    if (!sorted) {
      return { path: [], length: 0 } // Graph has cycles
    }

    const dist = new Map()
    const prev = new Map()

    for (const id of sorted) {
      dist.set(id, 0)
      prev.set(id, null)
    }

    for (const id of sorted) {
      for (const child of this._blockedBy.get(id) || []) {
        if (this.nodes.has(child)) {
          const newDist = dist.get(id) + 1
          if (newDist > dist.get(child)) {
            dist.set(child, newDist)
            prev.set(child, id)
          }
        }
      }
    }

    // Find the node with maximum distance
    let maxDist = 0
    let endNode = null
    for (const [id, d] of dist) {
      if (d > maxDist) {
        maxDist = d
        endNode = id
      }
    }

    // Reconstruct path
    const path = []
    let current = endNode
    while (current) {
      path.unshift(current)
      current = prev.get(current)
    }

    return { path, length: maxDist }
  }

  /**
   * Get nodes grouped by type
   * @returns {Map<TicketType, TicketNode[]>}
   */
  getNodesByType() {
    const groups = new Map()
    for (const node of this.nodes.values()) {
      if (!groups.has(node.type)) {
        groups.set(node.type, [])
      }
      groups.get(node.type).push(node)
    }
    return groups
  }

  /**
   * Get nodes grouped by parent epic
   * @returns {Map<number | null, TicketNode[]>}
   */
  getNodesByEpic() {
    const groups = new Map()
    for (const node of this.nodes.values()) {
      const epic = node.parentEpic || null
      if (!groups.has(epic)) {
        groups.set(epic, [])
      }
      groups.get(epic).push(node)
    }
    return groups
  }

  // ==========================================================================
  // Validation
  // ==========================================================================

  /**
   * Run all validations and return errors
   * @returns {ValidationError[]}
   */
  validate() {
    return [
      ...this._detectCycles(),
      ...this._detectSelfReferences(),
      ...this._detectDanglingRefs(),
      ...this._detectBidirectionalMismatches(),
    ]
  }

  /**
   * Detect cycles in the graph
   * @returns {ValidationError[]}
   */
  _detectCycles() {
    const errors = []
    const visited = new Set()
    const recStack = new Set()
    const path = []

    const dfs = (id) => {
      visited.add(id)
      recStack.add(id)
      path.push(id)

      for (const dep of this._dependsOn.get(id) || []) {
        if (!this.nodes.has(dep)) continue

        if (!visited.has(dep)) {
          const cycle = dfs(dep)
          if (cycle) return cycle
        } else if (recStack.has(dep)) {
          // Found cycle - extract it
          const cycleStart = path.indexOf(dep)
          return path.slice(cycleStart)
        }
      }

      path.pop()
      recStack.delete(id)
      return null
    }

    for (const id of this.nodes.keys()) {
      if (!visited.has(id)) {
        const cycle = dfs(id)
        if (cycle) {
          errors.push({
            type: 'cycle',
            message: `Cycle detected: ${cycle.join(' -> ')} -> ${cycle[0]}`,
            nodes: cycle,
          })
        }
      }
    }

    return errors
  }

  /**
   * Detect self-referencing nodes
   * @returns {ValidationError[]}
   */
  _detectSelfReferences() {
    const errors = []

    for (const id of this.nodes.keys()) {
      const deps = this._dependsOn.get(id) || new Set()
      if (deps.has(id)) {
        errors.push({
          type: 'self_reference',
          message: `Node ${id} references itself`,
          nodes: [id],
        })
      }
    }

    return errors
  }

  /**
   * Detect edges pointing to non-existent nodes
   * @returns {ValidationError[]}
   */
  _detectDanglingRefs() {
    const errors = []
    const reported = new Set()

    for (const edge of this.edges) {
      if (!this.nodes.has(edge.to) && !reported.has(edge.to)) {
        errors.push({
          type: 'dangling_ref',
          message: `Node ${edge.from} depends on non-existent node ${edge.to}`,
          nodes: [edge.from, edge.to],
        })
        reported.add(edge.to)
      }
    }

    return errors
  }

  /**
   * Detect bidirectional mismatches (A depends on B but B doesn't block A)
   * This is informational - the graph only stores depends_on, but we can
   * check against the original "blocks" metadata if provided.
   *
   * @param {Map<string, string[]>} [declaredBlocks] - Optional map of node ID -> declared blocks
   * @returns {ValidationError[]}
   */
  _detectBidirectionalMismatches(declaredBlocks) {
    // This validation requires the original "blocks" data which we don't store
    // It should be called during graph construction if needed
    return []
  }

  // ==========================================================================
  // Serialization
  // ==========================================================================

  /**
   * Export graph to a plain object (for JSON serialization)
   * @returns {Object}
   */
  toJSON() {
    return {
      nodes: [...this.nodes.values()],
      edges: this.edges,
      metadata: {
        nodeCount: this.nodes.size,
        edgeCount: this.edges.length,
        exportedAt: new Date().toISOString(),
      },
    }
  }

  /**
   * Create a graph from a plain object
   * @param {Object} data
   * @returns {TicketGraph}
   */
  static fromJSON(data) {
    const graph = new TicketGraph()

    for (const node of data.nodes) {
      graph.addNode(node)
    }

    for (const edge of data.edges) {
      if (edge.type === 'depends_on') {
        graph.addDependency(edge.from, edge.to)
      }
    }

    return graph
  }
}

// ============================================================================
// Graph Builder
// ============================================================================

/**
 * Build a TicketGraph from raw ticket data
 *
 * @param {Object[]} tickets - Raw ticket objects with metadata
 * @param {Object} options - Builder options
 * @param {Function} options.formatId - Function to format ticket ID (repo, number) => string
 * @returns {{ graph: TicketGraph, validationErrors: ValidationError[] }}
 */
export function buildGraphFromTickets(tickets, options = {}) {
  const formatId = options.formatId || ((repo, number) => `${repo}#${number}`)

  const graph = new TicketGraph()
  const declaredBlocks = new Map()

  // First pass: add all nodes
  for (const ticket of tickets) {
    const id = formatId(ticket.repo, ticket.number)

    graph.addNode({
      id,
      repo: ticket.repo,
      number: ticket.number,
      title: ticket.title,
      type: ticket.type || 'feature',
      status: ticket.status || 'todo',
      storyPoints: ticket.metadata?.story_points,
      parentEpic: ticket.metadata?.parentEpic,
      labels: ticket.metadata?.labels || ticket.labels?.map((l) => l.name || l),
    })

    // Track declared blocks for bidirectional validation
    if (ticket.metadata?.blocks) {
      declaredBlocks.set(
        id,
        ticket.metadata.blocks.map((ref) => formatId(ref.repo, ref.number)),
      )
    }
  }

  // Second pass: add edges
  for (const ticket of tickets) {
    const fromId = formatId(ticket.repo, ticket.number)

    for (const depRef of ticket.metadata?.depends_on || []) {
      const toId = formatId(depRef.repo, depRef.number)
      graph.addDependency(fromId, toId)
    }
  }

  // Validate including bidirectional checks
  const validationErrors = [
    ...graph.validate(),
    ...validateBidirectional(graph, declaredBlocks),
  ]

  return { graph, validationErrors }
}

/**
 * Validate bidirectional consistency between depends_on and blocks
 * @param {TicketGraph} graph
 * @param {Map<string, string[]>} declaredBlocks
 * @returns {ValidationError[]}
 */
function validateBidirectional(graph, declaredBlocks) {
  const errors = []

  // Check: if A depends_on B, then B should have blocks: [A]
  for (const [nodeId, node] of graph.nodes) {
    for (const depId of graph.getDependencies(nodeId)) {
      if (!graph.hasNode(depId)) continue

      const depBlocks = declaredBlocks.get(depId) || []
      if (!depBlocks.includes(nodeId)) {
        errors.push({
          type: 'bidirectional_mismatch',
          message: `${depId} should have blocks: [${node.number}] (because ${nodeId} depends on it)`,
          nodes: [depId, nodeId],
          fix: { addBlocks: [node.number] },
        })
      }
    }
  }

  // Check: if A blocks B, then B should have depends_on: [A]
  for (const [nodeId, blocks] of declaredBlocks) {
    if (!graph.hasNode(nodeId)) continue
    const node = graph.getNode(nodeId)

    for (const blockedId of blocks) {
      if (!graph.hasNode(blockedId)) continue

      const blockedDeps = graph.getDependencies(blockedId)
      if (!blockedDeps.includes(nodeId)) {
        errors.push({
          type: 'bidirectional_mismatch',
          message: `${blockedId} should have depends_on: [${node.number}] (because ${nodeId} blocks it)`,
          nodes: [blockedId, nodeId],
          fix: { addDependsOn: [node.number] },
        })
      }
    }
  }

  return errors
}

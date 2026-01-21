/**
 * Tests for TicketGraph
 */

import { describe, it, expect } from 'vitest'
import { TicketGraph, buildGraphFromTickets } from './ticket-graph.mjs'

describe('TicketGraph', () => {
  describe('construction', () => {
    it('should create an empty graph', () => {
      const graph = new TicketGraph()
      expect(graph.nodes.size).toBe(0)
      expect(graph.edges.length).toBe(0)
    })

    it('should add nodes', () => {
      const graph = new TicketGraph()
      graph.addNode({ id: 'repo#1', repo: 'repo', number: 1, title: 'Test', type: 'feature', status: 'todo' })

      expect(graph.nodes.size).toBe(1)
      expect(graph.hasNode('repo#1')).toBe(true)
      expect(graph.getNode('repo#1').title).toBe('Test')
    })

    it('should add dependencies', () => {
      const graph = new TicketGraph()
      graph.addNode({ id: 'repo#1', repo: 'repo', number: 1, title: 'A', type: 'feature', status: 'todo' })
      graph.addNode({ id: 'repo#2', repo: 'repo', number: 2, title: 'B', type: 'feature', status: 'todo' })
      graph.addDependency('repo#2', 'repo#1') // #2 depends on #1

      expect(graph.edges.length).toBe(1)
      expect(graph.getDependencies('repo#2')).toContain('repo#1')
      expect(graph.getBlockedBy('repo#1')).toContain('repo#2')
    })
  })

  describe('queries', () => {
    function createTestGraph() {
      // Graph structure:
      //   1 -> 2 -> 4
      //   1 -> 3 -> 4
      //   5 (orphan)
      const graph = new TicketGraph()
      graph.addNode({ id: 'r#1', repo: 'r', number: 1, title: 'Root', type: 'feature', status: 'done' })
      graph.addNode({ id: 'r#2', repo: 'r', number: 2, title: 'Middle A', type: 'feature', status: 'in_progress' })
      graph.addNode({ id: 'r#3', repo: 'r', number: 3, title: 'Middle B', type: 'feature', status: 'todo' })
      graph.addNode({ id: 'r#4', repo: 'r', number: 4, title: 'Leaf', type: 'feature', status: 'todo' })
      graph.addNode({ id: 'r#5', repo: 'r', number: 5, title: 'Orphan', type: 'feature', status: 'todo' })

      graph.addDependency('r#2', 'r#1')
      graph.addDependency('r#3', 'r#1')
      graph.addDependency('r#4', 'r#2')
      graph.addDependency('r#4', 'r#3')

      return graph
    }

    it('should find roots (nodes with no dependencies)', () => {
      const graph = createTestGraph()
      const roots = graph.getRoots()

      expect(roots).toContain('r#1')
      expect(roots).toContain('r#5')
      expect(roots.length).toBe(2)
    })

    it('should find leaves (nodes nothing depends on)', () => {
      const graph = createTestGraph()
      const leaves = graph.getLeaves()

      expect(leaves).toContain('r#4')
      expect(leaves).toContain('r#5')
      expect(leaves.length).toBe(2)
    })

    it('should find orphans (isolated nodes)', () => {
      const graph = createTestGraph()
      const orphans = graph.getOrphans()

      expect(orphans).toContain('r#5')
      expect(orphans.length).toBe(1)
    })

    it('should compute transitive dependencies', () => {
      const graph = createTestGraph()
      const deps = graph.getTransitiveDependencies('r#4')

      expect(deps).toContain('r#1')
      expect(deps).toContain('r#2')
      expect(deps).toContain('r#3')
      expect(deps.length).toBe(3)
    })

    it('should compute transitive blockers', () => {
      const graph = createTestGraph()
      const blockers = graph.getTransitiveBlockers('r#1')

      expect(blockers).toContain('r#2')
      expect(blockers).toContain('r#3')
      expect(blockers).toContain('r#4')
      expect(blockers.length).toBe(3)
    })

    it('should compute depths via BFS', () => {
      const graph = createTestGraph()
      const depths = graph.computeDepths()

      expect(depths.get('r#1')).toBe(0)
      expect(depths.get('r#5')).toBe(0)
      expect(depths.get('r#2')).toBe(1)
      expect(depths.get('r#3')).toBe(1)
      expect(depths.get('r#4')).toBe(2)
    })

    it('should perform topological sort', () => {
      const graph = createTestGraph()
      const sorted = graph.topologicalSort()

      expect(sorted).not.toBeNull()
      // #1 must come before #2 and #3
      expect(sorted.indexOf('r#1')).toBeLessThan(sorted.indexOf('r#2'))
      expect(sorted.indexOf('r#1')).toBeLessThan(sorted.indexOf('r#3'))
      // #2 and #3 must come before #4
      expect(sorted.indexOf('r#2')).toBeLessThan(sorted.indexOf('r#4'))
      expect(sorted.indexOf('r#3')).toBeLessThan(sorted.indexOf('r#4'))
    })

    it('should find critical path', () => {
      const graph = createTestGraph()
      const { path, length } = graph.getCriticalPath()

      expect(length).toBe(2) // r#1 -> r#2 -> r#4 or r#1 -> r#3 -> r#4
      expect(path.length).toBe(3)
      expect(path[0]).toBe('r#1')
      expect(path[2]).toBe('r#4')
    })

    it('should group nodes by type', () => {
      const graph = new TicketGraph()
      graph.addNode({ id: 'r#1', repo: 'r', number: 1, title: 'Epic', type: 'epic', status: 'todo' })
      graph.addNode({ id: 'r#2', repo: 'r', number: 2, title: 'Feature', type: 'feature', status: 'todo' })
      graph.addNode({ id: 'r#3', repo: 'r', number: 3, title: 'Bug', type: 'bug', status: 'todo' })

      const groups = graph.getNodesByType()

      expect(groups.get('epic').length).toBe(1)
      expect(groups.get('feature').length).toBe(1)
      expect(groups.get('bug').length).toBe(1)
    })
  })

  describe('validation', () => {
    it('should detect cycles', () => {
      const graph = new TicketGraph()
      graph.addNode({ id: 'r#1', repo: 'r', number: 1, title: 'A', type: 'feature', status: 'todo' })
      graph.addNode({ id: 'r#2', repo: 'r', number: 2, title: 'B', type: 'feature', status: 'todo' })
      graph.addNode({ id: 'r#3', repo: 'r', number: 3, title: 'C', type: 'feature', status: 'todo' })

      graph.addDependency('r#1', 'r#2')
      graph.addDependency('r#2', 'r#3')
      graph.addDependency('r#3', 'r#1') // Creates cycle

      const errors = graph.validate()
      const cycleErrors = errors.filter((e) => e.type === 'cycle')

      expect(cycleErrors.length).toBeGreaterThan(0)
      expect(cycleErrors[0].message).toContain('Cycle detected')
    })

    it('should detect self-references', () => {
      const graph = new TicketGraph()
      graph.addNode({ id: 'r#1', repo: 'r', number: 1, title: 'A', type: 'feature', status: 'todo' })
      graph.addDependency('r#1', 'r#1') // Self-reference

      const errors = graph.validate()
      const selfRefErrors = errors.filter((e) => e.type === 'self_reference')

      expect(selfRefErrors.length).toBe(1)
      expect(selfRefErrors[0].message).toContain('references itself')
    })

    it('should detect dangling references', () => {
      const graph = new TicketGraph()
      graph.addNode({ id: 'r#1', repo: 'r', number: 1, title: 'A', type: 'feature', status: 'todo' })
      graph.addDependency('r#1', 'r#999') // r#999 doesn't exist

      const errors = graph.validate()
      const danglingErrors = errors.filter((e) => e.type === 'dangling_ref')

      expect(danglingErrors.length).toBe(1)
      expect(danglingErrors[0].message).toContain('non-existent')
    })

    it('should return null for topological sort when cycle exists', () => {
      const graph = new TicketGraph()
      graph.addNode({ id: 'r#1', repo: 'r', number: 1, title: 'A', type: 'feature', status: 'todo' })
      graph.addNode({ id: 'r#2', repo: 'r', number: 2, title: 'B', type: 'feature', status: 'todo' })

      graph.addDependency('r#1', 'r#2')
      graph.addDependency('r#2', 'r#1')

      const sorted = graph.topologicalSort()
      expect(sorted).toBeNull()
    })
  })

  describe('serialization', () => {
    it('should serialize to JSON', () => {
      const graph = new TicketGraph()
      graph.addNode({ id: 'r#1', repo: 'r', number: 1, title: 'A', type: 'feature', status: 'todo' })
      graph.addNode({ id: 'r#2', repo: 'r', number: 2, title: 'B', type: 'feature', status: 'done' })
      graph.addDependency('r#2', 'r#1')

      const json = graph.toJSON()

      expect(json.nodes.length).toBe(2)
      expect(json.edges.length).toBe(1)
      expect(json.metadata.nodeCount).toBe(2)
      expect(json.metadata.edgeCount).toBe(1)
    })

    it('should deserialize from JSON', () => {
      const data = {
        nodes: [
          { id: 'r#1', repo: 'r', number: 1, title: 'A', type: 'feature', status: 'todo' },
          { id: 'r#2', repo: 'r', number: 2, title: 'B', type: 'feature', status: 'done' },
        ],
        edges: [{ from: 'r#2', to: 'r#1', type: 'depends_on' }],
      }

      const graph = TicketGraph.fromJSON(data)

      expect(graph.nodes.size).toBe(2)
      expect(graph.edges.length).toBe(1)
      expect(graph.getDependencies('r#2')).toContain('r#1')
    })
  })
})

describe('buildGraphFromTickets', () => {
  it('should build graph from ticket data', () => {
    const tickets = [
      {
        repo: 'repo',
        number: 1,
        title: 'First',
        type: 'feature',
        status: 'done',
        metadata: { story_points: 3 },
      },
      {
        repo: 'repo',
        number: 2,
        title: 'Second',
        type: 'feature',
        status: 'todo',
        metadata: {
          depends_on: [{ repo: 'repo', number: 1 }],
          blocks: [],
        },
      },
    ]

    const { graph, validationErrors } = buildGraphFromTickets(tickets, {
      formatId: (repo, num) => `${repo}#${num}`,
    })

    expect(graph.nodes.size).toBe(2)
    expect(graph.edges.length).toBe(1)
    expect(graph.getDependencies('repo#2')).toContain('repo#1')
  })

  it('should detect bidirectional mismatches', () => {
    const tickets = [
      {
        repo: 'repo',
        number: 1,
        title: 'First',
        type: 'feature',
        status: 'done',
        metadata: {
          blocks: [], // Should have blocks: [2] since #2 depends on it
        },
      },
      {
        repo: 'repo',
        number: 2,
        title: 'Second',
        type: 'feature',
        status: 'todo',
        metadata: {
          depends_on: [{ repo: 'repo', number: 1 }],
        },
      },
    ]

    const { validationErrors } = buildGraphFromTickets(tickets, {
      formatId: (repo, num) => `${repo}#${num}`,
    })

    const mismatchErrors = validationErrors.filter((e) => e.type === 'bidirectional_mismatch')
    expect(mismatchErrors.length).toBeGreaterThan(0)
  })

  it('should preserve ticket metadata', () => {
    const tickets = [
      {
        repo: 'repo',
        number: 1,
        title: 'Test',
        type: 'epic',
        status: 'in_progress',
        metadata: {
          story_points: 8,
          parentEpic: 99,
        },
        labels: ['epic', 'important'],
      },
    ]

    const { graph } = buildGraphFromTickets(tickets, {
      formatId: (repo, num) => `${repo}#${num}`,
    })

    const node = graph.getNode('repo#1')
    expect(node.type).toBe('epic')
    expect(node.status).toBe('in_progress')
    expect(node.storyPoints).toBe(8)
    expect(node.parentEpic).toBe(99)
  })
})

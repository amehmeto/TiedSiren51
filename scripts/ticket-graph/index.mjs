/**
 * Dependency Graph Library
 *
 * Exports:
 * - TicketGraph: Graph data structure for ticket dependencies
 * - buildGraphFromTickets: Build a graph from raw ticket data
 * - GitHub fetcher utilities
 * - Mermaid renderer
 */

export { TicketGraph, buildGraphFromTickets } from './ticket-graph.mjs'

export {
  fetchAllIssues,
  extractMetadata,
  parseDependencyRef,
  parseTicketDependencies,
  detectTicketType,
  transformIssuesToTickets,
} from './github-fetcher.mjs'

export { renderMermaidDiagram, validateMermaid } from './mermaid-renderer.mjs'

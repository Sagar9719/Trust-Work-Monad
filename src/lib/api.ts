import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

function getDemoProject(projectId: string) {
  const now = Math.floor(Date.now() / 1000)

  return {
    id: projectId,
    title: 'Build Spring Boot REST API',
    description: 'Create a REST API with PostgreSQL integration, JWT authentication, and unit tests',
    budget_usd: 3500,
    status: 'bidding',
    client_wallet: '0x1234567890abcdef1234567890abcdef12345678',
    auction: {
      commit_deadline: now + 3600,
      reveal_deadline: now + 7200,
      winner_id: null,
      finalized: false,
    },
    bids: [],
    escrow: null,
  }
}

// Projects
export async function getProject(projectId: string) {
  try {
    const response = await client.get(`/api/projects/${projectId}`)
    return response.data
  } catch (error) {
    console.warn(`Falling back to demo project data for ${projectId}:`, error)
    return getDemoProject(projectId)
  }
}

export async function createProject(data: {
  title: string
  description: string
  budget_usd: number
  auction_duration_minutes: number
}) {
  const response = await client.post('/api/projects', data)
  return response.data
}

// Bidding
export async function submitBidCommitment(data: {
  auctionId: string
  commitment_hash: string
}) {
  const response = await client.post('/api/bids/commit', data)
  return response.data
}

export async function revealBid(data: {
  bidId: string
  amount: number
  secret: string
}) {
  const response = await client.post('/api/bids/reveal', data)
  return response.data
}

// Auction
export async function finalizeAuction(auctionId: string) {
  const response = await client.post(`/api/auctions/${auctionId}/finalize`)
  return response.data
}

// Escrow
export async function fundEscrow(data: {
  projectId: string
  amount_usd: number
}) {
  const response = await client.post('/api/escrow/fund', data)
  return response.data
}

// Milestones
export async function submitMilestone(milestoneId: string, data: {
  submission_link: string
}) {
  const response = await client.post(`/api/milestones/${milestoneId}/submit`, data)
  return response.data
}

export async function approveMilestone(milestoneId: string) {
  const response = await client.post(`/api/milestones/${milestoneId}/approve`, {})
  return response.data
}

// Blockchain Events
export async function pollBlockchainEvents() {
  const response = await client.get('/api/blockchain/events/poll')
  return response.data
}

// Users
export async function getOrCreateUser(walletAddress: string) {
  const response = await client.post('/api/users', { wallet_address: walletAddress })
  return response.data
}

export default client

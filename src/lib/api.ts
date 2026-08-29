import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://trustwork-production-dddf.up.railway.app'

export const TRUSTWORK_PROJECT_ID = '08aae2b6-e67e-44b0-81f2-b92559c49b23'

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
    title: 'AI-Powered DeFi Analytics Dashboard',
    description: 'Build an on-chain analytics dashboard for Monad users with wallet insights, risk scoring, and portfolio alerts for institutional traders.',
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

function normalizeProject(data: any) {
  if (!data || data.auction) return data

  return {
    ...data,
    uiPhase: data.uiPhase ?? 'AWAITING_FINALIZE',
    chainProjectId: data.chainProjectId ?? null,
    budget_usd: data.budgetUsd ?? data.budget_usd ?? 0,
    status: String(data.phase || data.status || 'pending').toLowerCase(),
    client_wallet: data.clientWallet ?? data.client_wallet ?? '',
    auction: {
      commit_deadline: data.commitDeadline ?? data.commit_deadline ?? 0,
      reveal_deadline: data.revealDeadline ?? data.reveal_deadline ?? 0,
      winner_id: data.winnerWallet ?? data.winner_id ?? null,
      finalized: data.uiPhase === 'COMPLETED' || Boolean(data.finalized),
    },
    bids: (data.bids || []).map((bid: any) => ({
      ...bid,
      id: bid.bidId ?? bid.id,
      bidder_id: bid.bidderWallet ?? bid.bidder_id ?? '',
      revealed_amount: bid.revealedAmountUsd ?? bid.revealed_amount,
      is_ai_agent: bid.isAiAgent ?? bid.is_ai_agent ?? false,
    })),
    milestone: data.milestone || (data.milestones || [])[0] || null,
    escrow: data.escrow
      ? {
          ...data.escrow,
          smart_contract_tx_hash: data.escrow.smartContractTxHash ?? data.escrow.smart_contract_tx_hash,
        }
      : null,
  }
}

// Projects
export async function getProjects() {
  const response = await client.get('/api/projects')
  return response.data.map(normalizeProject)
}

export async function getProject(projectId: string) {
  try {
    const response = await client.get(`/api/projects/${projectId}`)
    return normalizeProject(response.data)
  } catch (error) {
    console.warn(`Falling back to demo project data for ${projectId}:`, error)
    return getDemoProject(projectId)
  }
}

export async function createProject(data: {
  title: string
  description: string
  specUri?: string
  budgetUsd: number
  clientWallet: string
  commitDurationSeconds?: number
  revealDurationSeconds?: number
  bidBondWei?: string
  milestoneBps?: number[]
}) {
  const response = await client.post('/api/projects', data)
  return response.data
}

export async function getConfig() {
  const response = await client.get('/api/config')
  return response.data
}

// Bidding
export async function submitBidCommitment(data: {
  projectId: string
  bidderWallet: string
  amountUsd: number
  salt: string
  commitmentHash: string
}) {
  const response = await client.post('/api/bids/commit', data)
  return response.data
}

export async function revealBid(data: {
  bidId: string
  amountUsd: number
  salt: string
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

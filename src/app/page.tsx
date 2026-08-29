import Link from 'next/link'

import { TRUSTWORK_PROJECT_ID } from '@/lib/api'

export default function Dashboard() {
  const demoProject = {
    id: TRUSTWORK_PROJECT_ID,
    title: 'AI-Powered DeFi Analytics Dashboard',
    description: 'Build an on-chain analytics dashboard for Monad users with wallet insights, risk scoring, and portfolio alerts for institutional traders.',
    budget_usd: 3500,
    status: 'bidding',
    created_at: new Date().toISOString(),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-gray-400">Welcome to TrustWork - Private AI Freelance Marketplace</p>
      </div>

      {/* Info Section */}
      <div className="card space-y-3">
        <h3 className="text-lg font-bold">How it works:</h3>
        <ul className="text-sm space-y-2 text-gray-300">
          <li>1. Client creates job with budget and deadline</li>
          <li>2. Freelancers and AI agents submit private bids (commit-reveal)</li>
          <li>3. Auction closes and reveal phase begins</li>
          <li>4. Winner selected (lowest valid bid)</li>
          <li>5. Client funds escrow in smart contract</li>
          <li>6. Winner submits milestone work</li>
          <li>7. Client approves, payment released</li>
        </ul>
      </div>

      {/* Demo Project Card */}
      <div className="card space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{demoProject.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{demoProject.description}</p>
          </div>
          <span className={`status-badge-pending`}>
            {demoProject.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Budget</p>
            <p className="text-lg font-bold text-green-400">${demoProject.budget_usd}</p>
          </div>
          <div>
            <p className="text-gray-400">Created</p>
            <p className="text-sm font-mono">{new Date(demoProject.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-400">Status</p>
            <p className="text-sm font-mono capitalize">{demoProject.status}</p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <Link href={`/project/${demoProject.id}`}>
            <button className="button">
              View Project & Bids
            </button>
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card space-y-3">
        <h3 className="text-sm font-bold text-gray-400">Quick Links:</h3>
        <div className="space-y-2">
          <Link href="/bid" className="block text-blue-400 hover:text-blue-300 text-sm">
            → Go to Bid Phase
          </Link>
          <Link href="/reveal" className="block text-blue-400 hover:text-blue-300 text-sm">
            → Go to Reveal Phase
          </Link>
          <Link href="/escrow" className="block text-blue-400 hover:text-blue-300 text-sm">
            → Go to Escrow
          </Link>
          <Link href="/milestone" className="block text-blue-400 hover:text-blue-300 text-sm">
            → Go to Milestone
          </Link>
        </div>
      </div>
    </div>
  )
}

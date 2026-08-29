'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProject } from '@/lib/api'
import { getAuctionPhase, getTimeRemaining, formatUSDC, formatAddress } from '@/lib/utils'

export default function ProjectPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<string>('')

  useEffect(() => {
    const loadProject = async () => {
      const resolvedParams = typeof params === 'object' && params !== null && 'then' in params
        ? await params
        : params

      const projectId = resolvedParams?.id || 'demo-001'

      try {
        const data = await getProject(projectId)
        setProject(data)
        setError(null)
      } catch (err) {
        setError('Failed to load project')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadProject()
    const interval = setInterval(() => loadProject(), 5000)
    return () => clearInterval(interval)
  }, [params])

  // Update countdown timer
  useEffect(() => {
    if (!project?.auction) return

    const updateCountdown = () => {
      const phase = getAuctionPhase(
        project.auction.commit_deadline,
        project.auction.reveal_deadline
      )

      const deadline =
        phase === 'bidding'
          ? project.auction.commit_deadline
          : project.auction.reveal_deadline

      const { display } = getTimeRemaining(deadline)
      setCountdown(display)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [project])

  if (loading) {
    return (
      <div className="card">
        <p>Loading project...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="card border-red-600">
        <p className="text-red-400">{error || 'Project not found'}</p>
        <Link href="/" className="text-blue-400 hover:text-blue-300 mt-4 block">
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  const phase = getAuctionPhase(
    project.auction.commit_deadline,
    project.auction.reveal_deadline
  )

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
        ← Back to Dashboard
      </Link>

      {/* Project Header */}
      <div className="card space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{project.title}</h2>
            <p className="text-gray-400 mt-2">{project.description}</p>
          </div>
          <span className={`status-badge-${project.status}`}>
            {project.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm border-t border-gray-700 pt-4">
          <div>
            <p className="text-gray-400">Budget</p>
            <p className="text-lg font-bold text-green-400">{formatUSDC(project.budget_usd)}</p>
          </div>
          <div>
            <p className="text-gray-400">Client Wallet</p>
            <p className="text-xs font-mono">{formatAddress(project.client_wallet, 6)}</p>
          </div>
          <div>
            <p className="text-gray-400">Total Bids</p>
            <p className="text-lg font-bold">{project.bids?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Auction Phase Info */}
      <div className="card space-y-4">
        <div>
          <h3 className="text-lg font-bold">Auction Status</h3>
          <p className="text-gray-400 text-sm mt-1">Current phase: <span className="text-white font-bold capitalize">{phase}</span></p>
        </div>

        <div className="bg-gray-900 border border-gray-700 p-4 rounded space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">
              {phase === 'bidding' ? 'Commit Phase Ends In:' : 'Reveal Phase Ends In:'}
            </span>
            <span className="countdown">{countdown}</span>
          </div>

          {phase === 'bidding' && (
            <div className="text-xs text-gray-400">
              Bidders submit commitment hashes. Actual bids are hidden.
            </div>
          )}

          {phase === 'reveal' && (
            <div className="text-xs text-gray-400">
              Bidders reveal their actual bids. Commitments are verified.
            </div>
          )}

          {phase === 'completed' && (
            <div className="text-xs text-green-400">
              Auction completed. Winner: {project.auction.winner_id ? formatAddress(project.auction.winner_id) : 'Not yet decided'}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-gray-700">
          {phase === 'bidding' && (
            <Link href="/bid">
              <button className="button w-full">Submit Bid Commitment</button>
            </Link>
          )}

          {phase === 'reveal' && (
            <Link href="/reveal">
              <button className="button w-full">Reveal Your Bid</button>
            </Link>
          )}

          {phase === 'completed' && project.auction.winner_id && !project.auction.finalized && (
            <p className="text-yellow-400 text-sm">
              ℹ Waiting for winner confirmation...
            </p>
          )}

          {phase === 'completed' && project.auction.finalized && (
            <Link href="/escrow">
              <button className="button w-full">Proceed to Escrow Funding</button>
            </Link>
          )}
        </div>
      </div>

      {/* Current Bids */}
      {project.bids && project.bids.length > 0 && (
        <div className="card space-y-3">
          <h3 className="text-lg font-bold">Bids Submitted: {project.bids.length}</h3>

          {phase === 'bidding' && (
            <p className="text-xs text-gray-400">Bid amounts are hidden during bidding phase</p>
          )}

          <div className="space-y-2">
            {project.bids.map((bid: any, idx: number) => (
              <div key={idx} className="bg-gray-900 p-3 rounded border border-gray-700 flex justify-between">
                <div className="text-sm">
                  <p className="text-gray-400">
                    Bidder {idx + 1} {bid.is_ai_agent && <span className="text-purple-400">[AI Agent]</span>}
                  </p>
                  <p className="text-xs font-mono text-gray-500">{formatAddress(bid.bidder_id, 4)}</p>
                </div>
                {phase !== 'bidding' && bid.revealed_amount ? (
                  <div className="text-right">
                    <p className="font-bold">{formatUSDC(bid.revealed_amount)}</p>
                    {project.auction.winner_id === bid.bidder_id && (
                      <span className="winner-badge">WINNER</span>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Hidden</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Info */}
      {project.escrow?.smart_contract_tx_hash && (
        <div className="card space-y-2 border-green-600">
          <p className="text-green-400">✓ Escrow Funded</p>
          <p className="text-xs text-gray-400">Transaction Hash:</p>
          <a
            href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${project.escrow.smart_contract_tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-hash"
          >
            {project.escrow.smart_contract_tx_hash}
          </a>
        </div>
      )}
    </div>
  )
}

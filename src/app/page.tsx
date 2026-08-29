'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProjects } from '@/lib/api'

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch((err) => {
        setError('Unable to load projects from the backend')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [])

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

      {/* Live Projects */}
      <div className="card space-y-4">
        <h3 className="text-lg font-bold">Projects</h3>
        {loading && <p className="text-sm text-gray-400">Loading live projects...</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}
        {!loading && !error && projects.length === 0 && (
          <p className="text-sm text-gray-400">No projects are available.</p>
        )}
        <div className="space-y-4">
          {projects.map((project) => {
            const canBid = project.uiPhase === 'COMMIT_OPEN'
            return (
              <div key={project.id} className="border border-gray-700 bg-gray-900 p-4 rounded space-y-4">
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <h3 className="text-xl font-bold">{project.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{project.description}</p>
                  </div>
                  <span className={canBid ? 'status-badge-success' : 'status-badge-pending'}>
                    {String(project.uiPhase || project.phase || 'UNKNOWN').replaceAll('_', ' ')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-700 pt-3 text-sm">
                  <span className="text-gray-400">Budget: <strong className="text-green-400">${project.budget_usd.toLocaleString()}</strong></span>
                  <div className="flex gap-2">
                    <Link href={`/project/${project.id}`} className="button-secondary">View Project</Link>
                    {canBid && <Link href="/bid" className="button">Submit Bid</Link>}
                  </div>
                </div>
              </div>
            )
          })}
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

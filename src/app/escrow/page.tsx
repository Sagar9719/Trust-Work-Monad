'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { getProject, fundEscrow } from '@/lib/api'
import { formatAddress, formatUSDC } from '@/lib/utils'
import Link from 'next/link'

export default function EscrowPage() {
  const { address, isConnected } = useAccount()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [funded, setFunded] = useState(false)
  const [txHash, setTxHash] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [escrowAddress, setEscrowAddress] = useState<string>('')

  const projectId = 'demo-001'

  useEffect(() => {
    loadProject()
  }, [])

  const loadProject = async () => {
    try {
      const data = await getProject(projectId)
      setProject(data)
      setError(null)
    } catch (err) {
      setError('Failed to load project')
      console.error(err)
    }
  }

  const handleFundEscrow = async () => {
    if (!isConnected) {
      setError('Please connect your wallet')
      return
    }

    if (!project?.auction?.winner_id) {
      setError('No winner selected yet')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fundEscrow({
        projectId: projectId,
        amount_usd: project.budget_usd,
      })

      setTxHash(response.tx_hash)
      setEscrowAddress(response.escrow_contract_address)
      setFunded(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fund escrow')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!project) {
    return (
      <div className="card">
        <p>Loading project...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back Link */}
      <Link href="/project/demo-001" className="text-blue-400 hover:text-blue-300 text-sm">
        ← Back to Project
      </Link>

      {/* Header */}
      <div className="card space-y-2">
        <h2 className="text-2xl font-bold">Escrow Funding</h2>
        <p className="text-gray-400 text-sm">
          Client deposits funds into smart contract. Funds are released based on milestone approvals.
        </p>
      </div>

      {/* Wallet Connection */}
      {!isConnected && (
        <div className="card border-yellow-600 bg-yellow-900 bg-opacity-20">
          <p className="text-yellow-300 text-sm">
            ⚠ Please connect your wallet to fund escrow
          </p>
        </div>
      )}

      {/* Project Summary */}
      <div className="card space-y-3">
        <h3 className="text-lg font-bold">Project Summary</h3>

        <div className="bg-gray-900 p-3 rounded border border-gray-700 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Project Title</span>
            <span className="font-mono text-sm">{project.title}</span>
          </div>
          <div className="flex justify-between border-t border-gray-700 pt-2">
            <span className="text-gray-400">Winner</span>
            <span className="font-mono text-sm text-green-400">
              {project.auction?.winner_id ? formatAddress(project.auction.winner_id) : 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Winning Bid Amount</span>
            <span className="font-bold text-green-400">
              {project.bids?.find((b: any) => b.bidder_id === project.auction?.winner_id)?.revealed_amount 
                ? formatUSDC(project.bids.find((b: any) => b.bidder_id === project.auction?.winner_id).revealed_amount)
                : 'N/A'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Escrow Details */}
      {!funded ? (
        <div className="card space-y-4">
          <h3 className="text-lg font-bold">Escrow Amount</h3>

          <div className="bg-blue-900 bg-opacity-30 border border-blue-600 p-4 rounded">
            <p className="text-sm text-gray-400 mb-2">Total Amount to Fund:</p>
            <p className="text-4xl font-bold text-blue-400">{formatUSDC(project.budget_usd)}</p>
            <p className="text-xs text-gray-500 mt-2">
              This amount will be locked in the smart contract and released upon milestone approvals.
            </p>
          </div>

          <div className="bg-gray-900 p-3 rounded border border-gray-700 text-xs space-y-2">
            <p className="font-bold text-white">Escrow Details:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Client: {formatAddress(project.client_wallet, 6)}</li>
              <li>Freelancer: {formatAddress(project.auction?.winner_id, 6)}</li>
              <li>Network: Monad Testnet</li>
              <li>Token: USDC (testnet)</li>
            </ul>
          </div>

          {/* Warning */}
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 p-3 rounded">
            <p className="text-yellow-300 text-sm font-bold">⚠ Important:</p>
            <p className="text-yellow-200 text-xs mt-2">
              You need to have approved USDC transfer first. Make sure your MetaMask is set to Monad Testnet and you have testnet USDC.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-600 p-3 rounded">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Button */}
          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={handleFundEscrow}
              disabled={loading || !isConnected || !project?.auction?.winner_id}
              className={`button w-full ${loading || !isConnected || !project?.auction?.winner_id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Funding Escrow...' : `Fund Escrow with ${formatUSDC(project.budget_usd)} USDC`}
            </button>
          </div>
        </div>
      ) : (
        /* Success Message */
        <div className="card space-y-4 border-green-600">
          <h3 className="text-lg font-bold text-green-400">✓ Escrow Funded Successfully!</h3>

          <div className="bg-gray-900 p-3 rounded border border-gray-700 space-y-2">
            <p className="text-sm text-gray-400">Funded Amount:</p>
            <p className="text-2xl font-bold text-green-400">{formatUSDC(project.budget_usd)}</p>
          </div>

          <div className="bg-gray-900 p-3 rounded border border-gray-700 space-y-2">
            <p className="text-sm text-gray-400">Escrow Contract Address:</p>
            <p className="text-xs font-mono break-all text-blue-400">{escrowAddress}</p>
          </div>

          <div className="bg-gray-900 p-3 rounded border border-gray-700 space-y-2">
            <p className="text-sm text-gray-400">Transaction Hash:</p>
            <a
              href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-xs font-mono break-all"
            >
              {txHash}
            </a>
            <p className="text-xs text-gray-500">
              Click to view on Monad Explorer
            </p>
          </div>

          <div className="bg-blue-900 bg-opacity-30 border border-blue-600 p-3 rounded text-sm text-blue-300 space-y-2">
            <p className="font-bold">Next Steps:</p>
            <ol className="space-y-1 ml-4 list-decimal">
              <li>Freelancer submits milestone work</li>
              <li>You review and approve the work</li>
              <li>Smart contract automatically releases payment</li>
            </ol>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <Link href="/milestone">
              <button className="button w-full">
                Go to Milestone
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

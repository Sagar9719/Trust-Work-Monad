'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { revealBid, TRUSTWORK_PROJECT_ID } from '@/lib/api'
import { getExplorerUrl } from '@/lib/utils'
import Link from 'next/link'

export default function RevealPage() {
  const { isConnected } = useAccount()
  const [bidId, setBidId] = useState('')
  const [amount, setAmount] = useState('')
  const [salt, setSalt] = useState('')
  const [loading, setLoading] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleRevealBid = async () => {
    if (!bidId || !amount || !salt) {
      setError('Please enter your bid ID, amount, and salt')
      return
    }

    if (!isConnected) {
      setError('Please connect your wallet')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await revealBid({
        bidId,
        amountUsd: Number(amount),
        salt,
      })

      if (response.match === false) {
        setError('The amount or salt does not match your committed bid')
        return
      }

      setTxHash(response.txHash || response.tx_hash || '')
      setRevealed(true)
    } catch (err: any) {
      const backendMessage = err.response?.data?.message || err.response?.data?.error
      setError(backendMessage || 'Failed to reveal bid')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href={`/project/${TRUSTWORK_PROJECT_ID}`} className="text-blue-400 hover:text-blue-300 text-sm">
        ← Back to Project
      </Link>

      <div className="card space-y-2">
        <h2 className="text-2xl font-bold">Reveal Bid</h2>
        <p className="text-gray-400 text-sm">
          Provide the bid ID, amount, and 32-byte salt used during commitment.
        </p>
      </div>

      {!isConnected && (
        <div className="card border-yellow-600 bg-yellow-900 bg-opacity-20">
          <p className="text-yellow-300 text-sm">Please connect your wallet to reveal a bid</p>
        </div>
      )}

      {!revealed ? (
        <div className="card space-y-4">
          <div className="form-group">
            <label htmlFor="bidId" className="label">Bid ID</label>
            <input
              id="bidId"
              type="text"
              value={bidId}
              onChange={(event) => setBidId(event.target.value)}
              placeholder="Paste the bid ID from the commitment response"
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount" className="label">Your Bid Amount (USD)</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="e.g., 2500"
              className="input"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">Must match the amount you committed</p>
          </div>

          <div className="form-group">
            <label htmlFor="salt" className="label">Your Bid Salt</label>
            <input
              id="salt"
              type="text"
              value={salt}
              onChange={(event) => setSalt(event.target.value)}
              placeholder="Paste the 32-byte salt saved after bidding"
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">Use the exact salt saved after your bid was committed.</p>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-600 p-3 rounded">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleRevealBid}
            disabled={loading || !isConnected}
            className={`button w-full ${loading || !isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Revealing...' : 'Reveal Bid'}
          </button>

          <div className="bg-gray-900 p-3 rounded border border-gray-700 text-xs text-gray-400 space-y-1">
            <p className="font-bold text-white">Reveal Process</p>
            <p>The backend verifies your amount and salt against the stored commitment.</p>
          </div>
        </div>
      ) : (
        <div className="card space-y-4 border-green-600">
          <h3 className="text-lg font-bold text-green-400">Bid Revealed Successfully!</h3>
          <p className="text-2xl font-bold text-green-400">${amount}</p>
          {txHash ? (
            <a
              href={getExplorerUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-xs font-mono break-all"
            >
              View transaction: {txHash}
            </a>
          ) : (
            <p className="text-yellow-300 text-sm">Reveal accepted. The transaction hash is still pending.</p>
          )}
          <Link href={`/project/${TRUSTWORK_PROJECT_ID}`} className="button w-full text-center">
            Back to Project
          </Link>
        </div>
      )}
    </div>
  )
}

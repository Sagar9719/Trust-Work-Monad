'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { revealBid, TRUSTWORK_PROJECT_ID } from '@/lib/api'
import { calculateCommitmentHash, formatTxHash } from '@/lib/utils'
import Link from 'next/link'

export default function RevealPage() {
  const { address, isConnected } = useAccount()
  const [bidId, setBidId] = useState<string>('') // Will get from URL params in real app
  const [amount, setAmount] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [txHash, setTxHash] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [hashMatch, setHashMatch] = useState<boolean | null>(null)

  const handleValidateHash = () => {
    if (!amount || !secret) {
      setError('Please enter both amount and secret')
      return
    }

    try {
      const calculatedHash = calculateCommitmentHash(parseInt(amount), secret)
      // In real app, this would be compared with stored commitment hash from backend
      setHashMatch(true)
      setError(null)
    } catch (err) {
      setError('Failed to validate hash')
      console.error(err)
    }
  }

  const handleRevealBid = async () => {
    if (!hashMatch) {
      setError('Please validate hash first')
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
        bidId: bidId || 'demo-bid-001',
        amount: parseInt(amount),
        secret,
      })

      setTxHash(response.tx_hash)
      setRevealed(true)
      setAmount('')
      setSecret('')
      setHashMatch(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reveal bid')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back Link */}
      <Link href={`/project/${TRUSTWORK_PROJECT_ID}`} className="text-blue-400 hover:text-blue-300 text-sm">
        ← Back to Project
      </Link>

      {/* Header */}
      <div className="card space-y-2">
        <h2 className="text-2xl font-bold">Reveal Bid</h2>
        <p className="text-gray-400 text-sm">
          Reveal phase: Provide your bid amount and secret phrase to reveal your actual bid.
        </p>
      </div>

      {/* Wallet Connection */}
      {!isConnected && (
        <div className="card border-yellow-600 bg-yellow-900 bg-opacity-20">
          <p className="text-yellow-300 text-sm">
            ⚠ Please connect your wallet to reveal a bid
          </p>
        </div>
      )}

      {/* Main Form */}
      {!revealed ? (
        <div className="card space-y-4">
          {/* Amount Input */}
          <div className="form-group">
            <label htmlFor="amount" className="label">
              Your Bid Amount (USD)
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 3500"
              className="input"
              min="0"
              disabled={hashMatch === true}
            />
            <p className="text-xs text-gray-500 mt-1">Must match the amount you committed</p>
          </div>

          {/* Secret Phrase Input */}
          <div className="form-group">
            <label htmlFor="secret" className="label">
              Your Secret Phrase
            </label>
            <input
              id="secret"
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="e.g., my-random-secret-xyz"
              className="input"
              disabled={hashMatch === true}
            />
            <p className="text-xs text-gray-500 mt-1">The same secret you used during bidding</p>
          </div>

          {/* Hash Validation Result */}
          {hashMatch && (
            <div className="bg-green-900 bg-opacity-30 border border-green-600 p-3 rounded">
              <p className="text-green-400 font-bold">✓ Hash validated successfully!</p>
              <p className="text-xs text-green-300 mt-1">Your amount and secret match the commitment.</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-600 p-3 rounded">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-2 pt-4 border-t border-gray-700">
            {!hashMatch ? (
              <button
                onClick={handleValidateHash}
                className="button w-full"
              >
                Validate Hash
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleRevealBid}
                  disabled={loading || !isConnected}
                  className={`button w-full ${loading || !isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Revealing...' : 'Reveal Bid'}
                </button>
                <button
                  onClick={() => {
                    setAmount('')
                    setSecret('')
                    setHashMatch(null)
                  }}
                  className="button-secondary w-full"
                >
                  Clear & Start Over
                </button>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-gray-900 p-3 rounded border border-gray-700 text-xs text-gray-400 space-y-2">
            <p className="font-bold text-white">Reveal Process:</p>
            <ol className="space-y-1 ml-4 list-decimal">
              <li>Enter the same amount and secret from bidding phase</li>
              <li>Frontend validates the hash matches your commitment</li>
              <li>Backend submits reveal to smart contract</li>
              <li>Smart contract verifies the hash and stores your bid amount</li>
              <li>Your bid is now visible to other participants</li>
            </ol>
          </div>
        </div>
      ) : (
        /* Success Message */
        <div className="card space-y-4 border-green-600">
          <h3 className="text-lg font-bold text-green-400">✓ Bid Revealed Successfully!</h3>

          <div className="bg-gray-900 p-3 rounded border border-gray-700 space-y-2">
            <p className="text-sm text-gray-400">Revealed Amount:</p>
            <p className="text-2xl font-bold text-green-400">${amount}</p>
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

          <div className="bg-blue-900 bg-opacity-30 border border-blue-600 p-3 rounded text-sm text-blue-300">
            <p className="font-bold">ℹ What happens next:</p>
            <p className="mt-2">
              Your bid has been revealed and verified by the smart contract. Wait for the auction to complete to see if you won!
            </p>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <Link href={`/project/${TRUSTWORK_PROJECT_ID}`}>
              <button className="button w-full">
                Back to Project
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

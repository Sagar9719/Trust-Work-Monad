'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { submitBidCommitment, TRUSTWORK_PROJECT_ID } from '@/lib/api'
import { calculateCommitmentHash, formatTxHash } from '@/lib/utils'
import Link from 'next/link'

export default function BidPage() {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [commitmentHash, setCommitmentHash] = useState<string>('')
  const [auctionId, setAuctionId] = useState<string>(TRUSTWORK_PROJECT_ID)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [txHash, setTxHash] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const handleCalculateHash = () => {
    if (!amount || !secret) {
      setError('Please enter both amount and secret')
      return
    }

    try {
      const hash = calculateCommitmentHash(parseInt(amount), secret)
      setCommitmentHash(hash)
      setError(null)
    } catch (err) {
      setError('Failed to calculate hash')
      console.error(err)
    }
  }

  const handleSubmitBid = async () => {
    if (!commitmentHash) {
      setError('Please calculate commitment hash first')
      return
    }

    if (!isConnected || !address) {
      setError('Please connect your wallet')
      return
    }

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid bid amount')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await submitBidCommitment({
        projectId: auctionId,
        bidderWallet: address,
        amountUsd: Number(amount),
        commitmentHash,
      })

      setTxHash(response.txHash || response.tx_hash || '')
      setSubmitted(true)
      setAmount('')
      setSecret('')
      setCommitmentHash('')
    } catch (err: any) {
      const backendMessage = err.response?.data?.message || err.response?.data?.error
      setError(backendMessage || 'Failed to submit bid')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const generateRandomSecret = () => {
    const random = Math.random().toString(36).substring(2, 15)
    setSecret(random)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back Link */}
      <Link href={`/project/${TRUSTWORK_PROJECT_ID}`} className="text-blue-400 hover:text-blue-300 text-sm">
        ← Back to Project
      </Link>

      {/* Header */}
      <div className="card space-y-2">
        <h2 className="text-2xl font-bold">Submit Bid</h2>
        <p className="text-gray-400 text-sm">
          Commit phase: Submit your bid amount and secret phrase. Your actual bid amount is hidden.
        </p>
      </div>

      {/* Wallet Connection */}
      {!isConnected && (
        <div className="card border-yellow-600 bg-yellow-900 bg-opacity-20">
          <p className="text-yellow-300 text-sm">
            ⚠ Please connect your wallet to submit a bid
          </p>
        </div>
      )}

      {/* Main Form */}
      {!submitted ? (
        <div className="card space-y-4">
          {/* Amount Input */}
          <div className="form-group">
            <label htmlFor="amount" className="label">
              Bid Amount (USD)
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 3500"
              className="input"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Enter your bid amount in USD</p>
          </div>

          {/* Secret Phrase Input */}
          <div className="form-group">
            <label htmlFor="secret" className="label">
              Secret Phrase
            </label>
            <div className="flex gap-2">
              <input
                id="secret"
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="e.g., my-random-secret-xyz"
                className="input flex-1"
              />
              <button
                onClick={generateRandomSecret}
                className="button-secondary px-3 py-2 whitespace-nowrap"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Random secret to prevent bid manipulation. Store this safely!
            </p>
          </div>

          {/* Hash Preview */}
          {commitmentHash && (
            <div className="bg-gray-900 p-3 rounded border border-green-600">
              <p className="text-xs text-gray-400 mb-2">Commitment Hash (keccak256):</p>
              <p className="text-xs font-mono break-all text-green-400">{commitmentHash}</p>
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
            {!commitmentHash ? (
              <button
                onClick={handleCalculateHash}
                className="button w-full"
              >
                Calculate Commitment Hash
              </button>
            ) : (
              <button
                onClick={handleSubmitBid}
                disabled={loading || !isConnected}
                className={`button w-full ${loading || !isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Submitting...' : 'Submit Bid Commitment'}
              </button>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-gray-900 p-3 rounded border border-gray-700 text-xs text-gray-400 space-y-2">
            <p className="font-bold text-white">How commit-reveal works:</p>
            <ol className="space-y-1 ml-4 list-decimal">
              <li>You provide amount + secret</li>
              <li>Frontend calculates keccak256(amount + secret)</li>
              <li>Only hash is submitted on-chain (bid hidden)</li>
              <li>During reveal phase, you provide amount + secret again</li>
              <li>Smart contract verifies the hash matches</li>
            </ol>
          </div>
        </div>
      ) : (
        /* Success Message */
        <div className="card space-y-4 border-green-600">
          <h3 className="text-lg font-bold text-green-400">✓ Bid Committed Successfully!</h3>

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
            <p className="font-bold mb-2">📝 Important: Save Your Secret!</p>
            <p className="font-mono bg-gray-900 p-2 rounded mb-2 break-all">{secret}</p>
            <p>
              You'll need this secret to reveal your bid during the reveal phase. Keep it safe!
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

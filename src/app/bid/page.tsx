'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { getProjects, submitBidCommitment, TRUSTWORK_PROJECT_ID } from '@/lib/api'
import { calculateBidCommitmentHash, formatTxHash, generateBidSalt, getExplorerUrl } from '@/lib/utils'
import Link from 'next/link'

export default function BidPage() {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState<string>('')
  const [salt, setSalt] = useState<string>('')
  const [commitmentHash, setCommitmentHash] = useState<string>('')
  const [auctionId, setAuctionId] = useState<string>(TRUSTWORK_PROJECT_ID)
  const [chainProjectId, setChainProjectId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [txHash, setTxHash] = useState<string>('')
  const [explorerUrl, setExplorerUrl] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [bidWindowOpen, setBidWindowOpen] = useState(false)
  const [checkingBidWindow, setCheckingBidWindow] = useState(true)

  useEffect(() => {
    const checkBidWindow = () => {
      setCheckingBidWindow(true)
      getProjects().then((projects) => {
        const project = projects.find((candidate: any) => candidate.uiPhase === 'COMMIT_OPEN')
        setBidWindowOpen(Boolean(project))
        if (project) {
          setAuctionId(project.id)
          setChainProjectId(project.chainProjectId ?? null)
        }
      }).catch((err) => {
        setBidWindowOpen(false)
        console.error('Failed to check bid window:', err)
      }).finally(() => setCheckingBidWindow(false))
    }

    checkBidWindow()
    const interval = setInterval(checkBidWindow, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleCalculateHash = () => {
    if (!bidWindowOpen) {
      setError('The commit window is closed. New bids cannot be submitted for this project.')
      return
    }

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid bid amount')
      return
    }

    if (!address || !chainProjectId) {
      setError('Connect your wallet and wait for the project details to load')
      return
    }

    try {
      const generatedSalt = generateBidSalt()
      const hash = calculateBidCommitmentHash(chainProjectId, address, Number(amount), generatedSalt)
      setSalt(generatedSalt)
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

    if (!bidWindowOpen) {
      setError('The commit window is closed. New bids cannot be submitted for this project.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await submitBidCommitment({
        projectId: auctionId,
        bidderWallet: address,
        amountUsd: Number(amount),
        salt,
        commitmentHash,
      })

      const submittedTxHash = response.txHash || response.tx_hash || ''
      setTxHash(submittedTxHash)
      setExplorerUrl(response.explorer || (submittedTxHash ? getExplorerUrl(submittedTxHash) : ''))
      setSubmitted(true)
      setAmount('')
      setCommitmentHash('')
    } catch (err: any) {
      const backendMessage = err.response?.data?.message || err.response?.data?.error
      setError(backendMessage || 'Failed to submit bid')
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
        <h2 className="text-2xl font-bold">Submit Bid</h2>
        <p className="text-gray-400 text-sm">
          Commit phase: Submit your bid amount. Your actual bid amount is hidden until reveal.
        </p>
        {!checkingBidWindow && !bidWindowOpen && (
          <p className="text-yellow-300 text-sm border-t border-gray-700 pt-2">
            This project&apos;s commit window is closed. Watch for a new active project to submit a bid.
          </p>
        )}
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

          {/* Salt */}
          <div className="form-group">
            <label htmlFor="salt" className="label">
              Bid Salt
            </label>
            <div className="flex gap-2">
              <input
                id="salt"
                type="text"
                value={salt}
                readOnly
                placeholder="Generated when you calculate the commitment"
                className="input flex-1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              A secure 32-byte salt is generated locally. Store it safely for the reveal step.
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
                disabled={checkingBidWindow || !bidWindowOpen}
                className={`button w-full ${checkingBidWindow || !bidWindowOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {checkingBidWindow ? 'Checking Bid Window...' : bidWindowOpen ? 'Calculate Commitment Hash' : 'Commit Window Closed'}
              </button>
            ) : (
              <button
                onClick={handleSubmitBid}
                disabled={loading || !isConnected || !bidWindowOpen}
                className={`button w-full ${loading || !isConnected || !bidWindowOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Submitting...' : 'Submit Bid Commitment'}
              </button>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-gray-900 p-3 rounded border border-gray-700 text-xs text-gray-400 space-y-2">
            <p className="font-bold text-white">How commit-reveal works:</p>
            <ol className="space-y-1 ml-4 list-decimal">
              <li>You provide an amount</li>
              <li>Frontend generates a secure salt and calculates the commitment</li>
              <li>Only hash is submitted on-chain (bid hidden)</li>
              <li>During reveal phase, you provide amount + salt again</li>
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
            {txHash && explorerUrl ? (
              <>
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs font-mono break-all"
                >
                  {formatTxHash(txHash, 10)}
                </a>
                <p className="text-xs text-gray-500">View this transaction on Monad Explorer</p>
              </>
            ) : (
              <p className="text-xs text-yellow-300">
                Transaction submitted to the backend. The on-chain transaction hash is still pending.
              </p>
            )}
          </div>

          <div className="bg-blue-900 bg-opacity-30 border border-blue-600 p-3 rounded text-sm text-blue-300">
            <p className="font-bold mb-2">📝 Important: Save Your Salt!</p>
            <p className="font-mono bg-gray-900 p-2 rounded mb-2 break-all">{salt}</p>
            <p>
              You&apos;ll need this salt to reveal your bid during the reveal phase. Keep it safe!
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

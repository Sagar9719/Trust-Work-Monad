'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { getProject, submitMilestone, approveMilestone, TRUSTWORK_PROJECT_ID } from '@/lib/api'
import { formatAddress, formatUSDC } from '@/lib/utils'
import Link from 'next/link'

export default function MilestonePage() {
  const { address, isConnected } = useAccount()
  const [project, setProject] = useState<any>(null)
  const [userRole, setUserRole] = useState<'client' | 'freelancer' | 'observer'>('observer')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submissionLink, setSubmissionLink] = useState<string>('')
  const [submitted, setSubmitted] = useState(false)
  const [approved, setApproved] = useState(false)
  const [txHash, setTxHash] = useState<string>('')

  const projectId = TRUSTWORK_PROJECT_ID

  useEffect(() => {
    loadProject()
  }, [address])

  const loadProject = async () => {
    try {
      const data = await getProject(projectId)
      setProject(data)

      // Determine user role
      if (address === data.client_wallet) {
        setUserRole('client')
      } else if (address === data.auction?.winner_id) {
        setUserRole('freelancer')
      } else {
        setUserRole('observer')
      }

      setError(null)
    } catch (err) {
      setError('Failed to load project')
      console.error(err)
    }
  }

  const handleSubmitWork = async () => {
    if (!submissionLink) {
      setError('Please enter submission link')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await submitMilestone(project.milestone?.id || 'demo-milestone', {
        submission_link: submissionLink,
      })

      setSubmitted(true)
      setSubmissionLink('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit milestone')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveMilestone = async () => {
    if (!isConnected) {
      setError('Please connect your wallet')
      return
    }

    setApproving(true)
    setError(null)

    try {
      const response = await approveMilestone(project.milestone?.id || 'demo-milestone')

      setTxHash(response.tx_hash)
      setApproved(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve milestone')
      console.error(err)
    } finally {
      setApproving(false)
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
      <Link href={`/project/${TRUSTWORK_PROJECT_ID}`} className="text-blue-400 hover:text-blue-300 text-sm">
        ← Back to Project
      </Link>

      {/* Header */}
      <div className="card space-y-2">
        <h2 className="text-2xl font-bold">Milestone</h2>
        <p className="text-gray-400 text-sm">
          Freelancer submits work. Client reviews and approves for payment release.
        </p>
      </div>

      {/* User Role Info */}
      <div className={`card ${userRole === 'observer' ? 'border-gray-600' : 'border-blue-600'}`}>
        <p className="text-sm text-gray-400">Your Role: <span className="font-bold capitalize text-white">{userRole}</span></p>
        {userRole === 'observer' && (
          <p className="text-xs text-gray-500 mt-1">You can view but not interact with this milestone</p>
        )}
      </div>

      {/* Wallet Connection */}
      {!isConnected && (
        <div className="card border-yellow-600 bg-yellow-900 bg-opacity-20">
          <p className="text-yellow-300 text-sm">
            ⚠ Please connect your wallet
          </p>
        </div>
      )}

      {/* Milestone Summary */}
      <div className="card space-y-3">
        <h3 className="text-lg font-bold">Milestone Details</h3>

        <div className="bg-gray-900 p-3 rounded border border-gray-700 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Title</span>
            <span className="font-mono text-sm">{project.milestone?.title || 'Project Completion'}</span>
          </div>
          <div className="flex justify-between border-t border-gray-700 pt-2">
            <span className="text-gray-400">Amount</span>
            <span className="font-bold text-green-400">
              {formatUSDC(project.milestone?.amount_usd || project.budget_usd)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status</span>
            <span className={`status-badge-${project.milestone?.status || 'pending'}`}>
              {project.milestone?.status?.toUpperCase() || 'PENDING'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Freelancer</span>
            <span className="text-xs font-mono text-blue-400">{formatAddress(project.auction?.winner_id, 6)}</span>
          </div>
        </div>
      </div>

      {/* Freelancer View - Submit Work */}
      {userRole === 'freelancer' && !submitted && (
        <div className="card space-y-4">
          <h3 className="text-lg font-bold">Submit Your Work</h3>

          <div className="form-group">
            <label htmlFor="link" className="label">
              Work Submission Link
            </label>
            <input
              id="link"
              type="url"
              value={submissionLink}
              onChange={(e) => setSubmissionLink(e.target.value)}
              placeholder="https://github.com/your-project/..."
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Link to your completed work (GitHub, Google Drive, etc.)
            </p>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-600 p-3 rounded">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={handleSubmitWork}
              disabled={submitting || !isConnected || !submissionLink}
              className={`button w-full ${submitting || !isConnected || !submissionLink ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Submitting...' : 'Submit Work'}
            </button>
          </div>
        </div>
      )}

      {/* Freelancer View - Work Submitted */}
      {userRole === 'freelancer' && submitted && (
        <div className="card border-green-600 space-y-3">
          <p className="text-green-400 font-bold">✓ Work Submitted Successfully!</p>
          <p className="text-sm text-gray-400">
            Waiting for client review and approval...
          </p>
        </div>
      )}

      {/* Client View - Review & Approve */}
      {userRole === 'client' && project.milestone?.submission_link && !approved && (
        <div className="card space-y-4">
          <h3 className="text-lg font-bold">Review Work Submission</h3>

          <div className="bg-gray-900 p-3 rounded border border-gray-700 space-y-2">
            <p className="text-sm text-gray-400">Submitted Link:</p>
            <a
              href={project.milestone.submission_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm break-all"
            >
              {project.milestone.submission_link}
            </a>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-600 p-3 rounded">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 p-3 rounded">
            <p className="text-yellow-300 text-sm">
              ℹ Please review the submitted work. Once approved, payment will be released to the freelancer.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-700">
            <button
              onClick={handleApproveMilestone}
              disabled={approving || !isConnected}
              className={`button w-full ${approving || !isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {approving ? 'Approving...' : 'Approve & Release Payment'}
            </button>
          </div>
        </div>
      )}

      {/* Payment Released */}
      {approved && (
        <div className="card space-y-4 border-green-600">
          <h3 className="text-lg font-bold text-green-400">✓ Payment Released!</h3>

          <div className="bg-gray-900 p-3 rounded border border-gray-700 space-y-2">
            <p className="text-sm text-gray-400">Amount Released:</p>
            <p className="text-2xl font-bold text-green-400">
              {formatUSDC(project.milestone?.amount_usd || project.budget_usd)}
            </p>
          </div>

          <div className="bg-gray-900 p-3 rounded border border-gray-700 space-y-2">
            <p className="text-sm text-gray-400">To Freelancer:</p>
            <p className="text-sm font-mono text-blue-400">{formatAddress(project.auction?.winner_id, 6)}</p>
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
            <p className="text-xs text-gray-500">Click to view on Monad Explorer</p>
          </div>

          <div className="bg-blue-900 bg-opacity-30 border border-blue-600 p-3 rounded text-sm text-blue-300">
            <p className="font-bold">🎉 Project Complete!</p>
            <p className="mt-2">
              The freelancer has received their payment. Thank you for using TrustWork!
            </p>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <Link href="/">
              <button className="button w-full">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Observer View */}
      {userRole === 'observer' && (
        <div className="card space-y-3 border-gray-600">
          <p className="text-gray-400 text-sm">You are viewing this project as an observer.</p>
          {project.milestone?.submission_link && (
            <div className="bg-gray-900 p-3 rounded border border-gray-700 space-y-2">
              <p className="text-sm text-gray-400">Work Submission:</p>
              <a
                href={project.milestone.submission_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm break-all"
              >
                {project.milestone.submission_link}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

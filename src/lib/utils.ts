import { encodePacked, keccak256, toBytes } from 'viem'

/**
 * Calculate commitment hash for bid
 * Hash = keccak256(abi.encodePacked(amount, secretHash))
 */
export function calculateCommitmentHash(amount: number, secret: string): string {
  try {
    const secretHash = keccak256(toBytes(secret))
    const hash = keccak256(
      encodePacked(
        ['uint256', 'bytes32'],
        [BigInt(amount), secretHash]
      )
    )
    return hash
  } catch (error) {
    console.error('Error calculating hash:', error)
    throw new Error('Failed to calculate commitment hash')
  }
}

/**
 * Format address for display
 * 0x123abc... → 0x123...abc
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(txHash: string, chars = 6): string {
  if (!txHash) return ''
  return `${txHash.slice(0, chars + 2)}...${txHash.slice(-chars)}`
}

/**
 * Get Monad Explorer URL for transaction
 */
export function getExplorerUrl(txHash: string): string {
  const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://monadexplorer.com'
  return `${explorerUrl}/tx/${txHash}`
}

/**
 * Calculate time remaining in seconds
 */
export function getTimeRemaining(deadline: number): { total: number; display: string } {
  const now = Math.floor(Date.now() / 1000)
  const remaining = Math.max(0, deadline - now)
  
  if (remaining === 0) {
    return { total: 0, display: 'Deadline passed' }
  }

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

  return {
    total: remaining,
    display: `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

/**
 * Parse auction phase based on current time and deadlines
 */
export function getAuctionPhase(
  commitDeadline: number,
  revealDeadline: number
): 'bidding' | 'reveal' | 'completed' {
  const now = Math.floor(Date.now() / 1000)
  
  if (now < commitDeadline) return 'bidding'
  if (now < revealDeadline) return 'reveal'
  return 'completed'
}

/**
 * Format USDC amount (6 decimals)
 */
export function formatUSDC(amount: number): string {
  return `$${amount.toLocaleString()}`
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Validate address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString()
}

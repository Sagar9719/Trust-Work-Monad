'use client'

import { useAccount } from 'wagmi'

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()

  const connectMetaMask = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert('MetaMask is not installed or not available in this browser.')
      return
    }

    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      })

      console.log('Connected wallet accounts:', accounts)
      window.location.reload()
    } catch (error) {
      console.error('Wallet connection failed:', error)
      alert('Wallet connection was rejected or failed.')
    }
  }

  return (
    <button
      onClick={connectMetaMask}
      className="wallet-button"
      title={isConnected ? 'Connected wallet' : 'Connect your MetaMask wallet'}
    >
      <span className={`wallet-status-dot ${isConnected ? 'wallet-status-dot-connected' : ''}`} aria-hidden="true" />
      <span>{isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}</span>
    </button>
  )
}

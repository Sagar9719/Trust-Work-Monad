'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const connectMetaMask = async () => {
    const connector = connectors[0]
    if (connector) connect({ connector })
  }

  const handleClick = () => {
    if (isConnected) disconnect()
    else connectMetaMask()
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="wallet-button"
      title={isConnected ? 'Disconnect wallet' : 'Connect your MetaMask wallet'}
    >
      <span className={`wallet-status-dot ${isConnected ? 'wallet-status-dot-connected' : ''}`} aria-hidden="true" />
      <span>{isPending ? 'Connecting...' : isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}</span>
    </button>
  )
}

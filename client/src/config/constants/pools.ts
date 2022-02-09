import { VaultKey } from 'state/types'
import tokens from './tokens'
import { SerializedPoolConfig } from './types'

export const vaultPoolConfig = {
  [VaultKey.CovalVault]: {
    name: 'Auto COVAL',
    description: 'Automatic restaking',
    autoCompoundFrequency: 5000,
    gasLimit: 380000,
    tokenImage: {
      primarySrc: `/images/tokens/${tokens.coval.address}.svg`,
      secondarySrc: '/images/tokens/autorenew.svg',
    },
  },
  [VaultKey.IfoPool]: {
    name: 'IFO CAKE',
    description: 'Stake COVAL to participate in IFOs',
    autoCompoundFrequency: 1,
    gasLimit: 500000,
    tokenImage: {
      primarySrc: `/images/tokens/${tokens.coval.address}.svg`,
      secondarySrc: `/images/tokens/${tokens.coval.address}.svg`,
    },
  },
} as const

const pools: SerializedPoolConfig[] = [
]

export default pools

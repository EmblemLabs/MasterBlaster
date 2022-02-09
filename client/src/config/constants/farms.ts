import { serializeTokens } from './tokens'
import { SerializedFarmConfig } from './types'

const serializedTokens = serializeTokens()

const farms: SerializedFarmConfig[] = [
  {
    pid: 0,
    lpSymbol: 'COVAL-ETH LP',
    lpAddresses: {
      4: '0x5f09a3a0b60ec0aa2bbcc570cb637d33b18a89e6',
      1: '',
    },
    token: serializedTokens.coval,
    quoteToken: serializedTokens.weth,
  },
]

export default farms

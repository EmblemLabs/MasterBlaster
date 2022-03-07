import { serializeTokens } from './tokens'
import { SerializedFarmConfig } from './types'

const serializedTokens = serializeTokens()

const farms: SerializedFarmConfig[] = [
  {
    pid: 0,
    lpSymbol: 'COVAL-ETH LP',
    lpAddresses: {
      4: '0xc56b215c4448c6dd45eef76fb1c6d0258d2833ef',
      1: '',
    },
    token: serializedTokens.coval,
    quoteToken: serializedTokens.weth,
  },
]

export default farms

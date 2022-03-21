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
    isSingle: false,
  },
  // this is single token staking,
  {
    pid: 1,
    lpSymbol: 'ETH LP',
    lpAddresses: {
      4: '0xc778417e063141139fce010982780140aa0cd5ab',
      1: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    },
    token: serializedTokens.weth,
    quoteToken: serializedTokens.weth,
    isSingle: true,
  },
]

export default farms

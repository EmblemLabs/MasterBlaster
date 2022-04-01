import { serializeTokens } from './tokens'
import { SerializedFarmConfig } from './types'

const serializedTokens = serializeTokens()

const farms: SerializedFarmConfig[] = [
  {
    pid: 0,
    lpSymbol: 'COVAL-WETH LP',
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
    lpSymbol: 'COVAL',
    lpAddresses: {
      4: '0x83dD89B40636f946A08975E97Aa7A36d12daE551',
      1: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    },
    token: serializedTokens.coval,
    quoteToken: serializedTokens.coval,
    rewardToken: serializedTokens.usdt,
    isSingle: true,
  },
]

export default farms

import { ChainId, Token } from '@uniswap/sdk'
import { serializeToken } from 'state/user/hooks/helpers'
import { SerializedToken } from './types'

const { MAINNET, RINKEBY } = ChainId

interface TokenList {
  [symbol: string]: Token
}

const defineTokens = <T extends TokenList>(t: T) => t

export const mainnetTokens = defineTokens({
  weth: new Token(MAINNET, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 18, 'WETH', 'Wrapped Ether'),
  coval: new Token(MAINNET, '0x3d658390460295fb963f54dc0899cfb1c30776df', 8, 'COVAL', 'Circuits of Value'),
  usdt: new Token(RINKEBY, '0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02', 18, 'USDT', 'Tether USD'),
} as const)

export const testnetTokens = defineTokens({
  weth: new Token(RINKEBY, '0xc778417e063141139fce010982780140aa0cd5ab', 18, 'WETH', 'Wrapped Ether'),
  coval: new Token(RINKEBY, '0x83dd89b40636f946a08975e97aa7a36d12dae551', 8, 'COVAL', 'Circuits of Value'),
  usdt: new Token(RINKEBY, '0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02', 18, 'USDT', 'Tether USD'),
} as const)

const tokens = () => {
  const chainId = process.env.REACT_APP_CHAIN_ID

  // If testnet - return list comprised of testnetTokens wherever they exist, and mainnetTokens where they don't
  if (parseInt(chainId, 10) === ChainId.RINKEBY) {
    return Object.keys(mainnetTokens).reduce((accum, key) => {
      return { ...accum, [key]: testnetTokens[key] || mainnetTokens[key] }
    }, {} as typeof testnetTokens & typeof mainnetTokens)
  }

  return mainnetTokens
}

const unserializedTokens = tokens()

type SerializedTokenList = Record<keyof typeof unserializedTokens, SerializedToken>

export const serializeTokens = () => {
  const serializedTokens = Object.keys(unserializedTokens).reduce((accum, key) => {
    return { ...accum, [key]: serializeToken(unserializedTokens[key]) }
  }, {} as SerializedTokenList)

  return serializedTokens
}

export default unserializedTokens

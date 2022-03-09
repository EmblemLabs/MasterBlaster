import { ethers } from "hardhat";
import { BigNumber } from 'ethers'

import {
    EmblemLpStaking,
    EmblemTokenStaking,
    TestErc20
  } from '../../typechain'

interface TokensFixture {
    token0: TestErc20,
    lpToken: TestErc20,
    rewardToken: TestErc20,
    stakingToken: TestErc20
}

async function tokensFixture(): Promise<TokensFixture> {
    const tokenFactory = await ethers.getContractFactory('TestERC20')
    const token0 = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestErc20
    const lpToken = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestErc20
    const stakingToken = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestErc20
    const rewardToken = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestErc20
    return { token0, lpToken, rewardToken, stakingToken }
}

export const emblemLPStakingTestFixture = async function() {
    const emblemLPStakingFactory = await ethers.getContractFactory('EmblemLPStaking')
    const { token0: emblemContract, lpToken, rewardToken } = await tokensFixture()
    const currentBlockNumber = ethers.provider.getBlockNumber()
    const emblemLpStaking = (await emblemLPStakingFactory.deploy(emblemContract.address, 100, currentBlockNumber)) as EmblemLpStaking
    return { emblemLpStaking, lpToken, rewardToken, emblemContract }
}

export const emblemTokenStakingTestFixture = async function() {
    const emblemTokenStakingFactory = await ethers.getContractFactory('EmblemTokenStaking')
    const { token0: emblemContract, stakingToken, rewardToken } = await tokensFixture()
    const currentBlockNumber = ethers.provider.getBlockNumber()
    const emblemTokenStaking = (await emblemTokenStakingFactory.deploy(emblemContract.address, 100, currentBlockNumber)) as EmblemTokenStaking
    return { emblemTokenStaking, stakingToken, rewardToken, emblemContract }
}

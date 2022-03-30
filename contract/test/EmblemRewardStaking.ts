import { expect } from "chai";
import { ethers, waffle, network } from 'hardhat'
import { Ierc20, EmblemRewardStaking, TestErc20 } from "../typechain";
import { emblemRewardStakingTestFixture } from './shared/fixtures'

const createFixtureLoader = waffle.createFixtureLoader

describe("Emblem Reward Staking by pool", function() {
  const [wallet, alice, bob, other] = waffle.provider.getWallets();
  
  let loadFixture: ReturnType<typeof createFixtureLoader>;
  let emblemRewardStaking: EmblemRewardStaking;
  let stakingToken: TestErc20;
  let rewardToken: TestErc20;

  const rewardPerBlock = 10;

  const timeTravel = async (seconds: Number) => {
    await network.provider.send("evm_increaseTime", [seconds])
    await network.provider.send("evm_mine") // this one will have 02:00 PM as its timestamp
  }

  before('create fixture loader', async () => {
    loadFixture = createFixtureLoader([wallet, other])
  })

  beforeEach('deploy contracts', async () => {
    ({ emblemRewardStaking, stakingToken, rewardToken } = await loadFixture(emblemRewardStakingTestFixture))
    await emblemRewardStaking.add(rewardPerBlock, stakingToken.address, rewardToken.address, false);
    await stakingToken.mint(alice.address, ethers.utils.parseEther('100'));
    await stakingToken.mint(bob.address, ethers.utils.parseEther('200'));
    await rewardToken.mint(wallet.address, ethers.utils.parseEther('1000'));
    await rewardToken.connect(wallet).approve(emblemRewardStaking.address, ethers.utils.parseEther('1000'));
    await emblemRewardStaking.fund(0, ethers.utils.parseEther('1000'));
  })

  it("deposit/withdraw", async function() {
    await stakingToken.connect(alice).approve(emblemRewardStaking.address, ethers.utils.parseEther('100'));
    await stakingToken.connect(bob).approve(emblemRewardStaking.address, ethers.utils.parseEther('200'));
    const initialBlockNumber =  await ethers.provider.getBlockNumber();
    await emblemRewardStaking.connect(alice).deposit(0, 100);
    await emblemRewardStaking.connect(bob).deposit(0, 200);
    expect(await stakingToken.balanceOf(emblemRewardStaking.address)).to.be.eq(300)
    // time travel
    await timeTravel(10);
    
    let currentBlockNumber = await ethers.provider.getBlockNumber();
    // Calculation logic
    // RPB(reward per block) : 10
    // duration: currentBlockNumber - initialBlockNumber + 1
    //
    // |block number 13--------|block number 14-------------------------|block number 15----------------------------
    // |alice deposit 100------|bob deposit 200-------------------------|calculate reward for alice and bob-----------------------------
    //
    // alice's reward = RPB[as alice was the only guy staking] * (block number 13 - block number 14) +
    //                RPB*(alice deposit amount / total liquidity)[both bob and alice staking from block 14] * (14 - 13)
    // bob's reward   = RPB*(bob deposit amount / total liquidity)[both bob and alice staking from block 14] * (14 - 13)
    // 
    // alice's reward = (10 * 1) + ((10 / 3) * 1) = 13
    // bob's reward   =            ((10 / 3) * 2) * 1 = 6
    expect(await emblemRewardStaking.connect(alice).pendingEmblemReward(0, alice.address)).to.be.eq(13)
    expect(await emblemRewardStaking.connect(bob).pendingEmblemReward(0, bob.address)).to.be.eq(6)

    // harvest check
    // block number increased so by following above logic
    // alice's reward = 16
    await emblemRewardStaking.connect(alice).harvest(0);
    expect(await rewardToken.balanceOf(alice.address)).to.be.eq(16);
    // harvest check
    // block number increased so by following above logic
    // bob's reward = 13
    await emblemRewardStaking.connect(bob).harvest(0);
    expect(await rewardToken.balanceOf(bob.address)).to.be.eq(19);

    // withdraw check

    await emblemRewardStaking.connect(alice).withdraw(0, 100);
    expect(await stakingToken.balanceOf(alice.address)).to.be.eq(ethers.utils.parseEther('100'));
    
    await emblemRewardStaking.connect(bob).withdraw(0, 200);
    expect(await stakingToken.balanceOf(bob.address)).to.be.eq(ethers.utils.parseEther('200'));
  });
});

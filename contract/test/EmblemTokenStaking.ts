import { expect } from "chai";
import { ethers, waffle, network } from 'hardhat'
import { Ierc20, EmblemTokenStaking, TestErc20 } from "../typechain";
import { emblemTokenStakingTestFixture } from './shared/fixtures'

const createFixtureLoader = waffle.createFixtureLoader

describe("Emblem Token Staking", function() {
  const [wallet, alice, bob, other] = waffle.provider.getWallets();
  
  let loadFixture: ReturnType<typeof createFixtureLoader>;
  let emblemTokenStaking: EmblemTokenStaking;
  let stakingToken: TestErc20;
  let rewardToken: TestErc20;
  let emblemContract: TestErc20;

  const rewardPerBlock = 10;

  const timeTravel = async (seconds: Number) => {
    await network.provider.send("evm_increaseTime", [seconds])
    await network.provider.send("evm_mine") // this one will have 02:00 PM as its timestamp
  }

  before('create fixture loader', async () => {
    loadFixture = createFixtureLoader([wallet, other])
  })

  beforeEach('deploy contracts', async () => {
    ({ emblemTokenStaking, stakingToken, rewardToken, emblemContract } = await loadFixture(emblemTokenStakingTestFixture))
    await emblemTokenStaking.add(rewardPerBlock, stakingToken.address, false);
    await stakingToken.mint(alice.address, ethers.utils.parseEther('100'));
    await stakingToken.mint(bob.address, ethers.utils.parseEther('200'));
    await emblemContract.mint(wallet.address, ethers.utils.parseEther('1000'));
    await emblemContract.connect(wallet).approve(emblemTokenStaking.address, ethers.utils.parseEther('1000'));
    await emblemTokenStaking.fund(ethers.utils.parseEther('1000'));
  })

  it("deposit/withdraw", async function() {
    await stakingToken.connect(alice).approve(emblemTokenStaking.address, ethers.utils.parseEther('100'));
    await stakingToken.connect(bob).approve(emblemTokenStaking.address, ethers.utils.parseEther('200'));
    const initialBlockNumber =  await ethers.provider.getBlockNumber();
    await emblemTokenStaking.connect(alice).deposit(0, 100);
    await emblemTokenStaking.connect(bob).deposit(0, 200);
    expect(await stakingToken.balanceOf(emblemTokenStaking.address)).to.be.eq(300)
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
    expect(await emblemTokenStaking.connect(alice).pendingEmblemReward(0, alice.address)).to.be.eq(13)
    expect(await emblemTokenStaking.connect(bob).pendingEmblemReward(0, bob.address)).to.be.eq(6)

    // harvest check
    // block number increased so by following above logic
    // alice's reward = 16
    await emblemTokenStaking.connect(alice).harvest(0);
    expect(await emblemContract.balanceOf(alice.address)).to.be.eq(16);
    // harvest check
    // block number increased so by following above logic
    // bob's reward = 13
    await emblemTokenStaking.connect(bob).harvest(0);
    expect(await emblemContract.balanceOf(bob.address)).to.be.eq(19);

    // withdraw check

    await emblemTokenStaking.connect(alice).withdraw(0, 100);
    expect(await stakingToken.balanceOf(alice.address)).to.be.eq(ethers.utils.parseEther('100'));
    
    await emblemTokenStaking.connect(bob).withdraw(0, 200);
    expect(await stakingToken.balanceOf(bob.address)).to.be.eq(ethers.utils.parseEther('200'));
  });
});

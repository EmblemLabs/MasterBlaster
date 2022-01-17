// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const EmblemLPStaking = await hre.ethers.getContractFactory("EmblemLPStaking");
  const emblemLPStaking = await EmblemLPStaking.deploy("0xcba3eae7f55d0f423af43cc85e67ab0fbf87b61c", "100000", "8780600");

  await emblemLPStaking.deployed();

  console.log("emblemStakingContract deployed to:", emblemLPStaking.address);

  // await hre.run("verify:verify", {
  //   address: emblemLPStaking.address,
  //   constructorArguments: [
  //     "0xcba3eae7f55d0f423af43cc85e67ab0fbf87b61c",
  //     "100000",
  //     "8788888",
  //   ],
  // })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
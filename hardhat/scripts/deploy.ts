import { ethers } from "hardhat";

async function main() {
  const donation = await ethers.deployContract("DonationCampaign", ["Buy a Car Campaign", 3]);

  await donation.waitForDeployment();

  console.log(`deployed to ${donation.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

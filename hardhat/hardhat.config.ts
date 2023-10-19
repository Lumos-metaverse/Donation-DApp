import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    mumbai: {
      url: process.env.ALCHEMY_MUMBAI_API_KEY_URL,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY]
    }
  }
};

require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-ethers")
require('hardhat-contract-sizer')
require('@openzeppelin/hardhat-upgrades')
require('solidity-coverage')

// config
const { config: dotenvConfig } = require("dotenv")
const { resolve } = require("path")
dotenvConfig({ path: resolve(__dirname, "./.env") })

const SEPOLIA_PK_ONE = process.env.SEPOLIA_PK_ONE
const SEPOLIA_PK_TWO = process.env.SEPOLIA_PK_TWO
if (!SEPOLIA_PK_ONE) {
  throw new Error("Please set at least one private key in a .env file")
}

const MAINNET_PK = process.env.MAINNET_PK
const MAINNET_ALCHEMY_AK = process.env.MAINNET_ALCHEMY_AK

const SEPOLIA_ALCHEMY_AK = process.env.SEPOLIA_ALCHEMY_AK
if (!SEPOLIA_ALCHEMY_AK) {
  throw new Error("Please set your SEPOLIA_ALCHEMY_AK in a .env file")
}

// Validate MAINNET_PK format if it's set
if (MAINNET_PK && MAINNET_ALCHEMY_AK) {
  // Check if MAINNET_PK is a valid hex string
  if (!/^0x[0-9a-fA-F]{64}$/.test(MAINNET_PK)) {
    console.warn("Warning: MAINNET_PK is not a valid hex private key format. Mainnet network will be disabled.");
    MAINNET_PK = null;
  }
}

// Define networks object
const networks = {
  sepolia: {
    url: `https://ethereum-sepolia-rpc.publicnode.com`,
    accounts: [`${SEPOLIA_PK_ONE}`, `${SEPOLIA_PK_TWO}`],
  },
};

// Add mainnet network only if MAINNET_PK is set and valid
if (MAINNET_PK && MAINNET_ALCHEMY_AK) {
  networks.mainnet = {
    url: `https://eth-mainnet.g.alchemy.com/v2/${MAINNET_ALCHEMY_AK}`,
    accounts: [`${MAINNET_PK}`],
    saveDeployments: true,
    chainId: 1,
  };
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 50,
      },
      viaIR: true,
    },
    metadata: {
      bytecodeHash: 'none',
    }
  },
  networks,
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
}
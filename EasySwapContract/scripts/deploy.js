const { ethers } = require("hardhat")

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log("deployer: ", deployer.address)

  // 检查账户余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("deployer balance: ", ethers.utils.formatEther(balance), "ETH");

  // 部署 EasySwapVault 合约
  console.log("Deploying EasySwapVault...");
  const esVaultFactory = await ethers.getContractFactory("EasySwapVault")
  const esVault = await esVaultFactory.deploy();
  await esVault.deployed();
  console.log("esVault contract deployed to:", esVault.address);

  // 部署 EasySwapOrderBook 合约
  console.log("Deploying EasySwapOrderBook...");
  const newProtocolShare = 200;
  const newESVault = esVault.address;
  const EIP712Name = "EasySwapOrderBook";
  const EIP712Version = "1";
  
  const esDexFactory = await ethers.getContractFactory("EasySwapOrderBook")
  const esDex = await esDexFactory.deploy();
  await esDex.deployed();
  console.log("esDex contract deployed to:", esDex.address);
  
  // 初始化合约
  console.log("Initializing contracts...");
  let tx = await esVault.initialize();
  await tx.wait();
  console.log("esVault initialized");
  
  tx = await esDex.initialize(newProtocolShare, newESVault, EIP712Name, EIP712Version);
  await tx.wait();
  console.log("esDex initialized");
  
  // 设置 vault 的 orderBook
  console.log("Setting orderBook in vault...");
  tx = await esVault.setOrderBook(esDex.address);
  await tx.wait();
  console.log("esVault setOrderBook tx:", tx.hash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
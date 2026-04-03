const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("=== Setting NFT Metadata URI ===\n");
  
  // 1. 获取合约地址（从 .env 或配置文件读取）
  const contractAddress = process.env.TEST_ERC721A_ADDRESS || "0x609f6127D6F08119A351645b246Ba771c7c7A762";
  console.log("Contract Address:", contractAddress);
  
  // 2. 获取部署者账户（应该是合约 owner）
  const [owner] = await hre.ethers.getSigners();
  console.log("Owner Address:", owner.address);
  
  // 3. 获取合约实例
  const TrollContract = await hre.ethers.getContractFactory("Troll");
  const trollContract = TrollContract.attach(contractAddress);
  
  // 4. 验证是否是 owner
  try {
    const currentOwner = await trollContract.owner();
    if (currentOwner.toLowerCase() !== owner.address.toLowerCase()) {
      console.error("❌ Error: Current signer is not the contract owner!");
      console.error("Contract Owner:", currentOwner);
      console.error("Signer:", owner.address);
      return;
    }
    console.log("✅ Verified: Signer is the contract owner");
  } catch (error) {
    console.error("Error checking ownership:", error);
    return;
  }
  
  // 5. 设置 metadata URI
  // 方案 A: 使用 IPFS URI（推荐）
  const ipfsBaseURI = "ipfs://QmYourMetadataFolderHash/";
  
  // 方案 B: 使用 HTTP URL
  const httpBaseURI = "https://your-api.com/metadata/";
  
  // 选择一个使用
  const baseURI = ipfsBaseURI; // 或 httpBaseURI
  
  console.log("\n📝 Setting base URI to:", baseURI);
  
  try {
    const tx = await trollContract.setTokenURI(baseURI);
    console.log("⏳ Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Block Number:", receipt.blockNumber);
    console.log("Gas Used:", receipt.gasUsed.toString());
    
    // 6. 验证设置结果
    console.log("\n🔍 Verifying tokenURI...");
    const tokenURI = await trollContract.tokenURI(0);
    console.log("TokenURI for token #0:", tokenURI);
    
    if (tokenURI === baseURI) {
      console.log("\n✅ SUCCESS: Base URI set correctly!");
    } else {
      console.log("\n⚠️  WARNING: TokenURI doesn't match expected value");
    }
    
  } catch (error) {
    console.error("❌ Error setting tokenURI:", error);
    throw error;
  }
  
  console.log("\n=== Done ===");
}

// 错误处理
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

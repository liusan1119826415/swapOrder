-- 为 ob_item_* 表添加 image_url 字段
-- 用于存储 NFT 的图片 URL

-- Sepolia testnet
ALTER TABLE ob_item_sepolia 
ADD COLUMN image_url VARCHAR(512) DEFAULT '' COMMENT 'NFT 图片 URL' AFTER name;

-- Ethereum mainnet (如果需要)
-- ALTER TABLE ob_item_eth 
-- ADD COLUMN image_url VARCHAR(512) DEFAULT '' COMMENT 'NFT 图片 URL' AFTER name;

-- Optimism (如果需要)
-- ALTER TABLE ob_item_optimism 
-- ADD COLUMN image_url VARCHAR(512) DEFAULT '' COMMENT 'NFT 图片 URL' AFTER name;

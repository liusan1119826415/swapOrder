-- NFT Marketplace 测试数据种子脚本
-- 用于开发环境测试 Analytics、Artists、Auctions、Drops 等功能

-- ========================================
-- 1. 插入测试创作者数据
-- ========================================
INSERT INTO ob_creator (address, username, bio, avatar_uri, banner_uri, is_verified, twitter, discord, total_volume, total_sales, total_items, floor_price, followers, create_time) VALUES
('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'CryptoArtist', '数字艺术创作者，专注于生成艺术和抽象作品', '', '', 1, 'https://twitter.com/cryptoartist', '', 125.5, 89, 150, 0.85, 1200, UNIX_TIMESTAMP(NOW()) * 1000),
('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', 'NFTMaster', 'NFT 艺术家和收藏家，创作独特的像素艺术作品', '', '', 1, '', 'https://discord.gg/nftmaster', 256.8, 156, 320, 1.2, 2500, UNIX_TIMESTAMP(NOW()) * 1000),
('0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359', 'DigitalDreamer', '探索虚拟与现实的边界，创造沉浸式数字体验', '', '', 0, '', '', 45.2, 32, 80, 0.45, 350, UNIX_TIMESTAMP(NOW()) * 1000),
('0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB', 'PixelPioneer', '像素艺术先驱，早期采用者和创新者', '', '', 1, 'https://twitter.com/pixelpioneer', 'https://discord.gg/pixel', 389.6, 245, 500, 2.5, 4200, UNIX_TIMESTAMP(NOW()) * 1000),
('0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb', 'AbstractVisions', '抽象艺术爱好者，用代码表达情感', '', '', 0, '', '', 78.3, 56, 120, 0.65, 890, UNIX_TIMESTAMP(NOW()) * 1000);

-- ========================================
-- 2. 插入测试拍卖数据
-- ========================================
INSERT INTO ob_auction (auction_id, marketplace_id, collection_address, token_id, seller, highest_bidder, start_price, reserve_price, current_bid, bid_count, start_time, end_time, status, currency_address, chain_id, chain_name, create_time) VALUES
('auction_001', 0, '0xabc123', '1', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', 1.5, 2.0, 1.8, 5, UNIX_TIMESTAMP(NOW()) - 86400, UNIX_TIMESTAMP(NOW()) + 172800, 0, '1', 11155111, 'sepolia', UNIX_TIMESTAMP(NOW()) * 1000),
('auction_002', 0, '0xdef456', '42', '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359', '', 0.5, NULL, 0.5, 0, UNIX_TIMESTAMP(NOW()) - 3600, UNIX_TIMESTAMP(NOW()) + 86400, 0, '1', 11155111, 'sepolia', UNIX_TIMESTAMP(NOW()) * 1000),
('auction_003', 0, '0xghi789', '7', '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB', '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb', 3.0, 3.5, 3.2, 12, UNIX_TIMESTAMP(NOW()) - 172800, UNIX_TIMESTAMP(NOW()) - 3600, 1, '1', 11155111, 'sepolia', UNIX_TIMESTAMP(NOW()) * 1000),
('auction_004', 0, '0xjkl012', '15', '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 2.0, NULL, 2.3, 8, UNIX_TIMESTAMP(NOW()), UNIX_TIMESTAMP(NOW()) + 259200, 0, '1', 11155111, 'sepolia', UNIX_TIMESTAMP(NOW()) * 1000),
('auction_005', 0, '0xmno345', '99', '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb', '', 0.8, 1.0, 0.8, 0, UNIX_TIMESTAMP(NOW()) + 7200, UNIX_TIMESTAMP(NOW()) + 93600, 0, '1', 11155111, 'sepolia', UNIX_TIMESTAMP(NOW()) * 1000);

-- ========================================
-- 3. 插入测试拍卖出价记录
-- ========================================
INSERT INTO ob_auction_bid (auction_id, bidder, amount, tx_hash, bid_time, create_time) VALUES
('auction_001', '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', 1.5, '0xtxhash001', UNIX_TIMESTAMP(NOW()) - 80000, UNIX_TIMESTAMP(NOW()) * 1000),
('auction_001', '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359', 1.6, '0xtxhash002', UNIX_TIMESTAMP(NOW()) - 70000, UNIX_TIMESTAMP(NOW()) * 1000),
('auction_001', '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', 1.7, '0xtxhash003', UNIX_TIMESTAMP(NOW()) - 60000, UNIX_TIMESTAMP(NOW()) * 1000),
('auction_001', '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359', 1.75, '0xtxhash004', UNIX_TIMESTAMP(NOW()) - 50000, UNIX_TIMESTAMP(NOW()) * 1000),
('auction_001', '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', 1.8, '0xtxhash005', UNIX_TIMESTAMP(NOW()) - 40000, UNIX_TIMESTAMP(NOW()) * 1000),
('auction_003', '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb', 3.0, '0xtxhash006', UNIX_TIMESTAMP(NOW()) - 170000, UNIX_TIMESTAMP(NOW()) * 1000),
('auction_003', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 3.1, '0xtxhash007', UNIX_TIMESTAMP(NOW()) - 160000, UNIX_TIMESTAMP(NOW()) * 1000),
('auction_003', '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb', 3.2, '0xtxhash008', UNIX_TIMESTAMP(NOW()) - 150000, UNIX_TIMESTAMP(NOW()) * 1000),
('auction_004', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 2.0, '0xtxhash009', UNIX_TIMESTAMP(NOW()) - 3000, UNIX_TIMESTAMP(NOW()) * 1000),
('auction_004', '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359', 2.1, '0xtxhash010', UNIX_TIMESTAMP(NOW()) - 2000, UNIX_TIMESTAMP(NOW()) * 1000),
('auction_004', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 2.3, '0xtxhash011', UNIX_TIMESTAMP(NOW()) - 1000, UNIX_TIMESTAMP(NOW()) * 1000);

-- ========================================
-- 4. 插入测试新品发布数据
-- ========================================
INSERT INTO ob_drop (drop_id, collection_address, collection_name, creator_address, creator_name, description, logo_uri, banner_uri, total_supply, items_minted, price, mint_start_time, mint_end_time, status, chain_id, chain_name, is_verified, categories, website, discord, twitter, create_time) VALUES
('drop_001', '0xnewcollection1', 'Neon Dreams Collection', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'CryptoArtist', '一个未来主义的系列，探索数字意识和虚拟现实', '', '', 1000, 750, 0.5, UNIX_TIMESTAMP(NOW()) - 86400, UNIX_TIMESTAMP(NOW()) + 604800, 1, 11155111, 'sepolia', 1, 'Art,Metaverse', 'https://neondreams.io', '', 'https://twitter.com/neondreams', UNIX_TIMESTAMP(NOW()) * 1000),
('drop_002', '0xnewcollection2', 'Pixel Universe', '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', 'NFTMaster', '像素艺术的宇宙，每个像素都是一个世界', '', '', 5000, 1200, 0.3, UNIX_TIMESTAMP(NOW()) - 172800, UNIX_TIMESTAMP(NOW()) + 432000, 1, 11155111, 'sepolia', 1, 'Art,Gaming', 'https://pixeluniverse.art', 'https://discord.gg/pixel', '', UNIX_TIMESTAMP(NOW()) * 1000),
('drop_003', '0xnewcollection3', 'Abstract Emotions', '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359', 'DigitalDreamer', '用抽象的形式表达人类的情感', '', '', 2000, 2000, 0.8, UNIX_TIMESTAMP(NOW()) - 604800, UNIX_TIMESTAMP(NOW()) - 86400, 2, 11155111, 'sepolia', 0, 'Art,Photography', '', '', '', UNIX_TIMESTAMP(NOW()) * 1000),
('drop_004', '0xnewcollection4', 'Cyber Samurai', '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB', 'PixelPioneer', '赛博朋克风格的武士系列 NFT', '', '', 3333, 0, 0.6, UNIX_TIMESTAMP(NOW()) + 86400, UNIX_TIMESTAMP(NOW()) + 691200, 0, 11155111, 'sepolia', 1, 'Gaming,Art', 'https://cybersamurai.xyz', 'https://discord.gg/samurai', 'https://twitter.com/cybersamurai', UNIX_TIMESTAMP(NOW()) * 1000),
('drop_005', '0xnewcollection5', 'Music Vibes', '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb', 'AbstractVisions', '音乐与视觉的完美结合', '', '', 1500, 450, 0.4, UNIX_TIMESTAMP(NOW()) - 43200, UNIX_TIMESTAMP(NOW()) + 259200, 1, 11155111, 'sepolia', 0, 'Music,Art', '', '', '', UNIX_TIMESTAMP(NOW()) * 1000);

-- ========================================
-- 5. 更新集合分类关联（假设有现成的集合）
-- ========================================
-- 注意：这需要在 ob_collection_sepolia 表中有数据的情况下执行
-- INSERT INTO ob_collection_category (collection_address, category_id, chain_name, create_time)
-- SELECT address, 1, 'sepolia', UNIX_TIMESTAMP(NOW()) * 1000
-- FROM ob_collection_sepolia
-- WHERE address IN ('0xabc123', '0xdef456', '0xghi789')
-- LIMIT 5;

-- ========================================
-- 6. 查询验证
-- ========================================
-- 验证创作者数据
SELECT 
    id,
    username,
    address,
    is_verified,
    total_volume,
    total_sales,
    followers
FROM ob_creator
ORDER BY total_volume DESC;

-- 验证拍卖数据
SELECT 
    auction_id,
    collection_address,
    token_id,
    seller,
    current_bid,
    bid_count,
    status,
    FROM_UNIXTIME(end_time) as end_time_str
FROM ob_auction
ORDER BY end_time ASC;

-- 验证 Drops 数据
SELECT 
    drop_id,
    collection_name,
    creator_name,
    items_minted,
    total_supply,
    price,
    status,
    FROM_UNIXTIME(mint_start_time) as start_time_str,
    FROM_UNIXTIME(mint_end_time) as end_time_str
FROM ob_drop
ORDER BY mint_start_time ASC;

-- ========================================
-- 7. 统计信息
-- ========================================
SELECT 
    'Creators' as table_name,
    COUNT(*) as total_count,
    SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified_count
FROM ob_creator
UNION ALL
SELECT 
    'Auctions',
    COUNT(*),
    SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END)
FROM ob_auction
UNION ALL
SELECT 
    'Drops',
    COUNT(*),
    SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END)
FROM ob_drop;

-- NFT Marketplace 数据库扩展表
-- 用于支持艺术家、拍卖、新品发布、分类等功能
-- 适用于 EasySwapSync 同步服务和 EasySwapBackend API服务

-- ========================================
-- 1. 创作者/艺术家表
-- ========================================
CREATE TABLE ob_creator (
    id BIGINT AUTO_INCREMENT COMMENT '主键' PRIMARY KEY,
    address VARCHAR(42) NOT NULL COMMENT '创作者钱包地址',
    username VARCHAR(100) COMMENT '用户名',
    bio TEXT COMMENT '个人简介',
    avatar_uri VARCHAR(512) COMMENT '头像 URL',
    banner_uri VARCHAR(512) COMMENT '横幅图片 URL',
    is_verified TINYINT DEFAULT 0 COMMENT '是否认证 (0:未认证，1:已认证)',
    twitter VARCHAR(256) COMMENT 'Twitter 链接',
    discord VARCHAR(256) COMMENT 'Discord 链接',
    instagram VARCHAR(256) COMMENT 'Instagram 链接',
    website VARCHAR(256) COMMENT '个人网站',
    total_volume DECIMAL(30) DEFAULT 0 COMMENT '总交易量 (ETH)',
    total_sales BIGINT DEFAULT 0 COMMENT '总销售次数',
    total_items BIGINT DEFAULT 0 COMMENT '总作品数',
    floor_price DECIMAL(30) DEFAULT 0 COMMENT '地板价 (ETH)',
    followers BIGINT DEFAULT 0 COMMENT '粉丝数',
    create_time BIGINT COMMENT '创建时间戳 (毫秒)',
    update_time BIGINT COMMENT '更新时间戳 (毫秒)',
    UNIQUE KEY uk_address (address),
    KEY idx_username (username),
    KEY idx_total_volume (total_volume),
    KEY idx_is_verified (is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='创作者/艺术家表';

-- ========================================
-- 2. 分类表
-- ========================================
CREATE TABLE ob_category (
    id BIGINT AUTO_INCREMENT COMMENT '主键' PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    slug VARCHAR(50) NOT NULL COMMENT '分类标识 (英文短名)',
    description VARCHAR(500) COMMENT '分类描述',
    icon_uri VARCHAR(512) COMMENT '分类图标 URL',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    is_active TINYINT DEFAULT 1 COMMENT '是否激活 (0:禁用，1:启用)',
    create_time BIGINT COMMENT '创建时间戳 (毫秒)',
    update_time BIGINT COMMENT '更新时间戳 (毫秒)',
    UNIQUE KEY uk_slug (slug),
    KEY idx_sort_order (sort_order),
    KEY idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='分类表';

-- ========================================
-- 3. 集合分类关联表
-- ========================================
CREATE TABLE ob_collection_category (
    id BIGINT AUTO_INCREMENT COMMENT '主键' PRIMARY KEY,
    collection_address VARCHAR(42) NOT NULL COMMENT '集合合约地址',
    category_id BIGINT NOT NULL COMMENT '分类 ID',
    chain_name VARCHAR(50) NOT NULL COMMENT '链名称 (如：sepolia)',
    create_time BIGINT COMMENT '创建时间戳 (毫秒)',
    UNIQUE KEY uk_collection_category (collection_address, category_id, chain_name),
    KEY idx_category_id (category_id),
    KEY idx_chain_name (chain_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='集合分类关联表';

-- ========================================
-- 4. 拍卖表
-- ========================================
CREATE TABLE ob_auction (
    id BIGINT AUTO_INCREMENT COMMENT '主键' PRIMARY KEY,
    auction_id VARCHAR(66) NOT NULL COMMENT '拍卖唯一 ID',
    marketplace_id TINYINT DEFAULT 0 COMMENT '市场 ID (0:本平台，1:opensea, 2:looksrare, 3:x2y2)',
    collection_address VARCHAR(42) NOT NULL COMMENT '集合合约地址',
    token_id VARCHAR(128) NOT NULL COMMENT 'Token ID',
    seller VARCHAR(42) NOT NULL COMMENT '卖家地址',
    highest_bidder VARCHAR(42) COMMENT '最高出价者地址',
    start_price DECIMAL(30) NOT NULL COMMENT '起始价格 (ETH)',
    reserve_price DECIMAL(30) COMMENT '保留价格 (ETH)',
    current_bid DECIMAL(30) DEFAULT 0 COMMENT '当前出价 (ETH)',
    bid_count BIGINT DEFAULT 0 COMMENT '出价次数',
    start_time BIGINT NOT NULL COMMENT '开始时间戳 (秒)',
    end_time BIGINT NOT NULL COMMENT '结束时间戳 (秒)',
    status TINYINT DEFAULT 0 COMMENT '状态 (0:活跃，1:已结束，2:已取消，3:已售出)',
    currency_address VARCHAR(42) DEFAULT '1' COMMENT '货币类型 (1:ETH)',
    chain_id BIGINT DEFAULT 1 COMMENT '链 ID',
    chain_name VARCHAR(50) NOT NULL COMMENT '链名称 (如：sepolia)',
    create_time BIGINT COMMENT '创建时间戳 (毫秒)',
    update_time BIGINT COMMENT '更新时间戳 (毫秒)',
    UNIQUE KEY uk_auction_id (auction_id),
    KEY idx_collection_token (collection_address, token_id),
    KEY idx_seller (seller),
    KEY idx_status_end_time (status, end_time),
    KEY idx_chain_name (chain_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='拍卖表';

-- ========================================
-- 5. 拍卖出价记录表
-- ========================================
CREATE TABLE ob_auction_bid (
    id BIGINT AUTO_INCREMENT COMMENT '主键' PRIMARY KEY,
    auction_id VARCHAR(66) NOT NULL COMMENT '拍卖 ID',
    bidder VARCHAR(42) NOT NULL COMMENT '出价者地址',
    amount DECIMAL(30) NOT NULL COMMENT '出价金额 (ETH)',
    tx_hash VARCHAR(66) COMMENT '交易 hash',
    bid_time BIGINT NOT NULL COMMENT '出价时间戳 (秒)',
    create_time BIGINT COMMENT '创建时间戳 (毫秒)',
    KEY idx_auction_id (auction_id),
    KEY idx_bidder (bidder),
    KEY idx_bid_time (bid_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='拍卖出价记录表';

-- ========================================
-- 6. 新品发布表 (Drop/Mint)
-- ========================================
CREATE TABLE ob_drop (
    id BIGINT AUTO_INCREMENT COMMENT '主键' PRIMARY KEY,
    drop_id VARCHAR(66) NOT NULL COMMENT 'Drop 唯一 ID',
    collection_address VARCHAR(42) NOT NULL COMMENT '集合合约地址',
    collection_name VARCHAR(128) NOT NULL COMMENT '集合名称',
    creator_address VARCHAR(42) NOT NULL COMMENT '创建者地址',
    creator_name VARCHAR(100) COMMENT '创建者名称',
    description TEXT COMMENT '项目描述',
    logo_uri VARCHAR(512) COMMENT 'Logo URL',
    banner_uri VARCHAR(512) COMMENT '横幅 URL',
    total_supply BIGINT NOT NULL COMMENT '总供应量',
    items_minted BIGINT DEFAULT 0 COMMENT '已 mint 数量',
    price DECIMAL(30) NOT NULL COMMENT '单价 (ETH)',
    mint_start_time BIGINT NOT NULL COMMENT '开始时间戳 (秒)',
    mint_end_time BIGINT NOT NULL COMMENT '结束时间戳 (秒)',
    status TINYINT DEFAULT 0 COMMENT '状态 (0:upcoming, 1:live, 2:sold_out, 3:ended)',
    chain_id BIGINT DEFAULT 1 COMMENT '链 ID',
    chain_name VARCHAR(50) NOT NULL COMMENT '链名称 (如：sepolia)',
    is_verified TINYINT DEFAULT 0 COMMENT '是否认证',
    categories VARCHAR(500) COMMENT '分类列表 (逗号分隔)',
    website VARCHAR(256) COMMENT '官网地址',
    discord VARCHAR(256) COMMENT 'Discord 地址',
    twitter VARCHAR(256) COMMENT 'Twitter 地址',
    create_time BIGINT COMMENT '创建时间戳 (毫秒)',
    update_time BIGINT COMMENT '更新时间戳 (毫秒)',
    UNIQUE KEY uk_drop_id (drop_id),
    KEY idx_collection_address (collection_address),
    KEY idx_creator_address (creator_address),
    KEY idx_status (status),
    KEY idx_mint_time (mint_start_time, mint_end_time),
    KEY idx_chain_name (chain_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='新品发布表';

-- ========================================
-- 7. 统计数据缓存表 (用于 Analytics)
-- ========================================
CREATE TABLE ob_analytics_stats (
    id BIGINT AUTO_INCREMENT COMMENT '主键' PRIMARY KEY,
    stat_date DATE NOT NULL COMMENT '统计日期',
    period_type VARCHAR(20) NOT NULL COMMENT '周期类型 (1h, 6h, 1d, 7d, 30d, all)',
    total_volume DECIMAL(30) DEFAULT 0 COMMENT '总交易量 (ETH)',
    total_volume_usd DECIMAL(30) DEFAULT 0 COMMENT '总交易量 (USD)',
    total_sales BIGINT DEFAULT 0 COMMENT '总销售次数',
    active_users BIGINT DEFAULT 0 COMMENT '活跃用户数',
    average_price DECIMAL(30) DEFAULT 0 COMMENT '平均价格 (ETH)',
    average_price_usd DECIMAL(30) DEFAULT 0 COMMENT '平均价格 (USD)',
    market_cap DECIMAL(30) DEFAULT 0 COMMENT '市值 (ETH)',
    market_cap_usd DECIMAL(30) DEFAULT 0 COMMENT '市值 (USD)',
    total_collections BIGINT DEFAULT 0 COMMENT '总集合数',
    total_items BIGINT DEFAULT 0 COMMENT '总物品数',
    chain_name VARCHAR(50) COMMENT '链名称',
    create_time BIGINT COMMENT '创建时间戳 (毫秒)',
    update_time BIGINT COMMENT '更新时间戳 (毫秒)',
    UNIQUE KEY uk_date_period_chain (stat_date, period_type, chain_name),
    KEY idx_stat_date (stat_date),
    KEY idx_period_type (period_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='统计数据缓存表';

-- ========================================
-- 8. 集合排名缓存表 (用于 Analytics)
-- ========================================
CREATE TABLE ob_collection_ranking (
    id BIGINT AUTO_INCREMENT COMMENT '主键' PRIMARY KEY,
    ranking_date DATE NOT NULL COMMENT '排名日期',
    period_type VARCHAR(20) NOT NULL COMMENT '周期类型 (1h, 6h, 1d, 7d, 30d)',
    collection_address VARCHAR(42) NOT NULL COMMENT '集合合约地址',
    chain_name VARCHAR(50) NOT NULL COMMENT '链名称',
    `rank` INT NOT NULL COMMENT '排名',
    volume DECIMAL(30) DEFAULT 0 COMMENT '交易量 (ETH)',
    volume_change DECIMAL(10,4) DEFAULT 0 COMMENT '交易量变化率',
    sales BIGINT DEFAULT 0 COMMENT '销售次数',
    sales_change DECIMAL(10,4) DEFAULT 0 COMMENT '销售变化率',
    floor_price DECIMAL(30) DEFAULT 0 COMMENT '地板价 (ETH)',
    floor_change DECIMAL(10,4) DEFAULT 0 COMMENT '地板价变化率',
    owners BIGINT DEFAULT 0 COMMENT '所有者数量',
    items BIGINT DEFAULT 0 COMMENT '物品总数',
    create_time BIGINT COMMENT '创建时间戳 (毫秒)',
    UNIQUE KEY uk_date_period_collection (ranking_date, period_type, collection_address, chain_name),
    KEY idx_ranking_date (ranking_date),
    KEY idx_period_type (period_type),
    KEY idx_rank (`rank`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='集合排名缓存表';

-- ========================================
-- 初始化分类数据
-- ========================================
-- ========================================
-- 初始化分类数据
-- ========================================
INSERT INTO ob_category (name, slug, description, icon_uri, sort_order, is_active, create_time) VALUES
('艺术', 'art', '数字艺术作品和创意表达', '', 1, 1, UNIX_TIMESTAMP(NOW()) * 1000),
('游戏', 'gaming', '游戏相关 NFT 和虚拟资产', '', 2, 1, UNIX_TIMESTAMP(NOW()) * 1000),
('元宇宙', 'metaverse', '虚拟世界和土地资产', '', 3, 1, UNIX_TIMESTAMP(NOW()) * 1000),
('音乐', 'music', '音乐作品和音频 NFT', '', 4, 1, UNIX_TIMESTAMP(NOW()) * 1000),
('摄影', 'photography', '摄影作品和视觉艺术', '', 5, 1, UNIX_TIMESTAMP(NOW()) * 1000),
('体育', 'sports', '体育时刻和收藏品', '', 6, 1, UNIX_TIMESTAMP(NOW()) * 1000),
('实用工具', 'utility', '具有实用功能的 NFT', '', 7, 1, UNIX_TIMESTAMP(NOW()) * 1000),
('头像', 'pfp', '个人资料头像系列', '', 8, 1, UNIX_TIMESTAMP(NOW()) * 1000);

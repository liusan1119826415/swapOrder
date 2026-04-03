/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80044 (8.0.44)
 Source Host           : localhost:3306
 Source Schema         : easyswap

 Target Server Type    : MySQL
 Target Server Version : 80044 (8.0.44)
 File Encoding         : 65001

 Date: 29/03/2026 11:11:55
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ob_activity_sepolia
-- ----------------------------
DROP TABLE IF EXISTS `ob_activity_sepolia`;
CREATE TABLE `ob_activity_sepolia`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `activity_type` tinyint NOT NULL COMMENT '(1:Buy,2:Mint,3:List,4:Cancel Listing,5:Cancel Offer,6.Make Offer,7.Sell,8.Transfer,9.collection-bid,10.item-bid)',
  `maker` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '对于buy,sell,listing,transfer类型指的是nft流转的起始方，即卖方address。对于其他类型可以理解为发起方，如make offer谁发起的from就是谁的地址',
  `taker` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '目标方,和maker相对',
  `marketplace_id` tinyint NOT NULL DEFAULT 0,
  `collection_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `token_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `currency_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '1' COMMENT '货币类型(1表示eth)',
  `price` decimal(30, 0) NOT NULL DEFAULT 0 COMMENT 'nft 价格',
  `sell_price` decimal(30, 0) NOT NULL DEFAULT 0 COMMENT '池子相关数据,出售价格',
  `buy_price` decimal(30, 0) NOT NULL DEFAULT 0 COMMENT '池子相关数据,购买价格',
  `block_number` bigint NOT NULL DEFAULT 0 COMMENT '区块号',
  `tx_hash` varchar(66) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '交易事务hash',
  `event_time` bigint NULL DEFAULT NULL COMMENT '链上事件发生的时间',
  `create_time` bigint NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` bigint NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `index_tx_collection_token_type`(`tx_hash` ASC, `collection_address` ASC, `token_id` ASC, `activity_type` ASC) USING BTREE,
  INDEX `index_collection_token_type`(`collection_address` ASC, `token_id` ASC, `activity_type` ASC) USING BTREE,
  INDEX `index_hash_collection_token_type`(`tx_hash` ASC, `collection_address` ASC, `token_id` ASC, `activity_type` ASC) USING BTREE,
  INDEX `index_tx_collection_token_type_time`(`tx_hash` ASC, `collection_address` ASC, `token_id` ASC, `activity_type` ASC, `event_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_analytics_stats
-- ----------------------------
DROP TABLE IF EXISTS `ob_analytics_stats`;
CREATE TABLE `ob_analytics_stats`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `stat_date` date NOT NULL COMMENT '统计日期',
  `period_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '周期类型 (1h, 6h, 1d, 7d, 30d, all)',
  `total_volume` decimal(30, 0) NULL DEFAULT 0 COMMENT '总交易量 (ETH)',
  `total_volume_usd` decimal(30, 0) NULL DEFAULT 0 COMMENT '总交易量 (USD)',
  `total_sales` bigint NULL DEFAULT 0 COMMENT '总销售次数',
  `active_users` bigint NULL DEFAULT 0 COMMENT '活跃用户数',
  `average_price` decimal(30, 0) NULL DEFAULT 0 COMMENT '平均价格 (ETH)',
  `average_price_usd` decimal(30, 0) NULL DEFAULT 0 COMMENT '平均价格 (USD)',
  `market_cap` decimal(30, 0) NULL DEFAULT 0 COMMENT '市值 (ETH)',
  `market_cap_usd` decimal(30, 0) NULL DEFAULT 0 COMMENT '市值 (USD)',
  `total_collections` bigint NULL DEFAULT 0 COMMENT '总集合数',
  `total_items` bigint NULL DEFAULT 0 COMMENT '总物品数',
  `chain_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '链名称',
  `create_time` bigint NULL DEFAULT NULL COMMENT '创建时间戳 (毫秒)',
  `update_time` bigint NULL DEFAULT NULL COMMENT '更新时间戳 (毫秒)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_date_period_chain`(`stat_date` ASC, `period_type` ASC, `chain_name` ASC) USING BTREE,
  INDEX `idx_stat_date`(`stat_date` ASC) USING BTREE,
  INDEX `idx_period_type`(`period_type` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '统计数据缓存表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_auction
-- ----------------------------
DROP TABLE IF EXISTS `ob_auction`;
CREATE TABLE `ob_auction`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `auction_id` varchar(66) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '拍卖唯一 ID',
  `marketplace_id` tinyint NULL DEFAULT 0 COMMENT '市场 ID (0:本平台，1:opensea, 2:looksrare, 3:x2y2)',
  `collection_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '集合合约地址',
  `token_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Token ID',
  `seller` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '卖家地址',
  `highest_bidder` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '最高出价者地址',
  `start_price` decimal(30, 0) NOT NULL COMMENT '起始价格 (ETH)',
  `reserve_price` decimal(30, 0) NULL DEFAULT NULL COMMENT '保留价格 (ETH)',
  `current_bid` decimal(30, 0) NULL DEFAULT 0 COMMENT '当前出价 (ETH)',
  `bid_count` bigint NULL DEFAULT 0 COMMENT '出价次数',
  `start_time` bigint NOT NULL COMMENT '开始时间戳 (秒)',
  `end_time` bigint NOT NULL COMMENT '结束时间戳 (秒)',
  `status` tinyint NULL DEFAULT 0 COMMENT '状态 (0:活跃，1:已结束，2:已取消，3:已售出)',
  `currency_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '1' COMMENT '货币类型 (1:ETH)',
  `chain_id` bigint NULL DEFAULT 1 COMMENT '链 ID',
  `chain_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '链名称 (如：sepolia)',
  `create_time` bigint NULL DEFAULT NULL COMMENT '创建时间戳 (毫秒)',
  `update_time` bigint NULL DEFAULT NULL COMMENT '更新时间戳 (毫秒)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_auction_id`(`auction_id` ASC) USING BTREE,
  INDEX `idx_collection_token`(`collection_address` ASC, `token_id` ASC) USING BTREE,
  INDEX `idx_seller`(`seller` ASC) USING BTREE,
  INDEX `idx_status_end_time`(`status` ASC, `end_time` ASC) USING BTREE,
  INDEX `idx_chain_name`(`chain_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '拍卖表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_auction_bid
-- ----------------------------
DROP TABLE IF EXISTS `ob_auction_bid`;
CREATE TABLE `ob_auction_bid`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `auction_id` varchar(66) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '拍卖 ID',
  `bidder` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '出价者地址',
  `amount` decimal(30, 0) NOT NULL COMMENT '出价金额 (ETH)',
  `tx_hash` varchar(66) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '交易 hash',
  `bid_time` bigint NOT NULL COMMENT '出价时间戳 (秒)',
  `create_time` bigint NULL DEFAULT NULL COMMENT '创建时间戳 (毫秒)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_auction_id`(`auction_id` ASC) USING BTREE,
  INDEX `idx_bidder`(`bidder` ASC) USING BTREE,
  INDEX `idx_bid_time`(`bid_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '拍卖出价记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_category
-- ----------------------------
DROP TABLE IF EXISTS `ob_category`;
CREATE TABLE `ob_category`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分类名称',
  `slug` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分类标识 (英文短名)',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '分类描述',
  `icon_uri` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '分类图标 URL',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序顺序',
  `is_active` tinyint NULL DEFAULT 1 COMMENT '是否激活 (0:禁用，1:启用)',
  `create_time` bigint NULL DEFAULT NULL COMMENT '创建时间戳 (毫秒)',
  `update_time` bigint NULL DEFAULT NULL COMMENT '更新时间戳 (毫秒)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_slug`(`slug` ASC) USING BTREE,
  INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '分类表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_collection_category
-- ----------------------------
DROP TABLE IF EXISTS `ob_collection_category`;
CREATE TABLE `ob_collection_category`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `collection_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '集合合约地址',
  `category_id` bigint NOT NULL COMMENT '分类 ID',
  `chain_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '链名称 (如：sepolia)',
  `create_time` bigint NULL DEFAULT NULL COMMENT '创建时间戳 (毫秒)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_collection_category`(`collection_address` ASC, `category_id` ASC, `chain_name` ASC) USING BTREE,
  INDEX `idx_category_id`(`category_id` ASC) USING BTREE,
  INDEX `idx_chain_name`(`chain_name` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '集合分类关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_collection_floor_price_sepolia
-- ----------------------------
DROP TABLE IF EXISTS `ob_collection_floor_price_sepolia`;
CREATE TABLE `ob_collection_floor_price_sepolia`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `collection_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '链上合约地址',
  `price` decimal(30, 0) NULL DEFAULT NULL COMMENT 'token 价格',
  `event_time` bigint NULL DEFAULT NULL COMMENT '事件时间',
  `create_time` bigint NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` bigint NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `index_price`(`collection_address` ASC, `price` ASC, `event_time` ASC) USING BTREE,
  INDEX `index_collection_address`(`collection_address` ASC) USING BTREE,
  INDEX `index_event_time`(`event_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_collection_import_record_sepolia
-- ----------------------------
DROP TABLE IF EXISTS `ob_collection_import_record_sepolia`;
CREATE TABLE `ob_collection_import_record_sepolia`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `collection_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `msg` varchar(1600) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `finished_stage` tinyint(1) NOT NULL DEFAULT 0 COMMENT '已完成的阶段。0表示加入任务，1表示导入collection完成，2全部完成(指item导入完成，photo不好记录不影响此处的阶段)',
  `create_time` bigint NOT NULL,
  `update_time` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_collection_ranking
-- ----------------------------
DROP TABLE IF EXISTS `ob_collection_ranking`;
CREATE TABLE `ob_collection_ranking`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `ranking_date` date NOT NULL COMMENT '排名日期',
  `period_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '周期类型 (1h, 6h, 1d, 7d, 30d)',
  `collection_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '集合合约地址',
  `chain_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '链名称',
  `rank` int NOT NULL COMMENT '排名',
  `volume` decimal(30, 0) NULL DEFAULT 0 COMMENT '交易量 (ETH)',
  `volume_change` decimal(10, 4) NULL DEFAULT 0.0000 COMMENT '交易量变化率',
  `sales` bigint NULL DEFAULT 0 COMMENT '销售次数',
  `sales_change` decimal(10, 4) NULL DEFAULT 0.0000 COMMENT '销售变化率',
  `floor_price` decimal(30, 0) NULL DEFAULT 0 COMMENT '地板价 (ETH)',
  `floor_change` decimal(10, 4) NULL DEFAULT 0.0000 COMMENT '地板价变化率',
  `owners` bigint NULL DEFAULT 0 COMMENT '所有者数量',
  `items` bigint NULL DEFAULT 0 COMMENT '物品总数',
  `create_time` bigint NULL DEFAULT NULL COMMENT '创建时间戳 (毫秒)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_date_period_collection`(`ranking_date` ASC, `period_type` ASC, `collection_address` ASC, `chain_name` ASC) USING BTREE,
  INDEX `idx_ranking_date`(`ranking_date` ASC) USING BTREE,
  INDEX `idx_period_type`(`period_type` ASC) USING BTREE,
  INDEX `idx_rank`(`rank` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '集合排名缓存表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_collection_sepolia
-- ----------------------------
DROP TABLE IF EXISTS `ob_collection_sepolia`;
CREATE TABLE `ob_collection_sepolia`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `symbol` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '项目标识',
  `chain_id` bigint NOT NULL DEFAULT 1 COMMENT '链类型(1:以太坊)',
  `auth` tinyint NOT NULL DEFAULT 0 COMMENT '认证(0:默认未认证1:认证通过2:认证不通过)',
  `token_standard` bigint NOT NULL COMMENT '合约实现标准',
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '项目名称',
  `creator` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '创建者',
  `address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '链上合约地址',
  `owner_amount` bigint NOT NULL DEFAULT 0 COMMENT '拥有item人数',
  `item_amount` bigint NOT NULL DEFAULT 0 COMMENT '该项目NFT的发行总量',
  `description` varchar(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '项目描述',
  `website` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '项目官网地址',
  `twitter` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '项目twitter地址',
  `discord` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '项目 discord 地址',
  `instagram` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '项目 instagram 地址',
  `floor_price` decimal(30, 0) NULL DEFAULT NULL COMMENT '整个collection中item的最低的listing价格',
  `sale_price` decimal(30, 0) NULL DEFAULT NULL COMMENT '整个collection中bid的最高的价格',
  `volume_total` decimal(30, 0) NULL DEFAULT NULL COMMENT '总交易量',
  `image_uri` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '项目封面图的链接',
  `banner_uri` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'banner image uri',
  `opensea_ban_scan` tinyint NULL DEFAULT 0 COMMENT '（0.未扫描 1扫描过）',
  `is_syncing` tinyint(1) NOT NULL DEFAULT 0,
  `history_sale_sync` tinyint NOT NULL DEFAULT 0,
  `history_overview` int NOT NULL DEFAULT 0 COMMENT '是否生成历史overview 0:已经生成 1:等待生成 2:生成错误',
  `floor_price_status` int NOT NULL DEFAULT 0,
  `create_time` bigint NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` bigint NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `index_unique_address`(`address` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_creator
-- ----------------------------
DROP TABLE IF EXISTS `ob_creator`;
CREATE TABLE `ob_creator`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '创作者钱包地址',
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '用户名',
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '个人简介',
  `avatar_uri` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '头像 URL',
  `banner_uri` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '横幅图片 URL',
  `is_verified` tinyint NULL DEFAULT 0 COMMENT '是否认证 (0:未认证，1:已认证)',
  `twitter` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'Twitter 链接',
  `discord` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'Discord 链接',
  `instagram` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'Instagram 链接',
  `website` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '个人网站',
  `total_volume` decimal(30, 0) NULL DEFAULT 0 COMMENT '总交易量 (ETH)',
  `total_sales` bigint NULL DEFAULT 0 COMMENT '总销售次数',
  `total_items` bigint NULL DEFAULT 0 COMMENT '总作品数',
  `floor_price` decimal(30, 0) NULL DEFAULT 0 COMMENT '地板价 (ETH)',
  `followers` bigint NULL DEFAULT 0 COMMENT '粉丝数',
  `create_time` bigint NULL DEFAULT NULL COMMENT '创建时间戳 (毫秒)',
  `update_time` bigint NULL DEFAULT NULL COMMENT '更新时间戳 (毫秒)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_address`(`address` ASC) USING BTREE,
  INDEX `idx_username`(`username` ASC) USING BTREE,
  INDEX `idx_total_volume`(`total_volume` ASC) USING BTREE,
  INDEX `idx_is_verified`(`is_verified` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '创作者/艺术家表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_drop
-- ----------------------------
DROP TABLE IF EXISTS `ob_drop`;
CREATE TABLE `ob_drop`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `drop_id` varchar(66) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Drop 唯一 ID',
  `collection_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '集合合约地址',
  `collection_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '集合名称',
  `creator_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '创建者地址',
  `creator_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '创建者名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '项目描述',
  `logo_uri` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'Logo URL',
  `banner_uri` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '横幅 URL',
  `total_supply` bigint NOT NULL COMMENT '总供应量',
  `items_minted` bigint NULL DEFAULT 0 COMMENT '已 mint 数量',
  `price` decimal(30, 0) NOT NULL COMMENT '单价 (ETH)',
  `mint_start_time` bigint NOT NULL COMMENT '开始时间戳 (秒)',
  `mint_end_time` bigint NOT NULL COMMENT '结束时间戳 (秒)',
  `status` tinyint NULL DEFAULT 0 COMMENT '状态 (0:upcoming, 1:live, 2:sold_out, 3:ended)',
  `chain_id` bigint NULL DEFAULT 1 COMMENT '链 ID',
  `chain_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '链名称 (如：sepolia)',
  `is_verified` tinyint NULL DEFAULT 0 COMMENT '是否认证',
  `categories` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '分类列表 (逗号分隔)',
  `website` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '官网地址',
  `discord` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'Discord 地址',
  `twitter` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'Twitter 地址',
  `create_time` bigint NULL DEFAULT NULL COMMENT '创建时间戳 (毫秒)',
  `update_time` bigint NULL DEFAULT NULL COMMENT '更新时间戳 (毫秒)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_drop_id`(`drop_id` ASC) USING BTREE,
  INDEX `idx_collection_address`(`collection_address` ASC) USING BTREE,
  INDEX `idx_creator_address`(`creator_address` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_mint_time`(`mint_start_time` ASC, `mint_end_time` ASC) USING BTREE,
  INDEX `idx_chain_name`(`chain_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '新品发布表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_global_collection_sepolia
-- ----------------------------
DROP TABLE IF EXISTS `ob_global_collection_sepolia`;
CREATE TABLE `ob_global_collection_sepolia`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `collection_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `token_standard` tinyint NOT NULL DEFAULT 0,
  `import_status` tinyint NOT NULL DEFAULT 0,
  `create_time` bigint NOT NULL,
  `update_time` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_indexed_status
-- ----------------------------
DROP TABLE IF EXISTS `ob_indexed_status`;
CREATE TABLE `ob_indexed_status`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `chain_id` bigint NOT NULL DEFAULT 1 COMMENT '链id (1:以太坊, 56: BSC)',
  `last_indexed_block` bigint NULL DEFAULT 0 COMMENT '区块号',
  `last_indexed_time` bigint NULL DEFAULT NULL COMMENT '最后同步时间戳',
  `index_type` tinyint NOT NULL DEFAULT 0 COMMENT '0:activity, 1:trade info, 2:listing,3:sale,4:exchange,5:floor price',
  `create_time` bigint NULL DEFAULT NULL,
  `update_time` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_item_external_sepolia
-- ----------------------------
DROP TABLE IF EXISTS `ob_item_external_sepolia`;
CREATE TABLE `ob_item_external_sepolia`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `collection_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_uploaded_oss` tinyint(1) NULL DEFAULT 0 COMMENT '是否已上传oss(0:未上传,1:已上传)',
  `upload_status` tinyint NOT NULL DEFAULT 0 COMMENT '标记上传oss状态',
  `meta_data_uri` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '元数据地址',
  `image_uri` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `oss_uri` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '图片地址',
  `token_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `is_video_uploaded` tinyint(1) NULL DEFAULT 0 COMMENT 'video是否已上传oss(0:未上传,1:已上传)',
  `video_upload_status` tinyint NOT NULL DEFAULT 0 COMMENT '标记video上传oss状态',
  `video_type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT '标记video 类型',
  `video_uri` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'video 原始uri',
  `video_oss_uri` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'video oss uri',
  `create_time` bigint NULL DEFAULT NULL,
  `update_time` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `index_collection_token`(`collection_address` ASC, `token_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_item_sepolia
-- ----------------------------
DROP TABLE IF EXISTS `ob_item_sepolia`;
CREATE TABLE `ob_item_sepolia`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `chain_id` bigint NOT NULL DEFAULT 1 COMMENT '链类型',
  `token_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'token_id',
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'nft名称',
  `owner` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '拥有者',
  `collection_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '合约地址',
  `creator` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '创建者',
  `supply` bigint NOT NULL COMMENT 'item最多可以有多少份',
  `list_price` decimal(30, 0) NULL DEFAULT NULL COMMENT '上架价格',
  `list_time` bigint NULL DEFAULT NULL COMMENT '上架时间',
  `sale_price` decimal(30, 0) NULL DEFAULT NULL COMMENT '销售价格',
  `views` bigint NULL DEFAULT NULL COMMENT '浏览量',
  `is_opensea_banned` tinyint(1) NULL DEFAULT 0 COMMENT '是否被opensea标记禁止交易',
  `create_time` bigint NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` bigint NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `index_collection_token`(`collection_address` ASC, `token_id` ASC) USING BTREE,
  INDEX `index_collection_item_name`(`collection_address` ASC, `token_id` ASC, `name` ASC) USING BTREE,
  INDEX `index_collection_owner`(`collection_address` ASC, `owner` ASC) USING BTREE,
  INDEX `index_collection_token_owner`(`collection_address` ASC, `token_id` ASC, `owner` ASC) USING BTREE,
  INDEX `index_owner`(`owner` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_item_trait_sepolia
-- ----------------------------
DROP TABLE IF EXISTS `ob_item_trait_sepolia`;
CREATE TABLE `ob_item_trait_sepolia`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `collection_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'collection主键',
  `token_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'item主键',
  `trait` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '属性名称',
  `trait_value` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '属性值',
  `create_time` bigint NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` bigint NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `index_collection_token`(`collection_address` ASC, `token_id` ASC) USING BTREE,
  INDEX `index_collection_trait_value`(`collection_address` ASC, `trait` ASC, `trait_value` ASC) USING BTREE,
  INDEX `index_trait_value`(`trait` ASC, `trait_value` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_order_sepolia
-- ----------------------------
DROP TABLE IF EXISTS `ob_order_sepolia`;
CREATE TABLE `ob_order_sepolia`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `marketplace_id` tinyint NOT NULL DEFAULT 0 COMMENT '0.locol 1.opensea 2.looks 3.x2y2',
  `collection_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `token_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `order_id` varchar(66) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '订单hash',
  `order_status` tinyint NOT NULL DEFAULT 0 COMMENT '标记订单状态',
  `event_time` bigint NULL DEFAULT NULL COMMENT '订单时间',
  `expire_time` bigint NULL DEFAULT NULL,
  `price` decimal(30, 0) NOT NULL DEFAULT 0,
  `maker` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `taker` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `quantity_remaining` bigint NOT NULL DEFAULT 1,
  `size` bigint NOT NULL DEFAULT 1,
  `currency_address` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '1',
  `order_type` tinyint NOT NULL COMMENT '1',
  `salt` bigint NULL DEFAULT 0,
  `create_time` bigint NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` bigint NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `index_hash`(`order_id` ASC) USING BTREE,
  INDEX `index_collection_maker_status_type_market_token_id`(`collection_address` ASC, `maker` ASC, `order_status` ASC, `order_type` ASC, `marketplace_id` ASC, `token_id` ASC) USING BTREE,
  INDEX `index_collection_token`(`collection_address` ASC, `token_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ob_user
-- ----------------------------
DROP TABLE IF EXISTS `ob_user`;
CREATE TABLE `ob_user`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `address` varchar(66) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户地址',
  `is_allowed` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否允许用户访问',
  `is_signed` tinyint(1) NULL DEFAULT 0,
  `create_time` bigint NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` bigint NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `index_address`(`address` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;

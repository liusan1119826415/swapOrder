-- 初始化 NFT Transfer 事件索引状态
-- index_type: 7 = NFT Transfer Index

INSERT INTO ob_indexed_status (chain_id, last_indexed_block, last_indexed_time, index_type, create_time, update_time)
VALUES 
    (11155111, 0, UNIX_TIMESTAMP(), 7, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000)
ON DUPLICATE KEY UPDATE 
    update_time = VALUES(update_time);

-- 说明：
-- chain_id: 11155111 = Sepolia testnet
-- last_indexed_block: 从区块 0 开始同步
-- index_type: 7 = NFT Transfer Event Index (新增类型)
-- 主网可以添加：
-- INSERT INTO ob_indexed_status (chain_id, last_indexed_block, last_indexed_time, index_type, create_time, update_time)
-- VALUES (1, 0, UNIX_TIMESTAMP(), 7, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000)
-- ON DUPLICATE KEY UPDATE update_time = VALUES(update_time);

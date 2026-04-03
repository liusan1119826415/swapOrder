package nftindexer

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/ProjectsTask/EasySwapBase/logger/xzap"
	"github.com/ProjectsTask/EasySwapBase/stores/gdb/orderbookmodel/multi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// NFTMetadata NFT 元数据结构
type NFTMetadata struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Image       string `json:"image"`
	ExternalURL string `json:"external_url"`
	Attributes  []struct {
		TraitType string `json:"trait_type"`
		Value     string `json:"value"`
	} `json:"attributes"`
}

// FetchNFTMetadata 获取 NFT 元数据
func FetchNFTMetadata(ctx context.Context, tokenURI string) (*NFTMetadata, error) {
	if tokenURI == "" {
		return nil, errors.New("token URI is empty")
	}

	// 如果 URI 是 IPFS 格式，转换为 HTTP 格式
	if strings.HasPrefix(tokenURI, "ipfs://") {
		tokenURI = strings.Replace(tokenURI, "ipfs://", "https://ipfs.io/ipfs/", 1)
	}

	// 增加超时时间，因为 IPFS 网关可能比较慢
	client := &http.Client{
		Timeout: 60 * time.Second, // 从 10 秒增加到 60 秒
	}

	resp, err := client.Get(tokenURI)
	if err != nil {
		return nil, errors.Wrap(err, "failed to fetch metadata from URI")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.Errorf("metadata request failed with status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrap(err, "failed to read metadata response")
	}

	var metadata NFTMetadata
	if err := json.Unmarshal(body, &metadata); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal metadata")
	}

	return &metadata, nil
}

// UpdateNFTMetadata 更新 NFT 元数据到数据库
func UpdateNFTMetadata(ctx context.Context, db *gorm.DB, chain string, collectionAddress string, tokenId string, metadata *NFTMetadata) error {
	if metadata == nil {
		return errors.New("metadata is nil")
	}

	// 构建 NFT 名称
	name := metadata.Name
	if name == "" {
		name = collectionAddress + " #" + tokenId
	}

	// 准备更新的字段
	updates := map[string]interface{}{
		"name":      name,
		"image_url": metadata.Image,
	}

	if err := db.WithContext(ctx).Table(multi.ItemTableName(chain)).
		Where("collection_address = ? AND token_id = ?", strings.ToLower(collectionAddress), tokenId).
		Updates(updates).Error; err != nil {
		return errors.Wrap(err, "failed to update NFT metadata")
	}

	xzap.WithContext(ctx).Debug("Updated NFT metadata",
		zap.String("collection", collectionAddress),
		zap.String("token_id", tokenId),
		zap.String("name", name),
		zap.String("image_url", metadata.Image))

	return nil
}

// ResolveMetadataURI 解析元数据 URI（处理链上存储和 IPFS）
func ResolveMetadataURI(ctx context.Context, contractAddress common.Address, tokenId string, chainClient interface{}) (string, error) {
	// TODO: 实现通过合约调用获取 tokenURI
	// 这需要集成 ERC721 的 tokenURI(uint256 tokenId) 方法

	// 目前返回空字符串，由调用方自行处理
	return "", errors.New("not implemented")
}

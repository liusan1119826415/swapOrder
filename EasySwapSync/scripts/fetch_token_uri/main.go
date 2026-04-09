// main.go - 测试脚本：根据 tokenId 获取 tokenURI 和 metadata name
//
// 使用方法（在 EasySwapSync 目录下执行）：
//
//	go run scripts/fetch_token_uri/main.go
//	go run scripts/fetch_token_uri/main.go -contract=0x... -token=16
//	go run scripts/fetch_token_uri/main.go -contract=0x... -token=16 -rpc=https://rpc.ankr.com/eth_sepolia
//
// 环境变量方式（优先级低于命令行参数）：
//
//	NFT_CONTRACT=0x... TOKEN_ID=16 RPC_URL=https://... go run scripts/fetch_token_uri/main.go

package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"math/big"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/ProjectsTask/EasySwapBase/chain/chainclient"
	"github.com/ProjectsTask/EasySwapBase/stores/xkv"
	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/core/stores/kv"
	"github.com/zeromicro/go-zero/core/stores/redis"

	"github.com/ProjectsTask/EasySwapSync/service/config"
	"github.com/ProjectsTask/EasySwapSync/service/nftindexer"
)

// NFTMetadata JSON 元数据结构（只解析关心的字段）
type NFTMetadata struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Image       string `json:"image"`
	ExternalURL string `json:"external_url"`
}

func main() {
	// ── 命令行参数 ────────────────────────────────────────────────────────────────
	contractFlag := flag.String("contract", "", "NFT 合约地址 (e.g. 0xbD82...)")
	tokenFlag := flag.Int64("token", 0, "Token ID (e.g. 16)")
	rpcFlag := flag.String("rpc", "", "RPC URL (e.g. https://rpc.ankr.com/eth_sepolia)")
	configFlag := flag.String("config", "config/config_import.toml", "配置文件路径")
	flag.Parse()

	// ── 从环境变量补充（命令行参数优先）────────────────────────────────────────────
	contractAddr := firstNonEmpty(*contractFlag, os.Getenv("NFT_CONTRACT"))
	tokenIDStr := os.Getenv("TOKEN_ID")
	rpcURL := firstNonEmpty(*rpcFlag, os.Getenv("RPC_URL"))

	// 确定 tokenId
	var tokenId int64 = *tokenFlag
	if tokenId == 0 && tokenIDStr != "" {
		fmt.Sscan(tokenIDStr, &tokenId)
	}
	if tokenId == 0 {
		tokenId = 1 // 默认 token id
	}

	// ── 加载配置文件（用来获取 RPC / chain 信息）────────────────────────────────────
	var chainID int64 = 11155111
	var chainName string = "sepolia"

	cfg, cfgErr := config.UnmarshalConfig(*configFlag)
	if cfgErr != nil {
		fmt.Printf("⚠️  无法加载配置文件 %s: %v\n", *configFlag, cfgErr)
		fmt.Println("   将使用命令行参数 / 环境变量继续运行")
	} else {
		chainID = cfg.ChainCfg.ID
		chainName = cfg.ChainCfg.Name

		// 从配置补充 RPC 地址
		if rpcURL == "" {
			rpcURL = cfg.AnkrCfg.HttpsUrl + cfg.AnkrCfg.ApiKey
		}
		// 从配置补充合约地址
		if contractAddr == "" && len(cfg.ContractCfg.NFTAddresses) > 0 {
			contractAddr = cfg.ContractCfg.NFTAddresses[0]
		}
	}

	// ── 参数最终校验 ───────────────────────────────────────────────────────────────
	if contractAddr == "" {
		log.Fatal("❌ 请指定 NFT 合约地址：-contract=0x... 或环境变量 NFT_CONTRACT=0x...")
	}
	if rpcURL == "" {
		log.Fatal("❌ 请指定 RPC URL：-rpc=https://... 或环境变量 RPC_URL=https://...")
	}

	fmt.Println("═══════════════════════════════════════════════════════")
	fmt.Println("  NFT Token URI & Metadata 查询工具")
	fmt.Println("═══════════════════════════════════════════════════════")
	fmt.Printf("  合约地址 : %s\n", contractAddr)
	fmt.Printf("  Token ID  : %d\n", tokenId)
	fmt.Printf("  Chain     : %s (id=%d)\n", chainName, chainID)
	fmt.Printf("  RPC URL   : %s\n", maskURL(rpcURL))
	fmt.Println("═══════════════════════════════════════════════════════")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// ── 初始化 ChainClient ────────────────────────────────────────────────────────
	fmt.Println("\n[1/3] 连接区块链节点...")
	chainClient, err := chainclient.New(int(chainID), rpcURL)
	if err != nil {
		log.Fatalf("❌ 初始化 ChainClient 失败: %v", err)
	}
	fmt.Println("  ✅ 连接成功")

	// ── 初始化 KV Store（NFTIndexerService 依赖）─────────────────────────────────
	var kvStore *xkv.Store
	if cfg != nil && cfg.Kv != nil && len(cfg.Kv.Redis) > 0 {
		var kvConf kv.KvConf
		for _, con := range cfg.Kv.Redis {
			kvConf = append(kvConf, cache.NodeConf{
				RedisConf: redis.RedisConf{
					Host: con.Host,
					Type: con.Type,
					Pass: con.Pass,
				},
				Weight: 2,
			})
		}
		kvStore = xkv.NewStore(kvConf)
	} else {
		kvStore = xkv.NewStore(nil) // 无 Redis 也可以运行
	}

	// ── 创建 NFTIndexerService ────────────────────────────────────────────────────
	fmt.Println("[2/3] 创建 NFTIndexerService...")
	var svcCfg *config.Config
	if cfg != nil {
		svcCfg = cfg
	} else {
		svcCfg = &config.Config{
			ChainCfg: config.ChainCfg{ID: chainID, Name: chainName},
		}
	}
	nftService := nftindexer.New(ctx, svcCfg, nil, kvStore, chainClient, chainID, chainName)
	fmt.Println("  ✅ NFTIndexerService 创建成功")

	// ── 调用 FetchTokenURI ────────────────────────────────────────────────────────
	fmt.Printf("[3/3] 调用 FetchTokenURI(tokenId=%d)...\n", tokenId)
	tokenBigInt := big.NewInt(tokenId)
	tokenURI, err := nftService.FetchTokenURI(ctx, contractAddr, tokenBigInt)
	if err != nil {
		log.Fatalf("❌ 获取 tokenURI 失败: %v", err)
	}

	fmt.Println("\n─────────────────────────────────────────────────────")
	fmt.Printf("  Token URI : %s\n", tokenURI)
	fmt.Println("─────────────────────────────────────────────────────")

	// ── 获取 Metadata ─────────────────────────────────────────────────────────────
	if tokenURI == "" {
		fmt.Println("⚠️  tokenURI 为空，跳过 metadata 获取")
		return
	}

	fmt.Println("\n正在获取 metadata...")
	metadataURL := resolveMetadataURL(tokenURI)
	fmt.Printf("  Metadata URL: %s\n", metadataURL)

	metadata, rawJSON, fetchErr := fetchMetadata(metadataURL)
	if fetchErr != nil {
		fmt.Printf("⚠️  获取 metadata 失败: %v\n", fetchErr)
		fmt.Println("  （tokenURI 已获取成功，仅 metadata HTTP 解析失败）")
	} else {
		fmt.Println("\n─────────────────────────────────────────────────────")
		fmt.Printf("  Metadata Name : %s\n", metadata.Name)
		if metadata.Description != "" {
			fmt.Printf("  Description   : %s\n", metadata.Description)
		}
		if metadata.Image != "" {
			fmt.Printf("  Image         : %s\n", metadata.Image)
		}
		if metadata.ExternalURL != "" {
			fmt.Printf("  External URL  : %s\n", metadata.ExternalURL)
		}
		fmt.Println("─────────────────────────────────────────────────────")
		fmt.Println("\n  Raw JSON:")
		fmt.Println(rawJSON)
	}

	fmt.Println("\n✅ 查询完成")
}

// ── 辅助函数 ──────────────────────────────────────────────────────────────────

// firstNonEmpty 返回第一个非空字符串
func firstNonEmpty(vals ...string) string {
	for _, v := range vals {
		if v != "" {
			return v
		}
	}
	return ""
}

// maskURL 隐藏 URL 中可能含有的 API Key（超过 60 字符时截断）
func maskURL(u string) string {
	if len(u) > 60 {
		return u[:60] + "..."
	}
	return u
}

// resolveMetadataURL 将 ipfs:// URI 转换为可访问的 HTTP 网关地址
func resolveMetadataURL(uri string) string {
	if strings.HasPrefix(uri, "ipfs://") {
		return "https://ipfs.io/ipfs/" + strings.TrimPrefix(uri, "ipfs://")
	}
	return uri
}

// fetchMetadata 通过 HTTP 获取并解析 NFT metadata JSON
func fetchMetadata(url string) (*NFTMetadata, string, error) {
	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, "", fmt.Errorf("HTTP 请求失败: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("HTTP 状态码: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", fmt.Errorf("读取响应体失败: %w", err)
	}

	// 格式化 JSON 便于阅读
	var raw interface{}
	prettyStr := string(body)
	if jsonErr := json.Unmarshal(body, &raw); jsonErr == nil {
		prettyBytes, _ := json.MarshalIndent(raw, "  ", "  ")
		prettyStr = string(prettyBytes)
	}

	var meta NFTMetadata
	if err := json.Unmarshal(body, &meta); err != nil {
		return nil, prettyStr, fmt.Errorf("JSON 解析失败: %w", err)
	}

	return &meta, prettyStr, nil
}

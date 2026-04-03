package service

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/ProjectsTask/EasySwapBase/chain"
	"github.com/ProjectsTask/EasySwapBase/chain/chainclient"
	"github.com/ProjectsTask/EasySwapBase/ordermanager"
	"github.com/ProjectsTask/EasySwapBase/stores/xkv"
	"github.com/pkg/errors"
	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/core/stores/kv"
	"github.com/zeromicro/go-zero/core/stores/redis"
	"gorm.io/gorm"

	"github.com/ProjectsTask/EasySwapSync/service/nftindexer"
	"github.com/ProjectsTask/EasySwapSync/service/orderbookindexer"

	"github.com/ProjectsTask/EasySwapSync/model"
	"github.com/ProjectsTask/EasySwapSync/service/collectionfilter"
	"github.com/ProjectsTask/EasySwapSync/service/config"
)

type Service struct {
	ctx              context.Context
	config           *config.Config
	kvStore          *xkv.Store
	db               *gorm.DB
	wg               *sync.WaitGroup
	collectionFilter *collectionfilter.Filter
	orderbookIndexer *orderbookindexer.Service
	nftIndexer       *nftindexer.NFTIndexerService
	orderManager     *ordermanager.OrderManager
}

func New(ctx context.Context, cfg *config.Config) (*Service, error) {
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

	kvStore := xkv.NewStore(kvConf)

	var err error
	db := model.NewDB(cfg.DB)
	collectionFilter := collectionfilter.New(ctx, db, cfg.ChainCfg.Name, cfg.ProjectCfg.Name)
	orderManager := ordermanager.New(ctx, db, kvStore, cfg.ChainCfg.Name, cfg.ProjectCfg.Name)

	var chainClient chainclient.ChainClient
	fmt.Println("chainClient url:" + cfg.AnkrCfg.HttpsUrl + cfg.AnkrCfg.ApiKey)

	chainClient, err = chainclient.New(int(cfg.ChainCfg.ID), cfg.AnkrCfg.HttpsUrl+cfg.AnkrCfg.ApiKey)
	if err != nil {
		return nil, errors.Wrap(err, "failed on create evm client")
	}

	var orderbookSyncer *orderbookindexer.Service
	var nftSyncer *nftindexer.NFTIndexerService

	switch cfg.ChainCfg.ID {
	case chain.EthChainID, chain.OptimismChainID, chain.SepoliaChainID:
		orderbookSyncer = orderbookindexer.New(ctx, cfg, db, kvStore, chainClient, cfg.ChainCfg.ID, cfg.ChainCfg.Name, orderManager)
		nftSyncer = nftindexer.New(ctx, cfg, db, kvStore, chainClient, cfg.ChainCfg.ID, cfg.ChainCfg.Name)
	}

	manager := Service{
		ctx:              ctx,
		config:           cfg,
		db:               db,
		kvStore:          kvStore,
		collectionFilter: collectionFilter,
		orderbookIndexer: orderbookSyncer,
		nftIndexer:       nftSyncer,
		orderManager:     orderManager,
		wg:               &sync.WaitGroup{},
	}
	return &manager, nil
}

func (s *Service) Start() error {
	// 不要移动位置
	if err := s.collectionFilter.PreloadCollections(); err != nil {
		return errors.Wrap(err, "failed on preload collection to filter")
	}

	// 启动订单簿索引服务
	if s.orderbookIndexer != nil {
		s.orderbookIndexer.Start()
	}

	// 启动 NFT 索引服务
	if s.nftIndexer != nil {
		s.nftIndexer.Start()
	}

	// 启动 NFT 元数据定时更新任务（每小时执行一次）
	go func() {
		updater := nftindexer.NewMetadataUpdater(s.db, s.nftIndexer, s.config.ChainCfg.ID, s.config.ChainCfg.Name)
		updater.SetParallelism(5)
		updater.SetTimeout(60 * time.Second) // 单个 NFT 超时 60 秒
		updater.SetInterval(5 * time.Minute) // 每 5 分钟执行一次
		updater.Start(s.ctx)
	}()
	fmt.Println("✅ NFT metadata updater started (runs every hour)")

	s.orderManager.Start()
	return nil
}

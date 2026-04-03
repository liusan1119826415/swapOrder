package service

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/ProjectsTask/EasySwapBase/logger/xzap"
	"github.com/ProjectsTask/EasySwapBase/stores/gdb/orderbookmodel/multi"
	"github.com/pkg/errors"
	"github.com/shopspring/decimal"
	"go.uber.org/zap"

	"github.com/ProjectsTask/EasySwapBackend/src/dao"
	"github.com/ProjectsTask/EasySwapBackend/src/service/svc"
	"github.com/ProjectsTask/EasySwapBackend/src/types/v1"
)

const BidTypeOffset = 3

func getBidType(origin int64) int64 {
	if origin >= BidTypeOffset {
		return origin - BidTypeOffset
	} else {
		return origin
	}
}

// GetMultiChainUserCollections 获取用户拥有Collection信息： 拥有item数量、上架数量、floor price
func GetMultiChainUserCollections(ctx context.Context, svcCtx *svc.ServerCtx, chainIDs []int, chainNames []string, userAddrs []string) (*types.UserCollectionsResp, error) {
	// 1. 查询用户在多条链上的Collection基本信息
	collections, err := svcCtx.Dao.QueryMultiChainUserCollectionInfos(ctx, chainIDs, chainNames, userAddrs)
	if err != nil {
		return nil, errors.Wrap(err, "failed on get collection info")
	}

	// 2. 构建chainID到chainName的映射
	chainIDToChainName := make(map[int]string)
	for _, chain := range svcCtx.C.ChainSupported {
		chainIDToChainName[chain.ChainID] = chain.Name
	}

	// 3. 构建chainID到Collection地址列表的映射
	chainIDToCollectionAddrs := make(map[int][]string)
	for _, collection := range collections {
		if _, ok := chainIDToCollectionAddrs[collection.ChainID]; !ok {
			chainIDToCollectionAddrs[collection.ChainID] = []string{collection.Address}
		} else {
			chainIDToCollectionAddrs[collection.ChainID] = append(chainIDToCollectionAddrs[collection.ChainID], collection.Address)
		}
	}

	// 4. 并发查询每个Collectionlection的挂单数量
	var listed []types.CollectionInfo
	var wg sync.WaitGroup
	var mu sync.Mutex
	for chainID, collectionAddrs := range chainIDToCollectionAddrs {
		chainName := chainIDToChainName[chainID]
		wg.Add(1)
		go func(chainName string, collectionAddrs []string) {
			defer wg.Done()

			list, err := svcCtx.Dao.QueryListedAmountEachCollection(ctx, chainName, collectionAddrs, userAddrs)
			if err != nil {
				return
			}
			mu.Lock()
			listed = append(listed, list...)
			mu.Unlock()
		}(chainName, collectionAddrs)
	}
	wg.Wait()

	// 5. 构建Collection地址到挂单数量的映射
	collectionsListed := make(map[string]int)
	for _, l := range listed {
		collectionsListed[strings.ToLower(l.Address)] = l.ListAmount
	}

	// 6. 组装最终结果
	var results types.UserCollectionsData
	chainInfos := make(map[int]types.ChainInfo)
	for _, collection := range collections {
		// 6.1 添加Collection信息
		listCount := collectionsListed[strings.ToLower(collection.Address)]
		results.CollectionInfos = append(results.CollectionInfos, types.CollectionInfo{
			ChainID:    collection.ChainID,
			Name:       collection.Name,
			Address:    collection.Address,
			Symbol:     collection.Symbol,
			ImageURI:   collection.ImageURI,
			ListAmount: listCount,
			ItemAmount: collection.ItemCount,
			FloorPrice: collection.FloorPrice,
		})

		// 6.2 计算每条链的统计信息
		chainInfo, ok := chainInfos[collection.ChainID]
		if ok {
			chainInfo.ItemOwned += collection.ItemCount
			chainInfo.ItemValue = chainInfo.ItemValue.Add(decimal.New(collection.ItemCount, 0).Mul(collection.FloorPrice))
			chainInfos[collection.ChainID] = chainInfo
		} else {
			chainInfos[collection.ChainID] = types.ChainInfo{
				ChainID:   collection.ChainID,
				ItemOwned: collection.ItemCount,
				ItemValue: decimal.New(collection.ItemCount, 0).Mul(collection.FloorPrice),
			}
		}
	}

	// 6.3 添加链信息到结果中
	for _, chainInfo := range chainInfos {
		results.ChainInfos = append(results.ChainInfos, chainInfo)
	}

	return &types.UserCollectionsResp{
		Result: results,
	}, nil
}

// GetMultiChainUserItems 查询用户拥有 nft 的 Item 基本信息，list 信息和 bid 信息，从 Item 表和 Activity 表中查询
func GetMultiChainUserItems(ctx context.Context, svcCtx *svc.ServerCtx, chainID []int, chain []string, userAddrs []string, contractAddrs []string, page, pageSize int) (*types.UserItemsResp, error) {
	// 1. 查询用户 Item 基础信息
	xzap.WithContext(ctx).Debug("GetMultiChainUserItems - Step 1: Querying user items",
		zap.Any("chainID", chainID),
		zap.Any("chain", chain),
		zap.Any("userAddrs", userAddrs),
		zap.Any("contractAddrs", contractAddrs),
		zap.Int("page", page),
		zap.Int("pageSize", pageSize),
	)

	items, count, err := svcCtx.Dao.QueryMultiChainUserItemInfos(ctx, chain, userAddrs, contractAddrs, page, pageSize)
	if err != nil {
		xzap.WithContext(ctx).Error("GetMultiChainUserItems - Failed to query user items",
			zap.Error(err),
		)
		return nil, errors.Wrap(err, "failed on get user items info")
	}

	// Debug: 打印查询结果
	xzap.WithContext(ctx).Debug("GetMultiChainUserItems - Query result",
		zap.Int64("count", count),
		zap.Int("items_length", len(items)),
		zap.Any("items_nil", items == nil),
	)

	// 打印每个 item 的详细信息
	for i, item := range items {
		xzap.WithContext(ctx).Debug("GetMultiChainUserItems - Item detail",
			zap.Int("index", i),
			zap.String("collection_address", item.CollectionAddress),
			zap.String("token_id", item.TokenID),
			zap.String("name", item.Name),
			zap.String("owner", item.Owner),
			zap.Int("chain_id", item.ChainID),
		)
	}

	// 如果没有 Item，直接返回空结果
	if count == 0 {
		xzap.WithContext(ctx).Warn("GetMultiChainUserItems - Count is 0, returning empty result")
		return &types.UserItemsResp{
			Result: items,
			Count:  count,
		}, nil
	}

	// 如果 count > 0 但 items 为空或 nil，这是异常情况
	if count > 0 && (items == nil || len(items) == 0) {
		xzap.WithContext(ctx).Error("GetMultiChainUserItems - CRITICAL: count > 0 but items is empty!",
			zap.Int64("count", count),
			zap.Bool("items_is_nil", items == nil),
			zap.Int("items_length", len(items)),
			zap.Any("query_params", map[string]interface{}{
				"chain":     chain,
				"userAddrs": userAddrs,
				"page":      page,
				"pageSize":  pageSize,
			}),
		)
		// 返回一个空的 result 但保留 count
		return &types.UserItemsResp{
			Result: []types.PortfolioItemInfo{},
			Count:  count,
		}, nil
	}

	// 2. 构建chainID到chain name的映射
	chainIDToChainName := make(map[int]string)
	for i, _ := range chainID {
		chainIDToChainName[chainID[i]] = chain[i]
	}

	// 3. 准备查询参数
	var collectionAddrs [][]string                          // Collection地址和链名称对
	var itemInfos []dao.MultiChainItemInfo                  // Item信息
	var chainCollections = make(map[string][]string)        // 按链分组的Collection地址
	var multichainItems = make(map[string][]types.ItemInfo) // 按链分组的Item信息

	// 遍历Item,构建查询参数
	for _, item := range items {
		collectionAddrs = append(collectionAddrs, []string{strings.ToLower(item.CollectionAddress), chainIDToChainName[item.ChainID]})
		itemInfos = append(itemInfos, dao.MultiChainItemInfo{
			ItemInfo: types.ItemInfo{
				CollectionAddress: item.CollectionAddress,
				TokenID:           item.TokenID,
			},
			ChainName: chainIDToChainName[item.ChainID],
		})
		chainCollections[strings.ToLower(chainIDToChainName[item.ChainID])] = append(chainCollections[strings.ToLower(chainIDToChainName[item.ChainID])], item.CollectionAddress)
		multichainItems[chainIDToChainName[item.ChainID]] = append(multichainItems[chainIDToChainName[item.ChainID]], types.ItemInfo{
			CollectionAddress: item.CollectionAddress,
			TokenID:           item.TokenID,
		})
	}

	// 4. 获取用户地址
	var userAddr string
	if len(userAddrs) == 0 {
		userAddr = ""
	} else {
		userAddr = userAddrs[0]
	}

	// 5. 并发查询Collection最高出价信息
	collectionBestBids := make(map[types.MultichainCollection]multi.Order)
	var wg sync.WaitGroup
	var mu sync.Mutex
	var queryErr error
	for chain, collections := range chainCollections {
		wg.Add(1)
		go func(chainName string, collectionArray []string) {
			defer wg.Done()
			bestBids, err := svcCtx.Dao.QueryCollectionsBestBid(ctx, chainName, userAddr, collectionArray)
			if err != nil {
				queryErr = errors.Wrap(err, "failed on query collections best bids")
				return
			}
			mu.Lock()
			defer mu.Unlock()
			for _, bestBid := range bestBids {
				collectionBestBids[types.MultichainCollection{
					CollectionAddress: strings.ToLower(bestBid.CollectionAddress),
					Chain:             chainName,
				}] = *bestBid
			}
		}(chain, collections)
	}
	wg.Wait()
	if queryErr != nil {
		return nil, errors.Wrap(err, "failed on query collection bids")
	}

	// 6. 并发查询Item最高出价信息
	itemsBestBids := make(map[dao.MultiChainItemInfo]multi.Order)
	for chain, items := range multichainItems {
		wg.Add(1)
		go func(chainName string, itemInfos []types.ItemInfo) {
			defer wg.Done()
			bids, err := svcCtx.Dao.QueryItemsBestBids(ctx, chainName, userAddr, itemInfos)
			if err != nil {
				queryErr = errors.Wrap(err, "failed on query items best bids")
				return
			}

			mu.Lock()
			defer mu.Unlock()
			for _, bid := range bids {
				order, ok := itemsBestBids[dao.MultiChainItemInfo{ItemInfo: types.ItemInfo{CollectionAddress: strings.ToLower(bid.CollectionAddress), TokenID: bid.TokenId}, ChainName: chainName}]
				if !ok {
					itemsBestBids[dao.MultiChainItemInfo{ItemInfo: types.ItemInfo{CollectionAddress: strings.ToLower(bid.CollectionAddress), TokenID: bid.TokenId}, ChainName: chainName}] = bid
					continue
				}
				if bid.Price.GreaterThan(order.Price) {
					itemsBestBids[dao.MultiChainItemInfo{ItemInfo: types.ItemInfo{CollectionAddress: strings.ToLower(bid.CollectionAddress), TokenID: bid.TokenId}, ChainName: chainName}] = bid
				}
			}
		}(chain, items)
	}
	wg.Wait()
	if queryErr != nil {
		return nil, errors.Wrap(err, "failed on query items best bids")
	}

	// 7. 查询Collection信息
	collections, err := svcCtx.Dao.QueryMultiChainCollectionsInfo(ctx, collectionAddrs)
	if err != nil {
		return nil, errors.Wrap(err, "failed on query collections info")
	}

	collectionInfos := make(map[string]multi.Collection)
	for _, collection := range collections {
		collectionInfos[strings.ToLower(collection.Address)] = collection
	}

	// 8. 查询Item挂单信息
	listings, err := svcCtx.Dao.QueryMultiChainUserItemsListInfo(ctx, userAddrs, itemInfos)
	if err != nil {
		return nil, errors.Wrap(err, "failed on query item list info")
	}

	listingInfos := make(map[string]*dao.CollectionItem)
	for _, listing := range listings {
		listingInfos[strings.ToLower(listing.CollectionAddress+listing.TokenId)] = listing
	}

	// 9. 获取挂单价格信息
	var itemPrice []dao.MultiChainItemPriceInfo
	for _, item := range listingInfos {
		if item.Listing {
			itemPrice = append(itemPrice, dao.MultiChainItemPriceInfo{
				ItemPriceInfo: types.ItemPriceInfo{
					CollectionAddress: item.CollectionAddress,
					TokenID:           item.TokenId,
					Maker:             item.Owner,
					Price:             item.ListPrice,
					OrderStatus:       multi.OrderStatusActive,
				},
				ChainName: chainIDToChainName[item.ChainId],
			})
		}
	}

	// 10. 查询挂单订单信息
	orderIds := make(map[string]multi.Order)
	if len(itemPrice) > 0 {
		orders, err := svcCtx.Dao.QueryMultiChainListingInfo(ctx, itemPrice)
		if err != nil {
			return nil, errors.Wrap(err, "failed on query item order id")
		}

		for _, order := range orders {
			orderIds[strings.ToLower(order.CollectionAddress+order.TokenId)] = order
		}
	}

	// 12. 组装最终结果
	for i := 0; i < len(items); i++ {
		// 设置出价信息
		bidOrder, ok := itemsBestBids[dao.MultiChainItemInfo{ItemInfo: types.ItemInfo{CollectionAddress: strings.ToLower(items[i].CollectionAddress), TokenID: items[i].TokenID}, ChainName: chainIDToChainName[items[i].ChainID]}]
		if ok {
			if bidOrder.Price.GreaterThan(collectionBestBids[types.MultichainCollection{
				CollectionAddress: strings.ToLower(items[i].CollectionAddress),
				Chain:             chainIDToChainName[items[i].ChainID],
			}].Price) {
				items[i].BidOrderID = bidOrder.OrderID
				items[i].BidExpireTime = bidOrder.ExpireTime
				items[i].BidPrice = bidOrder.Price
				items[i].BidTime = bidOrder.EventTime
				items[i].BidSalt = bidOrder.Salt
				items[i].BidMaker = bidOrder.Maker
				items[i].BidType = getBidType(bidOrder.OrderType)
				items[i].BidSize = bidOrder.Size
				items[i].BidUnfilled = bidOrder.QuantityRemaining
			}
		} else {
			if cBid, ok := collectionBestBids[types.MultichainCollection{
				CollectionAddress: strings.ToLower(items[i].CollectionAddress),
				Chain:             chainIDToChainName[items[i].ChainID],
			}]; ok {
				items[i].BidOrderID = cBid.OrderID
				items[i].BidExpireTime = cBid.ExpireTime
				items[i].BidPrice = cBid.Price
				items[i].BidTime = cBid.EventTime
				items[i].BidSalt = cBid.Salt
				items[i].BidMaker = cBid.Maker
				items[i].BidType = getBidType(cBid.OrderType)
				items[i].BidSize = cBid.Size
				items[i].BidUnfilled = cBid.QuantityRemaining
			}
		}

		// 设置Collection信息
		collection, ok := collectionInfos[strings.ToLower(items[i].CollectionAddress)]
		if ok {
			items[i].CollectionName = collection.Name
			items[i].FloorPrice = collection.FloorPrice
			items[i].CollectionImageURI = collection.ImageUri
			if items[i].Name == "" {
				items[i].Name = fmt.Sprintf("%s #%s", collection.Name, items[i].TokenID)
			}
		}

		// 设置挂单信息
		listing, ok := listingInfos[strings.ToLower(items[i].CollectionAddress+items[i].TokenID)]
		if ok {
			items[i].ListPrice = listing.ListPrice
			items[i].Listing = listing.Listing
			items[i].MarketplaceID = listing.MarketID
		}

		// 设置订单信息
		order, ok := orderIds[strings.ToLower(items[i].CollectionAddress+items[i].TokenID)]
		if ok {
			items[i].ListOrderID = order.OrderID
			items[i].ListTime = order.EventTime
			items[i].ListExpireTime = order.ExpireTime
			items[i].ListSalt = order.Salt
			items[i].ListMaker = order.Maker
		}

	}

	return &types.UserItemsResp{
		Result: items,
		Count:  count,
	}, nil
}

// GetMultiChainUserListings 获取用户在多条链上的挂单信息
func GetMultiChainUserListings(ctx context.Context, svcCtx *svc.ServerCtx, chainID []int, chain []string, userAddrs []string, contractAddrs []string, page, pageSize int) (*types.UserListingsResp, error) {
	var result []types.Listing

	// Debug: 打印请求参数
	xzap.WithContext(ctx).Info("GetMultiChainUserListings - Step 1: Received request",
		zap.Any("chainID", chainID),
		zap.Any("chain", chain),
		zap.Any("userAddrs", userAddrs),
		zap.Any("contractAddrs", contractAddrs),
		zap.Int("page", page),
		zap.Int("pageSize", pageSize),
	)

	// 1. 查询用户挂单 Item 基本信息
	xzap.WithContext(ctx).Debug("GetMultiChainUserListings - Step 2: Querying database for user listings...")
	items, count, err := svcCtx.Dao.QueryMultiChainUserListingItemInfos(ctx, chain, userAddrs, contractAddrs, page, pageSize)
	if err != nil {
		xzap.WithContext(ctx).Error("GetMultiChainUserListings - Step 2: Failed to query listings",
			zap.String("error", err.Error()),
			zap.Any("params", map[string]interface{}{
				"chain":         chain,
				"userAddrs":     userAddrs,
				"contractAddrs": contractAddrs,
			}),
		)
		return nil, errors.Wrap(err, "failed on get user items info")
	}

	// Debug: 打印查询结果
	xzap.WithContext(ctx).Info("GetMultiChainUserListings - Step 2: Database query completed",
		zap.Int64("total_count", count),
		zap.Int("items_returned", len(items)),
		zap.Bool("items_is_nil", items == nil),
	)

	// 打印每个 listing item 的详细信息
	if len(items) > 0 {
		xzap.WithContext(ctx).Debug("GetMultiChainUserListings - Step 2: Item details:")
		for i, item := range items {
			xzap.WithContext(ctx).Debug(fmt.Sprintf("  Item[%d]:", i),
				zap.String("collection", item.CollectionAddress),
				zap.String("token_id", item.TokenID),
				zap.String("name", item.Name),
				zap.String("image_url", item.ImageURL),
				zap.String("owner", item.Owner),
				zap.Int("chain_id", item.ChainID),
			)
		}
	}

	// 如果没有挂单，直接返回空结果
	if count == 0 {
		xzap.WithContext(ctx).Warn("GetMultiChainUserListings - Step 3: No listings found, returning empty result")
		return &types.UserListingsResp{
			Count: count,
		}, nil
	}

	// 如果 count > 0 但 items 为空或 nil，这是异常情况
	if count > 0 && (items == nil || len(items) == 0) {
		xzap.WithContext(ctx).Error("GetMultiChainUserListings - Step 3: CRITICAL - count > 0 but items is empty!",
			zap.Int64("count", count),
			zap.Bool("items_is_nil", items == nil),
			zap.Int("items_length", len(items)),
			zap.Any("query_params", map[string]interface{}{
				"chain":         chain,
				"userAddrs":     userAddrs,
				"contractAddrs": contractAddrs,
				"page":          page,
				"pageSize":      pageSize,
			}),
		)
		// 返回一个空的 result 但保留 count
		return &types.UserListingsResp{
			Result: []types.Listing{},
			Count:  count,
		}, nil
	}

	// 2. 构建 chainID 到 chain name 的映射
	xzap.WithContext(ctx).Debug("GetMultiChainUserListings - Step 4: Building chain ID to chain name mapping")
	chainIDToChainName := make(map[int]string)
	for i, _ := range chainID {
		chainIDToChainName[chainID[i]] = chain[i]
	}
	xzap.WithContext(ctx).Debug("GetMultiChainUserListings - Step 4: Chain mapping completed",
		zap.Any("chainIDToChainName", chainIDToChainName),
	)

	// 3. 获取用户地址
	xzap.WithContext(ctx).Debug("GetMultiChainUserListings - Step 5: Preparing query parameters")
	var userAddr string
	if len(userAddrs) == 0 {
		userAddr = ""
	} else {
		userAddr = userAddrs[0]
	}
	xzap.WithContext(ctx).Debug("GetMultiChainUserListings - Step 5: User address determined",
		zap.String("userAddr", userAddr),
	)

	// 4. 准备查询参数
	var collectionAddrs [][]string                          // Collection 地址和链名称对
	var itemInfos []dao.MultiChainItemInfo                  // Item 信息
	var chainCollections = make(map[string][]string)        // 按链分组的 Collection 地址
	var multichainItems = make(map[string][]types.ItemInfo) // 按链分组的 Item 信息

	// 遍历 Item，构建查询参数
	xzap.WithContext(ctx).Debug("GetMultiChainUserListings - Step 6: Building query parameters from items")
	for idx, item := range items {
		chainName := chainIDToChainName[item.ChainID]
		collectionAddrs = append(collectionAddrs, []string{strings.ToLower(item.CollectionAddress), chainName})
		itemInfos = append(itemInfos, dao.MultiChainItemInfo{
			ItemInfo: types.ItemInfo{
				CollectionAddress: item.CollectionAddress,
				TokenID:           item.TokenID,
			},
			ChainName: chainName,
		})

		chainCollections[strings.ToLower(chainName)] = append(chainCollections[strings.ToLower(chainName)], item.CollectionAddress)
		multichainItems[chainName] = append(multichainItems[chainName], types.ItemInfo{
			CollectionAddress: item.CollectionAddress,
			TokenID:           item.TokenID,
		})

		xzap.WithContext(ctx).Debug(fmt.Sprintf("GetMultiChainUserListings - Step 6: Processed item[%d]", idx),
			zap.String("chain", chainName),
			zap.String("collection", item.CollectionAddress),
			zap.String("token_id", item.TokenID),
		)
	}

	xzap.WithContext(ctx).Info("GetMultiChainUserListings - Step 6: Query parameters built",
		zap.Int("total_items", len(items)),
		zap.Int("unique_chains", len(chainCollections)),
		zap.Any("chain_summary", func() map[string]int {
			summary := make(map[string]int)
			for chainName, addrs := range chainCollections {
				summary[chainName] = len(addrs)
			}
			return summary
		}()),
	)

	// 5. 记录 Item 最近成本
	xzap.WithContext(ctx).Debug("GetMultiChainUserListings - Step 7: Initializing item last cost map")
	itemLastCost := make(map[dao.MultiChainItemInfo]decimal.Decimal)

	// 6. 并发查询 Collection 最高出价信息
	xzap.WithContext(ctx).Info("GetMultiChainUserListings - Step 8: Starting concurrent queries for collection best bids",
		zap.Int("total_chains", len(chainCollections)),
	)
	collectionBestBids := make(map[types.MultichainCollection]multi.Order)
	var wg sync.WaitGroup
	var mu sync.Mutex
	var queryErr error

	queryStart := time.Now()
	for chain, collections := range chainCollections {
		wg.Add(1)
		xzap.WithContext(ctx).Debug(fmt.Sprintf("GetMultiChainUserListings - Step 8: Launching goroutine for chain: %s", chain),
			zap.Int("collections_count", len(collections)),
		)
		go func(chainName string, collectionArray []string) {
			defer wg.Done()
			goroutineStart := time.Now()
			bestBids, err := svcCtx.Dao.QueryCollectionsBestBid(ctx, chainName, userAddr, collectionArray)
			duration := time.Since(goroutineStart)

			if err != nil {
				xzap.WithContext(ctx).Error("GetMultiChainUserListings - Step 8: Failed to query collection best bids",
					zap.String("chain", chainName),
					zap.Duration("duration", duration),
					zap.Error(err),
				)
				queryErr = errors.Wrap(err, "failed on query collections best bids")
				return
			}

			xzap.WithContext(ctx).Debug(fmt.Sprintf("GetMultiChainUserListings - Step 8: Collection bids queried for %s", chainName),
				zap.Int("bids_count", len(bestBids)),
				zap.Duration("duration", duration),
			)

			mu.Lock()
			defer mu.Unlock()
			for _, bestBid := range bestBids {
				collectionBestBids[types.MultichainCollection{
					CollectionAddress: strings.ToLower(bestBid.CollectionAddress),
					Chain:             chainName,
				}] = *bestBid
			}
		}(chain, collections)
	}

	xzap.WithContext(ctx).Debug("GetMultiChainUserListings - Step 8: Waiting for all collection bid queries to complete...")
	wg.Wait()
	totalDuration := time.Since(queryStart)
	xzap.WithContext(ctx).Info("GetMultiChainUserListings - Step 8: All collection bid queries completed",
		zap.Duration("total_duration", totalDuration),
		zap.Int("collections_queried", len(collectionBestBids)),
	)

	if queryErr != nil {
		xzap.WithContext(ctx).Error("GetMultiChainUserListings - Step 8: Query failed",
			zap.Error(queryErr),
		)
		return nil, errors.Wrap(queryErr, "failed on query collection bids")
	}

	// 7. 并发查询Item最高出价信息
	xzap.WithContext(ctx).Debug("QueryItemsBestBids start", zap.Int("multichainItems_count", len(multichainItems)))
	itemsBestBids := make(map[dao.MultiChainItemInfo]multi.Order)
	for chain, items := range multichainItems {
		wg.Add(1)
		go func(chainName string, itemInfos []types.ItemInfo) {
			defer wg.Done()
			xzap.WithContext(ctx).Debug("QueryItemsBestBids for chain", zap.String("chain", chainName), zap.Int("item_count", len(itemInfos)))
			bids, err := svcCtx.Dao.QueryItemsBestBids(ctx, chainName, userAddr, itemInfos)
			if err != nil {
				xzap.WithContext(ctx).Debug("QueryItemsBestBids error", zap.String("chain", chainName), zap.Error(err))
				queryErr = errors.Wrap(err, "failed on query items best bids")
				return
			}
			xzap.WithContext(ctx).Debug("QueryItemsBestBids success", zap.String("chain", chainName), zap.Int("bid_count", len(bids)))

			mu.Lock()
			defer mu.Unlock()
			for _, bid := range bids {
				order, ok := itemsBestBids[dao.MultiChainItemInfo{ItemInfo: types.ItemInfo{CollectionAddress: strings.ToLower(bid.CollectionAddress), TokenID: bid.TokenId}, ChainName: chainName}]
				if !ok {
					itemsBestBids[dao.MultiChainItemInfo{ItemInfo: types.ItemInfo{CollectionAddress: strings.ToLower(bid.CollectionAddress), TokenID: bid.TokenId}, ChainName: chainName}] = bid
					continue
				}
				if bid.Price.GreaterThan(order.Price) {
					itemsBestBids[dao.MultiChainItemInfo{ItemInfo: types.ItemInfo{CollectionAddress: strings.ToLower(bid.CollectionAddress), TokenID: bid.TokenId}, ChainName: chainName}] = bid
				}
			}
		}(chain, items)
	}
	wg.Wait()
	xzap.WithContext(ctx).Debug("QueryItemsBestBids completed", zap.Int("itemsBestBids_count", len(itemsBestBids)))
	if queryErr != nil {
		return nil, errors.Wrap(err, "failed on query items best bids")
	}

	// 8. 查询Collection基本信息
	xzap.WithContext(ctx).Debug("QueryMultiChainCollectionsInfo start", zap.Int("collectionAddrs_count", len(collectionAddrs)))
	collections, err := svcCtx.Dao.QueryMultiChainCollectionsInfo(ctx, collectionAddrs)
	if err != nil {
		xzap.WithContext(ctx).Debug("QueryMultiChainCollectionsInfo error", zap.Error(err))
		return nil, errors.Wrap(err, "failed on query collections info")
	}
	xzap.WithContext(ctx).Debug("QueryMultiChainCollectionsInfo success", zap.Int("collections_count", len(collections)))

	collectionInfos := make(map[string]multi.Collection)
	for _, collection := range collections {
		collectionInfos[strings.ToLower(collection.Address)] = collection
	}

	// 9. 查询用户Item挂单信息
	xzap.WithContext(ctx).Debug("QueryMultiChainUserItemsExpireListInfo start", zap.Int("userAddrs_count", len(userAddrs)), zap.Int("itemInfos_count", len(itemInfos)))
	listings, err := svcCtx.Dao.QueryMultiChainUserItemsExpireListInfo(ctx, userAddrs, itemInfos)
	if err != nil {
		xzap.WithContext(ctx).Debug("QueryMultiChainUserItemsExpireListInfo error", zap.Error(err))
		return nil, errors.Wrap(err, "failed on query item list info")
	}
	xzap.WithContext(ctx).Debug("QueryMultiChainUserItemsExpireListInfo success", zap.Int("listings_count", len(listings)))

	listingInfos := make(map[string]*dao.CollectionItem)
	for _, listing := range listings {
		listingInfos[strings.ToLower(listing.CollectionAddress+listing.TokenId)] = listing
	}

	// 10. 查询挂单订单信息
	xzap.WithContext(ctx).Debug("Build itemPrice for listing orders", zap.Int("listingInfos_count", len(listingInfos)))
	var itemPrice []dao.MultiChainItemPriceInfo
	for _, item := range listingInfos {
		if item.Listing {
			itemPrice = append(itemPrice, dao.MultiChainItemPriceInfo{
				ItemPriceInfo: types.ItemPriceInfo{
					CollectionAddress: item.CollectionAddress,
					TokenID:           item.TokenId,
					Maker:             item.Owner,
					Price:             item.ListPrice,
					OrderStatus:       item.OrderStatus,
				},
				ChainName: chainIDToChainName[item.ChainId],
			})
		}
	}
	xzap.WithContext(ctx).Debug("itemPrice built", zap.Int("itemPrice_count", len(itemPrice)))

	orderIds := make(map[string]multi.Order)
	if len(itemPrice) > 0 {
		xzap.WithContext(ctx).Debug("QueryMultiChainListingInfo start", zap.Int("itemPrice_count", len(itemPrice)))
		orders, err := svcCtx.Dao.QueryMultiChainListingInfo(ctx, itemPrice)
		if err != nil {
			xzap.WithContext(ctx).Debug("QueryMultiChainListingInfo error", zap.Error(err))
			return nil, errors.Wrap(err, "failed on query item order id")
		}
		xzap.WithContext(ctx).Debug("QueryMultiChainListingInfo success", zap.Int("orders_count", len(orders)))

		for _, order := range orders {
			orderIds[strings.ToLower(order.CollectionAddress+order.TokenId)] = order
		}
	} else {
		xzap.WithContext(ctx).Debug("Skip QueryMultiChainListingInfo, itemPrice is empty")
	}

	// 12. 组装最终结果
	xzap.WithContext(ctx).Debug("Start assembling final result", zap.Int("items_count", len(items)), zap.Int("listingInfos_count", len(listingInfos)), zap.Int("collectionInfos_count", len(collectionInfos)), zap.Int("orderIds_count", len(orderIds)), zap.Int("itemsBestBids_count", len(itemsBestBids)))
	for i := 0; i < len(items); i++ {
		var resultlisting types.Listing
		listing, ok := listingInfos[strings.ToLower(items[i].CollectionAddress+items[i].TokenID)]
		if ok {
			resultlisting.ListPrice = listing.ListPrice
			resultlisting.MarketplaceID = listing.MarketID
			xzap.WithContext(ctx).Debug("Found listing for item", zap.String("collection", items[i].CollectionAddress), zap.String("token_id", items[i].TokenID))
		} else {
			xzap.WithContext(ctx).Debug("No listing found for item, skipping", zap.String("collection", items[i].CollectionAddress), zap.String("token_id", items[i].TokenID))
			count--
			continue
		}

		resultlisting.ChainID = items[i].ChainID
		resultlisting.ImageURL = items[i].ImageURL
		resultlisting.CollectionAddress = items[i].CollectionAddress
		resultlisting.TokenID = items[i].TokenID
		resultlisting.LastCostPrice = itemLastCost[dao.MultiChainItemInfo{
			ItemInfo: types.ItemInfo{
				CollectionAddress: items[i].CollectionAddress,
				TokenID:           items[i].TokenID,
			},
			ChainName: chainIDToChainName[items[i].ChainID],
		}]

		// 设置出价信息 - 优先使用Item出价,如果没有则使用Collection出价
		bidOrder, ok := itemsBestBids[dao.MultiChainItemInfo{ItemInfo: types.ItemInfo{CollectionAddress: strings.ToLower(items[i].CollectionAddress), TokenID: items[i].TokenID}, ChainName: chainIDToChainName[items[i].ChainID]}]
		if ok {
			xzap.WithContext(ctx).Debug("Found item best bid", zap.String("collection", items[i].CollectionAddress), zap.String("token_id", items[i].TokenID), zap.String("bid_price", bidOrder.Price.String()))
			if bidOrder.Price.GreaterThan(collectionBestBids[types.MultichainCollection{
				CollectionAddress: strings.ToLower(items[i].CollectionAddress),
				Chain:             chainIDToChainName[items[i].ChainID],
			}].Price) {
				resultlisting.BidOrderID = bidOrder.OrderID
				resultlisting.BidExpireTime = bidOrder.ExpireTime
				resultlisting.BidPrice = bidOrder.Price
				resultlisting.BidTime = bidOrder.EventTime
				resultlisting.BidSalt = bidOrder.Salt
				resultlisting.BidMaker = bidOrder.Maker
				resultlisting.BidType = getBidType(bidOrder.OrderType)
				resultlisting.BidSize = bidOrder.Size
				resultlisting.BidUnfilled = bidOrder.QuantityRemaining
			}
		} else {
			bidOrder, ok := collectionBestBids[types.MultichainCollection{
				CollectionAddress: strings.ToLower(items[i].CollectionAddress),
				Chain:             chainIDToChainName[items[i].ChainID],
			}]

			if ok {
				xzap.WithContext(ctx).Debug("Using collection best bid", zap.String("collection", items[i].CollectionAddress), zap.String("token_id", items[i].TokenID), zap.String("bid_price", bidOrder.Price.String()))
				resultlisting.BidOrderID = bidOrder.OrderID
				resultlisting.BidExpireTime = bidOrder.ExpireTime
				resultlisting.BidPrice = bidOrder.Price
				resultlisting.BidTime = bidOrder.EventTime
				resultlisting.BidSalt = bidOrder.Salt
				resultlisting.BidMaker = bidOrder.Maker
				resultlisting.BidType = getBidType(bidOrder.OrderType)
				resultlisting.BidSize = bidOrder.Size
				resultlisting.BidUnfilled = bidOrder.QuantityRemaining
			} else {
				xzap.WithContext(ctx).Debug("No bid found for item", zap.String("collection", items[i].CollectionAddress), zap.String("token_id", items[i].TokenID))
			}
		}

		// 设置Collection信息
		collection, ok := collectionInfos[strings.ToLower(items[i].CollectionAddress)]
		if ok {
			resultlisting.CollectionName = collection.Name
			if resultlisting.Name == "" {
				resultlisting.Name = fmt.Sprintf("%s #%s", collection.Name, items[i].TokenID)
			}
			resultlisting.FloorPrice = collection.FloorPrice
			xzap.WithContext(ctx).Debug("Collection info found", zap.String("collection", items[i].CollectionAddress), zap.String("name", collection.Name))
		} else {
			xzap.WithContext(ctx).Debug("Collection info not found", zap.String("collection", items[i].CollectionAddress))
		}

		// 设置订单信息
		order, ok := orderIds[strings.ToLower(items[i].CollectionAddress+items[i].TokenID)]
		if ok {
			resultlisting.ListOrderID = order.OrderID
			resultlisting.ListExpireTime = order.ExpireTime
			resultlisting.ListMaker = order.Maker
			resultlisting.ListSalt = order.Salt
			xzap.WithContext(ctx).Debug("Order info found", zap.String("collection", items[i].CollectionAddress), zap.String("token_id", items[i].TokenID), zap.String("order_id", order.OrderID))
		} else {
			xzap.WithContext(ctx).Debug("Order info not found", zap.String("collection", items[i].CollectionAddress), zap.String("token_id", items[i].TokenID))
		}

		// 设置图片信息

		result = append(result, resultlisting)
		xzap.WithContext(ctx).Debug("Result item appended", zap.String("collection", items[i].CollectionAddress), zap.String("token_id", items[i].TokenID))
	}

	xzap.WithContext(ctx).Debug("Final result assembled", zap.Int("result_count", len(result)), zap.Int("count", int(count)))
	return &types.UserListingsResp{
		Count:  count,
		Result: result,
	}, nil
}

type multiOrder struct {
	multi.Order
	chainID   int
	chainName string
}

// GetMultiChainUserBids 获取用户在多条链上的出价信息
// 参数:
// - ctx: 上下文
// - svcCtx: 服务上下文
// - chainID: 链ID列表
// - chainNames: 链名称列表
// - userAddrs: 用户地址列表
// - contractAddrs: 合约地址列表
// - page: 页码
// - pageSize: 每页大小
// 返回:
// - *types.UserBidsResp: 用户出价信息响应
// - error: 错误信息
func GetMultiChainUserBids(ctx context.Context, svcCtx *svc.ServerCtx, chainID []int, chainNames []string, userAddrs []string, contractAddrs []string, page, pageSize int) (*types.UserBidsResp, error) {
	// 1. 遍历每条链,查询用户出价信息
	var totalBids []multiOrder
	for i, chain := range chainNames {
		orders, err := svcCtx.Dao.QueryUserBids(ctx, chain, userAddrs, contractAddrs)
		if err != nil {
			return nil, errors.Wrap(err, "failed on get user bids info")
		}

		// 将每条链的出价信息添加到总出价列表中
		var tmpBids []multiOrder
		for j := 0; j < len(orders); j++ {
			tmpBids = append(tmpBids, multiOrder{
				Order:     orders[j],
				chainID:   chainID[i],
				chainName: chain,
			})
		}
		totalBids = append(totalBids, tmpBids...)
	}

	// 2. 构建出价信息映射和Collection地址映射
	bidsMap := make(map[string]types.UserBid)
	bidCollections := make(map[string][]string)
	for _, bid := range totalBids {
		// 按链名称分组Collection地址
		if collections, ok := bidCollections[bid.chainName]; ok {
			bidCollections[bid.chainName] = append(collections, strings.ToLower(bid.CollectionAddress))
		} else {
			bidCollections[bid.chainName] = []string{strings.ToLower(bid.CollectionAddress)}
		}

		// 构建唯一key,用于合并相同Collection的出价信息
		key := strings.ToLower(bid.CollectionAddress) + bid.TokenId + bid.Price.String() + fmt.Sprintf("%d", bid.MarketplaceId) + fmt.Sprintf("%d", bid.ExpireTime) + fmt.Sprintf("%d", bid.OrderType)
		userBid, ok := bidsMap[key]
		if !ok {
			// 如果key不存在,创建新的出价信息
			bidsMap[key] = types.UserBid{
				ChainID:           bid.chainID,
				CollectionAddress: strings.ToLower(bid.CollectionAddress),
				TokenID:           bid.TokenId,
				BidPrice:          bid.Price,
				MarketplaceID:     bid.MarketplaceId,
				ExpireTime:        bid.ExpireTime,
				BidType:           getBidType(bid.OrderType),
				OrderSize:         bid.QuantityRemaining,
				BidInfos: []types.BidInfo{
					{
						BidOrderID:    bid.OrderID,
						BidTime:       bid.EventTime,
						BidExpireTime: bid.ExpireTime,
						BidPrice:      bid.Price,
						BidSalt:       bid.Salt,
						BidSize:       bid.Size,
						BidUnfilled:   bid.QuantityRemaining,
					},
				},
			}
			continue
		}

		// 如果key存在,更新出价信息
		userBid.OrderSize += bid.QuantityRemaining
		userBid.BidInfos = append(userBid.BidInfos, types.BidInfo{
			BidOrderID:    bid.OrderID,
			BidTime:       bid.EventTime,
			BidExpireTime: bid.ExpireTime,
			BidPrice:      bid.Price,
			BidSalt:       bid.Salt,
			BidSize:       bid.Size,
			BidUnfilled:   bid.QuantityRemaining,
		})
		bidsMap[key] = userBid
	}

	// 3. 查询 Collection 基本信息
	collectionInfos := make(map[string]multi.Collection)
	for chain, collections := range bidCollections {
		cs, err := svcCtx.Dao.QueryCollectionsInfo(ctx, chain, removeRepeatedElement(collections))
		if err != nil {
			return nil, errors.Wrap(err, "failed on get collections info")
		}

		for _, c := range cs {
			collectionInfos[fmt.Sprintf("%d:%s", c.ChainId, strings.ToLower(c.Address))] = c
		}
	}

	// 4. 查询 NFT Item 的 image_url
	itemImageURLs := make(map[string]string)
	for _, userBid := range bidsMap {
		key := fmt.Sprintf("%s:%s", strings.ToLower(userBid.CollectionAddress), userBid.TokenID)
		if _, ok := itemImageURLs[key]; !ok {
			itemInfos := []dao.MultiChainItemInfo{
				{ItemInfo: types.ItemInfo{CollectionAddress: userBid.CollectionAddress, TokenID: userBid.TokenID}},
			}
			// 找到对应的链名称
			var chainName string
			for cn, _ := range bidCollections {
				chainName = cn
				break
			}
			if chainName != "" {
				urls, err := svcCtx.Dao.QueryItemImageURLs(ctx, chainName, itemInfos)
				if err == nil && len(urls) > 0 {
					for k, v := range urls {
						itemImageURLs[k] = v
					}
				}
			}
		}
	}

	// 5. 组装最终结果
	var results []types.UserBid
	for _, userBid := range bidsMap {
		// 设置 Collection 名称和图片信息
		if c, ok := collectionInfos[fmt.Sprintf("%d:%s", userBid.ChainID, strings.ToLower(userBid.CollectionAddress))]; ok {
			userBid.CollectionName = c.Name
			userBid.ImageURL = c.ImageURL
		}

		// 优先使用 Item 级别的 image_url
		itemKey := fmt.Sprintf("%s:%s", strings.ToLower(userBid.CollectionAddress), userBid.TokenID)
		if itemURL, ok := itemImageURLs[itemKey]; ok && itemURL != "" {
			userBid.ImageURL = itemURL
		}

		results = append(results, userBid)
	}

	// 5. 按过期时间降序排序
	sort.SliceStable(results, func(i, j int) bool {
		return results[i].ExpireTime > (results[j].ExpireTime)
	})

	return &types.UserBidsResp{
		Count:  len(bidsMap),
		Result: results,
	}, nil
}

func removeRepeatedElement(arr []string) (newArr []string) {
	newArr = make([]string, 0)
	for i := 0; i < len(arr); i++ {
		repeat := false
		for j := i + 1; j < len(arr); j++ {
			if arr[i] == arr[j] {
				repeat = true
				break
			}
		}
		if !repeat && arr[i] != "" {
			newArr = append(newArr, arr[i])
		}
	}
	return
}

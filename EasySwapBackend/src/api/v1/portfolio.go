package v1

import (
	"encoding/json"
	"fmt"

	"github.com/ProjectsTask/EasySwapBase/errcode"
	"github.com/ProjectsTask/EasySwapBase/logger/xzap"
	"github.com/ProjectsTask/EasySwapBase/xhttp"
	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
	"go.uber.org/zap"

	"github.com/ProjectsTask/EasySwapBackend/src/service/svc"
	"github.com/ProjectsTask/EasySwapBackend/src/service/v1"
	"github.com/ProjectsTask/EasySwapBackend/src/types/v1"
)

func UserMultiChainCollectionsHandler(svcCtx *svc.ServerCtx) gin.HandlerFunc {
	return func(c *gin.Context) {
		filterParam := c.Query("filters")
		if filterParam == "" {
			xhttp.Error(c, errcode.NewCustomErr("Filter param is nil."))
			return
		}

		var filter types.UserCollectionsParams
		err := json.Unmarshal([]byte(filterParam), &filter)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("Filter param is nil."))
			return
		}

		var chainNames []string
		var chainIDs []int
		for _, chain := range svcCtx.C.ChainSupported {
			chainIDs = append(chainIDs, chain.ChainID)
			chainNames = append(chainNames, chain.Name)
		}

		res, err := service.GetMultiChainUserCollections(c.Request.Context(), svcCtx, chainIDs, chainNames, filter.UserAddresses)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("query user multi chain collections err."))
			return
		}

		xhttp.OkJson(c, res)
	}
}

func UserMultiChainItemsHandler(svcCtx *svc.ServerCtx) gin.HandlerFunc {
	return func(c *gin.Context) {
		filterParam := c.Query("filters")
		if filterParam == "" {
			xhttp.Error(c, errcode.NewCustomErr("Filter param is nil."))
			return
		}

		var filter types.PortfolioMultiChainItemFilterParams
		err := json.Unmarshal([]byte(filterParam), &filter)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("Filter param is nil."))
			return
		}

		// if filter.ChainID is empty, show all chain info
		if len(filter.ChainID) == 0 {
			for _, chain := range svcCtx.C.ChainSupported {
				filter.ChainID = append(filter.ChainID, chain.ChainID)
			}
		}

		var chainNames []string
		for _, chainID := range filter.ChainID {
			chain, ok := chainIDToChain[chainID]
			if !ok {
				xhttp.Error(c, errcode.ErrInvalidParams)
				return
			}
			chainNames = append(chainNames, chain)
		}

		// 添加调试日志
		fmt.Printf("DEBUG: Query items - chainIDs: %v, chainNames: %v, userAddrs: %v, contractAddrs: %v, page: %d, pageSize: %d\n",
			filter.ChainID, chainNames, filter.UserAddresses, filter.CollectionAddresses, filter.Page, filter.PageSize)

		res, err := service.GetMultiChainUserItems(c.Request.Context(), svcCtx, filter.ChainID, chainNames, filter.UserAddresses, filter.CollectionAddresses, filter.Page, filter.PageSize)
		if err != nil {
			fmt.Printf("ERROR: Query user items failed: %v\n", err)
			xhttp.Error(c, errcode.NewCustomErr(fmt.Sprintf("query user multi chain items err: %v", err)))
			return
		}

		xhttp.OkJson(c, res)
	}
}

func UserMultiChainListingsHandler(svcCtx *svc.ServerCtx) gin.HandlerFunc {
	return func(c *gin.Context) {
		filterParam := c.Query("filters")
		if filterParam == "" {
			xhttp.Error(c, errcode.NewCustomErr("Filter param is nil."))
			return
		}

		var filter types.PortfolioMultiChainListingFilterParams
		err := json.Unmarshal([]byte(filterParam), &filter)
		if err != nil {
			xzap.WithContext(c.Request.Context()).Error("UserMultiChainListingsHandler - Failed to parse filter",
				zap.Error(err),
				zap.String("filter_param", filterParam),
			)
			xhttp.Error(c, errcode.NewCustomErr("Filter param is nil."))
			return
		}

		// Debug: 打印解析后的过滤参数
		xzap.WithContext(c.Request.Context()).Debug("UserMultiChainListingsHandler - Parsed filter params",
			zap.Any("filter", filter),
		)

		// if filter.ChainID is empty, show all chain info
		if len(filter.ChainID) == 0 {
			for _, chain := range svcCtx.C.ChainSupported {
				filter.ChainID = append(filter.ChainID, chain.ChainID)
			}
		}

		var chainNames []string
		for _, chainID := range filter.ChainID {
			chain, ok := chainIDToChain[chainID]
			if !ok {
				xzap.WithContext(c.Request.Context()).Error("UserMultiChainListingsHandler - Invalid chain ID",
					zap.Int("chain_id", chainID),
				)
				xhttp.Error(c, errcode.ErrInvalidParams)
				return
			}
			chainNames = append(chainNames, chain)
		}

		xzap.WithContext(c.Request.Context()).Debug("UserMultiChainListingsHandler - Calling GetMultiChainUserListings service",
			zap.Any("chainIDs", filter.ChainID),
			zap.Any("chainNames", chainNames),
			zap.Any("userAddresses", filter.UserAddresses),
			zap.Any("collectionAddresses", filter.CollectionAddresses),
			zap.Int("page", filter.Page),
			zap.Int("pageSize", filter.PageSize),
		)

		res, err := service.GetMultiChainUserListings(c.Request.Context(), svcCtx, filter.ChainID, chainNames, filter.UserAddresses, filter.CollectionAddresses, filter.Page, filter.PageSize)
		if err != nil {
			xzap.WithContext(c.Request.Context()).Error("UserMultiChainListingsHandler - Service call failed",
				zap.Error(err),
				zap.Any("response", res),
			)
			xhttp.Error(c, errcode.NewCustomErr("query user multi chain items err."))
			return
		}

		// Debug: 打印返回结果
		xzap.WithContext(c.Request.Context()).Debug("UserMultiChainListingsHandler - Service response",
			zap.Any("result_nil", res.Result == nil),
			zap.Int("result_length", func() int {
				if res.Result == nil {
					return 0
				}
				return len(res.Result)
			}()),
			zap.Int64("count", res.Count),
		)

		xhttp.OkJson(c, res)
	}
}

func UserMultiChainBidsHandler(svcCtx *svc.ServerCtx) gin.HandlerFunc {
	return func(c *gin.Context) {
		filterParam := c.Query("filters")
		if filterParam == "" {
			xhttp.Error(c, errcode.NewCustomErr("Filter param is nil."))
			return
		}

		var filter types.PortfolioMultiChainBidFilterParams
		err := json.Unmarshal([]byte(filterParam), &filter)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("Filter param is nil."))
			return
		}

		// if filter.ChainID is empty, show all chain info
		if len(filter.ChainID) == 0 {
			for _, chain := range svcCtx.C.ChainSupported {
				filter.ChainID = append(filter.ChainID, chain.ChainID)
			}
		}

		var chainNames []string
		for _, chainID := range filter.ChainID {
			chain, ok := chainIDToChain[chainID]
			if !ok {
				xhttp.Error(c, errcode.ErrInvalidParams)
				return
			}
			chainNames = append(chainNames, chain)
		}

		res, err := service.GetMultiChainUserBids(c.Request.Context(), svcCtx, filter.ChainID, chainNames, filter.UserAddresses, filter.CollectionAddresses, filter.Page, filter.PageSize)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("query user multi chain items err."))
			return
		}

		xhttp.OkJson(c, res)
	}
}

// PortfolioOverviewHandler 获取用户投资组合概览
func PortfolioOverviewHandler(svcCtx *svc.ServerCtx) gin.HandlerFunc {
	return func(c *gin.Context) {
		userAddress := c.Param("address")
		if userAddress == "" {
			xhttp.Error(c, errcode.ErrInvalidParams)
			return
		}

		// 1. 获取用户 Collections
		var chainNames []string
		var chainIDs []int
		for _, chain := range svcCtx.C.ChainSupported {
			chainIDs = append(chainIDs, chain.ChainID)
			chainNames = append(chainNames, chain.Name)
		}

		collectionsResp, err := service.GetMultiChainUserCollections(c.Request.Context(), svcCtx, chainIDs, chainNames, []string{userAddress})
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("failed to get collections"))
			return
		}

		// 2. 获取用户 Items 总数
		itemsResp, err := service.GetMultiChainUserItems(c.Request.Context(), svcCtx, chainIDs, chainNames, []string{userAddress}, nil, 1, 1)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("failed to get items"))
			return
		}

		// 3. 获取用户 Listings 数量
		listingsResp, err := service.GetMultiChainUserListings(c.Request.Context(), svcCtx, chainIDs, chainNames, []string{userAddress}, nil, 1, 1)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("failed to get listings"))
			return
		}

		// 4. 获取用户 Bids 数量
		bidsResp, err := service.GetMultiChainUserBids(c.Request.Context(), svcCtx, chainIDs, chainNames, []string{userAddress}, nil, 1, 1)
		if err != nil {
			xhttp.Error(c, errcode.NewCustomErr("failed to get bids"))
			return
		}

		// 5. 组装概览数据
		var overview types.PortfolioOverview

		// 从 Items 响应中获取总数
		if itemsResp != nil && itemsResp.Count > 0 {
			overview.TotalItems = itemsResp.Count
		}

		// 计算总价值和地板价
		totalValue := decimal.Zero
		floorPriceSum := decimal.Zero
		collectionCount := 0

		if collectionsResp != nil {
			if data, ok := collectionsResp.Result.(types.UserCollectionsData); ok {
				collectionCount = len(data.CollectionInfos)
				for _, collection := range data.CollectionInfos {
					totalValue = totalValue.Add(collection.FloorPrice.Mul(decimal.New(collection.ItemAmount, 0)))
					if !collection.FloorPrice.IsZero() {
						floorPriceSum = floorPriceSum.Add(collection.FloorPrice)
					}
				}
			}
		}

		overview.TotalValue = totalValue
		overview.Collections = collectionCount

		// 计算平均地板价
		if collectionCount > 0 {
			overview.FloorPrice = floorPriceSum.Div(decimal.New(int64(collectionCount), 0))
		}

		// 从 Listings 和 Bids 响应中获取数量
		if listingsResp != nil {
			overview.ListedCount = int(listingsResp.Count)
		}
		if bidsResp != nil {
			overview.BidsCount = int(bidsResp.Count)
		}

		// TODO: 计算损益（需要历史成本数据）
		overview.ProfitLoss = decimal.Zero
		overview.ProfitLossPct = decimal.Zero

		xhttp.OkJson(c, types.PortfolioOverviewResp{
			Result: overview,
		})
	}
}

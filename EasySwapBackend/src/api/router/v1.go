package router

import (
	"github.com/gin-gonic/gin"

	"github.com/ProjectsTask/EasySwapBackend/src/api/middleware"
	v1 "github.com/ProjectsTask/EasySwapBackend/src/api/v1"
	"github.com/ProjectsTask/EasySwapBackend/src/service/svc"
)

func loadV1(r *gin.Engine, svcCtx *svc.ServerCtx) {
	apiV1 := r.Group("/api/v1")

	user := apiV1.Group("/user")
	{
		user.GET("/:address/login-message", v1.GetLoginMessageHandler(svcCtx)) // 生成login签名信息
		user.POST("/login", v1.UserLoginHandler(svcCtx))                       // 登陆
		user.GET("/:address/sig-status", v1.GetSigStatusHandler(svcCtx))       // 获取用户签名状态
	}

	collections := apiV1.Group("/collections")
	{
		// 接口定义： 路由 + 中间件 + 处理函数
		collections.GET("/:address", v1.CollectionDetailHandler(svcCtx))                  // 指定Collection详情
		collections.GET("/:address/bids", v1.CollectionBidsHandler(svcCtx))               // 指定Collection的bids信息
		collections.GET("/:address/:token_id/bids", v1.CollectionItemBidsHandler(svcCtx)) // 指定Item的bid信息
		collections.GET("/:address/items", v1.CollectionItemsHandler(svcCtx))             // 指定Collection的items信息

		collections.GET("/:address/:token_id", v1.ItemDetailHandler(svcCtx))                                                  // 获取NFT Item的详细信息
		collections.GET("/:address/:token_id/traits", v1.ItemTraitsHandler(svcCtx))                                           //获取NFT Item的Attribute信息
		collections.GET("/:address/top-trait", v1.ItemTopTraitPriceHandler(svcCtx))                                           //获取NFT Item的Trait的最高价格信息
		collections.GET("/:address/:token_id/image", middleware.CacheApi(svcCtx.KvStore, 60), v1.GetItemImageHandler(svcCtx)) // 获取NFT Item的图片信息
		collections.GET("/:address/history-sales", v1.HistorySalesHandler(svcCtx))                                            // NFT销售历史价格信息
		collections.GET("/:address/:token_id/owner", v1.ItemOwnerHandler(svcCtx))                                             // 获取NFT Item的owner信息
		collections.POST("/:address/:token_id/metadata", v1.ItemMetadataRefreshHandler(svcCtx))                               // 刷新NFT Item的metadata

		collections.GET("/ranking", middleware.CacheApi(svcCtx.KvStore, 60), v1.TopRankingHandler(svcCtx)) // 获取NFT集合排名信息
	}

	activities := apiV1.Group("/activities")
	{
		activities.GET("", v1.ActivityMultiChainHandler(svcCtx)) // 批量获取 activity 信息
	}

	analytics := apiV1.Group("/analytics")
	{
		analytics.GET("", v1.GetAnalyticsHandler(svcCtx))                 // 获取市场分析数据
		analytics.GET("/stats", v1.GetAnalyticsHandler(svcCtx))           // 获取统计数据
		analytics.GET("/top-collections", v1.GetAnalyticsHandler(svcCtx)) // 获取顶级集合
	}

	artists := apiV1.Group("/artists")
	{
		artists.GET("", v1.GetArtistsHandler(svcCtx))          // 获取艺术家列表
		artists.GET("/ranking", v1.GetArtistsHandler(svcCtx))  // 获取艺术家排名
		artists.GET("/:address", v1.GetArtistsHandler(svcCtx)) // 获取指定艺术家详情
	}

	auctions := apiV1.Group("/auctions")
	{
		auctions.GET("", v1.GetAuctionsHandler(svcCtx))             // 获取拍卖列表
		auctions.GET("/active", v1.GetAuctionsHandler(svcCtx))      // 获取进行中的拍卖
		auctions.GET("/ending-soon", v1.GetAuctionsHandler(svcCtx)) // 获取即将结束的拍卖
	}

	drops := apiV1.Group("/drops")
	{
		drops.GET("", v1.GetDropsHandler(svcCtx))          // 获取新品发布列表
		drops.GET("/live", v1.GetDropsHandler(svcCtx))     // 获取正在进行的 drops
		drops.GET("/upcoming", v1.GetDropsHandler(svcCtx)) // 获取即将开始的 drops
	}

	favorites := apiV1.Group("/favorites")
	{
		// favorites 需要用户认证，后续添加 auth 中间件
		favorites.GET("/items", v1.UserMultiChainItemsHandler(svcCtx))             // 获取用户收藏的 items
		favorites.GET("/collections", v1.UserMultiChainCollectionsHandler(svcCtx)) // 获取用户收藏的 collections
	}

	portfolio := apiV1.Group("/portfolio")
	{
		portfolio.GET("/collections", v1.UserMultiChainCollectionsHandler(svcCtx)) // 获取用户拥有的 collections
		portfolio.GET("/items", v1.UserMultiChainItemsHandler(svcCtx))             // 获取用户拥有的 items
		portfolio.GET("/listings", v1.UserMultiChainListingsHandler(svcCtx))       // 获取用户的 listings
		portfolio.GET("/bids", v1.UserMultiChainBidsHandler(svcCtx))               // 获取用户的 bids
		portfolio.GET("/:address/overview", v1.PortfolioOverviewHandler(svcCtx))   // 获取用户投资组合概览
	}

	orders := apiV1.Group("/bid-orders")
	{
		orders.GET("", v1.OrderInfosHandler(svcCtx)) // 批量查询出价信息
	}

	// 订单相关 API
	order := apiV1.Group("/order")
	{
		order.GET("/listings", v1.ListingsHandler(svcCtx)) // 获取挂单列表
		order.GET("/bids", v1.BidsHandler(svcCtx))         // 获取出价列表
	}
}

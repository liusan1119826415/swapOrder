package dao

import (
	"context"
	"time"

	"github.com/ProjectsTask/EasySwapBase/logger/xzap"
	"github.com/ProjectsTask/EasySwapBase/stores/gdb/orderbookmodel/multi"
	"github.com/pkg/errors"
	"go.uber.org/zap"

	"github.com/ProjectsTask/EasySwapBackend/src/types/v1"
)

// QueryListings 查询挂单列表
// 参数说明:
// - chain: 链名称
// - filter: 过滤条件
// 返回值:
// - []types.OrderListingInfo: 挂单列表
// - int64: 总数
// - error: 错误信息
func (d *Dao) QueryListings(ctx context.Context, chain string, filter types.ListingsRequest) ([]types.OrderListingInfo, int64, error) {
	var count int64
	var listings []types.OrderListingInfo

	// 构建基础查询
	db := d.DB.WithContext(ctx).Table(multi.OrderTableName(chain)).
		Where("order_type = ? AND order_status = ?", multi.ListingOrder, multi.OrderStatusActive)

	// Debug: 打印初始 SQL
	xzap.WithContext(ctx).Debug("QueryListings - Initial query",
		zap.String("chain", chain),
		zap.String("table", multi.OrderTableName(chain)),
		zap.Int("order_type", multi.ListingOrder),
		zap.Int("order_status", multi.OrderStatusActive),
	)

	// 添加过滤条件
	if filter.CollectionAddr != "" {
		db = db.Where("collection_address = ?", filter.CollectionAddr)
		xzap.WithContext(ctx).Debug("QueryListings - Adding collection filter",
			zap.String("collection_addr", filter.CollectionAddr),
		)
	}
	if filter.TokenID != "" {
		db = db.Where("token_id = ?", filter.TokenID)
		xzap.WithContext(ctx).Debug("QueryListings - Adding token_id filter",
			zap.String("token_id", filter.TokenID),
		)
	}
	if filter.UserAddress != "" {
		db = db.Where("maker = ?", filter.UserAddress)
		xzap.WithContext(ctx).Debug("QueryListings - Adding user_address filter",
			zap.String("user_address", filter.UserAddress),
		)
	}

	// 价格范围过滤
	if filter.MinPrice != "" {
		db = db.Where("price >= ?", filter.MinPrice)
		xzap.WithContext(ctx).Debug("QueryListings - Adding min_price filter",
			zap.String("min_price", filter.MinPrice),
		)
	}
	if filter.MaxPrice != "" {
		db = db.Where("price <= ?", filter.MaxPrice)
		xzap.WithContext(ctx).Debug("QueryListings - Adding max_price filter",
			zap.String("max_price", filter.MaxPrice),
		)
	}

	// 过滤过期的订单
	db = db.Where("expire_time > ?", time.Now().Unix())
	xzap.WithContext(ctx).Debug("QueryListings - Adding expire_time filter",
		zap.Int64("current_timestamp", time.Now().Unix()),
	)

	// 统计总数
	if err := db.Count(&count).Error; err != nil {
		xzap.WithContext(ctx).Error("QueryListings - Count failed",
			zap.Error(err),
		)
		return nil, 0, errors.Wrap(err, "failed to count listings")
	}
	xzap.WithContext(ctx).Debug("QueryListings - Total count",
		zap.Int64("count", count),
	)

	// 排序
	orderBy := "price"
	if filter.SortBy == "created_at" {
		orderBy = "event_time"
	}
	orderDir := "ASC"
	if filter.SortOrder == "desc" {
		orderDir = "DESC"
	}
	db = db.Order(orderBy + " " + orderDir)
	xzap.WithContext(ctx).Debug("QueryListings - Order by",
		zap.String("order_by", orderBy),
		zap.String("order_direction", orderDir),
	)

	// 分页
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.PageSize <= 0 {
		filter.PageSize = 20
	}
	offset := (filter.Page - 1) * filter.PageSize
	xzap.WithContext(ctx).Debug("QueryListings - Pagination",
		zap.Int("page", filter.Page),
		zap.Int("page_size", filter.PageSize),
		zap.Int("offset", offset),
	)

	// 使用 GORM Debug 模式打印完整 SQL
	db = db.Debug()

	// 查询数据
	if err := db.Limit(int(filter.PageSize)).Offset(offset).Find(&listings).Error; err != nil {
		xzap.WithContext(ctx).Error("QueryListings - Find failed",
			zap.Error(err),
		)
		return nil, 0, errors.Wrap(err, "failed to query listings")
	}
	xzap.WithContext(ctx).Debug("QueryListings - Results",
		zap.Int("results_count", len(listings)),
	)

	// 手动填充不在数据库中的字段
	// chainID := multi.ChainNameToChainID(chain)
	// for i := range listings {
	// 	listings[i].ChainID = chainID
	// 	listings[i].Status = getOrderStatusString(listings[i].OrderStatus)
	// }
	// xzap.WithContext(ctx).Debug("QueryListings - Filled additional fields",
	// 	zap.Int64("chain_id", chainID),
	// )

	return listings, count, nil
}

// QueryBids 查询出价列表
// 参数说明:
// - chain: 链名称
// - filter: 过滤条件
// 返回值:
// - []types.OrderBidInfo: 出价列表
// - int64: 总数
// - error: 错误信息
func (d *Dao) QueryBids(ctx context.Context, chain string, filter types.BidsRequest) ([]types.OrderBidInfo, int64, error) {
	var count int64
	var bids []types.OrderBidInfo

	// 构建基础查询 - 查询出价订单（包括 item bid 和 collection bid）
	db := d.DB.WithContext(ctx).Table(multi.OrderTableName(chain)).
		Where("order_type IN (?) AND order_status = ?", []int{multi.OfferOrder, multi.ItemBidOrder, multi.CollectionBidOrder}, multi.OrderStatusActive)

	// Debug: 打印初始 SQL
	xzap.WithContext(ctx).Debug("QueryBids - Initial query",
		zap.String("chain", chain),
		zap.String("table", multi.OrderTableName(chain)),
		zap.Any("order_types", []int{multi.OfferOrder, multi.ItemBidOrder, multi.CollectionBidOrder}),
		zap.Int("order_status", multi.OrderStatusActive),
	)

	// 添加过滤条件
	if filter.CollectionAddr != "" {
		db = db.Where("collection_address = ?", filter.CollectionAddr)
		xzap.WithContext(ctx).Debug("QueryBids - Adding collection filter",
			zap.String("collection_addr", filter.CollectionAddr),
		)
	}
	if filter.TokenID != "" {
		db = db.Where("token_id = ?", filter.TokenID)
		xzap.WithContext(ctx).Debug("QueryBids - Adding token_id filter",
			zap.String("token_id", filter.TokenID),
		)
	}
	if filter.UserAddress != "" {
		db = db.Where("maker = ?", filter.UserAddress)
		xzap.WithContext(ctx).Debug("QueryBids - Adding user_address filter",
			zap.String("user_address", filter.UserAddress),
		)
	}

	// 出价类型过滤
	if filter.BidType == "item" {
		db = db.Where("order_type IN (?)", []int{multi.OfferOrder, multi.ItemBidOrder})
		xzap.WithContext(ctx).Debug("QueryBids - Adding item bid type filter",
			zap.String("bid_type", filter.BidType),
		)
	} else if filter.BidType == "collection" {
		db = db.Where("order_type = ?", multi.CollectionBidOrder)
		xzap.WithContext(ctx).Debug("QueryBids - Adding collection bid type filter",
			zap.String("bid_type", filter.BidType),
		)
	}

	// 过滤过期的订单
	db = db.Where("expire_time > ?", time.Now().Unix())
	xzap.WithContext(ctx).Debug("QueryBids - Adding expire_time filter",
		zap.Int64("current_timestamp", time.Now().Unix()),
	)

	// 统计总数
	if err := db.Count(&count).Error; err != nil {
		xzap.WithContext(ctx).Error("QueryBids - Count failed",
			zap.Error(err),
		)
		return nil, 0, errors.Wrap(err, "failed to count bids")
	}
	xzap.WithContext(ctx).Debug("QueryBids - Total count",
		zap.Int64("count", count),
	)

	// 排序
	orderBy := "price"
	if filter.SortBy == "created_at" {
		orderBy = "event_time"
	}
	orderDir := "DESC" // 出价默认降序（最高的在前）
	if filter.SortOrder == "asc" {
		orderDir = "ASC"
	}
	db = db.Order(orderBy + " " + orderDir)
	xzap.WithContext(ctx).Debug("QueryBids - Order by",
		zap.String("order_by", orderBy),
		zap.String("order_direction", orderDir),
	)

	// 分页
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.PageSize <= 0 {
		filter.PageSize = 20
	}
	offset := (filter.Page - 1) * filter.PageSize
	xzap.WithContext(ctx).Debug("QueryBids - Pagination",
		zap.Int("page", filter.Page),
		zap.Int("page_size", filter.PageSize),
		zap.Int("offset", offset),
	)

	// 使用 GORM Debug 模式打印完整 SQL
	db = db.Debug()

	// 查询数据
	if err := db.Limit(int(filter.PageSize)).Offset(offset).Find(&bids).Error; err != nil {
		xzap.WithContext(ctx).Error("QueryBids - Find failed",
			zap.Error(err),
		)
		return nil, 0, errors.Wrap(err, "failed to query bids")
	}
	xzap.WithContext(ctx).Debug("QueryBids - Results",
		zap.Int("results_count", len(bids)),
	)

	// 手动填充不在数据库中的字段
	// chainID := multi.ChainNameToChainID(chain)
	// for i := range bids {
	// 	bids[i].ChainID = chainID
	// 	bids[i].Status = getOrderStatusString(bids[i].OrderStatus)
	// 	bids[i].BidType = getBidTypeString(bids[i].OrderType)
	// }
	// xzap.WithContext(ctx).Debug("QueryBids - Filled additional fields",
	// 	zap.Int64("chain_id", chainID),
	// )

	return bids, count, nil
}

// QueryOrderByKey 根据订单Key查询订单
func (d *Dao) QueryOrderByKey(ctx context.Context, chain string, orderKey string) (*multi.Order, error) {
	var order multi.Order
	if err := d.DB.WithContext(ctx).Table(multi.OrderTableName(chain)).
		Where("order_id = ?", orderKey).
		First(&order).Error; err != nil {
		return nil, errors.Wrap(err, "failed to query order by key")
	}
	return &order, nil
}

// QueryOrdersByKeys 根据订单Key列表查询订单
func (d *Dao) QueryOrdersByKeys(ctx context.Context, chain string, orderKeys []string) ([]multi.Order, error) {
	var orders []multi.Order
	if err := d.DB.WithContext(ctx).Table(multi.OrderTableName(chain)).
		Where("order_id IN (?)", orderKeys).
		Find(&orders).Error; err != nil {
		return nil, errors.Wrap(err, "failed to query orders by keys")
	}
	return orders, nil
}

// QueryUserActiveListings 查询用户的活跃挂单
func (d *Dao) QueryUserActiveListings(ctx context.Context, chain string, userAddr string, page, pageSize int) ([]multi.Order, int64, error) {
	var count int64
	var orders []multi.Order

	db := d.DB.WithContext(ctx).Table(multi.OrderTableName(chain)).
		Where("maker = ? AND order_type = ? AND order_status = ? AND expire_time > ?",
			userAddr, multi.ListingOrder, multi.OrderStatusActive, time.Now().Unix())

	if err := db.Count(&count).Error; err != nil {
		return nil, 0, errors.Wrap(err, "failed to count user listings")
	}

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	if err := db.Order("event_time DESC").Limit(pageSize).Offset(offset).Find(&orders).Error; err != nil {
		return nil, 0, errors.Wrap(err, "failed to query user listings")
	}

	return orders, count, nil
}

// QueryUserActiveBids 查询用户的活跃出价
func (d *Dao) QueryUserActiveBids(ctx context.Context, chain string, userAddr string, page, pageSize int) ([]multi.Order, int64, error) {
	var count int64
	var orders []multi.Order

	db := d.DB.WithContext(ctx).Table(multi.OrderTableName(chain)).
		Where("maker = ? AND order_type IN (?) AND order_status = ? AND expire_time > ?",
			userAddr, []int{multi.OfferOrder, multi.ItemBidOrder, multi.CollectionBidOrder}, multi.OrderStatusActive, time.Now().Unix())

	if err := db.Count(&count).Error; err != nil {
		return nil, 0, errors.Wrap(err, "failed to count user bids")
	}

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	if err := db.Order("event_time DESC").Limit(pageSize).Offset(offset).Find(&orders).Error; err != nil {
		return nil, 0, errors.Wrap(err, "failed to query user bids")
	}

	return orders, count, nil
}

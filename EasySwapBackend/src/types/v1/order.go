package types

import "github.com/shopspring/decimal"

type OrderInfosParam struct {
	ChainID           int      `json:"chain_id"`
	UserAddress       string   `json:"user_address"`
	CollectionAddress string   `json:"collection_address"`
	TokenIds          []string `json:"token_ids"`
}

// MakeOrderRequest 创建订单请求
type MakeOrderRequest struct {
	ChainID        int64  `json:"chain_id"`
	UserAddress    string `json:"user_address"`
	Side           uint8  `json:"side"`      // 1=List, 2=Bid
	SaleKind       uint8  `json:"sale_kind"` // 1=FixedPriceForItem
	CollectionAddr string `json:"collection_addr"`
	TokenID        string `json:"token_id"`
	Price          string `json:"price"`  // wei 为单位
	Expiry         int64  `json:"expiry"` // 时间戳
	Salt           uint64 `json:"salt,omitempty"`
	Amount         uint64 `json:"amount,omitempty"` // 默认为 1 (使用 uint64 代替 uint96)
}

// MakeOrderResponse 创建订单响应
type MakeOrderResponse struct {
	OrderKey string `json:"order_key"`
	TxHash   string `json:"tx_hash"`
	Status   string `json:"status"` // pending, success, failed
}

// CancelOrderRequest 取消订单请求
type CancelOrderRequest struct {
	ChainID     int64    `json:"chain_id"`
	UserAddress string   `json:"user_address"`
	OrderKeys   []string `json:"order_keys"`
}

// CancelOrderResponse 取消订单响应
type CancelOrderResponse struct {
	Successes []bool `json:"successes"`
	TxHash    string `json:"tx_hash"`
}

// EditOrderRequest 编辑订单请求
type EditOrderRequest struct {
	ChainID     int64  `json:"chain_id"`
	UserAddress string `json:"user_address"`
	OldOrderKey string `json:"old_order_key"`
	NewPrice    string `json:"new_price"`
	NewExpiry   int64  `json:"new_expiry,omitempty"`
	NewSalt     uint64 `json:"new_salt,omitempty"`
}

// EditOrderResponse 编辑订单响应
type EditOrderResponse struct {
	NewOrderKey string `json:"new_order_key"`
	TxHash      string `json:"tx_hash"`
	Status      string `json:"status"`
}

// MatchOrderRequest 匹配订单请求
type MatchOrderRequest struct {
	ChainID     int64  `json:"chain_id"`
	UserAddress string `json:"user_address"`
	SellOrder   Order  `json:"sell_order"`
	BuyOrder    Order  `json:"buy_order"`
	Value       string `json:"value,omitempty"` // 支付 ETH（买单时需要）
}

// Order 订单结构
type Order struct {
	Side       uint8  `json:"side"`
	SaleKind   uint8  `json:"sale_kind"`
	Maker      string `json:"maker"`
	TokenID    string `json:"token_id"`
	Collection string `json:"collection"`
	Amount     uint64 `json:"amount"`
	Price      string `json:"price"`
	Expiry     uint64 `json:"expiry"`
	Salt       uint64 `json:"salt"`
}

// MatchOrderResponse 匹配订单响应
type MatchOrderResponse struct {
	Success   bool   `json:"success"`
	TxHash    string `json:"tx_hash"`
	FillPrice string `json:"fill_price,omitempty"`
}

// ListingsRequest 挂单列表查询请求
type ListingsRequest struct {
	ChainID        int64  `json:"chain_id"`
	CollectionAddr string `json:"collection_addr,omitempty"`
	TokenID        string `json:"token_id,omitempty"`
	UserAddress    string `json:"user_address,omitempty"` // 可选：筛选特定用户的挂单
	Page           int    `json:"page"`
	PageSize       int    `json:"page_size"`
	SortBy         string `json:"sort_by"`    // price, created_at
	SortOrder      string `json:"sort_order"` // asc, desc
	MinPrice       string `json:"min_price,omitempty"`
	MaxPrice       string `json:"max_price,omitempty"`
}

// ListingsResponse 挂单列表响应
type ListingsResponse struct {
	Listings []OrderListingInfo `json:"listings"`
	Total    int64              `json:"total"`
	Page     int                `json:"page"`
	PageSize int                `json:"page_size"`
}

// OrderListingInfo 挂单信息
type OrderListingInfo struct {
	OrderKey       string          `json:"order_key" gorm:"column:order_id"`
	ChainID        int64           `json:"chain_id" gorm:"-"` // 不从数据库读取，由应用层填充
	CollectionAddr string          `json:"collection_addr" gorm:"column:collection_address"`
	TokenID        string          `json:"token_id" gorm:"column:token_id"`
	Maker          string          `json:"maker" gorm:"column:maker"`
	Price          decimal.Decimal `json:"price" gorm:"column:price"`
	PriceUSD       string          `json:"price_usd,omitempty" gorm:"-"` // 不从数据库读取
	Amount         uint64          `json:"amount" gorm:"column:size"`
	FilledAmount   uint64          `json:"filled_amount" gorm:"column:quantity_remaining"`
	Expiry         int64           `json:"expiry" gorm:"column:expire_time"`
	Salt           int64           `json:"salt" gorm:"column:salt"`
	OrderStatus    int             `json:"-" gorm:"column:order_status"` // 内部使用，不暴露给前端
	Status         string          `json:"status" gorm:"-"`              // 由 order_status 转换
	CreatedAt      int64           `json:"created_at" gorm:"column:create_time"`
	EventTime      int64           `json:"event_time" gorm:"column:event_time"`
}

// BidsRequest 出价列表查询请求
type BidsRequest struct {
	ChainID        int64  `json:"chain_id"`
	CollectionAddr string `json:"collection_addr,omitempty"`
	TokenID        string `json:"token_id,omitempty"`
	UserAddress    string `json:"user_address,omitempty"` // 可选：筛选特定用户的出价
	Page           int    `json:"page"`
	PageSize       int    `json:"page_size"`
	SortBy         string `json:"sort_by"`            // price, created_at
	SortOrder      string `json:"sort_order"`         // asc, desc
	BidType        string `json:"bid_type,omitempty"` // item, collection, all
}

// BidsResponse 出价列表响应
type BidsResponse struct {
	Bids     []OrderBidInfo `json:"bids"`
	Total    int64          `json:"total"`
	Page     int            `json:"page"`
	PageSize int            `json:"page_size"`
}

// OrderBidInfo 出价信息
type OrderBidInfo struct {
	OrderKey       string          `json:"order_key" gorm:"column:order_id"`
	ChainID        int64           `json:"chain_id" gorm:"-"` // 不从数据库读取，由应用层填充
	CollectionAddr string          `json:"collection_addr" gorm:"column:collection_address"`
	TokenID        string          `json:"token_id,omitempty" gorm:"column:token_id"` // collection bid 时可能为空
	Maker          string          `json:"maker" gorm:"column:maker"`
	Price          decimal.Decimal `json:"price" gorm:"column:price"`
	PriceUSD       string          `json:"price_usd,omitempty" gorm:"-"` // 不从数据库读取
	Amount         uint64          `json:"amount" gorm:"column:size"`
	FilledAmount   uint64          `json:"filled_amount" gorm:"column:quantity_remaining"`
	Expiry         int64           `json:"expiry" gorm:"column:expire_time"`
	OrderStatus    int             `json:"-" gorm:"column:order_status"` // 内部使用，不暴露给前端
	OrderType      int64           `json:"-" gorm:"column:order_type"`   // 内部使用，不暴露给前端
	Status         string          `json:"status" gorm:"-"`              // 由 order_status 转换
	BidType        string          `json:"bid_type" gorm:"-"`            // 由 order_type 转换
	CreatedAt      int64           `json:"created_at" gorm:"column:create_time"`
	EventTime      int64           `json:"event_time" gorm:"column:event_time"`
}

// ItemBid 用于返回NFT的出价信息 (别名，方便使用)
type OrderItemBid = ItemBid

// ItemInfo 用于构建查询参数 (别名，方便使用)
type OrderItemInfo = ItemInfo

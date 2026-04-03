package types

import "github.com/shopspring/decimal"

// AuctionInfo 拍卖信息
type AuctionInfo struct {
	AuctionID      string          `json:"auction_id"`      // 拍卖 ID
	ItemName       string          `json:"item_name"`       // 物品名称
	ItemImage      string          `json:"image_uri"`       // 图片 URL
	CollectionName string          `json:"collection_name"` // 集合名称
	CollectionAddr string          `json:"collection_addr"` // 集合地址
	TokenID        string          `json:"token_id"`        // Token ID
	Seller         string          `json:"seller"`          // 卖家
	HighestBidder  string          `json:"highest_bidder"`  // 最高出价者
	CurrentBid     decimal.Decimal `json:"current_bid"`     // 当前出价
	CurrentBidUSD  string          `json:"current_bid_usd"` // 当前出价 (USD)
	ReservePrice   decimal.Decimal `json:"reserve_price"`   // 保留价
	StartPrice     decimal.Decimal `json:"start_price"`     // 起始价
	BidCount       int64           `json:"bid_count"`       // 出价次数
	StartTime      int64           `json:"start_time"`      // 开始时间
	EndTime        int64           `json:"end_time"`        // 结束时间
	Status         string          `json:"status"`          // 状态：active, ended, cancelled
	ChainID        int             `json:"chain_id"`        // 链 ID
}

// AuctionsFilterParams 拍卖过滤参数
type AuctionsFilterParams struct {
	ChainID         []int    `json:"chain_ids"`        // 链 ID 列表
	Status          string   `json:"status"`           // 状态：active, ending_soon, new
	CollectionAddrs []string `json:"collection_addrs"` // 集合地址列表
	UserAddress     string   `json:"user_address"`     // 用户地址（创建或参与）
	PriceMin        string   `json:"price_min"`        // 最低价格
	PriceMax        string   `json:"price_max"`        // 最高价格
	Page            int      `json:"page"`             // 页码
	PageSize        int      `json:"page_size"`        // 每页数量
}

// AuctionsResponse 拍卖响应
type AuctionsResponse struct {
	Result []*AuctionInfo `json:"result"`
	Total  int64          `json:"total"`
}

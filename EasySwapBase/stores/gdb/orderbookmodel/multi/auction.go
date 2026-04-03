package multi

import (
	"github.com/shopspring/decimal"
)

// Auction 拍卖模型
type Auction struct {
	ID             int64           `gorm:"column:id;AUTO_INCREMENT;primary_key" json:"id"`
	AuctionID      string          `gorm:"column:auction_id;NOT NULL" json:"auction_id"`                 // 拍卖唯一 ID
	MarketplaceID  int             `gorm:"column:marketplace_id;default:0" json:"marketplace_id"`        // 市场 ID (0:本平台，1:opensea, 2:looksrare, 3:x2y2)
	CollectionAddr string          `gorm:"column:collection_address;NOT NULL" json:"collection_address"` // 集合合约地址
	TokenID        string          `gorm:"column:token_id;NOT NULL" json:"token_id"`                     // Token ID
	Seller         string          `gorm:"column:seller;NOT NULL" json:"seller"`                         // 卖家地址
	HighestBidder  string          `gorm:"column:highest_bidder" json:"highest_bidder"`                  // 最高出价者地址
	StartPrice     decimal.Decimal `gorm:"column:start_price;NOT NULL" json:"start_price"`               // 起始价格 (ETH)
	ReservePrice   decimal.Decimal `gorm:"column:reserve_price" json:"reserve_price"`                    // 保留价格 (ETH)
	CurrentBid     decimal.Decimal `gorm:"column:current_bid;default:0" json:"current_bid"`              // 当前出价 (ETH)
	BidCount       int64           `gorm:"column:bid_count;default:0" json:"bid_count"`                  // 出价次数
	StartTime      int64           `gorm:"column:start_time;NOT NULL" json:"start_time"`                 // 开始时间戳 (秒)
	EndTime        int64           `gorm:"column:end_time;NOT NULL" json:"end_time"`                     // 结束时间戳 (秒)
	Status         int             `gorm:"column:status;default:0" json:"status"`                        // 状态 (0:活跃，1:已结束，2:已取消，3:已售出)
	CurrencyAddr   string          `gorm:"column:currency_address;default:'1'" json:"currency_address"`  // 货币类型 (1:ETH)
	ChainID        int64           `gorm:"column:chain_id;default:1" json:"chain_id"`                    // 链 ID
	ChainName      string          `gorm:"column:chain_name;NOT NULL" json:"chain_name"`                 // 链名称
	CreateTime     int64           `json:"create_time" gorm:"column:create_time;type:bigint(20)"`        // 创建时间戳 (毫秒)
	UpdateTime     int64           `json:"update_time" gorm:"column:update_time;type:bigint(20)"`        // 更新时间戳 (毫秒)
}

// TableName 表名
func (Auction) TableName() string {
	return "ob_auction"
}

// AuctionBid 拍卖出价记录模型
type AuctionBid struct {
	ID         int64           `gorm:"column:id;AUTO_INCREMENT;primary_key" json:"id"`
	AuctionID  string          `gorm:"column:auction_id;NOT NULL" json:"auction_id"`          // 拍卖 ID
	Bidder     string          `gorm:"column:bidder;NOT NULL" json:"bidder"`                  // 出价者地址
	Amount     decimal.Decimal `gorm:"column:amount;NOT NULL" json:"amount"`                  // 出价金额 (ETH)
	TxHash     string          `gorm:"column:tx_hash" json:"tx_hash"`                         // 交易 hash
	BidTime    int64           `gorm:"column:bid_time;NOT NULL" json:"bid_time"`              // 出价时间戳 (秒)
	CreateTime int64           `json:"create_time" gorm:"column:create_time;type:bigint(20)"` // 创建时间戳 (毫秒)
}

// TableName 表名
func (AuctionBid) TableName() string {
	return "ob_auction_bid"
}

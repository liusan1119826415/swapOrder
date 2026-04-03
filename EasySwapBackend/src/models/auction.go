package models

import (
	"github.com/shopspring/decimal"
)

// Auction 拍卖表模型
type Auction struct {
	ID                int64           `gorm:"column:id"`
	AuctionID         string          `gorm:"column:auction_id"`
	MarketplaceID     int             `gorm:"column:marketplace_id"`
	CollectionAddress string          `gorm:"column:collection_address"`
	TokenID           string          `gorm:"column:token_id"`
	Seller            string          `gorm:"column:seller"`
	HighestBidder     string          `gorm:"column:highest_bidder"`
	StartPrice        decimal.Decimal `gorm:"column:start_price;type:decimal(30,18)"`
	ReservePrice      decimal.Decimal `gorm:"column:reserve_price;type:decimal(30,18)"`
	CurrentBid        decimal.Decimal `gorm:"column:current_bid;type:decimal(30,18)"`
	BidCount          int64           `gorm:"column:bid_count"`
	StartTime         int64           `gorm:"column:start_time"`
	EndTime           int64           `gorm:"column:end_time"`
	Status            int             `gorm:"column:status"`
	CurrencyAddress   string          `gorm:"column:currency_address"`
	ChainID           int64           `gorm:"column:chain_id"`
	ChainName         string          `gorm:"column:chain_name"`
	CreateTime        int64           `gorm:"column:create_time"`
	UpdateTime        int64           `gorm:"column:update_time"`
}

// Drop 新品发布表模型
type Drop struct {
	ID                int64           `gorm:"column:id"`
	DropID            string          `gorm:"column:drop_id"`
	CollectionAddress string          `gorm:"column:collection_address"`
	CollectionName    string          `gorm:"column:collection_name"`
	CreatorAddress    string          `gorm:"column:creator_address"`
	CreatorName       string          `gorm:"column:creator_name"`
	Description       string          `gorm:"column:description"`
	LogoURI           string          `gorm:"column:logo_uri"`
	BannerURI         string          `gorm:"column:banner_uri"`
	TotalSupply       int64           `gorm:"column:total_supply"`
	ItemsMinted       int64           `gorm:"column:items_minted"`
	Price             decimal.Decimal `gorm:"column:price;type:decimal(30,18)"`
	MintStartTime     int64           `gorm:"column:mint_start_time"`
	MintEndTime       int64           `gorm:"column:mint_end_time"`
	Status            int             `gorm:"column:status"`
	ChainID           int64           `gorm:"column:chain_id"`
	ChainName         string          `gorm:"column:chain_name"`
	IsVerified        int             `gorm:"column:is_verified"`
	Categories        string          `gorm:"column:categories"`
	Website           string          `gorm:"column:website"`
	Discord           string          `gorm:"column:discord"`
	Twitter           string          `gorm:"column:twitter"`
	CreateTime        int64           `gorm:"column:create_time"`
	UpdateTime        int64           `gorm:"column:update_time"`
}

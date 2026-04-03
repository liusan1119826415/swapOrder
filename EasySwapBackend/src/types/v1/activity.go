package types

import (
	"github.com/shopspring/decimal"
)

type ActivityMultiChainFilterParams struct {
	ChainID             []int    `json:"chainId"`
	CollectionAddresses []string `json:"collectionAddresses"`
	TokenID             string   `json:"tokenId"`
	UserAddresses       []string `json:"userAddresses"`
	EventTypes          []string `json:"eventTypes"`

	Page     int `json:"page"`
	PageSize int `json:"pageSize"`
}

type ActivityInfo struct {
	EventType          string          `json:"event_type"`
	EventTime          int64           `json:"event_time"`
	ImageURI           string          `json:"image_url"`
	CollectionAddress  string          `json:"collection_address"`
	CollectionName     string          `json:"collection_name"`
	CollectionImageURI string          `json:"collection_image_uri"`
	TokenID            string          `json:"token_id"`
	ItemName           string          `json:"item_name"`
	Currency           string          `json:"currency"`
	Price              decimal.Decimal `json:"price"`
	Maker              string          `json:"maker"`
	Taker              string          `json:"taker"`
	TxHash             string          `json:"tx_hash"`
	MarketplaceID      int             `json:"marketplace_id"`
	ChainID            int             `json:"chain_id"`
}

type ActivityResp struct {
	Result interface{} `json:"result"`
	Count  int64       `json:"count"`
}

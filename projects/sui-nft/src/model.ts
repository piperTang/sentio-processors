
export enum MintType {
  MINT = 'mint',
  BURN = 'burn'
}

export interface Mint {
  evt_type: MintType
  sender: string
  project: string
  collection_name: string
  collection_id: string
  object_id: string
}

export enum TradeType {
  BUY = 'buy',
  LIST = 'list',
  DELIST = 'delist'
}

export interface Trade {
  project: string
  collection_name: string
  collection_id: string
  object_id: string

  nft_type: string

  buyer: string

  amount: bigint
  price: bigint

}
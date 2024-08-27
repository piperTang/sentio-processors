
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type { String, Int, BigInt, Float, ID, Bytes, Timestamp, Boolean } from '@sentio/sdk/store'
import { Entity, Required, One, Many, Column, ListColumn, AbstractEntity } from '@sentio/sdk/store'
import { BigDecimal } from '@sentio/bigdecimal'
import { DatabaseSchema } from '@sentio/sdk'






@Entity("AccountSnapshot")
export class AccountSnapshot extends AbstractEntity  {

	@Required
	@Column("ID")
	id: ID

	@Required
	@Column("String")
	network: String

	@Required
	@Column("BigInt")
	balance: BigInt

	@Required
	@Column("BigInt")
	borrowBalance: BigInt

	@Required
	@Column("BigInt")
	netBalance: BigInt

	@Required
	@Column("BigInt")
	timestampMilli: BigInt
  constructor(data: Partial<AccountSnapshot>) {super()}
}

@Entity("GlobalState")
export class GlobalState extends AbstractEntity  {

	@Required
	@Column("ID")
	id: ID

	@Required
	@Column("String")
	network: String

	@Required
	@Column("BigInt")
	totalSupply: BigInt

	@Required
	@Column("BigInt")
	totalBorrow: BigInt

	@Required
	@Column("BigInt")
	totalPositiveNetBalance: BigInt
  constructor(data: Partial<GlobalState>) {super()}
}

@Entity("TempEvent")
export class TempEvent extends AbstractEntity  {

	@Required
	@Column("ID")
	id: ID

	@Required
	@Column("String")
	network: String

	@Required
	@Column("String")
	eventName: String

	@Required
	@Column("String")
	args: String

	@Required
	@Column("Int")
	blockNumber: Int

	@Required
	@Column("Int")
	txIdx: Int

	@Required
	@Column("Int")
	eventIdx: Int

	@Required
	@Column("BigInt")
	timestampMilli: BigInt
  constructor(data: Partial<TempEvent>) {super()}
}


const source = ` type AccountSnapshot @entity {
    id: ID!
    network: String!
    balance: BigInt!
    borrowBalance: BigInt!
    netBalance: BigInt!
    timestampMilli: BigInt!
}

type GlobalState @entity {
    id: ID!
    network: String!
    totalSupply: BigInt!
    totalBorrow: BigInt!
    totalPositiveNetBalance: BigInt!
}

type TempEvent @entity {
    id: ID!
    network: String!
    eventName: String!
    args: String!
    blockNumber: Int!
    txIdx: Int!
    eventIdx: Int!
    timestampMilli: BigInt!
}`
DatabaseSchema.register({
  source,
  entities: {
    "AccountSnapshot": AccountSnapshot,
		"GlobalState": GlobalState,
		"TempEvent": TempEvent
  }
})

/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type { String, Int, BigInt, Float, ID, Bytes, Timestamp, Boolean } from '@sentio/sdk/store'
import { Entity, Required, One, Many, Column, ListColumn, AbstractEntity } from '@sentio/sdk/store'
import { BigDecimal } from '@sentio/bigdecimal'
import { DatabaseSchema } from '@sentio/sdk'






@Entity("CreditAccountSnapshot")
export class CreditAccountSnapshot extends AbstractEntity  {

	@Required
	@Column("ID")
	id: ID

	@Required
	@Column("String")
	borrower: String

	@Required
	@Column("BigInt")
	lbtcBalance: BigInt

	@Required
	@Column("BigInt")
	timestampMilli: BigInt
  constructor(data: Partial<CreditAccountSnapshot>) {super()}
}


const source = `type CreditAccountSnapshot @entity {
  id: ID!
  borrower: String!
  lbtcBalance: BigInt!
  timestampMilli: BigInt!
}
`
DatabaseSchema.register({
  source,
  entities: {
    "CreditAccountSnapshot": CreditAccountSnapshot
  }
})
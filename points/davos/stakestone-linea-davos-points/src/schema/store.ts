
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
	@Column("BigInt")
	timestampMilli: BigInt

	@Required
	@Column("BigInt")
	balance: BigInt
  constructor(data: Partial<AccountSnapshot>) {super()}
}


const source = `type AccountSnapshot @entity {
  id: ID!
  timestampMilli: BigInt!
  balance: BigInt!
}
`
DatabaseSchema.register({
  source,
  entities: {
    "AccountSnapshot": AccountSnapshot
  }
})

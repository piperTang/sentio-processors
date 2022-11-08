import { liquidity_pool } from './types/aptos/liquidswap'

import { AccountEventTracker, aptos, Counter, Gauge } from "@sentio/sdk";

import {
  caculateValueInUsd,
  getCoinInfo,
  whiteListed,
  getPrice,
    scaleDown,
    CORE_TOKENS
} from "@sentio-processor/common/dist/aptos/coin"
import { aggregator, coin, optional_aggregator } from "@sentio/sdk/lib/builtin/aptos/0x1";

import { BigDecimal } from "@sentio/sdk/lib/core/big-decimal";

import { TypedMoveResource } from "@sentio/sdk/lib/aptos/types";
import { MoveResource } from "aptos-sdk/src/generated";
import { AptosDex } from "@sentio-processor/common/dist/aptos";
import {
  accountTracker,
  inputUsd,
  lpTracker,
  priceImpact,
  tvl,
  tvlAll,
  tvlByPool,
  volume
} from "./metrics";
import { AptosResourceContext } from "@sentio/sdk/lib/aptos/context";
import {  } from "./utils";



// const auxTvlAll = new Gauge("aux_tvl_all", commonOptions)


// const POOL_TYPE = "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::liquidity_pool::LiquidityPool"
//
// const ALL_POOLS = new Set<string>()
// let poolVersion = Long.ZERO

// const tmpFile = path.resolve(os.tmpdir(), "sentio", "cache", "sets")

// interface SavedPools {
//   version: string
//   pools: string[]
// }
//
// function savePool(version: Long, types: string[]) {
//   poolVersion = version
//   const value = types.join(", ")
//   if (!ALL_POOLS.has(value)) {
//     ALL_POOLS.add(value)
//     const data: SavedPools  = { version: poolVersion.toString(), pools: Array.from(ALL_POOLS)}
//     const json = JSON.stringify(data)
//     fs.mkdirSync(path.resolve(tmpFile, ".."), { recursive: true})
//     fs.writeFileSync(tmpFile , json)
//   }
// }
//
// function readPool(version: Long) {
//   if (ALL_POOLS.size !== 0) {
//     return
//   }
//   if (!fs.existsSync(tmpFile)) {
//     return
//   }
//   const json: SavedPools = JSON.parse(fs.readFileSync(tmpFile, "utf-8"))
//   const poolVersion = Long.fromString(json.version)
//   if (version.lte(poolVersion)) {
//     return
//   }
//   console.log("loading pools", json.pools.length)
//
//   for (const x of json.pools) {
//     ALL_POOLS.add(x)
//   }
//   console.log(json)
// }


const liquidSwap = new AptosDex<liquidity_pool.LiquidityPool<any, any, any>>(volume, tvlAll, tvl, tvlByPool, {
  getXReserve: pool => pool.coin_x_reserve.value,
  getYReserve: pool => pool.coin_y_reserve.value,
  getCurve: pool => pool.type_arguments[2],
  poolTypeName: liquidity_pool.LiquidityPool.TYPE_QNAME
})

liquidity_pool.bind({startVersion: 2311592})
    .onEventPoolCreatedEvent(async (evt, ctx) => {
      ctx.meter.Counter("num_pools").add(1)
      lpTracker.trackEvent(ctx, { distinctId: ctx.transaction.sender })
      // ctx.logger.info("PoolCreated", { user: ctx.transaction.sender })

      ctx.logger.info("", {user: "-", value: 0.0001})
    })
    .onEventLiquidityAddedEvent(async (evt, ctx) => {
      ctx.meter.Counter("event_liquidity_add").add(1)
      lpTracker.trackEvent(ctx, { distinctId: ctx.transaction.sender })
    })
    .onEventLiquidityRemovedEvent(async (evt, ctx) => {
      ctx.meter.Counter("event_liquidity_removed").add(1)
      accountTracker.trackEvent(ctx, { distinctId: ctx.transaction.sender })
    })
    .onEventSwapEvent(async (evt, ctx) => {
      const value = await liquidSwap.recordTradingVolume(ctx,
          evt.type_arguments[0], evt.type_arguments[1],
          evt.data_typed.x_in + evt.data_typed.x_out,
          evt.data_typed.y_in + evt.data_typed.y_out,
          getCurve(evt.type_arguments[2]))

      const coinXInfo = await getCoinInfo(evt.type_arguments[0])
      const coinYInfo = await getCoinInfo(evt.type_arguments[1])

      ctx.logger.info(`${ctx.transaction.sender} Swap ${coinXInfo.symbol} for ${coinYInfo.symbol}`, {user: ctx.transaction.sender, value: value.toNumber()})

      ctx.meter.Counter("event_swap_by_bridge").add(1, { bridge: coinXInfo.bridge })
      ctx.meter.Counter("event_swap_by_bridge").add(1, { bridge: coinYInfo.bridge })

      accountTracker.trackEvent(ctx, { distinctId: ctx.transaction.sender })

    })
    .onEventFlashloanEvent(async (evt, ctx) => {
      const coinXInfo = await getCoinInfo(evt.type_arguments[0])
      const coinYInfo = await getCoinInfo(evt.type_arguments[1])
      ctx.meter.Counter("event_flashloan_by_bridge").add(1, { bridge: coinXInfo.bridge })
      ctx.meter.Counter("event_flashloan_by_bridge").add(1, { bridge: coinYInfo.bridge })

      accountTracker.trackEvent(ctx, { distinctId: ctx.transaction.sender })
    })



// TODO pool name should consider not just use symbol name
async function getPair(coinx: string, coiny: string): Promise<string> {
  const coinXInfo = await getCoinInfo(coinx)
  const coinYInfo = await getCoinInfo(coiny)
  if (coinXInfo.symbol.localeCompare(coinYInfo.symbol) > 0) {
    return `${coinYInfo.symbol}-${coinXInfo.symbol}`
  }
  return `${coinXInfo.symbol}-${coinYInfo.symbol}`
}

function getCurve(type: string) {
  if (type.includes("0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::curves::Stable")) {
    return "Stable"
  } else {
    return "Uncorrelated"
  }
}

// TODO refactor this
async function syncLiquidSwapPools(resources: MoveResource[], ctx: AptosResourceContext) {

  let pools: TypedMoveResource<liquidity_pool.LiquidityPool<any, any, any>>[]
  pools = aptos.TYPE_REGISTRY.filterAndDecodeResources<liquidity_pool.LiquidityPool<any, any, any>>("0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::liquidity_pool::LiquidityPool", resources)

  const volumeByCoin = new Map<string, BigDecimal>()
  const timestamp = ctx.timestampInMicros

  console.log("num of pools: ", pools.length, ctx.version.toString())

  let tvlAllValue = BigDecimal(0)
  for (const pool of pools) {
    // savePool(ctx.version, pool.type_arguments)
    const coinx = pool.type_arguments[0]
    const coiny = pool.type_arguments[1]
    const whitelistx = whiteListed(coinx)
    const whitelisty = whiteListed(coiny)
    if (!whitelistx && !whitelisty) {
      continue
    }

    const pair = await getPair(coinx, coiny)
    const curve = getCurve(pool.type_arguments[2])

    const coinXInfo = await getCoinInfo(coinx)
    const coinYInfo = await getCoinInfo(coiny)

    const coinx_amount = pool.data_typed.coin_x_reserve.value
    const coiny_amount = pool.data_typed.coin_y_reserve.value

    let poolValue = BigDecimal(0)
    if (whitelistx) {
      const value = await caculateValueInUsd(coinx_amount, coinXInfo, timestamp)
      poolValue = poolValue.plus(value)
      // tvlTotal.record(ctx, value, { pool: poolName, type: coinXInfo.token_type.type })

      let coinXTotal = volumeByCoin.get(coinXInfo.token_type.type)
      if (!coinXTotal) {
        coinXTotal = value
      } else {
        coinXTotal = coinXTotal.plus(value)
      }
      volumeByCoin.set(coinXInfo.token_type.type, coinXTotal)

      if (!whitelisty) {
        poolValue = poolValue.plus(value)
        // tvlTotal.record(ctx, value, { pool: poolName, type: coinYInfo.token_type.type})
      }
    }
    if (whitelisty) {
      const value = await caculateValueInUsd(coiny_amount, coinYInfo, timestamp)
      poolValue = poolValue.plus(value)
      // tvlTotal.record(ctx, value, { pool: poolName, type: coinYInfo.token_type.type })

      let coinYTotal = volumeByCoin.get(coinYInfo.token_type.type)
      if (!coinYTotal) {
        coinYTotal = value
      } else {
        coinYTotal = coinYTotal.plus(value)
      }
      volumeByCoin.set(coinYInfo.token_type.type, coinYTotal)

      if (!whitelistx) {
        poolValue = poolValue.plus(value)
      }
    }
    if (poolValue.isGreaterThan(0)) {
      tvlByPool.record(ctx, poolValue, {pair, curve})

      if (curve == "Uncorrelated") {
        const priceX = await getPrice(coinXInfo.token_type.type, timestamp)
        const priceY = await getPrice(coinYInfo.token_type.type, timestamp)
        if (priceX != 0 && priceY != 0) {
          const nX = scaleDown(coinx_amount, coinXInfo.decimals)
          const nY = scaleDown(coiny_amount, coinYInfo.decimals)
          const fee = scaleDown(pool.data_typed.fee, 4)
          const feeFactor = fee.div(BigDecimal(1).minus(fee))

          for (const k of inputUsd) {
            // impactX = fee / (1 - fee) + inX / nX
            const inX = BigDecimal(k).div(priceX)
            const impactX = feeFactor.plus(inX.div(nX))
            priceImpact.record(ctx, impactX, {
              pair, curve,
              fee: fee.toString(),
              inputUsd: k.toString(),
              direction: 'X to Y'
            })

            const inY = BigDecimal(k).div(priceY)
            const impactY = feeFactor.plus(inY.div(nY))
            priceImpact.record(ctx, impactY, {
              pair, curve,
              fee: fee.toString(),
              inputUsd: k.toString(),
              direction: 'Y to X'
            })
          }
        }
      }
    }
    tvlAllValue = tvlAllValue.plus(poolValue)
  }

  tvlAll.record(ctx, tvlAllValue)

  for (const [k, v] of volumeByCoin) {
    const coinInfo = CORE_TOKENS.get(k)
    if (!coinInfo) {
      throw Error("unexpected coin " + k)
    }
    // const price = await getPrice(coinInfo, timestamp)
    // priceGauge.record(ctx, price, { coin: coinInfo.symbol })
    if (v.isGreaterThan(0)) {
      tvl.record(ctx, v, {coin: coinInfo.symbol, bridge: coinInfo.bridge, type: coinInfo.token_type.type})
    }
  }
}


aptos.AptosAccountProcessor.bind({address: '0x5a97986a9d031c4567e15b797be516910cfcb4156312482efc6a19c0a30c948', startVersion: 2311592})
    .onVersionInterval(async (resources, ctx) => syncLiquidSwapPools(resources, ctx))

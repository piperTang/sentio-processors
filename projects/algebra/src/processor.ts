import { Counter, Gauge } from "@sentio/sdk";
import { EthChainId } from "@sentio/sdk/eth";

import {
  AlgebraPoolContext,
  AlgebraPoolProcessor,
  SwapEvent,
} from "./types/eth/algebrapool.js";
import {
  UniswapV3PoolContext,
  UniswapV3PoolProcessor,
} from "./types/eth/uniswapv3pool.js";

import {
  UniswapV2PairProcessor,
  UniswapV2PairContext,
} from "./types/eth/uniswapv2pair.js";

import {
  ConstantProductPoolProcessor,
  ConstantProductPoolContext,
} from "./types/eth/constantproductpool.js";

import { DystPairProcessor } from "./types/eth/dystpair.js";
import { ApePairProcessor } from "./types/eth/apepair.js";

// a constant string array
const ALGEBRA_ADDRESSES = ["0x55CAaBB0d2b704FD0eF8192A7E35D8837e678207"];

const START_BLOCK = 44152590;

for (const address of ALGEBRA_ADDRESSES) {
  AlgebraPoolProcessor.bind({
    address: address,
    network: EthChainId.POLYGON,
    startBlock: START_BLOCK,
  }).onEventSwap(async (evt: SwapEvent, ctx: AlgebraPoolContext) => {
    ctx.eventLogger.emit("AlgebraSwapEvent", {
      sender: evt.args.sender,
      index: evt.transactionIndex,
    });
  });
}

const APE_ADDRESSES = ["0xd32f3139A214034A0f9777c87eE0a064c1FF6AE2"];

for (const address of APE_ADDRESSES) {
  ApePairProcessor.bind({
    address: address,
    network: EthChainId.POLYGON,
    startBlock: START_BLOCK,
  }).onEventSwap(async (evt, ctx) => {
    ctx.eventLogger.emit("ApeSwapEvent", {
      sender: evt.args.sender,
      index: evt.transactionIndex,
    });
  });
}

const V3_ADDRESSES = ["0x56fcb902bee19a645f9607cd1e1c0737b6358feb"];

for (const address of V3_ADDRESSES) {
  UniswapV3PoolProcessor.bind({
    address: address,
    network: EthChainId.POLYGON,
    startBlock: START_BLOCK,
  }).onEventSwap(async (evt, ctx) => {
    ctx.eventLogger.emit("V3SwapEvent", {
      sender: evt.args.sender,
      index: evt.transactionIndex,
    });
  });
}

const V2_ADDRESSES = ["0x4deb2d750b790f2a1a81ed51d9694675ae8628b8"];

for (const address of V2_ADDRESSES) {
  UniswapV2PairProcessor.bind({
    address: address,
    network: EthChainId.POLYGON,
    startBlock: START_BLOCK,
  }).onEventSwap(async (evt, ctx) => {
    ctx.eventLogger.emit("V2SwapEvent", {
      sender: evt.args.sender,
      index: evt.transactionIndex,
    });
  });
}

const CONSTANT_PRODUCT_ADDRESSES = [
  "0xd0266A51c4FA3E07beD30639Be7cfAE4F6080Bc3",
];

for (const address of CONSTANT_PRODUCT_ADDRESSES) {
  ConstantProductPoolProcessor.bind({
    address: address,
    network: EthChainId.POLYGON,
    startBlock: START_BLOCK,
  }).onEventSwap(async (evt, ctx) => {
    ctx.eventLogger.emit("ConstantProductSwapEvent", {
      sender: evt.args.recipient,
      index: evt.transactionIndex,
    });
  });
}

const DYS_ADDRESSES = ["0xC9e4a017ae5c2F89C085c534A38a3e6d3A183A43"];

for (const address of DYS_ADDRESSES) {
  DystPairProcessor.bind({
    address: address,
    network: EthChainId.POLYGON,
    startBlock: START_BLOCK,
  }).onEventSwap(async (evt, ctx) => {
    ctx.eventLogger.emit("DystSwapEvent", {
      sender: evt.args.sender,
      index: evt.transactionIndex,
    });
  });
}

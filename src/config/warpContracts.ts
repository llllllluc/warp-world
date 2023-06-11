import {
    TERRA_LOCALTERRA,
    TERRA_MAINNET,
    TERRA_TESTNET,
  } from "./networks";
  
  export const WARP_CONTRACTS = {
    [TERRA_MAINNET.chainId]: {
      warpController:
        "terra12w6h8u5wsurkgntam3xjc7n0ypjpp5ugeq5jhn52d2j8d3rq0ulqs02427",
    },
    [TERRA_TESTNET.chainId]: {
        warpController:
        "terra1f7lz4gp04lqku97exrmpcvrqr5xvz0mc94lfy7a67clg6sur9tcq80pgk8", 
    },
    [TERRA_LOCALTERRA.chainId]: {
      warpController:
        "terra156fwsk56dgldh4l6dpvm2p3mheugm408lac9au4pc8gn4gqn0kfsy44rqr",
    },
  };
  
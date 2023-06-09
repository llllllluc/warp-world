"use client";

import { useContext, useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import {
  NumberInput,
  NumberInputField,
  Flex,
  Box,
  Button,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";

import useBalance from "@/hooks/useBalance";
import { useWarpGetConfig } from "@/hooks/useWarpGetConfig";
import SelectPool from "@/components/warp/SelectPool";
import { WarpJobs } from "@/components/warp/WarpJobs";
import { useSimulateSwap } from "@/hooks/useAstroportSimulateSwapFromPool";
import { WarpCreateJobAstroportLimitOrder } from "@/components/warp/WarpCreateJobAstroportLimitOrder";
import { Swap } from "@/components/warp/Swap";
import { getTokenDecimals } from "@/utils/token";
import {
  DEFAULT_JOB_REWARD_AMOUNT,
  EVICTION_FEE,
  LABEL_ASTROPORT_LIMIT_ORDER,
  Token,
} from "@/utils/constants";
import { WarpProtocolFeeBreakdown } from "../warp/WarpProtocolFeeBreakdown";
import ChainContext from "@/contexts/ChainContext";

export const LimitOrderPage = () => {
  const { chainConfig, myAddress } = useContext(ChainContext);

  const warpControllerAddress = chainConfig.warp.controllerAddress;
  const warpFeeToken = chainConfig.warp.feeToken;

  const [warpJobCreationFeePercentage, setWarpJobCreationFeePercentage] =
    useState("5");

  const [warpJobCreationFee, setWarpJobCreationFee] = useState("0");
  const [warpJobEvictionFee, setWarpJobEvictionFee] = useState("0");
  const [warpJobRewardFee, setWarpJobRewardFee] = useState(
    BigNumber(DEFAULT_JOB_REWARD_AMOUNT).toString()
  );
  const [warpTotalJobFee, setWarpTotalJobFee] = useState("0");

  const [poolAddress, setPoolAddress] = useState(chainConfig.pools[0].address);
  const [offerToken, setOfferToken] = useState<Token>(
    chainConfig.pools[0].token1
  );
  const [returnToken, setReturnToken] = useState<Token>(
    chainConfig.pools[0].token2
  );

  useEffect(() => {
    setOfferToken(chainConfig.pools[0].token1);
    setReturnToken(chainConfig.pools[0].token2);
  }, [chainConfig]);

  const [offerTokenAmount, setOfferTokenAmount] = useState("1");
  const [returnTokenAmount, setReturnTokenAmount] = useState("1");

  const [marketExchangeRate, setMarketExchangeRate] = useState("1");
  const [desiredExchangeRate, setDesiredExchangeRate] = useState("1");

  const [expiredAfterDays, setExpiredAfterDays] = useState(1);

  const offerTokenBalance = useBalance({
    ownerAddress: myAddress,
    tokenAddress: offerToken.address,
  });
  const returnTokenBalance = useBalance({
    ownerAddress: myAddress,
    tokenAddress: returnToken.address,
  });

  const getWarpConfigResult = useWarpGetConfig({
    warpControllerAddress,
  }).configResult.data;

  useEffect(() => {
    if (!getWarpConfigResult) {
      return;
    }
    setWarpJobCreationFeePercentage(
      getWarpConfigResult.config.creation_fee_percentage
    );
  }, [getWarpConfigResult]);

  const simulateResult = useSimulateSwap({
    amount: offerTokenAmount,
    offerTokenAddress: offerToken.address,
    returnTokenAddress: returnToken.address,
    poolAddress,
  }).simulateResult.data;

  useEffect(() => {
    if (!simulateResult) {
      return;
    }
    setMarketExchangeRate(simulateResult.beliefPrice);
    // only set desired exchange rate if it's not set by user
    if (desiredExchangeRate === "1") {
      setDesiredExchangeRate(simulateResult.beliefPrice);
    }
    setReturnTokenAmount(
      BigNumber(simulateResult.amount)
        .div(getTokenDecimals(returnToken.address))
        .toString()
    );
  }, [simulateResult, returnToken, desiredExchangeRate]);

  useEffect(() => {
    if (!desiredExchangeRate) {
      return;
    }
    setReturnTokenAmount(
      BigNumber(offerTokenAmount).div(desiredExchangeRate).toString()
    );
  }, [desiredExchangeRate, offerTokenAmount]);

  useEffect(() => {
    setWarpJobCreationFee(
      BigNumber(warpJobRewardFee)
        .times(BigNumber(warpJobCreationFeePercentage).div(100))
        .toString()
    );
  }, [warpJobRewardFee, warpJobCreationFeePercentage]);

  useEffect(() => {
    setWarpJobEvictionFee(
      BigNumber(EVICTION_FEE).times(expiredAfterDays).toString()
    );
  }, [expiredAfterDays]);

  useEffect(() => {
    setWarpTotalJobFee(
      BigNumber(warpJobCreationFee)
        .plus(BigNumber(warpJobEvictionFee))
        .plus(BigNumber(warpJobRewardFee))
        .toString()
    );
  }, [warpJobCreationFee, warpJobEvictionFee, warpJobRewardFee]);

  const onChangeOfferToken = (updatedOfferToken: Token) => {
    setOfferToken(updatedOfferToken);
  };

  const onChangeReturnToken = (updatedReturnToken: Token) => {
    setReturnToken(updatedReturnToken);
  };

  const onChangePoolAddress = (updatedPoolAddress: string) => {
    setPoolAddress(updatedPoolAddress);
  };

  const handleChangeDesiredExchangeRate = (newRate: string) => {
    setDesiredExchangeRate(newRate);
  };

  const setDesiredExchangeRateWithMarketRate = () => {
    setDesiredExchangeRate(marketExchangeRate);
  };

  const onChangeExpiredAfterDays = (updatedExpiredAfterDays: string) => {
    setExpiredAfterDays(Number(updatedExpiredAfterDays));
  };

  return (
    <Flex align="center" justify="center" direction="column">
      <Flex
        align="center"
        justify="center"
        direction="column"
        style={{ marginTop: "10px" }}
      >
        <SelectPool
          onChangeOfferToken={onChangeOfferToken}
          onChangeReturnToken={onChangeReturnToken}
          onChangePoolAddress={onChangePoolAddress}
        />
        <Flex
          align="center"
          justify="center"
          direction="row"
          style={{ marginTop: "10px" }}
        >
          <Box style={{ marginRight: "20px" }}>
            {offerToken.name} balance: {offerTokenBalance.data}
          </Box>
          <Box>
            {returnToken.name} balance: {returnTokenBalance.data}
          </Box>
        </Flex>
      </Flex>
      <Swap
        offerToken={offerToken}
        returnToken={returnToken}
        returnTokenAmount={returnTokenAmount}
        offerTokenBalance={offerTokenBalance.data}
        onChangeOfferTokenAmount={setOfferTokenAmount}
      />
      <Flex align="center" justify="center" style={{ marginTop: "10px" }}>
        <Box>at desired rate 1 {returnToken.name} =</Box>
        <NumberInput
          width={150}
          value={desiredExchangeRate}
          onChange={handleChangeDesiredExchangeRate}
        >
          <NumberInputField style={{ textAlign: "center" }} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Box>{offerToken.name}</Box>
      </Flex>
      <Flex align="center" justify="center" style={{ marginTop: "10px" }}>
        <Box>
          current market rate 1 {returnToken.name} = {marketExchangeRate}{" "}
          {offerToken.name}{" "}
        </Box>
        <Button
          colorScheme="yellow"
          onClick={setDesiredExchangeRateWithMarketRate}
        >
          use market rate
        </Button>
      </Flex>
      <Flex align="center" justify="center" style={{ marginTop: "10px" }}>
        <Box>expire after</Box>
        <NumberInput
          defaultValue={expiredAfterDays}
          min={1}
          onChange={onChangeExpiredAfterDays}
          step={1}
          precision={0}
          width={150}
        >
          <NumberInputField style={{ textAlign: "center" }} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Box>{expiredAfterDays > 1 ? "days " : "day "}</Box>
        <WarpCreateJobAstroportLimitOrder
          senderAddress={myAddress}
          warpFeeTokenAddress={warpFeeToken.address}
          warpControllerAddress={warpControllerAddress}
          warpTotalJobFee={warpTotalJobFee}
          poolAddress={poolAddress}
          offerToken={offerToken}
          offerTokenAmount={offerTokenAmount}
          returnToken={returnToken}
          minimumReturnTokenAmount={returnTokenAmount}
          offerTokenBalance={offerTokenBalance.data}
          expiredAfterDays={expiredAfterDays}
        />
      </Flex>
      <WarpProtocolFeeBreakdown
        warpJobCreationFee={warpJobCreationFee}
        warpJobEvictionFee={warpJobEvictionFee}
        warpJobRewardFee={warpJobRewardFee}
        warpTotalJobFee={warpTotalJobFee}
        warpFeeToken={warpFeeToken}
      />
      <WarpJobs
        myAddress={myAddress}
        warpControllerAddress={warpControllerAddress}
        warpJobLabel={LABEL_ASTROPORT_LIMIT_ORDER}
      />
    </Flex>
  );
};

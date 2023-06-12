import Head from "next/head";
import { DcaOrderPage } from "@/components/page/DcaOrder";
import { useWallet } from "@terra-money/wallet-kit";

export default function DCA() {
  const wallet = useWallet();
  // TODO: support dummy data when wallet is not connected
  // currently LCD client is not available when wallet is not connected
  // need to wait for wallet-kit update
  return (
    <>
      <Head>
        <title>Warp World | DCA Order</title>
      </Head>
      {wallet.status !== "CONNECTED" ? <></> : <DcaOrderPage />}
    </>
  );
}

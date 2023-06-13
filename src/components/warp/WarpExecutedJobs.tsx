import { useWarpGetJobs } from "@/hooks/useWarpGetJobs";
import { useEffect, useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Box } from "@chakra-ui/react";
import { Job } from "@/utils/warpHelpers";
import { WarpJobLink } from "@/components/warp/WarpJobLink";
import { WarpJobDetail } from "@/components/warp/WarpJobDetail";
import { LCDClient } from "@terra-money/feather.js";

type WarpExecutedJobsProps = {
  lcd?: LCDClient;
  chainID: string;
  ownerAddress?: string;
  warpControllerAddress: string;
};

export const WarpExecutedJobs = ({
  lcd,
  chainID,
  ownerAddress,
  warpControllerAddress,
}: WarpExecutedJobsProps) => {
  const [warpExecutedJobs, setWarpExecutedJobs] = useState<Job[]>([]);
  const [warpExecutedJobCount, setWarpExecutedJobCount] = useState(0);

  const getWarpExecutedJobsResult = useWarpGetJobs({
    lcd,
    chainID,
    ownerAddress,
    warpControllerAddress,
    status: "Executed",
  }).jobsResult.data;

  useEffect(() => {
    if (!getWarpExecutedJobsResult) {
      return;
    }
    setWarpExecutedJobCount(getWarpExecutedJobsResult.totalCount);
    setWarpExecutedJobs(getWarpExecutedJobsResult.jobs);
  }, [getWarpExecutedJobsResult]);

  const warpExecutedJobItems =
    warpExecutedJobs.length > 0 ? (
      warpExecutedJobs.map((job) => (
        <Tr
          key={job.id}
          transition="0.25s all"
          bg="white"
          mb="2"
          _hover={{ bg: "gray.100" }}
        >
          <Td borderBottom="none" py="6" borderLeftRadius="2xl">
            <WarpJobLink jobId={job.id} />
          </Td>
          <Td borderBottom="none" py="6" minW="230px" borderRightRadius="2xl">
            <WarpJobDetail jobName={job.name} />
          </Td>
        </Tr>
      ))
    ) : (
      <Tr bg="white" mb="2">
        <Td
          colSpan={4}
          py="6"
          textAlign="center"
          borderBottom="none"
          borderRadius="2xl"
        >
          No Executed orders
        </Td>
      </Tr>
    );

  return (
    <>
      <Box>executed order count {warpExecutedJobCount}</Box>
      {warpExecutedJobCount > 50 ? (
        <Box>
          WARNING! currently UI only shows up to recent 50 jobs, you need to go
          to official Warp UI to see all jobs
        </Box>
      ) : (
        <></>
      )}
      <Box overflowX="auto">
        <Table
          style={{ borderCollapse: "separate", borderSpacing: "0 0.6rem" }}
        >
          <Thead>
            <Tr>
              <Th
                borderBottom="none"
                bg="brand.darkBrown"
                color="white"
                borderLeftRadius="2xl"
              >
                job id
              </Th>
              <Th
                borderBottom="none"
                bg="brand.darkBrown"
                color="white"
                borderRightRadius="2xl"
              >
                detail
              </Th>
            </Tr>
          </Thead>
          <Tbody>{warpExecutedJobItems}</Tbody>
        </Table>
      </Box>
    </>
  );
};
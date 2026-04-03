import { useQuery } from '@tanstack/react-query';
import { getActivity, ActivityEvent } from '../api/activity';

export const useActivity = (
  chainId: number | number[],
  collectionAddr: string,
  tokenId: string,
  eventTypes: string[] = [],
  page: number = 1,
  pageSize: number = 20,
) => {
  return useQuery({
    queryKey: ['activity', chainId, collectionAddr, tokenId, eventTypes, page, pageSize],
    queryFn: () => getActivity(chainId, collectionAddr, tokenId, eventTypes, page, pageSize),
    enabled: !!chainId && (!!collectionAddr || !!tokenId),
  });
};

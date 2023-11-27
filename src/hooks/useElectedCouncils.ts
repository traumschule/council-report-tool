import { ElectedCouncilOrderByInput, GetElectedCouncilsQueryVariables, useGetElectedCouncilsQuery } from '@/api/queries';
import { asElectedCouncil } from '@/types';

export const useElectedCouncils = ({
  ...rest
}: GetElectedCouncilsQueryVariables) => {
  const { data, error, loading } = useGetElectedCouncilsQuery({ variables: { ...rest } });

  return { error, loading, data: data?.electedCouncils.map(asElectedCouncil) };
};

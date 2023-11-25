import * as Types from './baseTypes.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetElectionRoundWithUniqueIdQueryVariables = Types.Exact<{
  where: Types.ElectionRoundWhereUniqueInput;
}>;


export type GetElectionRoundWithUniqueIdQuery = { __typename: 'Query', electionRoundByUniqueInput?: { __typename: 'ElectionRound', id: string, cycleId: number, castVotes: Array<{ __typename: 'CastVote', stake: string, stakeLocked: boolean }>, candidates: Array<{ __typename: 'Candidate', votePower: string, member: { __typename: 'Membership', handle: string } }> } | null };


export const GetElectionRoundWithUniqueIdDocument = gql`
    query GetElectionRoundWithUniqueID($where: ElectionRoundWhereUniqueInput!) {
  electionRoundByUniqueInput(where: $where) {
    id
    cycleId
    castVotes {
      stake
      stakeLocked
    }
    candidates {
      votePower
      member {
        handle
      }
    }
  }
}
    `;

/**
 * __useGetElectionRoundWithUniqueIdQuery__
 *
 * To run a query within a React component, call `useGetElectionRoundWithUniqueIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetElectionRoundWithUniqueIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetElectionRoundWithUniqueIdQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetElectionRoundWithUniqueIdQuery(baseOptions: Apollo.QueryHookOptions<GetElectionRoundWithUniqueIdQuery, GetElectionRoundWithUniqueIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetElectionRoundWithUniqueIdQuery, GetElectionRoundWithUniqueIdQueryVariables>(GetElectionRoundWithUniqueIdDocument, options);
      }
export function useGetElectionRoundWithUniqueIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetElectionRoundWithUniqueIdQuery, GetElectionRoundWithUniqueIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetElectionRoundWithUniqueIdQuery, GetElectionRoundWithUniqueIdQueryVariables>(GetElectionRoundWithUniqueIdDocument, options);
        }
export type GetElectionRoundWithUniqueIdQueryHookResult = ReturnType<typeof useGetElectionRoundWithUniqueIdQuery>;
export type GetElectionRoundWithUniqueIdLazyQueryHookResult = ReturnType<typeof useGetElectionRoundWithUniqueIdLazyQuery>;
export type GetElectionRoundWithUniqueIdQueryResult = Apollo.QueryResult<GetElectionRoundWithUniqueIdQuery, GetElectionRoundWithUniqueIdQueryVariables>;
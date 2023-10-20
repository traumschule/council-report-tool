import * as Types from './baseTypes.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetFundingProposalsQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.RequestFundedEventWhereInput>;
  orderBy?: Types.InputMaybe<Array<Types.RequestFundedEventOrderByInput> | Types.RequestFundedEventOrderByInput>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetFundingProposalsQuery = { __typename: 'Query', requestFundedEvents: Array<{ __typename: 'RequestFundedEvent', amount: string }> };

export type GetFundingProposalTotalCountQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.RequestFundedEventWhereInput>;
}>;


export type GetFundingProposalTotalCountQuery = { __typename: 'Query', requestFundedEventsConnection: { __typename: 'RequestFundedEventConnection', totalCount: number } };


export const GetFundingProposalsDocument = gql`
    query getFundingProposals($where: RequestFundedEventWhereInput, $orderBy: [RequestFundedEventOrderByInput!], $offset: Int, $limit: Int) {
  requestFundedEvents(
    where: $where
    orderBy: $orderBy
    offset: $offset
    limit: $limit
  ) {
    amount
  }
}
    `;

/**
 * __useGetFundingProposalsQuery__
 *
 * To run a query within a React component, call `useGetFundingProposalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFundingProposalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFundingProposalsQuery({
 *   variables: {
 *      where: // value for 'where'
 *      orderBy: // value for 'orderBy'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetFundingProposalsQuery(baseOptions?: Apollo.QueryHookOptions<GetFundingProposalsQuery, GetFundingProposalsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFundingProposalsQuery, GetFundingProposalsQueryVariables>(GetFundingProposalsDocument, options);
      }
export function useGetFundingProposalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFundingProposalsQuery, GetFundingProposalsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFundingProposalsQuery, GetFundingProposalsQueryVariables>(GetFundingProposalsDocument, options);
        }
export type GetFundingProposalsQueryHookResult = ReturnType<typeof useGetFundingProposalsQuery>;
export type GetFundingProposalsLazyQueryHookResult = ReturnType<typeof useGetFundingProposalsLazyQuery>;
export type GetFundingProposalsQueryResult = Apollo.QueryResult<GetFundingProposalsQuery, GetFundingProposalsQueryVariables>;
export const GetFundingProposalTotalCountDocument = gql`
    query getFundingProposalTotalCount($where: RequestFundedEventWhereInput) {
  requestFundedEventsConnection(where: $where) {
    totalCount
  }
}
    `;

/**
 * __useGetFundingProposalTotalCountQuery__
 *
 * To run a query within a React component, call `useGetFundingProposalTotalCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFundingProposalTotalCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFundingProposalTotalCountQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetFundingProposalTotalCountQuery(baseOptions?: Apollo.QueryHookOptions<GetFundingProposalTotalCountQuery, GetFundingProposalTotalCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFundingProposalTotalCountQuery, GetFundingProposalTotalCountQueryVariables>(GetFundingProposalTotalCountDocument, options);
      }
export function useGetFundingProposalTotalCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFundingProposalTotalCountQuery, GetFundingProposalTotalCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFundingProposalTotalCountQuery, GetFundingProposalTotalCountQueryVariables>(GetFundingProposalTotalCountDocument, options);
        }
export type GetFundingProposalTotalCountQueryHookResult = ReturnType<typeof useGetFundingProposalTotalCountQuery>;
export type GetFundingProposalTotalCountLazyQueryHookResult = ReturnType<typeof useGetFundingProposalTotalCountLazyQuery>;
export type GetFundingProposalTotalCountQueryResult = Apollo.QueryResult<GetFundingProposalTotalCountQuery, GetFundingProposalTotalCountQueryVariables>;
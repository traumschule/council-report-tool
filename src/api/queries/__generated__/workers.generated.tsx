import * as Types from './baseTypes.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetTerminatedWorkerQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.TerminatedWorkerEventWhereInput>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetTerminatedWorkerQuery = { __typename: 'Query', terminatedWorkerEvents: Array<{ __typename: 'TerminatedWorkerEvent', groupId: string, workerId: string, createdAt: any, worker: { __typename: 'Worker', membershipId: string } }> };

export type GetTerminatedWorkerTotalCountQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.TerminatedWorkerEventWhereInput>;
}>;


export type GetTerminatedWorkerTotalCountQuery = { __typename: 'Query', terminatedWorkerEventsConnection: { __typename: 'TerminatedWorkerEventConnection', totalCount: number } };

export type GetWorkerExitedQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.WorkerExitedEventWhereInput>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetWorkerExitedQuery = { __typename: 'Query', workerExitedEvents: Array<{ __typename: 'WorkerExitedEvent', createdAt: any, groupId: string, workerId: string, worker: { __typename: 'Worker', membershipId: string } }> };

export type GetWorkerExitedTotalCountQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.WorkerExitedEventWhereInput>;
}>;


export type GetWorkerExitedTotalCountQuery = { __typename: 'Query', workerExitedEventsConnection: { __typename: 'WorkerExitedEventConnection', totalCount: number } };

export type GetOpeningFilledQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.OpeningFilledEventWhereInput>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetOpeningFilledQuery = { __typename: 'Query', openingFilledEvents: Array<{ __typename: 'OpeningFilledEvent', createdAt: any, groupId: string, workersHired: Array<{ __typename: 'Worker', membershipId: string }> }> };

export type GetOpeningFilledTotalCountQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.OpeningFilledEventWhereInput>;
}>;


export type GetOpeningFilledTotalCountQuery = { __typename: 'Query', openingFilledEventsConnection: { __typename: 'OpeningFilledEventConnection', totalCount: number } };


export const GetTerminatedWorkerDocument = gql`
    query getTerminatedWorker($where: TerminatedWorkerEventWhereInput, $limit: Int, $offset: Int) {
  terminatedWorkerEvents(where: $where, limit: $limit, offset: $offset) {
    groupId
    workerId
    createdAt
    __typename
    worker {
      membershipId
    }
  }
}
    `;

/**
 * __useGetTerminatedWorkerQuery__
 *
 * To run a query within a React component, call `useGetTerminatedWorkerQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTerminatedWorkerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTerminatedWorkerQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetTerminatedWorkerQuery(baseOptions?: Apollo.QueryHookOptions<GetTerminatedWorkerQuery, GetTerminatedWorkerQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTerminatedWorkerQuery, GetTerminatedWorkerQueryVariables>(GetTerminatedWorkerDocument, options);
      }
export function useGetTerminatedWorkerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTerminatedWorkerQuery, GetTerminatedWorkerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTerminatedWorkerQuery, GetTerminatedWorkerQueryVariables>(GetTerminatedWorkerDocument, options);
        }
export type GetTerminatedWorkerQueryHookResult = ReturnType<typeof useGetTerminatedWorkerQuery>;
export type GetTerminatedWorkerLazyQueryHookResult = ReturnType<typeof useGetTerminatedWorkerLazyQuery>;
export type GetTerminatedWorkerQueryResult = Apollo.QueryResult<GetTerminatedWorkerQuery, GetTerminatedWorkerQueryVariables>;
export const GetTerminatedWorkerTotalCountDocument = gql`
    query getTerminatedWorkerTotalCount($where: TerminatedWorkerEventWhereInput) {
  terminatedWorkerEventsConnection(where: $where) {
    totalCount
  }
}
    `;

/**
 * __useGetTerminatedWorkerTotalCountQuery__
 *
 * To run a query within a React component, call `useGetTerminatedWorkerTotalCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTerminatedWorkerTotalCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTerminatedWorkerTotalCountQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetTerminatedWorkerTotalCountQuery(baseOptions?: Apollo.QueryHookOptions<GetTerminatedWorkerTotalCountQuery, GetTerminatedWorkerTotalCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTerminatedWorkerTotalCountQuery, GetTerminatedWorkerTotalCountQueryVariables>(GetTerminatedWorkerTotalCountDocument, options);
      }
export function useGetTerminatedWorkerTotalCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTerminatedWorkerTotalCountQuery, GetTerminatedWorkerTotalCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTerminatedWorkerTotalCountQuery, GetTerminatedWorkerTotalCountQueryVariables>(GetTerminatedWorkerTotalCountDocument, options);
        }
export type GetTerminatedWorkerTotalCountQueryHookResult = ReturnType<typeof useGetTerminatedWorkerTotalCountQuery>;
export type GetTerminatedWorkerTotalCountLazyQueryHookResult = ReturnType<typeof useGetTerminatedWorkerTotalCountLazyQuery>;
export type GetTerminatedWorkerTotalCountQueryResult = Apollo.QueryResult<GetTerminatedWorkerTotalCountQuery, GetTerminatedWorkerTotalCountQueryVariables>;
export const GetWorkerExitedDocument = gql`
    query getWorkerExited($where: WorkerExitedEventWhereInput, $limit: Int, $offset: Int) {
  workerExitedEvents(where: $where, limit: $limit, offset: $offset) {
    createdAt
    groupId
    workerId
    __typename
    worker {
      membershipId
    }
  }
}
    `;

/**
 * __useGetWorkerExitedQuery__
 *
 * To run a query within a React component, call `useGetWorkerExitedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkerExitedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkerExitedQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetWorkerExitedQuery(baseOptions?: Apollo.QueryHookOptions<GetWorkerExitedQuery, GetWorkerExitedQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWorkerExitedQuery, GetWorkerExitedQueryVariables>(GetWorkerExitedDocument, options);
      }
export function useGetWorkerExitedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWorkerExitedQuery, GetWorkerExitedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWorkerExitedQuery, GetWorkerExitedQueryVariables>(GetWorkerExitedDocument, options);
        }
export type GetWorkerExitedQueryHookResult = ReturnType<typeof useGetWorkerExitedQuery>;
export type GetWorkerExitedLazyQueryHookResult = ReturnType<typeof useGetWorkerExitedLazyQuery>;
export type GetWorkerExitedQueryResult = Apollo.QueryResult<GetWorkerExitedQuery, GetWorkerExitedQueryVariables>;
export const GetWorkerExitedTotalCountDocument = gql`
    query getWorkerExitedTotalCount($where: WorkerExitedEventWhereInput) {
  workerExitedEventsConnection(where: $where) {
    totalCount
  }
}
    `;

/**
 * __useGetWorkerExitedTotalCountQuery__
 *
 * To run a query within a React component, call `useGetWorkerExitedTotalCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkerExitedTotalCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkerExitedTotalCountQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetWorkerExitedTotalCountQuery(baseOptions?: Apollo.QueryHookOptions<GetWorkerExitedTotalCountQuery, GetWorkerExitedTotalCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWorkerExitedTotalCountQuery, GetWorkerExitedTotalCountQueryVariables>(GetWorkerExitedTotalCountDocument, options);
      }
export function useGetWorkerExitedTotalCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWorkerExitedTotalCountQuery, GetWorkerExitedTotalCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWorkerExitedTotalCountQuery, GetWorkerExitedTotalCountQueryVariables>(GetWorkerExitedTotalCountDocument, options);
        }
export type GetWorkerExitedTotalCountQueryHookResult = ReturnType<typeof useGetWorkerExitedTotalCountQuery>;
export type GetWorkerExitedTotalCountLazyQueryHookResult = ReturnType<typeof useGetWorkerExitedTotalCountLazyQuery>;
export type GetWorkerExitedTotalCountQueryResult = Apollo.QueryResult<GetWorkerExitedTotalCountQuery, GetWorkerExitedTotalCountQueryVariables>;
export const GetOpeningFilledDocument = gql`
    query getOpeningFilled($where: OpeningFilledEventWhereInput, $limit: Int, $offset: Int) {
  openingFilledEvents(where: $where, limit: $limit, offset: $offset) {
    createdAt
    groupId
    workersHired {
      membershipId
    }
  }
}
    `;

/**
 * __useGetOpeningFilledQuery__
 *
 * To run a query within a React component, call `useGetOpeningFilledQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOpeningFilledQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOpeningFilledQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetOpeningFilledQuery(baseOptions?: Apollo.QueryHookOptions<GetOpeningFilledQuery, GetOpeningFilledQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOpeningFilledQuery, GetOpeningFilledQueryVariables>(GetOpeningFilledDocument, options);
      }
export function useGetOpeningFilledLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOpeningFilledQuery, GetOpeningFilledQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOpeningFilledQuery, GetOpeningFilledQueryVariables>(GetOpeningFilledDocument, options);
        }
export type GetOpeningFilledQueryHookResult = ReturnType<typeof useGetOpeningFilledQuery>;
export type GetOpeningFilledLazyQueryHookResult = ReturnType<typeof useGetOpeningFilledLazyQuery>;
export type GetOpeningFilledQueryResult = Apollo.QueryResult<GetOpeningFilledQuery, GetOpeningFilledQueryVariables>;
export const GetOpeningFilledTotalCountDocument = gql`
    query getOpeningFilledTotalCount($where: OpeningFilledEventWhereInput) {
  openingFilledEventsConnection(where: $where) {
    totalCount
  }
}
    `;

/**
 * __useGetOpeningFilledTotalCountQuery__
 *
 * To run a query within a React component, call `useGetOpeningFilledTotalCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOpeningFilledTotalCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOpeningFilledTotalCountQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetOpeningFilledTotalCountQuery(baseOptions?: Apollo.QueryHookOptions<GetOpeningFilledTotalCountQuery, GetOpeningFilledTotalCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOpeningFilledTotalCountQuery, GetOpeningFilledTotalCountQueryVariables>(GetOpeningFilledTotalCountDocument, options);
      }
export function useGetOpeningFilledTotalCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOpeningFilledTotalCountQuery, GetOpeningFilledTotalCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOpeningFilledTotalCountQuery, GetOpeningFilledTotalCountQueryVariables>(GetOpeningFilledTotalCountDocument, options);
        }
export type GetOpeningFilledTotalCountQueryHookResult = ReturnType<typeof useGetOpeningFilledTotalCountQuery>;
export type GetOpeningFilledTotalCountLazyQueryHookResult = ReturnType<typeof useGetOpeningFilledTotalCountLazyQuery>;
export type GetOpeningFilledTotalCountQueryResult = Apollo.QueryResult<GetOpeningFilledTotalCountQuery, GetOpeningFilledTotalCountQueryVariables>;
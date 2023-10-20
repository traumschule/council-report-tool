import * as Types from './baseTypes.generated';

import { gql } from '@apollo/client';
import { MemberFieldsFragmentDoc } from './members.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetElectedCouncilsQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.ElectedCouncilWhereInput>;
  orderBy?: Types.InputMaybe<Array<Types.ElectedCouncilOrderByInput> | Types.ElectedCouncilOrderByInput>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetElectedCouncilsQuery = { __typename: 'Query', electedCouncils: Array<{ __typename: 'ElectedCouncil', id: string, electedAtBlock: number, endedAtBlock?: number | null, electedAtTime: any, endedAtTime?: any | null, electedAtNetwork: Types.Network, endedAtNetwork?: Types.Network | null, councilElections: Array<{ __typename: 'ElectionRound', cycleId: number }>, councilMembers: Array<{ __typename: 'CouncilMember', id: string, unpaidReward: string, stake: string, member: { __typename: 'Membership', id: string, rootAccount: string, controllerAccount: string, boundAccounts: Array<string>, handle: string, isVerified: boolean, isFoundingMember: boolean, isCouncilMember: boolean, inviteCount: number, createdAt: any, councilMembers: Array<{ __typename: 'CouncilMember' }>, metadata: { __typename: 'MemberMetadata', name?: string | null, about?: string | null, avatar?: { __typename: 'AvatarObject' } | { __typename: 'AvatarUri', avatarUri: string } | null }, roles: Array<{ __typename: 'Worker', id: string, createdAt: any, isLead: boolean, group: { __typename: 'WorkingGroup', name: string } }>, stakingaccountaddedeventmember?: Array<{ __typename: 'StakingAccountAddedEvent', createdAt: any, inBlock: number, network: Types.Network, account: string }> | null } }> }> };

export type GetCouncilRewardQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.RewardPaymentEventWhereInput>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetCouncilRewardQuery = { __typename: 'Query', rewardPaymentEvents: Array<{ __typename: 'RewardPaymentEvent', paidBalance: string, inBlock: number, councilMember: { __typename: 'CouncilMember', memberId: string } }> };

export type GetCouncilRewardTotalCountQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.RewardPaymentEventWhereInput>;
}>;


export type GetCouncilRewardTotalCountQuery = { __typename: 'Query', rewardPaymentEventsConnection: { __typename: 'RewardPaymentEventConnection', totalCount: number } };

export type GetCouncilReFillQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.BudgetRefillEventWhereInput>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetCouncilReFillQuery = { __typename: 'Query', budgetRefillEvents: Array<{ __typename: 'BudgetRefillEvent', balance: string, inBlock: number }> };

export type GetCouncilReFillTotalCountQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.BudgetRefillEventWhereInput>;
}>;


export type GetCouncilReFillTotalCountQuery = { __typename: 'Query', budgetRefillEventsConnection: { __typename: 'BudgetRefillEventConnection', totalCount: number } };

export type ElectedCouncilFieldsFragment = { __typename: 'ElectedCouncil', id: string, electedAtBlock: number, endedAtBlock?: number | null, electedAtTime: any, endedAtTime?: any | null, electedAtNetwork: Types.Network, endedAtNetwork?: Types.Network | null, councilElections: Array<{ __typename: 'ElectionRound', cycleId: number }>, councilMembers: Array<{ __typename: 'CouncilMember', id: string, unpaidReward: string, stake: string, member: { __typename: 'Membership', id: string, rootAccount: string, controllerAccount: string, boundAccounts: Array<string>, handle: string, isVerified: boolean, isFoundingMember: boolean, isCouncilMember: boolean, inviteCount: number, createdAt: any, councilMembers: Array<{ __typename: 'CouncilMember' }>, metadata: { __typename: 'MemberMetadata', name?: string | null, about?: string | null, avatar?: { __typename: 'AvatarObject' } | { __typename: 'AvatarUri', avatarUri: string } | null }, roles: Array<{ __typename: 'Worker', id: string, createdAt: any, isLead: boolean, group: { __typename: 'WorkingGroup', name: string } }>, stakingaccountaddedeventmember?: Array<{ __typename: 'StakingAccountAddedEvent', createdAt: any, inBlock: number, network: Types.Network, account: string }> | null } }> };

export type CouncilMemberFieldsFragment = { __typename: 'CouncilMember', id: string, unpaidReward: string, stake: string, member: { __typename: 'Membership', id: string, rootAccount: string, controllerAccount: string, boundAccounts: Array<string>, handle: string, isVerified: boolean, isFoundingMember: boolean, isCouncilMember: boolean, inviteCount: number, createdAt: any, councilMembers: Array<{ __typename: 'CouncilMember' }>, metadata: { __typename: 'MemberMetadata', name?: string | null, about?: string | null, avatar?: { __typename: 'AvatarObject' } | { __typename: 'AvatarUri', avatarUri: string } | null }, roles: Array<{ __typename: 'Worker', id: string, createdAt: any, isLead: boolean, group: { __typename: 'WorkingGroup', name: string } }>, stakingaccountaddedeventmember?: Array<{ __typename: 'StakingAccountAddedEvent', createdAt: any, inBlock: number, network: Types.Network, account: string }> | null } };

export const CouncilMemberFieldsFragmentDoc = gql`
    fragment CouncilMemberFields on CouncilMember {
  id
  member {
    ...MemberFields
    councilMembers {
      __typename
    }
  }
  unpaidReward
  stake
}
    ${MemberFieldsFragmentDoc}`;
export const ElectedCouncilFieldsFragmentDoc = gql`
    fragment ElectedCouncilFields on ElectedCouncil {
  id
  electedAtBlock
  endedAtBlock
  electedAtTime
  endedAtTime
  electedAtNetwork
  endedAtNetwork
  councilElections {
    cycleId
  }
  councilMembers {
    ...CouncilMemberFields
  }
}
    ${CouncilMemberFieldsFragmentDoc}`;
export const GetElectedCouncilsDocument = gql`
    query GetElectedCouncils($where: ElectedCouncilWhereInput, $orderBy: [ElectedCouncilOrderByInput!], $offset: Int, $limit: Int) {
  electedCouncils(
    where: $where
    orderBy: $orderBy
    offset: $offset
    limit: $limit
  ) {
    ...ElectedCouncilFields
    __typename
  }
}
    ${ElectedCouncilFieldsFragmentDoc}`;

/**
 * __useGetElectedCouncilsQuery__
 *
 * To run a query within a React component, call `useGetElectedCouncilsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetElectedCouncilsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetElectedCouncilsQuery({
 *   variables: {
 *      where: // value for 'where'
 *      orderBy: // value for 'orderBy'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetElectedCouncilsQuery(baseOptions?: Apollo.QueryHookOptions<GetElectedCouncilsQuery, GetElectedCouncilsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetElectedCouncilsQuery, GetElectedCouncilsQueryVariables>(GetElectedCouncilsDocument, options);
      }
export function useGetElectedCouncilsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetElectedCouncilsQuery, GetElectedCouncilsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetElectedCouncilsQuery, GetElectedCouncilsQueryVariables>(GetElectedCouncilsDocument, options);
        }
export type GetElectedCouncilsQueryHookResult = ReturnType<typeof useGetElectedCouncilsQuery>;
export type GetElectedCouncilsLazyQueryHookResult = ReturnType<typeof useGetElectedCouncilsLazyQuery>;
export type GetElectedCouncilsQueryResult = Apollo.QueryResult<GetElectedCouncilsQuery, GetElectedCouncilsQueryVariables>;
export const GetCouncilRewardDocument = gql`
    query GetCouncilReward($where: RewardPaymentEventWhereInput, $limit: Int, $offset: Int) {
  rewardPaymentEvents(
    where: $where
    limit: $limit
    offset: $offset
    orderBy: createdAt_ASC
  ) {
    paidBalance
    inBlock
    councilMember {
      memberId
    }
  }
}
    `;

/**
 * __useGetCouncilRewardQuery__
 *
 * To run a query within a React component, call `useGetCouncilRewardQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCouncilRewardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCouncilRewardQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetCouncilRewardQuery(baseOptions?: Apollo.QueryHookOptions<GetCouncilRewardQuery, GetCouncilRewardQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCouncilRewardQuery, GetCouncilRewardQueryVariables>(GetCouncilRewardDocument, options);
      }
export function useGetCouncilRewardLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCouncilRewardQuery, GetCouncilRewardQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCouncilRewardQuery, GetCouncilRewardQueryVariables>(GetCouncilRewardDocument, options);
        }
export type GetCouncilRewardQueryHookResult = ReturnType<typeof useGetCouncilRewardQuery>;
export type GetCouncilRewardLazyQueryHookResult = ReturnType<typeof useGetCouncilRewardLazyQuery>;
export type GetCouncilRewardQueryResult = Apollo.QueryResult<GetCouncilRewardQuery, GetCouncilRewardQueryVariables>;
export const GetCouncilRewardTotalCountDocument = gql`
    query GetCouncilRewardTotalCount($where: RewardPaymentEventWhereInput) {
  rewardPaymentEventsConnection(where: $where) {
    totalCount
  }
}
    `;

/**
 * __useGetCouncilRewardTotalCountQuery__
 *
 * To run a query within a React component, call `useGetCouncilRewardTotalCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCouncilRewardTotalCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCouncilRewardTotalCountQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetCouncilRewardTotalCountQuery(baseOptions?: Apollo.QueryHookOptions<GetCouncilRewardTotalCountQuery, GetCouncilRewardTotalCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCouncilRewardTotalCountQuery, GetCouncilRewardTotalCountQueryVariables>(GetCouncilRewardTotalCountDocument, options);
      }
export function useGetCouncilRewardTotalCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCouncilRewardTotalCountQuery, GetCouncilRewardTotalCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCouncilRewardTotalCountQuery, GetCouncilRewardTotalCountQueryVariables>(GetCouncilRewardTotalCountDocument, options);
        }
export type GetCouncilRewardTotalCountQueryHookResult = ReturnType<typeof useGetCouncilRewardTotalCountQuery>;
export type GetCouncilRewardTotalCountLazyQueryHookResult = ReturnType<typeof useGetCouncilRewardTotalCountLazyQuery>;
export type GetCouncilRewardTotalCountQueryResult = Apollo.QueryResult<GetCouncilRewardTotalCountQuery, GetCouncilRewardTotalCountQueryVariables>;
export const GetCouncilReFillDocument = gql`
    query GetCouncilReFill($where: BudgetRefillEventWhereInput, $limit: Int, $offset: Int) {
  budgetRefillEvents(
    where: $where
    limit: $limit
    offset: $offset
    orderBy: createdAt_ASC
  ) {
    balance
    inBlock
  }
}
    `;

/**
 * __useGetCouncilReFillQuery__
 *
 * To run a query within a React component, call `useGetCouncilReFillQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCouncilReFillQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCouncilReFillQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetCouncilReFillQuery(baseOptions?: Apollo.QueryHookOptions<GetCouncilReFillQuery, GetCouncilReFillQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCouncilReFillQuery, GetCouncilReFillQueryVariables>(GetCouncilReFillDocument, options);
      }
export function useGetCouncilReFillLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCouncilReFillQuery, GetCouncilReFillQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCouncilReFillQuery, GetCouncilReFillQueryVariables>(GetCouncilReFillDocument, options);
        }
export type GetCouncilReFillQueryHookResult = ReturnType<typeof useGetCouncilReFillQuery>;
export type GetCouncilReFillLazyQueryHookResult = ReturnType<typeof useGetCouncilReFillLazyQuery>;
export type GetCouncilReFillQueryResult = Apollo.QueryResult<GetCouncilReFillQuery, GetCouncilReFillQueryVariables>;
export const GetCouncilReFillTotalCountDocument = gql`
    query GetCouncilReFillTotalCount($where: BudgetRefillEventWhereInput) {
  budgetRefillEventsConnection(where: $where) {
    totalCount
  }
}
    `;

/**
 * __useGetCouncilReFillTotalCountQuery__
 *
 * To run a query within a React component, call `useGetCouncilReFillTotalCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCouncilReFillTotalCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCouncilReFillTotalCountQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetCouncilReFillTotalCountQuery(baseOptions?: Apollo.QueryHookOptions<GetCouncilReFillTotalCountQuery, GetCouncilReFillTotalCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCouncilReFillTotalCountQuery, GetCouncilReFillTotalCountQueryVariables>(GetCouncilReFillTotalCountDocument, options);
      }
export function useGetCouncilReFillTotalCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCouncilReFillTotalCountQuery, GetCouncilReFillTotalCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCouncilReFillTotalCountQuery, GetCouncilReFillTotalCountQueryVariables>(GetCouncilReFillTotalCountDocument, options);
        }
export type GetCouncilReFillTotalCountQueryHookResult = ReturnType<typeof useGetCouncilReFillTotalCountQuery>;
export type GetCouncilReFillTotalCountLazyQueryHookResult = ReturnType<typeof useGetCouncilReFillTotalCountLazyQuery>;
export type GetCouncilReFillTotalCountQueryResult = Apollo.QueryResult<GetCouncilReFillTotalCountQuery, GetCouncilReFillTotalCountQueryVariables>;
/*
 * Copyright 2024 Baidu, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import { CommonResponse } from "./Common"
import { AutoBuildPolicyType, ElementType, IndexState, IndexStructureType, IndexType, InvertedIndexFieldAttribute, MetricType } from "./Const"

export type IndexParams = Record<string, any>

export interface AutoBuildPolicy {
    policyType: string
}

export interface AutoBuildTimingPolicy extends AutoBuildPolicy{
    timing: string
}

export interface AutoBuildPeriodicalPolicy extends AutoBuildPolicy{
    timing?: string,
    periodicalInSecond: number
}

export interface AutoBuildIncrementPolicy extends AutoBuildPolicy{
    rowCountIncrement?: number,
    rowCountIncrementRatio?: number
}

export function AutoBuildTiming(timing: string): AutoBuildPolicy {
    let policy : AutoBuildTimingPolicy = {policyType: AutoBuildPolicyType.Timing, timing: timing}
    return policy
}

export function AutoBuildPeriodical(timing: string, periodS: number): AutoBuildPolicy {
    let policy : AutoBuildPeriodicalPolicy = {policyType: AutoBuildPolicyType.Timing, periodicalInSecond: periodS}
    if (timing != "") {
        policy.timing = timing
    }
    return policy
}

export function AutoBuildIncrement(rowCountIncrement: number, rowCountIncrementRatio: number): AutoBuildPolicy {
    let policy : AutoBuildIncrementPolicy = {policyType: AutoBuildPolicyType.Timing}
    if (rowCountIncrement != 0) {
        policy.rowCountIncrement = rowCountIncrement
    }
    if (rowCountIncrementRatio != 0) {
        policy.rowCountIncrementRatio = rowCountIncrementRatio
    }
    return policy
}

export type FilteringIndexField = {
    field: string
    indexStructureType: IndexStructureType
}

export interface IndexSchema {
    indexName: string
    indexType: IndexType
    metricType?: MetricType
    params?: IndexParams
    field?: string
    fields?: string[] | FilteringIndexField[]
    fieldAttributes? : InvertedIndexFieldAttribute[]
    state?: IndexState
    autoBuild?: boolean
    autoBuildPolicy?: AutoBuildPolicy
}

export interface DescIndexResponse extends CommonResponse {
    index: IndexSchema
}

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

import { CommonResponse, CommonNamespaceArgs } from "./Common";
import { FieldType, PartitionType, TableState, ElementType } from "./Const";
import { IndexSchema } from "./MochowIndex";

export interface PartitionParams {
    partitionType: PartitionType
    partitionNum: number
}

export interface FieldSchema {
    fieldName: string
    fieldType: FieldType
    primaryKey?: boolean
    partitionKey?: boolean
    autoIncrement?: boolean
    notNull?: boolean
    dimension?: number
    elementType?: ElementType
    maxCapacity?: number
}

export interface TableSchema {
    fields: FieldSchema[]
    indexes: IndexSchema[]
}

export interface CreateTableArgs extends CommonNamespaceArgs {
    description?: string;
    replication: number;
    partition: PartitionParams;
    enableDynamicField?: boolean;
    schema: TableSchema;
}

export interface AddFieldArgs extends CommonNamespaceArgs {
    schema: TableSchema;
}

export interface ListTableResponse extends CommonResponse {
    tables: string[]
}

export interface TableDescription {
    database: string
    table: string
    createTime: string
    description: string
    replication: number
    partition: PartitionParams
    enableDynamicField: boolean
    state: TableState
    aliases: string[]
    schema: TableSchema
}

export interface ShowTableStatsResponse extends CommonResponse{
    rowCount: number
    memorySizeInByte: number
    diskSizeInByte: number
}

export interface DescTableResponse extends CommonResponse {
    table: TableDescription
}

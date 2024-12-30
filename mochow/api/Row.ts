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

import { HttpBaseClient } from '../MochowClient'
import {
    Row,
    CommonResponse,
    Constructor,
    ANNSearchParams,
    BatchANNSearchParams,
    BatchSearchRowResponse,
    SearchRowResponse,
    SelectRowResponse,
    InsertRowsResponse,
    QueryRowResponse,
    UpsertRowsResponse,
    PrimaryKey,
    PartitionKey,
    Marker,
    UpdateFields,
    ReadConsistency,
    VectorSearchArgs,
    BM25SearchArgs,
    HybridSearchArgs,
    searchRequest,
    BatchSearchRowResult,
    SearchRowResult
} from '../types'

/**
 *
 * @param {Constructor<HttpBaseClient>} Base - The base class to be extended.
 * @returns {class} - The extended class with additional methods for collection management.
 *
 * @method insertRows - insert rows
 * @method upsertRows - upsert rows
 * @method deleteRow - delete one row
 * @method queryRow - query row
 * @method searchRow - search one row 
 * @method batchSearchRows - search rows
 * @method updateRow - update one row
 */
export function Row<T extends Constructor<HttpBaseClient>>(Base: T) {
    return class extends Base {
        get rowPrefix() {
            return '/row'
        }
        async insertRows(
            database: string,
            table: string,
            rows: Record<string, any>[]) {
            const url = `${this.rowPrefix}`
            const params = { insert: '' }
            const data = {
                "database": database,
                "table": table,
                "rows": rows
            }
            return await this.POST<InsertRowsResponse>(url, params, data)
        }
        async upsertRows(
            database: string,
            table: string,
            rows: Row[]) {
            const url = `${this.rowPrefix}`
            const params = { upsert: '' }
            const data = {
                "database": database,
                "table": table,
                "rows": rows
            }
            return await this.POST<UpsertRowsResponse>(url, params, data)
        }
        async deleteRow(
            database: string,
            table: string,
            primaryKey?: PrimaryKey,
            partitionKey?: PartitionKey,
            filter?: string) {
            const url = `${this.rowPrefix}`
            const params = { delete: '' }
            let data = {
                "database": database,
                "table": table,
                "primaryKey": primaryKey,
                "partitionKey": partitionKey,
                "filter": filter
            }
            return await this.POST<CommonResponse>(url, params, data)
        }
        async queryRow(
            database: string,
            table: string,
            primaryKey: PrimaryKey,
            partitionKey?: PartitionKey,
            projections?: string[],
            retrieveVector: boolean = false,
            readConsistency: ReadConsistency = ReadConsistency.EVENTUAL) {
            const url = `${this.rowPrefix}`
            const params = { query: '' }
            const data = {
                "database": database,
                "table": table,
                "primaryKey": primaryKey,
                "partitionKey": partitionKey,
                "projections": projections,
                "retrieveVector": retrieveVector,
                "readConsistency": readConsistency
            }
            return await this.POST<QueryRowResponse>(url, params, data)
        }
        async searchRow(
            database: string,
            table: string,
            anns: ANNSearchParams,
            partitionKey?: PartitionKey,
            projections?: string[],
            retrieveVector: boolean = false,
            readConsistency: ReadConsistency = ReadConsistency.EVENTUAL) {
            const url = `${this.rowPrefix}`
            const params = { search: '' }
            const data = {
                "database": database,
                "table": table,
                "anns": anns,
                "partitionKey": partitionKey,
                "projections": projections,
                "retrieveVector": retrieveVector,
                "readConsistency": readConsistency
            }
            return await this.POST<SearchRowResponse>(url, params, data)
        }
        async batchSearchRows(
            database: string,
            table: string,
            anns: BatchANNSearchParams,
            partitionKey?: PartitionKey,
            projections?: string[],
            retrieveVector: boolean = false,
            readConsistency: ReadConsistency = ReadConsistency.EVENTUAL
        ) {
            const url = `${this.rowPrefix}`
            const params = { batchSearch: '' }
            const data = {
                "database": database,
                "table": table,
                "anns": anns,
                "partitionKey": partitionKey,
                "retrieveVector": retrieveVector,
                "projections": projections,
                "readConsistency": readConsistency
            }
            return await this.POST<BatchSearchRowResponse>(url, params, data)
        }
        async updateRow(
            database: string,
            table: string,
            primaryKey?: PrimaryKey,
            partitionKey?: PartitionKey,
            update?: UpdateFields,
        ) {
            const url = `${this.rowPrefix}`
            const params = { update: '' }
            const data = {
                "database": database,
                "table": table,
                "partitionKey": partitionKey,
                "primaryKey": primaryKey,
                "update": update,
            }
            return await this.POST<CommonResponse>(url, params, data)
        }
        async selectRows(
            database: string,
            table: string,
            filter?: string,
            marker?: Marker,
            projections?: string[],
            limit: number = 10,
            readConsistency: ReadConsistency = ReadConsistency.EVENTUAL
        ) {
            const url = `${this.rowPrefix}`
            const params = { select: '' }
            const data = {
                "database": database,
                "table": table,
                "filter": filter,
                "marker": marker,
                "projections": projections,
                "limit": limit,
                "readConsistency": readConsistency
            }
            return await this.POST<SelectRowResponse>(url, params, data)
        } 
        async vectorSearch(args :VectorSearchArgs) {
            return this.search(args.database, args.table, args.request)
        } 
        async bm25Search(args :BM25SearchArgs) {
            return this.search(args.database, args.table, args.request)
        }
        async hybridSearch(args :HybridSearchArgs) {
            return this.search(args.database, args.table, args.request)
        }
        async search(database :string, table :string, request :searchRequest) {
            let data = request.toDict()
            data["database"] = database
            data["table"] = table
            const url = `${this.rowPrefix}`
            let params : Record<string, string> = {}
            params[request.requestType()] = ''
            if (request.isBatch()) {
                return await this.POST<BatchSearchRowResponse>(url, params, data)
            } else {
                return await this.POST<SearchRowResponse>(url, params, data)
            }

        
        }
    }
}

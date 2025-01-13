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
    BatchSearchResponse,
    SearchResponse,
    SelectResponse,
    InsertArgs,
    InsertResponse,
    DeleteArgs,
    QueryResponse,
    BatchQueryResponse,
    UpsertResponse,
    VectorSearchArgs,
    BM25SearchArgs,
    HybridSearchArgs,
    searchRequest,
    UpsertArgs,
    QueryArgs,
    BatchQueryArgs,
    BatchSearchArgs,
    UpdateArgs,
    SelectArgs
} from '../types'

/**
 *
 * @param {Constructor<HttpBaseClient>} Base - The base class to be extended.
 * @returns {class} - The extended class with additional methods for collection management.
 *
 * @method insert - insert rows
 * @method upsert - upsert rows
 * @method delete - delete one row or batch delete with filter
 * @method query - query one row
 * @method batchQuery - query rows with multi keys
 * @method vectorSearch - search with vector
 * @method bm25Search - search with bm25
 * @method hybridSearch - hybrid search
 * @method batchSearch - search rows
 * @method update - update one row
 * @method select - select rows with filter
 */
export function Row<T extends Constructor<HttpBaseClient>>(Base: T) {
    return class extends Base {
        get rowPrefix() {
            return "/row";
        }
        async insert(args: InsertArgs) {
            const url = `${this.rowPrefix}`;
            const params = { insert: "" };
            return await this.POST<InsertResponse>(url, params, args);
        }
        async upsert(args: UpsertArgs) {
            const url = `${this.rowPrefix}`;
            const params = { upsert: "" };
            return await this.POST<UpsertResponse>(url, params, args);
        }
        async delete(args: DeleteArgs) {
            const url = `${this.rowPrefix}`;
            const params = { delete: "" };
            return await this.POST<CommonResponse>(url, params, args);
        }
        async query(args: QueryArgs) {
            const url = `${this.rowPrefix}`;
            const params = { query: "" };
            return await this.POST<QueryResponse>(url, params, args);
        }
        async batchQuery(args: BatchQueryArgs) {
            const url = `${this.rowPrefix}`;
            const params = { batchQuery: "" };
            return await this.POST<BatchQueryResponse>(url, params, args);
        }
        async batchSearch(args: BatchSearchArgs) {
            const url = `${this.rowPrefix}`;
            const params = { batchSearch: "" };
            return await this.POST<BatchSearchResponse>(url, params, args);
        }
        async update(args: UpdateArgs) {
            const url = `${this.rowPrefix}`;
            const params = { update: "" };
            return await this.POST<CommonResponse>(url, params, args);
        }
        async select(args: SelectArgs) {
            const url = `${this.rowPrefix}`;
            const params = { select: "" };
            return await this.POST<SelectResponse>(url, params, args);
        }
        async vectorSearch(args: VectorSearchArgs) {
            return this.search(args.database, args.table, args.request);
        }
        async bm25Search(args: BM25SearchArgs) {
            return this.search(args.database, args.table, args.request);
        }
        async hybridSearch(args: HybridSearchArgs) {
            return this.search(args.database, args.table, args.request);
        }
        async search(database: string, table: string, request: searchRequest) {
            let data = request.toDict();
            data["database"] = database;
            data["table"] = table;
            const url = `${this.rowPrefix}`;
            let params: Record<string, string> = {};
            params[request.requestType()] = "";
            if (request.isBatch()) {
                return await this.POST<BatchSearchResponse>(url, params, data);
            } else {
                return await this.POST<SearchResponse>(url, params, data);
            }
        }
    };
}
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
    CommonResponse,
    Constructor,
    DescIndexResponse,
    IndexSchema,
} from '../types'

/**
 *
 * @param {Constructor<HttpBaseClient>} Base - The base class to be extended.
 * @returns {class} - The extended class with additional methods for collection management.
 *
 * @method createIndex - create indexes for table
 * @method dropIndex - drop one index.
 * @method descIndex - desc one index, return index schema.
 * @method modifyIndex - change one index, now for modify auto build policy
 * @method rebuildIndex - rebuild one index
 */
export function Index<T extends Constructor<HttpBaseClient>>(Base: T) {
    return class extends Base {
        get indexPrefix() {
            return '/index'
        }
        async createIndex(database: string,
            table: string,
            indexes: IndexSchema[]) {
            const url = `${this.indexPrefix}`
            const params = { create: '' }
            const data = {
                "database": database,
                "table": table,
                "indexes": indexes
            }
            return await this.POST<CommonResponse>(url, params, data)
        }
        async dropIndex(database: string, table: string, indexName:string) {
            const url = `${this.indexPrefix}`
            const data = { "database": database, "table": table , "indexName" : indexName}
            return await this.DELETE<CommonResponse>(url, {}, data)
        }
        async descIndex(database: string, table: string, indexName: string) {
            const url = `${this.indexPrefix}`
            const params = { desc: '' }
            const data = { "database": database, "table": table, "indexName":indexName }
            return await this.POST<DescIndexResponse>(url, params, data)
        }
        async modifyIndex(database: string, table: string, indexSchema : IndexSchema) {
            const url = `${this.indexPrefix}`
            const params = { modify: '' }
            const data = { "database": database, "table": table , "index": indexSchema}
            return await this.POST<CommonResponse>(url, params, data)
        }
        async rebuildIndex(database: string, table: string, indexName: string) {
            const url = `${this.indexPrefix}`
            const params = { rebuild: '' }
            const data = { "database": database, "table": table, "indexName": indexName }
            return await this.POST<CommonResponse>(url, params, data)
        }
    }
}
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
    ListDatabaseResponse,
} from '../types'

/**
 *
 * @param {Constructor<HttpBaseClient>} Base - The base class to be extended.
 * @returns {class} - The extended class with additional methods for collection management.
 *
 * @method listDatabases - Lists all databases.
 * @method createDatabase - Create one database.
 * @method dropDatabases - drop one database.
 */
export function Database<T extends Constructor<HttpBaseClient>>(Base: T) {
    return class extends Base {
        get databasePrefix() {
            return '/database'
        }

        async listDatabases() {
            const url = `${this.databasePrefix}`
            const params = { list : '' }
            return await this.POST<ListDatabaseResponse>(url, params, {})
        }

        async createDatabase(databaseName: string) {
            const url = `${this.databasePrefix}`
            const params = { create : '' }
            const data = { database: databaseName}
            return await this.POST<CommonResponse>(url, params, data)
        }

        async dropDatabases(databaseName: string) {
            const url = `${this.databasePrefix}`
            const data = { database: databaseName}
            return await this.DELETE<CommonResponse>(url, {}, data)
        }
    }
}

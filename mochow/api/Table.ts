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
    AddFieldArgs,
    CommonResponse,
    Constructor,
    CreateTableArgs,
    DescTableResponse,
    ListTableResponse,
    ShowTableStatsResponse,
} from '../types'

/**
 *
 * @param {Constructor<HttpBaseClient>} Base - The base class to be extended.
 * @returns {class} - The extended class with additional methods for collection management.
 *
 * @method createTable - create one table
 * @method dropTable - drop one database.
 * @method listTables - list all tables.
 * @method descTable - desc one table.
 * @method addField - add one field.
 * @method aliasTable - alias one table.
 * @method unaliasTable - unalias one table.
 * @method showTableStats - show table stats.
 */
export function Table<T extends Constructor<HttpBaseClient>>(Base: T) {
    return class extends Base {
        get tablePrefix() {
            return "/table";
        }
        async createTable(args: CreateTableArgs) {
            const url = `${this.tablePrefix}`;
            const params = { create: "" };
            return await this.POST<CommonResponse>(url, params, args);
        }
        async dropTable(database: string, table: string) {
            const url = `${this.tablePrefix}`;
            const data = { database: database, table: table };
            return await this.DELETE<CommonResponse>(url, {}, data);
        }
        async listTables(database: string) {
            const url = `${this.tablePrefix}`;
            const params = { list: "" };
            const data = { database: database };
            return await this.POST<ListTableResponse>(url, params, data);
        }
        async descTable(database: string, table: string) {
            const url = `${this.tablePrefix}`;
            const params = { desc: "" };
            const data = { database: database, table: table };
            return await this.POST<DescTableResponse>(url, params, data);
        }
        async addField(args: AddFieldArgs) {
            const url = `${this.tablePrefix}`;
            const params = { addField: "" };
            return await this.POST<CommonResponse>(url, params, args);
        }
        async aliasTable(database: string, table: string, alias: string) {
            const url = `${this.tablePrefix}`;
            const params = { alias: "" };
            const data = { database: database, table: table, alias: alias };
            return await this.POST<CommonResponse>(url, params, data);
        }
        async unaliasTable(database: string, table: string, alias: string) {
            const url = `${this.tablePrefix}`;
            const params = { unalias: "" };
            const data = { database: database, table: table, alias: alias };
            return await this.POST<CommonResponse>(url, params, data);
        }
        async showTableStats(database: string, table: string) {
            const url = `${this.tablePrefix}`;
            const params = { stats: "" };
            const data = { database: database, table: table };
            return await this.POST<ShowTableStatsResponse>(url, params, data);
        }
    };
}
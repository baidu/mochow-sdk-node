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

import {
    Row,
    IndexSchema,
    FieldSchema,
    ClientConfiguration,
    AutoBuildTiming,
    PartitionParams,
    TableSchema,
    FieldType,
    IndexType,
    MetricType,
    PartitionType,
    PrimaryKey,
    PartitionKey,
    ReadConsistency,
    UpdateFields,
    IndexState,
    SearchParams,
    ANNSearchParams,
    BatchANNSearchParams,
    TableState,
    ServerErrCode,
    InvertedIndexFieldAttribute,
    InvertedIndexAnalyzer,
    InvertedIndexParseMode,
    Vector,
    VectorSearchArgs,
    VectorTopkSearchRequest,
    VectorSearchConfig,
    VectorRangeSearchRequest,
    DistanceRange,
    VectorBatchSearchRequest,
    BM25SearchRequest,
    BM25SearchArgs,
    HybridSearchArgs,
    HybridSearchRequest,
} from "../mochow/types/index"
import { MochowClient } from "../mochow/MochowClient"

export class MochowTest {
    private client: MochowClient
    private database_name: string = "test"
    private table_name: string = "test"
    public constructor(private config: ClientConfiguration) {
        this.client = new MochowClient(config)
    }

    public async createDatabase() {
        let resp = await this.client.createDatabase(this.database_name)
        if (resp.code != 0) {
            console.log("fail to create database due to: " + resp.msg)
            return resp
        }
        console.log("create database success")

        return resp
    }

    public async createTable() {
        let fields: FieldSchema[]
        fields = [
            {
                fieldName: "id",
                fieldType: FieldType.String,
                primaryKey: true,
                partitionKey: true,
                autoIncrement: false,
                notNull: true,
            },
            {
                fieldName: "bookName",
                fieldType: FieldType.String,
                notNull: true,
            },
            {
                fieldName: "author",
                fieldType: FieldType.String,
                notNull: true,
            },
            {
                fieldName: "page",
                fieldType: FieldType.Uint32,
                notNull: true,
            },
            {
                fieldName: "vector",
                fieldType: FieldType.FloatVector,
                notNull: true,
                dimension: 3,
            },
            {
                fieldName: "segment",
                fieldType: FieldType.Text,
                notNull: true
            }
        ]

        // Indexes
        let autoBuildPolicy = AutoBuildTiming("2024-11-29 18:35:00")
        let indexes: IndexSchema[] = [
            {
                indexName: "book_name_idx",
                field: "bookName",
                indexType: IndexType.SecondaryIndex,
            },
            {
                indexName: "vector_idx",
                field: "vector",
                indexType: IndexType.HNSW,
                metricType: MetricType.L2,
                params: {
                    "M": 32,
                    "efConstruction": 200,
                },
                autoBuild: true,
                autoBuildPolicy: autoBuildPolicy,
            },
            {
                indexName: "book_segment_inverted_idx",
                indexType: IndexType.InvertedIndex,
                fields: ["segment"],
                fieldAttributes: [InvertedIndexFieldAttribute.Analyzed],
                params: {
                    "analyzer": InvertedIndexAnalyzer.ChineseAnalyzer,
                    "parseMode": InvertedIndexParseMode.FineMode
                }
            }
        ]

        // create table
        let partitionParams: PartitionParams = { partitionType: PartitionType.HASH, partitionNum: 1 }
        let schema: TableSchema = { fields: fields, indexes: indexes }

        let resp = await this.client.createTable(this.database_name, this.table_name, "test", 1, partitionParams, true, schema)
        if (resp.code != 0) {
            console.log("fail to create table due to: " + resp.msg)
            return resp
        }
        console.log("create table success")

        return resp
    }

    public async checkTableStatus() {
        let count = 0;
        console.log("wait table create finish...")
        while (count < 120) {
            let resp = await this.client.descTable(this.database_name, this.table_name)
            if (resp.code != 0) {
                console.log("desc table failed")
                return
            }
            if (resp.table.state == TableState.Normal) {
                console.log("table is normal")
                return
            }
            count++;
            await new Promise(f => setTimeout(f, 10000));
        }
        if (count == 10) {
            console.log("index build overtime")
        }
    }

    public async insertRow() {
        console.log("start upsert row")
        let data: Row[] = [
            {
                "id": "0001",
                "bookName": "西游记",
                "author": "吴承恩",
                "page": 21,
                "vector": [0.2123, 0.21, 0.213],
                "segment": "富贵功名，前缘分定，为人切莫欺心。",
            },
            {
                "id": "0002",
                "bookName": "西游记",
                "author": "吴承恩",
                "page": 22,
                "vector": [0.2123, 0.22, 0.213],
                "segment": "正大光明，忠良善果弥深。些些狂妄天加谴，眼前不遇待时临。",
            },
            {
                "id": "0003",
                "bookName": "三国演义",
                "author": "罗贯中",
                "page": 23,
                "vector": [0.2123, 0.23, 0.213],
                "segment": "细作探知这个消息，飞报吕布。",
            },
            {
                "id": "0004",
                "bookName": "三国演义",
                "author": "罗贯中",
                "page": 24,
                "vector": [0.2123, 0.24, 0.213],
                "segment": "布大惊，与陈宫商议。宫曰：“闻刘玄德新领徐州，可往投之。” 布从其言，竟投徐州来。有人报知玄德。",
            },
            {
                "id": "0005",
                "bookName": "三国演义",
                "author": "罗贯中",
                "page": 25,
                "vector": [0.2123, 0.24, 0.213],
                "segment": "玄德曰：“布乃当今英勇之士，可出迎之。”糜竺曰：“吕布乃虎狼之徒，不可收留；收则伤人矣。",
            }
        ]
        let resp = await this.client.insertRows(this.database_name, this.table_name, data)
        if (resp.code != 0) {
            console.log("fail to upsert row due to: " + resp.msg)
            return resp
        }
        console.log("upsert row finish")
    }

    public async queryData() {
        let pk: PrimaryKey = { "id": "0001" }
        let projections: string[] = ["id", "bookName"]
        let resp = await this.client.queryRow(
            this.database_name,
            this.table_name,
            pk,
            undefined,
            projections,
            false,
            ReadConsistency.EVENTUAL)
        if (resp.code != 0) {
            console.log("fail to query data due to: " + resp.msg)
            return resp
        }
        console.log("query result: ", JSON.stringify(resp, null, " "))
        return resp
    }

    public async selectData() {
        let projections: string[] = ["id", "bookName"]
        let resp = await this.client.selectRows(
            this.database_name,
            this.table_name,
            undefined,
            undefined,
            projections,
            1)
        if (resp.code != 0) {
            console.log("fail to select data due to: " + resp.msg)
            return resp
        }
        console.log("select result: ", JSON.stringify(resp, null, " "))
        return resp
    }

    public async updateData() {
        let pk: PrimaryKey = { "id": "0001" }
        let update: UpdateFields = {
            "bookName": "红楼梦",
            "author": "曹雪芹",
            "page": 100,
            "segment": "满纸荒唐言，一把辛酸泪",
        }
        let resp = await this.client.updateRow(
            this.database_name,
            this.table_name,
            pk,
            undefined,
            update)
        if (resp.code != 0) {
            console.log("fail to update row due to: " + resp.msg)
            return resp
        }
        return resp
    }

    public async rebuildIndex() {
        // rebuild vector index
        let resp = await this.client.rebuildIndex(this.database_name, this.table_name, "vector_idx")
        if (resp.code != 0) {
            console.log("fail to rebuild index due to: " + resp.msg)
            return resp
        }
        return resp
    }

    public async checkIndexNormal() {
        let count = 0;
        console.log("wait index rebuild finished...")
        while (count < 120) {
            let resp = await this.client.descIndex(this.database_name, this.table_name, "vector_idx")
            if (resp.code != 0) {
                console.log("describe index failed")
                return
            }
            if (resp.index.state == IndexState.Normal) {
                console.log("index rebuild finished")
                return
            }
            count++;
            await new Promise(f => setTimeout(f, 1000));
        }
        if (count == 10) {
            console.log("index build overtime")
        }
    }

    public async topkSearch() {
        // search
        console.log("start search data")
        let vector = new Vector([0.3123, 0.43, 0.213])
        let searchArgs: VectorSearchArgs = {
            database: this.database_name,
            table: this.table_name,
            request: new VectorTopkSearchRequest("vector", vector, 5).
                Filter("bookName='三国演义'").
                Config(new VectorSearchConfig().Ef(200)),
        }
        let resp = await this.client.vectorSearch(searchArgs)
        if (resp.code != 0) {
            console.log("search row failed")
            return resp
        }
        console.log("search result: ", JSON.stringify(resp, null, " "))
        return resp
    }

    public async rangeSearch() {
        // search
        console.log("start range search data")

        let vector = new Vector([0.3123, 0.43, 0.213])
        let searchArgs: VectorSearchArgs = {
            database: this.database_name,
            table: this.table_name,
            request: new VectorRangeSearchRequest("vector", vector, new DistanceRange(0, 20)).
                Filter("bookName='三国演义'").
                Limit(15).
                Config(new VectorSearchConfig().Ef(200))
        }
        let resp = await this.client.vectorSearch(searchArgs)
        if (resp.code != 0) {
            console.log("search row failed")
            return resp
        }
        console.log("search result: ", JSON.stringify(resp, null, " "))
        return resp
    }

    public async batchSearch() {
        // search
        console.log("start batch search data")

        let vectors : Vector[] = []
        vectors.push(new Vector([0.3123, 0.43, 0.213]))
        vectors.push(new Vector([0.5512, 0.33, 0.43]))
        let searchArgs: VectorSearchArgs = {
            database: this.database_name,
            table: this.table_name,
            request: new VectorBatchSearchRequest("vector", vectors).
                Filter("bookName='三国演义'").
                Limit(10).
                Config(new VectorSearchConfig().Ef(200)).
                Projections([ "id", "bookName", "author", "page"]),
        }
        let resp = await this.client.vectorSearch(searchArgs)
        if (resp.code != 0) {
            console.log("search row failed")
            return resp
        }
        console.log("search result: ", JSON.stringify(resp, null, " "))
        return resp
    }

    public async bm25Search() {
        // search
        console.log("start bm25 search data")

        let searchArgs: BM25SearchArgs = {
            database: this.database_name,
            table: this.table_name,
            request: new BM25SearchRequest("book_segment_inverted_idx", "吕布").
                Filter("bookName='三国演义'").
                Limit(10).
                Projections([ "id", "bookName", "author", "page"]).
                ReadConsistency("STRONG").
                Projections([ "id", "vector"])
        }
        let resp = await this.client.bm25Search(searchArgs)
        if (resp.code != 0) {
            console.log("search row failed")
            return resp
        }
        console.log("search result: ", JSON.stringify(resp, null, " "))
        return resp
    }

    public async hybridSearch() {
        // search
        console.log("start hybrid search data")
        let vector = new Vector([0.3123, 0.43, 0.213])

        let searchArgs: HybridSearchArgs = {
            database: this.database_name,
            table: this.table_name,
            request: new HybridSearchRequest(
                new VectorTopkSearchRequest("vector", vector, 15).Config(new VectorSearchConfig().Ef(200)),
                new BM25SearchRequest("book_segment_inverted_idx", "吕布"),
                0.4,
                0.6
            ).
            Filter("bookName='三国演义'").
            Limit(15)
        }
        let resp = await this.client.hybridSearch(searchArgs)
        if (resp.code != 0) {
            console.log("search row failed")
            return resp
        }
        console.log("search result: ", JSON.stringify(resp, null, " "))
        return resp
    }

    public async deleteDataWithPK() {
        let resp = await this.client.deleteRow(this.database_name, this.table_name, { "id": "0001" })
        if (resp.code != 0) {
            console.log("delete data with pk failed")
            return resp
        }
        return resp
    }

    public async deleteDataWithFilter() {
        let resp = await this.client.deleteRow(this.database_name, this.table_name, undefined, undefined, "id = '0002'")
        if (resp.code != 0) {
            console.log("delete data with pk failed")
            return resp
        }
        return resp
    }

    public async dropIndex() {
        console.log("start drop index")
        let resp = await this.client.dropIndex(this.database_name, this.table_name, "vector_idx")
        if (resp.code != 0) {
            console.log("drop index failed")
            return resp
        }
        console.log("drop index finish")
        return resp
    }

    public async checkIndexNotExist() {
        let count = 0;
        console.log("check index to be deleted")
        while (count < 120) {
            let resp = await this.client.descIndex(this.database_name, this.table_name, "vector_idx")
            if (resp.code != 0) {
                if (resp.code == ServerErrCode.IndexNotExist) {
                    console.log("finish drop index")
                } else {
                    console.log("describe index failed")
                }
                return
            }
            count++;
            await new Promise(f => setTimeout(f, 1000));
        }
        if (count == 10) {
            console.log("index build overtime")
        }
    }

    public async createIndex() {
        let indexSchema: IndexSchema = {
            indexName: "vector_idx",
            field: "vector",
            indexType: IndexType.HNSW,
            metricType: MetricType.L2,
            params: {
                "M": 16,
                "efConstruction": 200
            }
        }
        let resp = await this.client.createIndex(this.database_name, this.table_name, [indexSchema])
        if (resp.code != 0) {
            console.log("fail to create index due to:", resp.msg)
        }
    }

    public async descIndex() {
        let resp = await this.client.descIndex(this.database_name, this.table_name, "vector_idx")
        if (resp.code != 0) {
            console.log("fail to create index due to:", resp.msg)
        }
        console.log("desc index: ", JSON.stringify(resp, null, " "))
    }

    public async dropTable() {
        let resp = await this.client.dropTable(this.database_name, this.table_name)
        if (resp.code != 0) {
            console.log("fail to drop table due to: " + resp.msg)
        }
    }

    public async checkTableDeleted() {
        let count = 0;
        console.log("wait table deleted")
        while (count < 120) {
            let resp = await this.client.descTable(this.database_name, this.table_name)
            if (resp.code != 0) {
                if (resp.code == ServerErrCode.TableNotExist) {
                    console.log("table is deleted")
                    return
                } else {
                    console.log("desc table failed")
                    return
                }
            }
            count++;
            await new Promise(f => setTimeout(f, 1000));
        }
        if (count == 10) {
            console.log("desc table overtime")
        }
    }

    public async dropDatabase() {
        let resp = await this.client.dropDatabases(this.database_name)
        if (resp.code != 0) {
            console.log("fail to drop database due to: " + resp.msg)
            return resp
        }
    }
}

(async () => {
    const mochowTest = new MochowTest({
        endpoint: "http://x.x.x.x:x",
        credential: {
            account: "xxxx",
            apiKey: "xxxx",
        },
    })

    await mochowTest.createDatabase()
    await mochowTest.createTable()
    await mochowTest.checkTableStatus()
    await new Promise(f => setTimeout(f, 10000));
    await mochowTest.insertRow()
    await mochowTest.queryData()
    await mochowTest.selectData()
    await mochowTest.updateData()
    await mochowTest.descIndex()
    await mochowTest.rebuildIndex()
    await mochowTest.checkIndexNormal()
    await mochowTest.topkSearch()
    await mochowTest.batchSearch()
    await mochowTest.bm25Search()
    await mochowTest.hybridSearch()
    await mochowTest.deleteDataWithPK()
    await mochowTest.deleteDataWithFilter()
    await mochowTest.dropIndex()
    await mochowTest.checkIndexNotExist()
    await mochowTest.dropTable()
    await mochowTest.checkTableDeleted()
    await mochowTest.dropDatabase()
})();

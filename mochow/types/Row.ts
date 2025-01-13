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
import { ReadConsistency } from "./Const";

export type Row = Record<string, any>;
export type PrimaryKey = Record<string, any>;
export type PartitionKey = Record<string, any>;
export type SearchParams = Record<string, any>;
export type UpdateFields = Record<string, any>;
export type Marker = Record<string, any>;

export interface InsertArgs extends CommonNamespaceArgs {
    rows: Record<string, any>[];
}

export interface InsertResponse extends CommonResponse {
    affectedCount: number;
}

export interface UpsertArgs extends InsertArgs {}

export interface UpsertResponse extends InsertResponse {}

export interface DeleteArgs extends CommonNamespaceArgs {
    primaryKey?: PrimaryKey;
    partitionKey?: PartitionKey;
    filter?: string;
}

export interface QueryArgs extends CommonNamespaceArgs {
    primaryKey: PrimaryKey;
    partitionKey?: PartitionKey;
    projections?: string[];
    retrieveVector?: boolean;
    readConsistency?: ReadConsistency;
}

export interface QueryResponse extends CommonResponse {
    row: Row;
}

export type QueryKey = {
    primaryKey: PrimaryKey;
    partitionKey?: PartitionKey;
};

export interface BatchQueryArgs extends CommonNamespaceArgs {
    keys: QueryKey[];
    projections?: string[];
    retrieveVector?: boolean;
    readConsistency?: ReadConsistency;
}

export interface BatchQueryResponse extends CommonResponse {
    rows: Row[];
}

export interface RowResult {
	row: Row
	distance: number
	score: number
}

export interface VectorSearchArgs {
	database: string
	table: string
	request: vectorSearchRequest
}

// BM25 search
export interface BM25SearchArgs {
	database: string
	table: string
	request: bm25SearchRequest
}

// hybrid search (vector + BM25)
export interface HybridSearchArgs {
	database: string
	table: string
	request: hybridSearchRequest
}

export interface SearchRowResult {
	searchVectorFloats?: number[]
	rows: RowResult[]
}

export interface BatchSearchRowResult {
	results: SearchRowResult[]
}

export interface SearchResult {
	isBatch: boolean
	rows: SearchRowResult
	batchRows: BatchSearchRowResult
}

export interface SearchResponse extends CommonResponse, SearchRowResult {
}

export interface BatchSearchResponse extends CommonResponse, BatchSearchRowResult {
}

export interface ANNSearchParams {
	vectorField: string
	vectorFloats: number[] | number[][]
	params: SearchParams
	filter?: string
}

export interface BatchSearchArgs extends CommonNamespaceArgs {
	anns: ANNSearchParams
	partitionKey?: PartitionKey
	retrieveVector?: boolean
	projections?: string[]
	readConsistency?: ReadConsistency
}

export interface UpdateArgs extends CommonNamespaceArgs {
	primaryKey: PrimaryKey
	partitionKey?: PartitionKey
	update: UpdateFields
}

export interface SelectArgs extends CommonNamespaceArgs {
    filter?: string;
    marker?: Marker;
    projections?: string[];
    limit: number;
    readConsistency?: ReadConsistency;
}

export interface SelectResponse extends CommonResponse {
	isTruncated: boolean
	nextMarker: Marker
	rows: Row[]
}

export class VectorSearchConfig {
	params: Record<string, any>
	constructor() {
		this.params = {}
	}

	Ef(ef: number): VectorSearchConfig {
		this.params["ef"] = ef
		return this
	}

	Pruning(pruning: boolean): VectorSearchConfig {
		this.params["pruning"] = pruning
		return this
	}

	SearchCoarseCount(searchCoarseCount: number): VectorSearchConfig {
		this.params["searchCoarseCount"] = searchCoarseCount
		return this
	}
}

export interface searchRequest {
	requestType(): string
	toDict(): Record<string, any>
	isBatch(): boolean
}

export interface vectorSearchRequest extends searchRequest {

	// Make sure user not pass e.g. 'BM25SearchRequest' to VectorSearch api
	vectorSearchRequestDummyInterface(): void
}

export class Vector {
	vector: number[]
	constructor(vector: number[]) {
		this.vector = vector
	}
	name(): string {
		return "vectorFloats"
	}
	representation(): any {
		return this.vector
	}
}

export class request {
	set: Record<string, boolean>;
	constructor() {
		this.set = {}
	}
	mark(key: string): void {
		this.set[key] = true
		return;
	}
	isMarked(key: string): boolean {
		return this.set[key]
	}
}

export class SearchCommonFields extends request {
	partitionKey?: Record<string, any>
	projections?: string[]
	readConsistency?: string
	limit?: number
	filter?: string
	searchCommonFieldsToMap(): Record<string, any> {
		let fields: Record<string, any> = {}
		if (this.isMarked("partitionKey")) {
			fields["partitionKey"] = this.partitionKey
		}
		if (this.isMarked("projections")) {
			fields["projections"] = this.projections
		}
		if (this.isMarked("readConsistency")) {
			fields["readConsistency"] = this.readConsistency
		}
		if (this.isMarked("filter")) {
			fields["filter"] = this.filter
		}
		if (this.isMarked("limit")) {
			fields["limit"] = this.limit
		}
		return fields
	}
}

export class vectorSearchFields extends SearchCommonFields {
	vectorField?: string
	vector?: Vector
	vectors?: Vector[]
	distanceNear?: number
	distanceFar?: number
	config?: VectorSearchConfig
	fillSearchFields(fields: Record<string, any>) {
		let anns: Record<string, any> = {}
		if (this.isMarked("vectorField")) {
			anns["vectorField"] = this.vectorField
		}
		if (this.isMarked("vector") && this.vector) {
			anns[this.vector.name()] = this.vector.representation()
		}
		if (this.isMarked("vectors") && this.vectors && this.vectors.length != 0) {
			let vectors: any[] = []
			for (let vector of this.vectors) {
				vectors.push(vector.representation())
			}
			anns[this.vectors[0].name()] = vectors
		}
		if (this.isMarked("filter")) {
			anns["filter"] = this.filter
		}

		let params: Record<string, any> = {}
		if (this.isMarked("config") && this.config) {
			for (let [k, v] of Object.entries(this.config.params)) {
				params[k] = this.config.params[k]
			}
		}
		if (this.isMarked("distanceNear")) {
			params["distanceNear"] = this.distanceNear
		}
		if (this.isMarked("distanceFar")) {
			params["distanceFar"] = this.distanceFar
		}
		if (this.isMarked("limit")) {
			params["limit"] = this.limit
		}
		if (params.length != 0) {
			anns["params"] = params
		}

		if (anns.length != 0) {
			fields["anns"] = anns
		}

		for (let [k, v] of Object.entries(this.searchCommonFieldsToMap())) {
			if (k == "filter" || k == "limit") { // in "anns"
				continue
			}
			fields[k] = v
		}
	}
}

export class VectorTopkSearchRequest extends vectorSearchFields implements vectorSearchRequest {
	constructor(vectorField: string, vector: Vector, limit: number) {
		super()
		this.mark("vectorField")
		this.vectorField = vectorField
		this.mark("vector")
		this.vector = vector
		this.mark("limit")
		this.limit = limit
	}
	PartitionKey(partitionKey: Record<string, any>): VectorTopkSearchRequest {
		this.mark("partitionKey")
		this.partitionKey = partitionKey
		return this
	}

	ReadConsistency(readConsistency: string): VectorTopkSearchRequest {
		this.mark("readConsistency")
		this.readConsistency = readConsistency
		return this
	}

	Projections(projections: string[]): VectorTopkSearchRequest {
		this.mark("projections")
		this.projections = projections
		return this
	}

	Filter(filter: string): VectorTopkSearchRequest {
		this.mark("filter")
		this.filter = filter
		return this
	}

	Config(config: VectorSearchConfig): VectorTopkSearchRequest {
		this.mark("config")
		this.config = config
		return this
	}

	requestType(): string {
		return "search"
	}
	isBatch(): boolean {
		return false
	}
	toDict(): Record<string, any> {
		let fields: Record<string, any> = {}
		this.fillSearchFields(fields)
		return fields
	}
	vectorSearchRequestDummyInterface(): void {
	}
}

/**** Vector Range Search ****/
export class DistanceRange {
	Min: number
	Max: number
	constructor(Min: number, Max: number) {
		this.Min = Min
		this.Max = Max
	}
}

export class VectorRangeSearchRequest extends vectorSearchFields implements vectorSearchRequest {
	constructor(vectorField: string, vector: Vector, distanceRange: DistanceRange) {
		super()
		this.mark("vectorField")
		this.vectorField = vectorField

		this.mark("vector")
		this.vector = vector

		this.mark("distanceNear")
		this.distanceNear = distanceRange.Min

		this.mark("distanceFar")
		this.distanceFar = distanceRange.Max
	}
	PartitionKey(partitionKey: Record<string, any>): VectorRangeSearchRequest {
		this.mark("partitionKey")
		this.partitionKey = partitionKey
		return this
	}
	ReadConsistency(readConsistency: string): VectorRangeSearchRequest {
		this.mark("readConsistency")
		this.readConsistency = readConsistency
		return this
	}
	Projections(projections: string[]): VectorRangeSearchRequest {
		this.mark("projections")
		this.projections = projections
		return this
	}
	Limit(limit: number): VectorRangeSearchRequest {
		this.mark("limit")
		this.limit = limit
		return this
	}
	Filter(filter: string): VectorRangeSearchRequest {
		this.mark("filter")
		this.filter = filter
		return this
	}
	Config(config: VectorSearchConfig): VectorRangeSearchRequest {
		this.mark("config")
		this.config = config
		return this
	}
	requestType(): string {
		return "search"
	}
	isBatch(): boolean {
		return false
	}
	toDict(): Record<string, any> {
		let fields: Record<string, any> = {}
		this.fillSearchFields(fields)
		return fields
	}
	vectorSearchRequestDummyInterface(): void {
	}
}

/**** Vectothis Batch Search ****/
export class VectorBatchSearchRequest extends vectorSearchFields implements vectorSearchRequest {
	constructor(vectorField: string, vectors: Vector[]) {
		super()
		this.mark("vectorField")
		this.vectorField = vectorField

		this.mark("vectors")
		this.vectors = vectors
	}

	PartitionKey(partitionKey: Record<string, any>): VectorBatchSearchRequest {
		this.mark("partitionKey")
		this.partitionKey = partitionKey
		return this
	}

	ReadConsistency(readConsistency: string): VectorBatchSearchRequest {
		this.mark("readConsistency")
		this.readConsistency = readConsistency
		return this
	}

	Projections(projections: string[]): VectorBatchSearchRequest {
		this.mark("projections")
		this.projections = projections
		return this
	}

	Limit(limit: number): VectorBatchSearchRequest {
		this.mark("limit")
		this.limit = limit
		return this
	}

	DistanceRange(distanceRange: DistanceRange): VectorBatchSearchRequest {
		this.mark("distanceNear")
		this.distanceNear = distanceRange.Min

		this.mark("distanceFar")
		this.distanceFar = distanceRange.Max
		return this
	}

	Filter(filter: string): VectorBatchSearchRequest {
		this.mark("filter")
		this.filter = filter
		return this
	}

	Config(config: VectorSearchConfig): VectorBatchSearchRequest {
		this.mark("config")
		this.config = config
		return this
	}

	isBatch(): boolean {
		return true
	}

	requestType(): string {
		return "batchSearch"
	}

	toDict(): Record<string, any> {
		let fields: Record<string, any> = {}
		this.fillSearchFields(fields)
		return fields
	}
	vectorSearchRequestDummyInterface(): void {
	}

}

/**** BM25 Search ****/
export interface bm25SearchRequest extends searchRequest {
	// Make sure usethis not pass e.g. 'VectorSearchRequest' to BM25Search api
	bm25SearchRequestDummyInterface(): void
}

export class BM25SearchRequest extends SearchCommonFields implements bm25SearchRequest {
	indexName: string
	searchText: string
	constructor(indexName: string, searchText: string) {
		super()
		this.indexName = indexName
		this.searchText = searchText
	}

	PartitionKey(partitionKey: Record<string, any>): BM25SearchRequest {
		this.mark("partitionKey")
		this.partitionKey = partitionKey
		return this
	}

	ReadConsistency(readConsistency: string): BM25SearchRequest {
		this.mark("readConsistency")
		this.readConsistency = readConsistency
		return this
	}

	Projections(projections: string[]): BM25SearchRequest {
		this.mark("projections")
		this.projections = projections
		return this
	}

	Limit(limit: number): BM25SearchRequest {
		this.mark("limit")
		this.limit = limit
		return this
	}

	Filter(filter: string): BM25SearchRequest {
		this.mark("filter")
		this.filter = filter
		return this
	}

	toDict(): Record<string, any> {
		let fields: Record<string, any> = {}
		for (let [k, v] of Object.entries(this.searchCommonFieldsToMap())) {
			fields[k] = v
		}

		let bm25Params: Record<string, any> = {}
		bm25Params["indexName"] = this.indexName
		bm25Params["searchText"] = this.searchText
		fields["BM25SearchParams"] = bm25Params

		return fields
	}

	requestType(): string {
		return "search"
	}

	isBatch(): boolean {
		return false
	}

	bm25SearchRequestDummyInterface() {
	}

}

/**** Hybrid Search ****/

export interface hybridSearchRequest extends searchRequest {
	hybridSearchRequestDummyInterface(): void
}

export class HybridSearchRequest extends SearchCommonFields implements hybridSearchRequest {
	vectorRequest: vectorSearchRequest
	bm25Request: bm25SearchRequest
	vectorWeight: number
	bm25Weight: number
	/*
	Note: 'limit' and 'filter' are global settings, and they will
	apply to both vectothis search and BM25 search. Avoid setting them in
	'bm25Request' othis 'vectorRequest'.  Any settings in 'vectorRequest'
	othis 'bm25Request' fothis 'limit' othis 'filter' will be overridden by the
	general settings.
	*/
	constructor(vectorRequest: vectorSearchRequest,
		bm25Request: bm25SearchRequest,
		vectorWeight: number,
		bm25Weight: number,
	) {
		super()
		this.vectorRequest = vectorRequest
		this.bm25Request = bm25Request
		this.vectorWeight = vectorWeight
		this.bm25Weight = bm25Weight
	}
	PartitionKey(partitionKey: Record<string, any>): HybridSearchRequest {
		this.mark("partitionKey")
		this.partitionKey = partitionKey
		return this
	}

	ReadConsistency(readConsistency: string): HybridSearchRequest {
		this.mark("readConsistency")
		this.readConsistency = readConsistency
		return this
	}

	Projections(projections: string[]): HybridSearchRequest {
		this.mark("projections")
		this.projections = projections
		return this
	}

	Limit(limit: number): HybridSearchRequest {
		this.mark("limit")
		this.limit = limit
		return this
	}

	Filter(filter: string): HybridSearchRequest {
		this.mark("filter")
		this.filter = filter
		return this
	}

	toDict(): Record<string, any> {
		let fields: Record<string, any> = {}

		for (let [k, v] of Object.entries(this.bm25Request.toDict())) {
			fields[k] = v
		}
		for (let [k, v] of Object.entries(this.vectorRequest.toDict())) {
			fields[k] = v
		}

		for (let [k, v] of Object.entries(this.searchCommonFieldsToMap())) {
			fields[k] = v
		}

		if (fields["anns"] != undefined) {
			fields["anns"]["weight"] = this.vectorWeight
		}

		if (fields["BM25SearchParams"] != undefined) {
			fields["BM25SearchParams"]["weight"] = this.bm25Weight
		}

		return fields
	}

	isBatch(): boolean {
		return false
	}

	requestType(): string {
		return "search"
	}

	hybridSearchRequestDummyInterface() {
	}
}

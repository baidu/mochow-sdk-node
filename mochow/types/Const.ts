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

export enum MetricType {
    L2 = "L2",
    IP = "IP",
    COSINE = "COSINE"
}

export enum IndexType {
    HNSW = "HNSW",
    FLAT = "FLAT",
    PUCK = "PUCK",
    HNSWPQ = "HNSWPQ",

    // scalar index type
    SecondaryIndex = "SECONDARY",
    InvertedIndex = "INVERTED"
}

export enum InvertedIndexAnalyzer {
    EnglishAnalyzer = "ENGLISH_ANALYZER",
    ChineseAnalyzer = "CHINESE_ANALYZER",
    DefaultAnalyzer = "DEFAULT_ANALYZER"
}


export enum InvertedIndexParseMode {
    CoarseMode = "COARSE_MODE",
    FineMode = "FINE_MODE"
}

export enum InvertedIndexFieldAttribute {
    NotAnalyzed = "ATTRIBUTE_NOT_ANALYZED",
    Analyzed = "ATTRIBUTE_ANALYZED"
}


export enum FieldType {
    // scalar field type
    Bool = "BOOL",
    Int8 = "INT8",
    Uint8 = "UINT8",
    Int16 = "INT16",
    Uint16 = "UINT16",
    Int32 = "INT32",
    Uint32 = "UINT32",
    Int64 = "INT64",
    Uint64 = "UINT64",
    Float = "FLOAT",
    Double = "DOUBLE",
    Date = "DATE",
    Datetime = "DATETIME",
    Timestamp = "TIMESTAMP",
    String = "STRING",
    Binary = "BINARY",
    UUID = "UUID",
    Text = "TEXT",
    TextGBK = "TEXT_GBK",
    TextGB18030 = "TEXT_GB18030",

    FloatVector = "FLOAT_VECTOR"
}

export enum AutoBuildPolicyType {
    Timing = "TIMING",
    Periodical = "PERIODICAL",
    Increment = "ROW_COUNT_INCREMENT"
}

export enum PartitionType {
    HASH = "HASH"
}

export enum ReadConsistency {
    EVENTUAL = "EVENTUAL",
    STRONG = "STRONG"
}

export enum TableState {
    Creating = "CREATING",
    Normal = "NORMAL",
    Deleting = "DELETING"
}


export enum IndexState {
    Building = "BUILDING",
    Normal = "NORMAL"
}

export enum ServerErrCode {
    OK = 0,
    InternalError = 1,
    InvalidParameter = 2,
    InvalidHTTPURL = 10,
    InvalidHTTPHeader = 11,
    InvalidHTTPBody = 12,
    MissSSLCertificates = 13,
    UserNotExist = 20,
    UserAlreadyExist = 21,
    RoleNotExist = 22,
    RoleAlreadyExist = 23,
    AuthenticationFailed = 24,
    PermissionDenied = 25,
    DBNotExist = 50,
    DBAlreadyExist = 51,
    DBTooManyTables = 52,
    DBNotEmpty = 53,
    InvalidTableSchema = 60,
    InvalidPartitionParameters = 61,
    TableTooManyFields = 62,
    TableTooManyFamilies = 63,
    TableTooManyPrimaryKeys = 64,
    TableTooManyPartitionKeys = 65,
    TableTooManyVectorFields = 66,
    TableTooManyIndexes = 67,
    DynamicSchemaError = 68,
    TableNotExist = 69,
    TableAlreadyExist = 70,
    InvalidTableState = 71,
    TableNotReady = 72,
    AliasNotExist = 73,
    AliasAlreadyExist = 74,
    FieldNotExist = 80,
    FieldAlreadyExist = 81,
    VectorFieldNotExist = 82,
    InvalidIndexSchema = 90,
    IndexNotExist = 91,
    IndexAlreadyExist = 92,
    IndexDuplicated = 93,
    InvalidIndexState = 94,
    PrimaryKeyDuplicated = 100,
}
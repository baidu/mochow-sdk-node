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

import { ClientConfiguration } from "./types";
import {
    DEFAULT_HTTP_TIMEOUT,
    DEFAULT_URL_VERSION_PREFIX
} from "./const"
import {
    Database,
    Table,
    Row,
    Index
} from "./api";
/**
 * HttpBaseClient is a base class for making HTTP requests to a Mochow server.
 * It provides basic functionality for making GET and POST requests, and handles
 * configuration, headers, and timeouts.
 *
 * The HttpClientConfig object should contain the following properties:
 * - endpoint: The URL of the Mochow server.
 * - username: (Optional) The username for authentication.
 * - password: (Optional) The password for authentication.
 * - version: (Optional) The version of the API endpoints.
 * - timeout: (Optional) The timeout for requests in milliseconds.
 *
 * Note: This is a base class and does not provide specific methods for interacting
 * with Mochow entities like collections or vectors. For that, use the HttpClient class
 * which extends this class and mixes in the Collection and Vector APIs.
 */
export class HttpBaseClient {
    // The client configuration.
    public config: ClientConfiguration;

    constructor(config: ClientConfiguration) {
        // Assign the configuration object.
        this.config = config;

        // Check endpoint
        if (!this.config.endpoint) {
            throw new Error(
                'The endpoint is required for creating mochow client.'
            );
        }
        // Check credentials
        if (!this.config.credential) {
            throw new Error(
                'The credential is required for creating mochow client.'
            );
        }
        if (!this.config.credential.account || !this.config.credential.apiKey) {
            throw new Error(
                'The account and apiKey is required for creating mochow client.'
            );
        }
    }

    // baseURL
    get baseURL() {
        return (
            `${this.config.endpoint}/${DEFAULT_URL_VERSION_PREFIX}`
        );
    }

    // authorization
    get authorization() {
        // @ts-ignore
        let token = `account=${this.config.credential.account}&api_key=${this.config.credential.apiKey}`;
        return `Bearer ${token}`;
    }

    // timeout
    get timeout() {
        return this.config.socketTimeoutInMills ?? DEFAULT_HTTP_TIMEOUT;
    }

    // headers
    get headers() {
        return {
            Authorization: this.authorization,
            ContentType: 'application/json',
        };
    }

    // POST API
    async POST<T>(
        url: string,
        params: Record<string, any> = {},
        data: Record<string, any> = {},
    ): Promise<T> {
        try {
            // timeout controller
            const timeout = this.timeout;
            const abortController = new AbortController();
            const id = setTimeout(() => abortController.abort(), timeout);

            // query params
            const queryParams = new URLSearchParams(params);

            // send http request
            const response = await fetch(`${this.baseURL}${url}?${queryParams}`, {
                method: 'post',
                headers: this.headers,
                body: JSON.stringify(data),
                signal: abortController.signal,
            });

            clearTimeout(id);
            return response.json() as T;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn(`post ${url} request was timeout`);
            }
            return Promise.reject(error);
        }
    }

    // DELETE API
    async DELETE<T>(
        url: string,
        params: Record<string, any> = {},
        data: Record<string, any> = {},
    ): Promise<T> {
        try {
            // timeout controller
            const timeout = this.timeout;
            const abortController = new AbortController();
            const id = setTimeout(() => abortController.abort(), timeout);

            // query params
            const queryParams = new URLSearchParams(params);

            const response = await fetch(
                `${this.baseURL}${url}?${queryParams}`,
                {
                    method: 'delete',
                    headers: this.headers,
                    body: JSON.stringify(data),
                    signal: abortController.signal,
                }
            );

            clearTimeout(id);
            return response.json() as T;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn(`milvus http client: request was timeout`);
            }
            return Promise.reject(error);
        }
    }
}

/**
 * The HttpClient class extends the functionality
 * of the HttpBaseClient class by mixing in the
 * - Database
 * - Table
 * - Row
 * - Alias
 */
export class MochowClient extends Database(Table(Index(Row(HttpBaseClient)))) {}

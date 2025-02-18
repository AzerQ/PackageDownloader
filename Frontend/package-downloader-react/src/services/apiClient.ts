//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v14.0.4.0 (NJsonSchema v11.0.0.0 (Newtonsoft.Json v13.0.0.0)) (http://NSwag.org)
// </auto-generated>
//----------------------

import { cloneObject } from "../utils/objectsTools";
import { downloadFile } from "./fileDownloader";

/* tslint:disable */
/* eslint-disable */
// ReSharper disable InconsistentNaming


export class PackagesAPIClient {
    private http: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> };
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(baseUrl?: string, http?: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> }) {
        this.http = http ? http : window as any;
        this.baseUrl = baseUrl ?? "";
    }

    /**
     * @param packageType (optional) 
     * @param namePart (optional) 
     * @return Success
     */
    async getSearchResults(packageType: PackageType | undefined, namePart: string | undefined): Promise<PackageInfo[]> {
        let url_ = this.baseUrl + "/api/PackageInfo/GetSearchResults?";
        if (packageType === null)
            throw new Error("The parameter 'packageType' cannot be null.");
        else if (packageType !== undefined)
            url_ += "packageType=" + encodeURIComponent("" + packageType) + "&";
        if (namePart === null)
            throw new Error("The parameter 'namePart' cannot be null.");
        else if (namePart !== undefined)
            url_ += "namePart=" + encodeURIComponent("" + namePart) + "&";
        url_ = url_.replace(/[?&]$/, "");

        let options_: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        };

        let response = await this.http.fetch(url_, options_);
        let results = await this.processGetSearchResults(response);
        return results.map(item => cloneObject(item, new PackageInfo()));
    }

    protected async processGetSearchResults(response: Response): Promise<IPackageInfo[]> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
                let result200: any = null;
                result200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver) as IPackageInfo[];
                return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
                return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<PackageInfo[]>(null as any);
    }

    /**
     * @param packageType (optional) 
     * @param namePart (optional) 
     * @return Success
     */
    getSearchSuggestions(packageType: PackageType | undefined, namePart: string | undefined): Promise<string[]> {
        let url_ = this.baseUrl + "/api/PackageInfo/GetSearchSuggestions?";
        if (packageType === null)
            throw new Error("The parameter 'packageType' cannot be null.");
        else if (packageType !== undefined)
            url_ += "packageType=" + encodeURIComponent("" + packageType) + "&";
        if (namePart === null)
            throw new Error("The parameter 'namePart' cannot be null.");
        else if (namePart !== undefined)
            url_ += "namePart=" + encodeURIComponent("" + namePart) + "&";
        url_ = url_.replace(/[?&]$/, "");

        let options_: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processGetSearchSuggestions(_response);
        });
    }

    protected processGetSearchSuggestions(response: Response): Promise<string[]> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
                let result200: any = null;
                result200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver) as string[];
                return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
                return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<string[]>(null as any);
    }

    /**
     * @param body (optional) 
     * @return Success
     */
    preparePackagesDownloadLink(body: PackageRequest | undefined): Promise<string> {
        let url_ = this.baseUrl + "/api/Packages/PreparePackagesDownloadLink";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_: RequestInit = {
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processPreparePackagesDownloadLink(_response);
        });
    }

    protected async processPreparePackagesDownloadLink(response: Response): Promise<string> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return await response.text();
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
                return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.reject<string>(null as any);
    }

    /**
     * @param packageType (optional) 
     * @param userPrompt (optional) 
     * @return Success
     */
    getRecommendations(packageType: PackageType | undefined, userPrompt: string | undefined): Promise<PackageRecommendation[]> {
        let url_ = this.baseUrl + "/api/Recommendations/GetRecommendations?";
        if (packageType === null)
            throw new Error("The parameter 'packageType' cannot be null.");
        else if (packageType !== undefined)
            url_ += "packageType=" + encodeURIComponent("" + packageType) + "&";
        if (userPrompt === null)
            throw new Error("The parameter 'userPrompt' cannot be null.");
        else if (userPrompt !== undefined)
            url_ += "userPrompt=" + encodeURIComponent("" + userPrompt) + "&";
        url_ = url_.replace(/[?&]$/, "");

        let options_: RequestInit = {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processGetRecommendations(_response);
        });
    }

    protected processGetRecommendations(response: Response): Promise<PackageRecommendation[]> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
                let result200: any = null;
                result200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver) as PackageRecommendation[];
                return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
                return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<PackageRecommendation[]>(null as any);
    }
}

export interface PackageDetails {
    packageID: string;
    packageVersion: string;
    packageIconUrl: string;
}

export interface IPackageInfo {
    id: string;
    currentVersion: string;
    otherVersions: string[];
    description: string;
    tags: string[];
    authorInfo: string;
    repositoryUrl: string | null;
    iconUrl: string | null;
    packageUrl: string | null;
    downloadsCount: number;
    isAddedInCart: boolean;
    getPackageIconOrStockImage(): string;
}

export class PackageInfo implements IPackageInfo {
    id!: string;
    currentVersion!: string;
    otherVersions!: string[];
    description!: string;
    tags!: string[];
    authorInfo!: string;
    repositoryUrl!: string | null;
    iconUrl!: string | null;
    packageUrl!: string | null;
    downloadsCount!: number;
    isAddedInCart: boolean = false;
    getPackageIconOrStockImage(): string {
        return this.iconUrl ? this.iconUrl : "https://img.icons8.com/isometric/64/box.png";
    }
}


export interface PackageRecommendation {
    name: string;
    id: string;
    choiceDescription: string;
    codeExample: string;
}

export interface PackageRequest {
    packageType: PackageType;
    sdkVersion?: string | null;
    packagesDetails: PackageDetails[];
}

export enum PackageType {
    Npm = "Npm",
    Nuget = "Nuget",
}

export class ApiException extends Error {
    override message: string;
    status: number;
    response: string;
    headers: { [key: string]: any; };
    result: any;

    constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
        super();

        this.message = message;
        this.status = status;
        this.response = response;
        this.headers = headers;
        this.result = result;
    }

    protected isApiException = true;

    static isApiException(obj: any): obj is ApiException {
        return obj.isApiException === true;
    }
}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): any {
    if (result !== null && result !== undefined)
        throw result;
    else
        throw new ApiException(message, status, response, headers, null);
}

interface ApiHeartbeat {
    isAlive: boolean;
}

const HEARTBEAT_ENDPOINT = '/api/Heartbeat/HeartbeatExists';

export async function isHeartbeatExists(baseUrl: string) {
    let response = await fetch(baseUrl + HEARTBEAT_ENDPOINT, { method: 'GET' });
    try {
        let result = await response.json() as ApiHeartbeat;
        return result.isAlive;
    }
    catch (error) {
        return false;
    }
}

async function getApiUrl(): Promise<string> {

    const FRONTEND_PORT_DEV = '3000';
    const BACKEND_PORT_DEV = '5026';

    let UrlMain = location.origin;
    let UrlDev = UrlMain.replace(FRONTEND_PORT_DEV, BACKEND_PORT_DEV);

    let UrlBaseVariants = [UrlMain, UrlDev];

    for (const urlVariant of UrlBaseVariants) {
        if (await isHeartbeatExists(urlVariant)) {
            return urlVariant;
        }
    }

    throw new Error("API server not found!");
}


export const API_URL: string = await getApiUrl();

export const packageApiClient = new PackagesAPIClient(API_URL);
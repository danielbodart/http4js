import {Res} from "./Res";
import {Req} from "./Req";

export type KeyValues = {[key:string]: string};
export type Form = {[key:string]: string|string[]};
export type HeadersType = {[key:string]: string};


export interface HttpMessage {
    headers: HeadersType;
    body: string;

    header(name: string): string;

    withHeader(name: string, value: string): HttpMessage;

    replaceHeader(name: string, value: string): HttpMessage

    removeHeader(name: string): HttpMessage

    withBody(body: string): HttpMessage

    bodyString(): string

}

export type HttpHandler = (request: Req) => Promise<Res>

//#region Classes

import { Response } from "node-fetch";

/**
 * Clase Usuario
 * Instancia al usuario que va a usar la api
 * @example
 * let { User } = require('nekoapi')
 * let user = new User('token')
 */
export class User {
    private token_: string | undefined;
    private getToken(): string;

    /**
     * puedes establecer el token a partir de aqui, pero recomiendo usar el metodo dedicado
     * @param token Token de la api
     */
    constructor(token: string);
    /**
     * establece el token para usar la api
     * @example 
     * // no tan recomendada (token expuesto)
     * user.setToken('mf3a***'); 
     * // recomendada (token oculto)
     * user.setToken(process.env['NekoApiToken']); 
     */
    public token(token: string): void;
}

/**
 * Clase NekoGif
 * Crea un objeto Gif a partir de la respuesta del servidor
 */
export class NekoGif {
    private url: string | null;
    private anime: string | null;

    /**
     * Recepcion de la respuesta del servidor.
     * @param response respuesta del servidor
     */
    constructor(response: GifResponse);

    /**
     * Obten la url del gif
     * @returns {string | null} string: URL
     */
    public getUrl(): string | null;
    /**
     * Obten el anime del gif
     * @returns {string | null} string: Anime
     */
    public getAnime(): string | null;
}

/**
 * Clase BaseUser
 * Unicamente es para el manejo del token a traves de todo el paquete
 */
export class BaseUser {

    /**
     * Obten el token del usuario si este ya se estableció
     * @returns {string} Token de usuario
     */
    public static getToken(): string

    /**
     * Establece el token "global" para todo el paquete
     * @param token token: token a establecer
     */
    public static setToken(token: string): void
}

/**
 * Clase APIClient
 * Se encarga de hacer las solicitudes al servidor
 */
export class APIClient {
    /**
     * Instanciamiento de la clase
     * @param baseUrl baseUrl: link principal de la api
     * @param data data: objeto para las solicitudes (unicamente requiere el token dentro)
     * @example
     * new APIClient('/ruta', { token: '***' });
     */
    constructor(baseUrl: string, data: APIClientData);
    /**
     * Obtiene el objeto compartido por la api rest a traves de la ruta y con autorizacion por token
     * @param endpoint establece la ruta a la que se quiere comunicar en la api
     * @throws {APIError} solo si sucede un error entre solicitudes
     */
    public get(endpoint: string): Promise<GifResponse>
}

/**
 * Clase APIError
 * Errores personalizados respecto a la api rest
 */
export class APIError extends Error {

    /**
     * url a la que se realizo la solicitud
     */
    url: string;

    /**
     * codigo HTTP de la api
     */
    statusCode: number;

    /**
     * respuesta de la api
     */
    data: ApiResponse;

    /**
     * Determina el mensaje del error basado en el codigo
     * @param response respuesta de la api
     * @returns Mensaje de error
     */
    private determineMessage(response: ApiResponse): string;
    
    /**
     * Instanciamiento de un error de api 
     * @param endpoint endpoint: ruta solicitada
     * @param response response: respuesta por node-fetch
     * @param data data: objeto dado por la api
     */
    constructor(endpoint: string, response: Awaited<Response>, data: ApiResponse);
}

/**
 * Clase NekoError
 * Errores personalizados respecto al paquete
 */
export class NekoError extends Error {
    /**
     * Instanciamiento de un error del paquete
     * @param name name: nombre del error
     * @param message message: mensaje del error
     */
    constructor(name: string, message: string);
}

//#region constants

/**
 * Categoria SFW
 * aqui encontraras categorias no nsfw como accion y reaccion
 * @example 
 * // obtiene el objeto SFW
 * const SFW = require('nekoapi').SFW
 */
export const SFW: {
    /**
     * Funcion principal para obtener gifs de cierta categoria
     * @param category category: corresponde a la subcategoria de SFW 
     * @param gif gif: corresponde al gif que quieras obtener por categoria
     * @example
     * const { SFW } = require('nekoapi')
     * 
     * // se obtiene el objeto (es necesario que esto sea dentro de una funcion asincrona)
     * let cuddle = await SFW.getGif('action', 'cuddle')
     * 
     * // obtener url
     * cuddle.getUrl();
     * // obtener anime
     * cuddle.getAnime(); 
     */
    getGif<T extends SfwCategories>(category: T, gif: GifMap[T]): Promise<NekoGif>
}

//#region inferfaces

export interface NekoGifInterface {
    url: string | null,
    anime?: string | null
}

export declare interface GifMap {
    action: ActionGifs,
    reaction: ReactionGifs
}

//#region responses

export interface GifResponse extends ApiResponse {
    data?: {
        url: string;
        anime: string;
    }
}

export interface ApiResponse {
    message?: string,
    code: number
}

export interface APIClientData {
    token: string
}

//#region types

export type ActionGifs =
    'cook' |
    'cuddle' |
    'cure' |
    'draw' |
    'drive' |
    'eat' |
    'explosion' |
    'feed' |
    'hug' |
    'kickbut' |
    'kill' |
    'kiss' |
    'lick'|
    'pat' |
    'peek' |
    'playing' |
    'poke' |
    'punch' |
    'run' |
    'sape' |
    'shoot' |
    'sip'|
    'slap' |
    'sleep' |
    'stare' |
    'tickle' |
    'travel' |
    'work' ;

export type ReactionGifs = 'angry' | 
    'blush' |
    'bored' |
    'confused' |
    'cry' |
    'dance' |
    'laugh' |
    'like' | 
    'pout' |
    'scream' |
    'smug' |
    'think' |
    'vomit' |
    'wink';

export type SfwCategories = 'action' | 'reaction';

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { NekoGif, SFW, User } = require('..');

const OFFICIAL_BASE_URL = 'https://www.nexatdc.work.gd/api/sfw';
const TEST_BASE_URL = 'https://api.example.test/sfw';
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

function response(data, url = TEST_BASE_URL) {
    return {
        ok: true,
        status: 200,
        url,
        async json() {
            return { code: 200, data };
        }
    };
}

function prepare(t) {
    const originalFetch = global.fetch;
    const originalRandom = Math.random;
    const originalNow = Date.now;

    new User('token-de-prueba');
    SFW.setBaseURL(TEST_BASE_URL);
    SFW.setCacheTTL(DEFAULT_CACHE_TTL);

    t.after(() => {
        global.fetch = originalFetch;
        Math.random = originalRandom;
        Date.now = originalNow;
        SFW.setBaseURL(OFFICIAL_BASE_URL);
        SFW.setCacheTTL(DEFAULT_CACHE_TTL);
    });
}

test('getGif conserva la lista pero elige nuevamente y evita repeticiones consecutivas', async t => {
    prepare(t);
    let requests = 0;
    global.fetch = async () => {
        requests += 1;
        return response([
            { url: 'https://cdn.example/a.gif', anime: 'A' },
            { url: 'https://cdn.example/b.gif', anime: 'B' }
        ]);
    };
    Math.random = () => 0;

    const first = await SFW.getGif('action', 'hug');
    const second = await SFW.getGif('action', 'hug');
    const third = await SFW.getGif('action', 'hug');

    assert.ok(first instanceof NekoGif);
    assert.equal(first.getUrl(), 'https://cdn.example/a.gif');
    assert.equal(second.getUrl(), 'https://cdn.example/b.gif');
    assert.equal(third.getUrl(), 'https://cdn.example/a.gif');
    assert.equal(requests, 1);
});

test('getGifs devuelve instancias nuevas sin exponer los datos internos del caché', async t => {
    prepare(t);
    let requests = 0;
    global.fetch = async () => {
        requests += 1;
        return response([{ url: 'https://cdn.example/hug.gif', anime: 'Serie' }]);
    };

    const first = await SFW.getGifs('action', 'hug');
    first[0].url = 'https://malicioso.example/cambio.gif';
    const second = await SFW.getGifs('action', 'hug');

    assert.notEqual(first[0], second[0]);
    assert.equal(second[0].getUrl(), 'https://cdn.example/hug.gif');
    assert.equal(requests, 1);
});

test('las solicitudes concurrentes de la misma subcategoría comparten una petición', async t => {
    prepare(t);
    let requests = 0;
    let release;
    global.fetch = () => {
        requests += 1;
        return new Promise(resolve => {
            release = () => resolve(response([{ url: 'https://cdn.example/a.gif', anime: 'A' }]));
        });
    };

    const pending = [
        SFW.getGifs('action', 'hug'),
        SFW.getGifs('action', 'hug'),
        SFW.getGif('action', 'hug')
    ];
    await Promise.resolve();
    assert.equal(requests, 1);

    release();
    await Promise.all(pending);
    assert.equal(requests, 1);
});

test('clearCache puede invalidar una subcategoría sin eliminar las demás', async t => {
    prepare(t);
    const requestedURLs = [];
    global.fetch = async url => {
        requestedURLs.push(String(url));
        const name = String(url).includes('/hug') ? 'hug' : 'cuddle';
        return response([{ url: `https://cdn.example/${name}.gif`, anime: 'Serie' }], String(url));
    };

    await SFW.getGif('action', 'hug');
    await SFW.getGif('action', 'cuddle');
    await SFW.getGif('action', 'hug');
    SFW.clearCache('action', 'hug');
    await SFW.getGif('action', 'hug');
    await SFW.getGif('action', 'cuddle');

    assert.equal(requestedURLs.length, 3);
    assert.equal(requestedURLs.filter(url => url.endsWith('/action/hug')).length, 2);
    assert.equal(requestedURLs.filter(url => url.endsWith('/action/cuddle')).length, 1);
});

test('el caché vuelve a consultar la API después de vencer el TTL', async t => {
    prepare(t);
    let now = 1_000;
    let requests = 0;
    Date.now = () => now;
    SFW.setCacheTTL(100);
    global.fetch = async () => {
        requests += 1;
        return response([{ url: 'https://cdn.example/a.gif', anime: 'A' }]);
    };

    await SFW.getGif('action', 'hug');
    now += 99;
    await SFW.getGif('action', 'hug');
    now += 1;
    await SFW.getGif('action', 'hug');

    assert.equal(requests, 2);
});

test('cambiar el token invalida automáticamente las listas almacenadas', async t => {
    prepare(t);
    let requests = 0;
    global.fetch = async () => {
        requests += 1;
        return response([{ url: 'https://cdn.example/a.gif', anime: 'A' }]);
    };

    await SFW.getGif('action', 'hug');
    new User('otro-token-de-prueba');
    await SFW.getGif('action', 'hug');

    assert.equal(requests, 2);
});

test('acciones y reacciones consultan sus listas sin solicitar random al servidor', async t => {
    prepare(t);
    const requestedURLs = [];
    global.fetch = async url => {
        requestedURLs.push(String(url));
        return response([{ url: 'https://cdn.example/a.gif', anime: 'A' }], String(url));
    };

    await SFW.getGifs('action', 'hug');
    await SFW.getGifs('reaction', 'angry');

    assert.deepEqual(requestedURLs, [
        `${TEST_BASE_URL}/action/hug`,
        `${TEST_BASE_URL}/reaction/angry`
    ]);
});

test('SFW rechaza respuestas vacías o elementos sin URL', async t => {
    prepare(t);
    global.fetch = async () => response([]);
    await assert.rejects(() => SFW.getGif('action', 'hug'), /EmptyResponse/);

    SFW.clearCache();
    global.fetch = async () => response([{ anime: 'Sin URL' }]);
    await assert.rejects(() => SFW.getGif('action', 'hug'), /InvalidResponse/);
});

test('la configuración rechaza URL insegura y TTL inválido', t => {
    prepare(t);
    assert.throws(() => SFW.setBaseURL('http://example.com'), /HTTPS/);
    assert.throws(() => SFW.setBaseURL('https://user:pass@example.com'), /credenciales/);
    assert.throws(() => SFW.setCacheTTL(-1), /mayor o igual a cero/);
});

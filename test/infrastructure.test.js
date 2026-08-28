'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Canvas = require('canvas');

const neekuro = require('..');
const {
    isPrivateAddress,
    parseRemoteURL,
    validateImageBuffer
} = require('../sources/utils/imageLoader.js');

const fixture = Canvas.createCanvas(2, 2);
const PNG = fixture.toBuffer('image/png');

test('la API pública conserva exports compatibles', () => {
    assert.equal(typeof neekuro.Welcome, 'function');
    assert.equal(typeof neekuro.APIError, 'function');
    assert.equal(neekuro.Error, neekuro.NekoError);
});

test('las URLs de imagen deben ser HTTPS y no llevar credenciales', () => {
    assert.equal(parseRemoteURL('https://cdn.discordapp.com/image.png', 'avatar').protocol, 'https:');
    assert.throws(() => parseRemoteURL('http://example.com/image.png', 'avatar'), /HTTPS/);
    assert.throws(() => parseRemoteURL('https://user:pass@example.com/image.png', 'avatar'), /credenciales/);
});

test('se identifican direcciones privadas y reservadas', () => {
    for (const address of ['127.0.0.1', '10.0.0.1', '172.16.0.1', '192.168.1.1', '::1', 'fd00::1']) {
        assert.equal(isPrivateAddress(address), true, address);
    }
    assert.equal(isPrivateAddress('1.1.1.1'), false);
    assert.equal(isPrivateAddress('2606:4700:4700::1111'), false);
});

test('se valida la firma del Buffer y se admite WebP', () => {
    assert.doesNotThrow(() => validateImageBuffer(PNG, 'avatar'));
    assert.doesNotThrow(() => validateImageBuffer(Buffer.from('524946460000000057454250', 'hex'), 'avatar'));
    assert.throws(() => validateImageBuffer(Buffer.alloc(20), 'avatar'), /JPEG, PNG, GIF o WebP/);
});

test('Welcome valida dimensiones, restaura defaults y acepta coordenadas cero', () => {
    const welcome = new neekuro.Welcome()
        .setResolution(800, 400)
        .setTitle('Título', { x: 0, y: 0 })
        .setDescription('Descripción', { x: 0, y: 0 })
        .setAvatar(PNG, { x: 0, y: 0, radio: 100 });

    assert.equal(welcome.data.title.x, 0);
    assert.equal(welcome.data.avatar.x, 0);
    assert.equal(welcome.data.layout, 'manual');
    welcome.setLayout('center');
    assert.equal(welcome.data.layout, 'center');
    welcome.setResolution('default', 'default');
    assert.equal(welcome.data.width, 1140);
    assert.equal(welcome.data.height, 520);
    assert.throws(() => welcome.setResolution(10, 10), /entre 128 y 4096/);
});

test('Welcome genera un PNG sin acceder a la red', async () => {
    const image = await new neekuro.Welcome()
        .setAvatar(PNG)
        .setTitle('Bienvenido')
        .setDescription('Servidor de prueba')
        .build();

    assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
});

test('el contenido automático queda centrado como una columna', async () => {
    const image = await new neekuro.Welcome()
        .setResolution(800, 500)
        .setAvatar(PNG)
        .setTitle('CENTRADO')
        .setDescription('También centrado')
        .build();
    const rendered = await Canvas.loadImage(image);
    const canvas = Canvas.createCanvas(rendered.width, rendered.height);
    const context = canvas.getContext('2d');
    context.drawImage(rendered, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let minX = canvas.width;
    let maxX = 0;
    let minY = canvas.height;
    let maxY = 0;
    for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
            const index = (y * canvas.width + x) * 4;
            if (pixels[index] !== 35 || pixels[index + 1] !== 39 || pixels[index + 2] !== 42) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
    }
    assert.ok(Math.abs((minX + maxX) / 2 - canvas.width / 2) <= 3);
    assert.ok(Math.abs((minY + maxY) / 2 - canvas.height / 2) <= 12);
});

test('User permite establecer el token en constructor o posteriormente', () => {
    assert.doesNotThrow(() => new neekuro.User().token('token-de-prueba'));
    assert.doesNotThrow(() => new neekuro.User('otro-token'));
    assert.throws(() => new neekuro.User('   '), /requerido/);
});

test('APIClient rechaza configuraciones inseguras antes de hacer solicitudes', () => {
    assert.throws(() => new neekuro.APIClient('http://example.com', { token: 'x' }), /HTTPS/);
    assert.throws(() => new neekuro.APIClient('https://example.com', { token: '' }), /token/);
    const client = new neekuro.APIClient('https://example.com/', { token: 'x' });
    assert.rejects(() => client.get('sin-barra'), /comenzar con/);
});

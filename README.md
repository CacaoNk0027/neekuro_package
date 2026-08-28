<center> <h1>NeeKuro</h1> </center>
<center>de <b>Kmz Kuro</b> en nombre de <b>NexaTDC</b></center>
<center>creada apartir de <b>cacao_nekoapi</b> y <b>nekoapi.beta</b> en npm.js</center>
<br>
<center>
<img alt="NPM Version" src="https://img.shields.io/npm/v/neekuro?logo=npm&style=flat&color=0d8973">
<img alt="Downloads" src="https://img.shields.io/npm/dw/neekuro?style=flat&color=bf9308&label=Descargas">
<img alt="Typescript" src="https://img.shields.io/badge/declaraciones-typescript-blue?logo=typescript">
<img alt="NPM Version" src="https://img.shields.io/badge/node%20version-%3E=20.12.2-489248?logo=nodedotjs">
</center>

### ¿Qué es "NeeKuro"?

NeeKuro es una biblioteca de imágenes con temática de anime para bots de Discord e imagenes de bienvenida.

Principalmente se creo con el fin de ser unicamente para <b>Maple Bot</b>. Sin embargo, desde que se decidio hacer a Maple de codigo publico, tambien se decidio que tanto su API como paquete fuesen libres.

> notas: el paquete puede contener errores ya que se encuentra en fase beta, la API se hostea de manera gratuita por lo que las solicitudes no siempre pueden estar disponibles.

## Instalacion

```sh
npm install neekuro
```

## Ejemplos

NeeKuro es un paquete que requiere de un token para llevar a cabo sus sollicitudes, por lo que requieres de ir a la [API Oficial](https://www.nexatdc.work.gd/api/) para poder generar un token.

### primeros pasos
1 - Instanciamiento de usuario y establecimiento del token.<br>Este paso se requiere ya que con ello se establece globalmente el token por el paquete
<hr>

```javascript
require('dotenv').config();
// importacion del paquete neekuro
const neekuro = require('neekuro');

// instanciamiento del usuario
const user = new neekuro.User();

// establecimiento del token
user.token(process.env['ApiToken'])
```
<hr>

#### Peticion de imagenes simple
Una vez estableciste el token puedes comenzar a pedir imagenes

```javascript

const neekuro = require('neekuro');

/**
 * Codigo de usuario
 */

// es necesario escribir todo siempre dentro de una funcion asincrona
async function ObtenerImagen() {
    // obtenemos un gif con el metodo getGif de SFW
    const cuddle = await neekuro.SFW.getGif('action', 'cuddle');
    
    // imprimimos la url y el anime del gif
    console.log(cuddle.getUrl(), cuddle.getAnime())
}

// ejecutamos la funcion
ObtenerImagen();

// nota: no te aguites por el gif y subcategoria, todo viene en documentado con typescript, solo tienes que completar los pasos :)
```

`getGif()` selecciona una imagen nuevamente en cada llamada. Internamente, NeeKuro
conserva durante cinco minutos la lista de la subcategoría para reducir solicitudes
HTTP; no conserva un único GIF durante ese tiempo. Cuando existen varias imágenes,
evita mostrar la misma dos veces consecutivas.

También puedes obtener la lista completa:

```javascript
const gifs = await neekuro.SFW.getGifs('action', 'cuddle');
console.log(gifs.map(gif => gif.getUrl()));
```

Si actualizaste el catálogo y necesitas consultarlo inmediatamente, puedes limpiar
una subcategoría, una categoría completa o toda la caché:

```javascript
neekuro.SFW.clearCache('action', 'cuddle');
neekuro.SFW.clearCache('action');
neekuro.SFW.clearCache();
```

El TTL se expresa en milisegundos y un valor de cero desactiva la caché:

```javascript
neekuro.SFW.setCacheTTL(5 * 60 * 1000);
```

Para pruebas o instalaciones propias de la API puede configurarse otra URL HTTPS:

```javascript
neekuro.SFW.setBaseURL('https://api.example.com/api/sfw');
```

#### Ejemplo de imagenes de bienvenida
Las imagenes de bienvenida son otra de las alternativas que otorga NeeKuro, puedes hacer una imagen de la siguiente manera:
```javascript
// obtenemos directamente la clase del paquete
const { Welcome } = require('neekuro');
const fs = require('fs');

// Configuración básica, añade un avatar titulo y descripción
const welcome = new Welcome()
  .setAvatar('https://ejemplo.com/avatar.jpg')
  .setTitle('¡Bienvenido!')
  .setDescription('Al servidor de Discord');

// Genera y guarda la imagen
welcome.build()
  .then(image => fs.writeFileSync('bienvenida.png', image))
  .then(() => console.log('Imagen creada correctamente!'))
  .catch(err => console.error('Error:', err.message));

// nota: como antes, todo viene bien documentado en el paquete, solo sigue los pasos y explora por ti ;3
```

Las imágenes remotas deben usar HTTPS. El paquete limita cada descarga a 10 MB,
aplica un tiempo máximo de 10 segundos, comprueba el formato y bloquea direcciones
locales o privadas. También puedes proporcionar un `Buffer` JPEG, PNG, GIF o WebP.

La resolución admite valores enteros entre 128 y 4096 píxeles. Para regresar al
tamaño original de 1140 × 520 puedes usar:

```javascript
welcome.setResolution('default', 'default');
```

Por defecto, el avatar, el título y la descripción forman una columna centrada
horizontal y verticalmente. El tamaño del avatar y de los textos se adapta cuando
la resolución es pequeña. Si necesitas coordenadas personalizadas puedes activar
el modo manual directamente o proporcionar `x`/`y` en cualquiera de los elementos:

```javascript
welcome.setLayout('manual');

// Para regresar a la distribución automática:
welcome.setLayout('center');
```

## Desarrollo

```sh
pnpm install
pnpm run check
pnpm run pack:check
```

`pnpm run check` ejecuta las pruebas funcionales locales y comprueba las
declaraciones TypeScript. Ninguna de estas pruebas consulta la API remota.
<hr>
<center>
<p>Resultado esperado</p>
<img src="./sources/assets/example.png" style="width: 60%; max-width: 500px;" alt="Texto alternativo">
</center>

## Contenido

Lo siguente es lo que contiene (o contendra) el paquete

| Categoria | Descripción | |
|-|-|-|
| Sfw | Contenido de roleplay no nsfw | en desarrollo
| Nsfw | Contenido +18 general y roleplay | no comenzada

## Finalmente....

Tanto la API, paquete y bot se encuentran en desarrollo, ante todo te pedimos la mayor de las paciencias, te aseguraremos que el resultado te gustará! :'3

Finalmente te agradecemos tu preferencia y esperamos haber cumplido tus espectativas ;)
<br><br><hr>

### que se tiene planeado?

Principalmente terminaremos la categoria acción y reacción para tener la primer subida a NPM de este paquete y asi finalmente tener terminada la categoria SFW. <br> Sin embargo una de las problematicas que se nos presentan son buscar los gifs para la API asi como sus animes <b>es un proceso lento...</b> y agobiante...
<br>Por eso ahora mas que nunca queremos que nos apoyes en <b>NexaTDC</b>! Con el fin de poder dar al publico lo mas pronto posible los servicios que Maple Bot ofrece.

<b><i>No es para mi, es para la comunidad... Si no es para la comunidad, no es para nadie...</i></b>
<i>- NexaTDC</i>
<br><br><br><br>
CC. Creative Commons 2025 - @CacaoNk0027

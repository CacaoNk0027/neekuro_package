<center> <h1>NekoApi</h1> </center>
<center>de <b>Kmz Kuro</b> en nombre de <b>NexaTDC</b></center>
<center>creada apartir de <b>cacao_nekoapi</b> y <b>nekoapi.beta</b> en npm.js</center>

### ¿Qué es "NekoApi"?

NekoApi es una biblioteca de imágenes con temática de anime para bots de Discord.

Principalmente se creo con el fin de ser unicamente para <b>Maple Bot</b>. Sin embargo, desde que se decidio hacer a Maple de codigo publico, tambien se decidio que tanto su API como paquete fuesen libres.

## Instalacion

```sh
npm install nekoapi
```

## Ejemplos

NekoApi es un paquete que requiere de un token para llevar a cabo sus sollicitudes, por lo que requieres de ir a la [API Oficial]() para poder generar un token.

#### primeros pasos
1 - Instanciamiento de usuario y establecimiento del token.<br>Este paso se requiere ya que con ello se establece globalmente el token por el paquete
<hr>

```javascript
require('dotenv').config();
// importacion del paquete nekoapi
const nekoapi = require('nekoapi');

// instanciamiento del usuario
const user = new nekoapi.User();

// establecimiento del token
user.token(process.env['ApiToken'])
```
<hr>

2 - Peticion de imagenes simple
Una vez estableciste el token puedes comenzar a pedir imagenes

```javascript

const nekoapi = require('nekoapi');

/**
 * Codigo de usuario
 */

// es necesario escribir todo siempre dentro de una funcion asincrona
async function ObtenerImagen() {
    // obtenemos un gif con el metodo getGif de SFW
    const cuddle = await nekoapi.SFW.getGif('action', 'cuddle');
    
    // imprimimos la url y el anime del gif
    console.log(cuddle.getUrl(), cuddle.getAnime())
}

// ejecutamos la funcion
ObtenerImagen();

// nota: no te aguites por el gif y subcategoria, todo viene en documentado con typescript, solo tienes que completar los pasos :)
```

## Contenido

Lo siguente es lo que contiene (o contendra) el paquete

| Categoria | Descripción | |
|-|-|-|
| Sfw | Contenido de roleplay no nsfw | en desarrollo
| Nsfw | Contenido +18 general y roleplay | no comenzada
| Gen | Categoria generadora de imagenes con canvas | no comenzada

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
CC. Creative Commons 2024 - @CacaoNk0027

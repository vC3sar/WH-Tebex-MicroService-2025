# WH-Tebex-MicroService

Este repositorio contiene una aplicación de Node.js que implementa un webhook para enviar notificaciones de compra a un canal específico en Discord. El webhook está diseñado para recibir solicitudes POST con información sobre productos y precios de compras realizadas.

A continuación, te presento la documentación del código proporcionado:

# Documentación del Código

## Descripción

Este código es una aplicación de Node.js que funciona como un bot de Discord y un servidor web. El bot de Discord recibe información de productos y sus precios a través de una solicitud POST y publica esos productos en un canal específico de Discord. El servidor web se encarga de recibir la solicitud POST y procesar la información para enviarla al bot de Discord.

## Configuración (APP)

Antes de ejecutar la aplicación, es necesario configurar algunas variables en el archivo `config.json`. A continuación, se describen las principales variables de configuración:

- `debug`: Un valor booleano que indica si el modo de depuración está habilitado o no.
- `defPort`: El número de puerto en el que se ejecutará el servidor web.
- `embed`: Un objeto con varias configuraciones para los mensajes embebidos (embeds) que se enviarán al canal de Discord.
- `token`: El token de acceso del bot de Discord.
- `shopchannelID`: El ID del canal de Discord donde se publicarán los productos.
- `language`: El idioma de la aplicación.

## Configuracion (Tebex)

1. Debera crear un dns apuntando a su servidor donde aloja este servicio.
2. Añada el dns con el puerto establecido anteriormente como punto de acceso webhook en la seccion developers en tebex.

- Ejemplo: us1.haliacraft.com:12345
- Puedes ver el ejemplo de la seccion aqui: https://prnt.sc/aT8YeXmqx9J7 - https://prnt.sc/eyVXUlLRJtL9 - https://prnt.sc/zDIEw7lYeJ3H

3. Verifique que se haya validado el webhook como correcto.

## Inicio de la Aplicación

La aplicación se inicia mediante la creación de una instancia del cliente de Discord y la configuración del servidor web.

- El cliente de Discord se inicializa con las intenciones adecuadas para recibir mensajes y eventos de miembros y mensajes de los servidores.
- El servidor web se crea utilizando Express y escucha en el puerto especificado en la variable `defPort`.

## Funciones Principales

La aplicación cuenta con las siguientes funciones principales:

### `sendWH()`

Esta función se encarga de enviar un mensaje embebido (embed) al canal de Discord especificado con la información de los productos recibidos a través de la solicitud POST. Los detalles del producto, el precio total y otros datos se incluyen en el mensaje embebido.

## Eventos y Funcionalidades de Depuración

El código también incluye una funcionalidad de depuración que se habilita si la variable `debug` se establece en `true`. En ese caso, se imprimirán mensajes adicionales en la consola, incluyendo mensajes de los usuarios del bot de Discord y otros detalles de funcionamiento.

## Iniciar la Aplicación

Para iniciar la aplicación, se debe ejecutar el comando `node index.js` en la línea de comandos. El bot de Discord y el servidor web comenzarán a funcionar, siempre y cuando se hayan configurado correctamente las variables necesarias y las dependencias estén instaladas.

Es importante recordar que la aplicación necesita acceso al token del bot de Discord y a los canales de Discord especificados para funcionar correctamente. Además, asegúrate de que el archivo `config.json` esté correctamente configurado y que todos los módulos necesarios estén instalados antes de iniciar la aplicación.

## Notas Finales

Este código es un ejemplo básico de una aplicación que recibe información a través de una solicitud POST y la envía a un canal de Discord. Dependiendo de tus necesidades específicas, es posible que desees agregar más funcionalidades, seguridad y manejo de errores para adaptarlo a tu caso de uso particular.

Recuerda también que la implementación de actualizaciones automáticas y la publicación en Discord deben realizarse con precaución en un entorno de producción para evitar problemas y garantizar un funcionamiento estable de la aplicación.

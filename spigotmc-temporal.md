[CENTER]
[SIZE=7][B][COLOR=rgb(89, 0, 179)]WH-Tebex-MicroService[/COLOR][/B][/SIZE]
[SIZE=3][COLOR=rgb(130, 130, 130)]MicroServicio Node.js  •  Webhook para Discord  •  Compatible con Tebex  •  100% Gratuito[/COLOR][/SIZE]
[/CENTER]

[CENTER][IMG]https://i.ibb.co/wBmySK6/image.png[/IMG][/CENTER]

[CENTER][SIZE=5][B][COLOR=rgb(179, 0, 89)]❯ Comandos Tebex[/COLOR][/B][/SIZE][/CENTER]

[LIST]
[*][SIZE=3][B]!tbxuser <nick|uuid>[/B] — Consulta un usuario Tebex, muestra sus pagos con paginación y permite abrir un pago desde el selector.[/SIZE]
[*][SIZE=3][B]!tbxcheck <tbx-id>[/B] — Consulta el detalle completo de un pago Tebex por ID de transacción.[/SIZE]
[/LIST]

[CENTER][SIZE=5][B][COLOR=rgb(179, 0, 89)]❯ Ejemplo rápido[/COLOR][/B][/SIZE][/CENTER]

[SIZE=3][B]Uso:[/B][/SIZE]
[LIST]
[*][SIZE=3][B]!tbxuser Notch[/B][/SIZE]
[*][SIZE=3][B]!tbxcheck 1234567890[/B][/SIZE]
[/LIST]

[SIZE=3][B]Resultado esperado:[/B] el bot responderá con un embed de usuario o con el detalle del pago seleccionado.[/SIZE]

[CENTER][SIZE=5][B][COLOR=rgb(179, 0, 89)]❯ Ejemplo de configuración[/COLOR][/B][/SIZE][/CENTER]

[SIZE=3]Renombra el archivo [B]config.example.json[/B] a [B]config.json[/B] y edita estos valores:[/SIZE]

[LIST]
[*][SIZE=3][B]token[/B] — Token secreto de tu bot de Discord.[/SIZE]
[*][SIZE=3][B]shopchannelID[/B] — ID del canal donde se publicarán las notificaciones.[/SIZE]
[*][SIZE=3][B]defPort[/B] — Puerto en el que escuchará el servidor web (ej: 25500).[/SIZE]
[*][SIZE=3][B]language[/B] — Idioma de la aplicación (ej: [I]es[/I], [I]en[/I]).[/SIZE]
[*][SIZE=3][B]showServer[/B] — Mostrar o no el servidor de compra en el embed ([I]true/false[/I]).[/SIZE]
[*][SIZE=3][B]embed.url[/B] — URL de tu tienda Tebex.[/SIZE]
[*][SIZE=3][B]embed.url_infooter[/B] — Muestra el dominio en el footer del embed.[/SIZE]
[*][SIZE=3][B]embed.color[/B] — Color del embed en hex (ej: [I]#0099ff[/I]).[/SIZE]
[*][SIZE=3][B]embed.useMCskin[/B] — Mostrar la skin de Minecraft del comprador ([I]true/false[/I]).[/SIZE]
[*][SIZE=3][B]embed.gifurl[/B] — GIF o imagen animada para el embed.[/SIZE]
[*][SIZE=3][B]embed.imageurl[/B] — Imagen principal del embed de compra.[/SIZE]
[*][SIZE=3][B]debug[/B] — Activa el modo de depuración en consola ([I]true/false[/I]).[/SIZE]
[*][SIZE=3][B]tebexCheck.prefix[/B] — Prefijo de comandos Tebex, normalmente [I]![/I].[/SIZE]
[*][SIZE=3][B]tebexCheck.apiKey[/B] — Private Key de Tebex para consultar la API.[/SIZE]
[*][SIZE=3][B]tebexCheck.requiredRole[/B] — Rol requerido para usar los comandos.[/SIZE]
[/LIST]

[CENTER][SIZE=5][B][COLOR=rgb(179, 0, 89)]❯ ¿Qué es?[/COLOR][/B][/SIZE][/CENTER]

[SIZE=3]Aplicación de [B]Node.js[/B] que actúa como bot de Discord y servidor web simultáneamente. Recibe notificaciones de compra desde [B]Tebex[/B] a través de solicitudes POST y las publica automáticamente como embeds en el canal de Discord que configures. También incluye comandos de consulta Tebex por Discord, validación por IP, idempotencia para evitar duplicados y endpoints de salud y métricas.

Esta versión fue desarrollada en colaboración con [B]benxh[/B].[/SIZE]

[CENTER][SIZE=5][B][COLOR=rgb(179, 0, 89)]❯ Características[/COLOR][/B][/SIZE][/CENTER]

[LIST]
[*][SIZE=3][B]Notificaciones de compra en Discord[/B] — Envía un embed detallado con el producto, precio, comprador y servidor de compra.[/SIZE]
[*][SIZE=3][B]Comandos Tebex[/B] — Consulta usuarios y pagos con `!tbxuser` y `!tbxcheck`.[/SIZE]
[*][SIZE=3][B]Paginación interactiva[/B] — Navega entre pagos y abre un pago concreto desde un selector.[/SIZE]
[*][SIZE=3][B]Idempotencia[/B] — Evita publicar eventos duplicados si Tebex reintenta el webhook.[/SIZE]
[*][SIZE=3][B]Muestra el servidor de compra[/B] — Identifica desde qué servidor se realizó la compra.[/SIZE]
[*][SIZE=3][B]Compatible con Proxy y Cloudflare[/B] — Funciona sin problemas detrás de proxies y protección Cloudflare.[/SIZE]
[*][SIZE=3][B]Traducción automática[/B] — Integración con la API de Google Translate, soporte para +133 idiomas.[/SIZE]
[*][SIZE=3][B]Skins de Minecraft[/B] — Opción para mostrar la skin del comprador en el embed ([I]useMCskin[/I]).[/SIZE]
[*][SIZE=3][B]Emojis personalizables[/B] — Configura los emojis del título, moneda, reacción y flechas de producto.[/SIZE]
[*][SIZE=3][B]Modo debug[/B] — Registro detallado en consola para facilitar la depuración.[/SIZE]
[*][SIZE=3][B]Favicon personalizado[/B] — Soporte para favicon de tu tienda Tebex en el embed.[/SIZE]
[*][SIZE=3][B]Health y metrics[/B] — Endpoints `GET /healthz` y `GET /metrics` para monitoreo básico.[/SIZE]
[/LIST]

[CENTER][SIZE=5][B][COLOR=rgb(179, 0, 89)]❯ Novedades actuales[/COLOR][/B][/SIZE][/CENTER]

[LIST]
[*][SIZE=3]Comandos nuevos para Tebex por Discord.[/SIZE]
[*][SIZE=3]Paginación para pagos de usuario.[/SIZE]
[*][SIZE=3]Detalle de pagos al seleccionar un item.[/SIZE]
[*][SIZE=3]Idempotencia por [B]transaction_id[/B] / [B]order_id[/B].[/SIZE]
[*][SIZE=3]Logs con [B]X-Request-Id[/B].[/SIZE]
[*][SIZE=3]Endpoint [B]GET /healthz[/B].[/SIZE]
[*][SIZE=3]Endpoint [B]GET /metrics[/B].[/SIZE]
[/LIST]

[CENTER][SIZE=5][B][COLOR=rgb(179, 0, 89)]❯ Tutorial de instalación[/COLOR][/B][/SIZE][/CENTER]

[CENTER][MEDIA=youtube]pwkYChsQ770[/MEDIA][/CENTER]

[CENTER][SIZE=5][B][COLOR=rgb(179, 0, 89)]❯ Configuración en Tebex[/COLOR][/B][/SIZE][/CENTER]

[LIST=1]
[*][SIZE=3]Crea un DNS apuntando a tu servidor donde alojas el microservicio.[/SIZE]
[*][SIZE=3]En tu panel de Tebex, ve a [B]Developers → Webhooks[/B] y añade tu DNS con el puerto configurado como punto de acceso.[/SIZE]
[SIZE=3]Ejemplo: [B]tu-servidor.com:25500[/B][/SIZE]
[*][SIZE=3]Verifica que el webhook aparezca como [B]validado[/B] en Tebex.[/SIZE]
[*][SIZE=3]Inicia la aplicación con [B]node index.js[/B] y el bot comenzará a recibir notificaciones.[/SIZE]
[/LIST]

[CENTER][SIZE=5][B][COLOR=rgb(179, 0, 89)]❯ Vista previa[/COLOR][/B][/SIZE][/CENTER]

[CENTER]
[IMG]https://i.ibb.co/wBmySK6/image.png[/IMG]
[IMG]https://i.ibb.co/w0NYWCr/image.png[/IMG]
[IMG]https://i.ibb.co/k5ptNP3/image.png[/IMG]
[/CENTER]

[CENTER][SIZE=5][B][COLOR=rgb(179, 0, 89)]❯ Endpoints[/COLOR][/B][/SIZE][/CENTER]

[LIST]
[*][SIZE=3][B]GET /healthz[/B] — Estado básico del servicio.[/SIZE]
[*][SIZE=3][B]GET /metrics[/B] — Contadores internos de requests, errores, validaciones y duplicados.[/SIZE]
[/LIST]

[CENTER][SIZE=5][B][COLOR=rgb(179, 0, 89)]❯ Seguridad y estabilidad[/COLOR][/B][/SIZE][/CENTER]

[LIST]
[*][SIZE=3]Verifica IPs oficiales de Tebex.[/SIZE]
[*][SIZE=3]Evita duplicados con idempotencia local.[/SIZE]
[*][SIZE=3]Cada request tiene un [B]X-Request-Id[/B].[/SIZE]
[*][SIZE=3]El sistema expone métricas y salud para monitoreo.[/SIZE]
[*][SIZE=3]El modo debug acelera pruebas, pero no está pensado para producción.[/SIZE]
[/LIST]

[CENTER][SIZE=5][B][COLOR=rgb(179, 0, 89)]❯ Enlaces[/COLOR][/B][/SIZE][/CENTER]

[LIST]
[*][SIZE=3][B][COLOR=rgb(89, 0, 179)]Documentación oficial:[/COLOR][/B] [URL='https://www.spigotmc.org/resources/tebex-webhook-for-discord.112311/field?field=documentation']Ver Docs[/URL][/SIZE]
[*][SIZE=3][B][COLOR=rgb(89, 0, 179)]GitHub (descarga alternativa):[/COLOR][/B] [URL='https://github.com/vC3sar/WH-Tebex-MicroService-2025/releases/tag/v2.1.1.1-STABLE']v2.1.1.1-STABLE[/URL][/SIZE]
[*][SIZE=3][B][COLOR=rgb(89, 0, 179)]Repositorio completo:[/COLOR][/B] [URL='https://github.com/vC3sar/WH-Tebex-MicroService-2025']GitHub — vC3sar/WH-Tebex-MicroService-2025[/URL][/SIZE]
[/LIST]

[CENTER]
[SIZE=2][COLOR=rgb(160, 0, 0)][B]⚠ RECURSO COMPLETAMENTE GRATUITO — PROHIBIDA SU REVENTA. PRODUCTO REGISTRADO.[/B][/COLOR][/SIZE]

[SIZE=2][COLOR=rgb(130, 130, 130)]Copyright ⓒ 2025 — vCesar's Company
Mantenido por [USER=1848683]@vCesar_1[/USER] y [USER=1149168]@Facucarpas[/USER][/COLOR][/SIZE]
[/CENTER]

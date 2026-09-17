# Despliegue en OCI A1 detrás de Cloudflare

> **En una línea:** cómo llevar el servidor HTTP (`src/http.ts`) de tu máquina a la instancia
> OCI A1 (Ampere, arm64), expuesto vía Cloudflare con HTTPS.

Este documento describe el plan; la ejecución contra el servidor real queda pendiente hasta
tener acceso SSH a la instancia y a la cuenta de Cloudflare.

**Ya validado localmente** (sin Docker ni OCI, simulando el paso de producción): el servidor
arranca y responde correctamente usando *solo* dependencias de producción (`npm ci --omit=dev`
+ `dist/` ya compilado, igual que hace el Dockerfile y el unit de systemd), así que el único
paso que falta es ejecutar esto en la instancia real.

## Variables de entorno requeridas

| Variable | Descripción |
|---|---|
| `PORT` | Puerto donde escucha el servidor HTTP (por defecto `3000`). |
| `MCP_TOKEN` | Token que deben enviar los clientes en `Authorization: Bearer <token>`. Obligatorio: el proceso no arranca sin él. |

Genera un token largo y aleatorio, por ejemplo con `openssl rand -hex 32`.

## Opción A — Docker

```bash
# En la instancia OCI A1 (arm64), o con buildx --platform linux/arm64 desde otra arquitectura:
docker build -t mcp-directorio-acambaro .
docker run -d \
  --name mcp-directorio-acambaro \
  --restart unless-stopped \
  -p 127.0.0.1:3000:3000 \
  -e MCP_TOKEN="tu-token-aqui" \
  mcp-directorio-acambaro
```

Nota: `better-sqlite3` es un módulo nativo; la imagen debe construirse en (o para) arm64 para
que coincida con la arquitectura de la instancia A1.

## Opción B — systemd (sin Docker)

1. Copiar el repo compilado a `/opt/mcp-directorio-acambaro` (incluye `dist/`, `node_modules/`,
   `package.json`).
2. Copiar `deploy/.env.example` a `/opt/mcp-directorio-acambaro/.env` y ajustar `MCP_TOKEN`.
3. Copiar `deploy/mcp-directorio-acambaro.service` a `/etc/systemd/system/`.
4. Crear el usuario de servicio y habilitar:

```bash
sudo useradd --system --no-create-home mcp-directorio
sudo chown -R mcp-directorio:mcp-directorio /opt/mcp-directorio-acambaro
sudo systemctl daemon-reload
sudo systemctl enable --now mcp-directorio-acambaro
sudo systemctl status mcp-directorio-acambaro
```

## Cloudflare (HTTPS)

Recomendado: **Cloudflare Tunnel** (`cloudflared`) en la propia instancia OCI, apuntando a
`http://localhost:3000`. Evita abrir puertos en el firewall/Security List de OCI y Cloudflare
gestiona el certificado HTTPS.

```bash
cloudflared tunnel create mcp-directorio-acambaro
cloudflared tunnel route dns mcp-directorio-acambaro mcp.acambaro.com.mx  # o el subdominio elegido
cloudflared tunnel --config ~/.cloudflared/config.yml run mcp-directorio-acambaro
```

Plantilla de config en [`deploy/cloudflared-config.example.yml`](../deploy/cloudflared-config.example.yml)
(copiarla a `~/.cloudflared/config.yml` y ajustar `credentials-file`/`hostname`).

Alternativa: exponer el puerto en el Security List de OCI y usar Cloudflare como proxy DNS
(nube naranja) hacia la IP pública, con "Full (strict)" y un certificado de origen de
Cloudflare en el servidor. Requiere abrir el puerto en el firewall de OCI.

## Verificación

```bash
deploy/verificar.sh https://<tu-dominio> <tu-token>
```

Corre `GET /salud`, confirma que `POST /mcp` sin token da 401, y que con el token correcto
responde el `initialize` de MCP. Ya se probó contra una instancia local (ver arriba).

## Pendiente

- [ ] Acceso SSH a la instancia OCI A1.
- [ ] Acceso a la cuenta/zona de Cloudflare (o confirmar que ya existe `staging.acambaro.com.mx`
      o similar para el subdominio del MCP).
- [ ] Elegir Docker o systemd.
- [ ] Ejecutar el despliegue y verificar con los comandos de arriba.
- [ ] Tag `v0.2.0` una vez verificado en producción.

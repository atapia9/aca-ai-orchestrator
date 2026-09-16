# MCP Directorio Acámbaro — Visión y alcance

> **En una línea:** un servidor MCP en TypeScript que permite a cualquier asistente de IA (Claude, etc.) buscar negocios locales de Acámbaro, consultar sus datos y recomendar servicios digitales de SDDA.

## 1. Por qué este proyecto

| Interés / conocimiento de Armando | Cómo lo aprovecha el MCP |
|---|---|
| Acambaro.com.mx y portal de directorio (ACA-2026-2027) | Es la fuente de datos y el caso de uso real |
| SDDA (consultoría de administración y mercadotecnia) | Tool de diagnóstico exprés que vincula negocio → servicio |
| 30+ años en IT, cursos de Node.js / JavaScript / Git | Stack TypeScript + Node, buenas prácticas de repo |
| Hosting en OCI (Monterrey) | Despliegue remoto HTTP en la instancia A1 |
| Prompt Engineering (Alura) | Prompts MCP reutilizables bien diseñados |
| Docencia UNAM | Documentación didáctica: el repo sirve también como material de clase |

## 2. Objetivo de portafolio

Demostrar en GitHub (`atapia9`) que Armando sabe **diseñar, construir, probar y desplegar** un servidor MCP con valor de negocio real, no un "hola mundo".

## 3. Alcance

**Incluye (MVP, v0.1):**
- Datos semilla en JSON (15–30 negocios **ficticios o con consentimiento**).
- 4 tools, 2 resources, 2 prompts (ver `01-ARQUITECTURA.md`).
- Transporte `stdio` para Claude Desktop / Claude Code.
- Pruebas automáticas + CI en GitHub Actions.

**Incluye (v0.2–v1.0):**
- Persistencia en SQLite.
- Transporte Streamable HTTP desplegado en OCI detrás de Cloudflare.
- Sincronización opcional con la API REST de WordPress (staging.acambaro.com.mx).

**No incluye:**
- Pagos, reservas, autenticación de usuarios finales.
- Datos personales reales sin consentimiento.

## 4. Criterios de éxito

1. `npx` / `npm start` levanta el servidor sin errores.
2. Se prueba completo con **MCP Inspector**.
3. Claude Desktop lo usa para responder: *"¿Qué cafeterías hay en Acámbaro abiertas en domingo?"*.
4. README con GIF demo, diagrama y guía de instalación en < 5 min.
5. Cobertura de pruebas ≥ 80 % en la lógica de dominio.

# vtex-init-helper

CLI para automatizar el inicio de tareas VTEX desde tickets de Jira.

## ¿Qué hace?

1. **Obtiene datos del ticket** de Jira (ID y título).
2. **Sugiere un nombre de rama** basado en el ticket.
3. **Lista repositorios** de Bitbucket con búsqueda difusa.
4. **Crea la rama remota** en el repositorio seleccionado.
5. **Clona el repositorio** y hace checkout a la rama.
6. **Configura el entorno VTEX** (switch, workspace, link).

## Instalación

```bash
npm install -g .
```

O para desarrollo:

```bash
npm run build
npm link
```

## Uso

### 1. Configurar credenciales (una sola vez)

```bash
vtex-init config
```

Se solicitarán:
- Dominio de Jira, email y API Token
- Workspace de Bitbucket, username y App Password

### 2. Iniciar una tarea

```bash
vtex-init ONIL-558
```

El CLI te guiará paso a paso a través de todo el flujo.

## Estructura del Proyecto

```
src/
├── index.ts              # Entry point (commander)
├── commands/
│   ├── config.ts         # Comando de configuración
│   └── init.ts           # Flujo principal
├── services/
│   ├── jira.ts           # API de Jira
│   └── bitbucket.ts      # API de Bitbucket
└── utils/
    ├── config.ts         # Manejo de configuración (conf)
    ├── branch.ts         # Generación de nombres de rama
    └── shell.ts          # Wrappers de execSync
```

## Configuración

Las credenciales se almacenan en `~/.config/vtex-init-helper/config.json`.

> ⚠️ **Nota de seguridad**: Actualmente las credenciales se almacenan en texto plano.
> En una versión futura se planea implementar cifrado de credenciales (ej. con `keytar`
> o cifrado AES con master password). Para el MVP esto es aceptable.

## Requisitos

- Node.js 18+
- VTEX Toolbelt instalado globalmente (`vtex`)
- Git
- Cuenta de Jira con API Token
- Cuenta de Bitbucket con App Password

## Desarrollo

```bash
npm run dev    # Compilación en modo watch
npm run build  # Compilación de producción
npm start      # Ejecutar dist/index.js
```

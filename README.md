# vtex-init-helper

CLI para automatizar el inicio de tareas VTEX desde tickets de Jira.

## ¿Qué hace?

1. **Obtiene datos del ticket** de Jira (ID y título).
2. **Sugiere un nombre de rama** basado en el ticket.
3. **Lista repositorios** de Bitbucket con búsqueda difusa.
4. **Crea la rama remota** en el repositorio seleccionado.
5. **Clona el repositorio** y hace checkout a la rama.
6. **Configura el entorno VTEX** (switch, workspace, link).
7. **Agrega un enlace web en Jira** apunando al workspace de prueba recién creado.

## Instalación

```bash
npm install -g vtex-init-helper
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
- Workspace de Bitbucket y API Token

### 2. Iniciar una tarea

```bash
vtex-init TAREA-001
```

El CLI te guiará paso a paso a través de todo el flujo.

### 3. Modo Simulación (Dry-Run)

Si quieres ver todo el flujo que ejecutaría el comando pero **sin realizar ningún cambio real** (no crea ramas, no clona, no afecta VTEX ni Jira), añade el flag `--dry-run`:

```bash
vtex-init TAREA-001 --dry-run
```

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
    ├── crypto.ts         # Cifrado de credenciales (AES-256)
    ├── branch.ts         # Generación de nombres de rama
    └── shell.ts          # Wrappers de execSync
```

## Seguridad

Las credenciales se almacenan **cifradas** en `~/.config/vtex-init-helper/config.json` usando **AES-256-CBC**.

### ¿Cómo funciona?

1. Se genera una **clave de cifrado única** para cada máquina y usuario, derivada de:
   - Hostname del equipo
   - Nombre de usuario del sistema operativo
   - Plataforma (win32, linux, darwin)
   - Directorio home del usuario
2. Estos datos se combinan y se procesan con **PBKDF2** (100.000 iteraciones, SHA-512) para producir una clave AES-256 segura.
3. La librería `conf` usa esta clave para cifrar/descifrar los datos de forma transparente.

### Garantías

- 🔒 Las credenciales **nunca se almacenan en texto plano**
- 🖥️ La configuración está **atada a la máquina**: copiar el archivo a otro equipo no permite leerlo
- 📦 **Sin dependencias externas**: usa únicamente `node:crypto` y `node:os` (built-in de Node.js)
- 🪟 **Cross-platform**: funciona en Windows, macOS y Linux sin compilación nativa

## Requisitos

- Node.js 18+
- VTEX Toolbelt instalado globalmente (`vtex`)
- Git
- Cuenta de Jira con API Token
- Cuenta de Bitbucket con API Token (con scope `repository:write`)

## Desarrollo

```bash
npm run dev    # Compilación en modo watch
npm run build  # Compilación de producción
npm start      # Ejecutar dist/index.js
```

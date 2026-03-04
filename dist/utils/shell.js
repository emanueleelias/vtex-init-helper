import { execSync } from 'node:child_process';
/**
 * Ejecuta un comando del sistema mostrando el output en consola.
 */
export function exec(cmd, cwd) {
    execSync(cmd, { stdio: 'inherit', cwd });
}
/**
 * Ejecuta un comando del sistema capturando el stdout.
 */
export function execSilent(cmd, cwd) {
    return execSync(cmd, { encoding: 'utf-8', cwd }).trim();
}
//# sourceMappingURL=shell.js.map
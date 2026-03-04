import { execSync } from 'node:child_process';

/**
 * Ejecuta un comando del sistema mostrando el output en consola.
 */
export function exec(cmd: string, cwd?: string): void {
    execSync(cmd, { stdio: 'inherit', cwd });
}

/**
 * Ejecuta un comando del sistema capturando el stdout.
 */
export function execSilent(cmd: string, cwd?: string): string {
    return execSync(cmd, { encoding: 'utf-8', cwd }).trim();
}

/**
 * Ejecuta un comando del sistema mostrando el output en consola.
 */
export declare function exec(cmd: string, cwd?: string): void;
/**
 * Ejecuta un comando del sistema capturando el stdout.
 */
export declare function execSilent(cmd: string, cwd?: string): string;

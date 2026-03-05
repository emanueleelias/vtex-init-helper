import { createHash, pbkdf2Sync } from 'node:crypto';
import { hostname, userInfo, platform, homedir } from 'node:os';

/**
 * Salt fijo vinculado al proyecto.
 * Cambiarlo invalidaría todas las configuraciones cifradas existentes.
 */
const PROJECT_SALT = 'vtex-init-helper:credential-store:v1';

/**
 * Genera una clave de cifrado determinista derivada de la máquina actual.
 *
 * Combina hostname + username + plataforma + homedir para crear
 * un identificador único por máquina y usuario. Luego usa PBKDF2
 * para derivar una clave segura.
 *
 * Esto garantiza que:
 * - La misma máquina/usuario siempre genera la misma clave
 * - Copiar el archivo de config a otra máquina no permite descifrarlo
 * - No se almacena la clave en ningún lado (se recalcula en cada ejecución)
 */
export function getMachineKey(): string {
    const machineIdentifier = [
        hostname(),
        userInfo().username,
        platform(),
        homedir(),
    ].join(':');

    const key = pbkdf2Sync(
        machineIdentifier,
        PROJECT_SALT,
        100_000,
        32,
        'sha512'
    );

    return key.toString('hex');
}

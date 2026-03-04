import axios from 'axios';
import { getConfig } from '../utils/config.js';
/**
 * Genera el header de autenticación Basic para Bitbucket.
 * Los nuevos API tokens de Bitbucket usan Basic Auth con email:token.
 */
function getAuthHeader() {
    const { bitbucketEmail, bitbucketApiToken } = getConfig();
    const auth = Buffer.from(`${bitbucketEmail}:${bitbucketApiToken}`).toString('base64');
    return `Basic ${auth}`;
}
/**
 * Obtiene todos los repositorios del workspace de Bitbucket.
 * Maneja paginación automáticamente.
 */
export async function getRepositories() {
    const { bitbucketWorkspace } = getConfig();
    const repos = [];
    let url = `https://api.bitbucket.org/2.0/repositories/${bitbucketWorkspace}?pagelen=100`;
    while (url) {
        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: getAuthHeader(),
                    Accept: 'application/json',
                },
            });
            for (const repo of response.data.values) {
                const sshClone = repo.links?.clone?.find((c) => c.name === 'ssh');
                repos.push({
                    name: repo.name,
                    slug: repo.slug,
                    cloneUrl: sshClone?.href || '',
                });
            }
            url = response.data.next || null;
        }
        catch (error) {
            if (error.response?.status === 401) {
                throw new Error('Credenciales de Bitbucket inválidas. Ejecutá "vtex-init config" para reconfigurar.');
            }
            if (error.response?.status === 403) {
                throw new Error('Permisos insuficientes. El API Token necesita los scopes "repository:read" y "repository:write". Creá un nuevo token con esos permisos.');
            }
            throw new Error(`Error al obtener repositorios de Bitbucket: ${error.message}`);
        }
    }
    return repos.sort((a, b) => a.name.localeCompare(b.name));
}
/**
 * Crea una rama en un repositorio de Bitbucket.
 * Intenta desde `main`, si falla prueba `master`, si falla retorna '' para que el caller pregunte.
 */
export async function createBranch(repoSlug, branchName) {
    const { bitbucketWorkspace } = getConfig();
    const apiUrl = `https://api.bitbucket.org/2.0/repositories/${bitbucketWorkspace}/${repoSlug}/refs/branches`;
    const headers = {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };
    const candidates = ['main', 'master'];
    for (const source of candidates) {
        try {
            await axios.post(apiUrl, {
                name: branchName,
                target: { hash: source },
            }, { headers });
            return source;
        }
        catch (error) {
            const status = error.response?.status;
            if (status === 404 || status === 400) {
                continue;
            }
            throw new Error(`Error al crear rama en Bitbucket: ${error.response?.data?.error?.message || error.message}`);
        }
    }
    return '';
}
/**
 * Crea una rama especificando la rama fuente explícitamente.
 */
export async function createBranchFrom(repoSlug, branchName, sourceBranch) {
    const { bitbucketWorkspace } = getConfig();
    const apiUrl = `https://api.bitbucket.org/2.0/repositories/${bitbucketWorkspace}/${repoSlug}/refs/branches`;
    try {
        await axios.post(apiUrl, {
            name: branchName,
            target: { hash: sourceBranch },
        }, {
            headers: {
                Authorization: getAuthHeader(),
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });
    }
    catch (error) {
        throw new Error(`Error al crear rama desde "${sourceBranch}": ${error.response?.data?.error?.message || error.message}`);
    }
}
//# sourceMappingURL=bitbucket.js.map
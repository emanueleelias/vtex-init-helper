import axios from 'axios';
import { getConfig } from '../utils/config.js';

export interface BitbucketRepo {
    name: string;
    slug: string;
    cloneUrl: string;
}

/**
 * Obtiene todos los repositorios del workspace de Bitbucket.
 * Maneja paginación automáticamente.
 */
export async function getRepositories(): Promise<BitbucketRepo[]> {
    const { bitbucketWorkspace, bitbucketUsername, bitbucketAppPassword } =
        getConfig();

    const auth = Buffer.from(
        `${bitbucketUsername}:${bitbucketAppPassword}`
    ).toString('base64');

    const repos: BitbucketRepo[] = [];
    let url: string | null =
        `https://api.bitbucket.org/2.0/repositories/${bitbucketWorkspace}?pagelen=100`;

    while (url) {
        try {
            const response: { data: any } = await axios.get(url, {
                headers: {
                    Authorization: `Basic ${auth}`,
                    Accept: 'application/json',
                },
            });

            for (const repo of response.data.values) {
                // Buscar la URL de clonación HTTPS
                const httpsClone = repo.links?.clone?.find(
                    (c: any) => c.name === 'https'
                );

                repos.push({
                    name: repo.name,
                    slug: repo.slug,
                    cloneUrl: httpsClone?.href || '',
                });
            }

            url = response.data.next || null;
        } catch (error: any) {
            if (error.response?.status === 401) {
                throw new Error(
                    'Credenciales de Bitbucket inválidas. Ejecutá "vtex-init config" para reconfigurar.'
                );
            }
            throw new Error(
                `Error al obtener repositorios de Bitbucket: ${error.message}`
            );
        }
    }

    // Ordenar alfabéticamente por nombre
    return repos.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Crea una rama en un repositorio de Bitbucket.
 * Intenta desde `main`, si falla prueba `master`, si falla pregunta al usuario.
 */
export async function createBranch(
    repoSlug: string,
    branchName: string
): Promise<string> {
    const { bitbucketWorkspace, bitbucketUsername, bitbucketAppPassword } =
        getConfig();

    const auth = Buffer.from(
        `${bitbucketUsername}:${bitbucketAppPassword}`
    ).toString('base64');

    const apiUrl = `https://api.bitbucket.org/2.0/repositories/${bitbucketWorkspace}/${repoSlug}/refs/branches`;

    const headers = {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };

    // Intentar con main, luego master
    const candidates = ['main', 'master'];

    for (const source of candidates) {
        try {
            await axios.post(
                apiUrl,
                {
                    name: branchName,
                    target: { hash: source },
                },
                { headers }
            );
            return source;
        } catch (error: any) {
            const status = error.response?.status;
            // Si es 404 o error de rama no encontrada, probar la siguiente
            if (status === 404 || status === 400) {
                continue;
            }
            // Cualquier otro error, lanzar
            throw new Error(
                `Error al crear rama en Bitbucket: ${error.response?.data?.error?.message || error.message}`
            );
        }
    }

    // Si ninguna candidata funcionó, retornar null para que el caller pregunte
    return '';
}

/**
 * Crea una rama especificando la rama fuente explícitamente.
 */
export async function createBranchFrom(
    repoSlug: string,
    branchName: string,
    sourceBranch: string
): Promise<void> {
    const { bitbucketWorkspace, bitbucketUsername, bitbucketAppPassword } =
        getConfig();

    const auth = Buffer.from(
        `${bitbucketUsername}:${bitbucketAppPassword}`
    ).toString('base64');

    const apiUrl = `https://api.bitbucket.org/2.0/repositories/${bitbucketWorkspace}/${repoSlug}/refs/branches`;

    try {
        await axios.post(
            apiUrl,
            {
                name: branchName,
                target: { hash: sourceBranch },
            },
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }
        );
    } catch (error: any) {
        throw new Error(
            `Error al crear rama desde "${sourceBranch}": ${error.response?.data?.error?.message || error.message}`
        );
    }
}

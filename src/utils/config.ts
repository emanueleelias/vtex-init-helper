import Conf from 'conf';

export interface AppConfig {
    jiraDomain: string;
    jiraEmail: string;
    jiraToken: string;
    bitbucketWorkspace: string;
    bitbucketEmail: string;
    bitbucketApiToken: string;
}

const config = new Conf<AppConfig>({
    projectName: 'vtex-init-helper',
    schema: {
        jiraDomain: { type: 'string' },
        jiraEmail: { type: 'string' },
        jiraToken: { type: 'string' },
        bitbucketWorkspace: { type: 'string' },
        bitbucketEmail: { type: 'string' },
        bitbucketApiToken: { type: 'string' },
    },
});

/**
 * Retorna la configuración guardada.
 * Lanza error si no se ha ejecutado `vtex-init config`.
 */
export function getConfig(): AppConfig {
    const stored = config.store;

    if (!stored.jiraDomain || !stored.jiraEmail || !stored.jiraToken) {
        throw new Error(
            'No se encontró configuración. Ejecutá "vtex-init config" primero.'
        );
    }

    return stored;
}

export { config };

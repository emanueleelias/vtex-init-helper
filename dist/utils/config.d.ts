import Conf from 'conf';
export interface AppConfig {
    jiraDomain: string;
    jiraEmail: string;
    jiraToken: string;
    bitbucketWorkspace: string;
    bitbucketEmail: string;
    bitbucketApiToken: string;
}
declare const config: Conf<AppConfig>;
/**
 * Retorna la configuración guardada.
 * Lanza error si no se ha ejecutado `vtex-init config`.
 */
export declare function getConfig(): AppConfig;
export { config };

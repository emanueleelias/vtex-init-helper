import Conf from 'conf';
export interface AppConfig {
    jiraDomain: string;
    jiraEmail: string;
    jiraToken: string;
    bitbucketWorkspace: string;
    bitbucketUsername: string;
    bitbucketAppPassword: string;
}
declare const config: Conf<AppConfig>;
/**
 * Retorna la configuración guardada.
 * Lanza error si no se ha ejecutado `vtex-init config`.
 */
export declare function getConfig(): AppConfig;
export { config };

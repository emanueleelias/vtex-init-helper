export interface JiraIssue {
    key: string;
    summary: string;
}
/**
 * Obtiene los datos de un ticket de Jira.
 */
export declare function getIssue(ticketId: string): Promise<JiraIssue>;
/**
 * Agrega un enlace web (remote link) a un ticket de Jira.
 */
export declare function addRemoteLink(ticketId: string, url: string, title: string): Promise<void>;

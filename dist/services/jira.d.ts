export interface JiraIssue {
    key: string;
    summary: string;
}
/**
 * Obtiene los datos de un ticket de Jira.
 */
export declare function getIssue(ticketId: string): Promise<JiraIssue>;

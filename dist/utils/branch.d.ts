/**
 * Genera un nombre de rama sugerido a partir del ID del ticket y el summary de Jira.
 * Ejemplo: "feature/ONIL-558-nombre-del-ticket"
 */
export declare function suggestBranchName(ticketId: string, summary: string): string;
/**
 * Genera un nombre de workspace VTEX a partir del ticket ID.
 * Ejemplo: "ONIL-558" → "onil558"
 */
export declare function generateWorkspaceName(ticketId: string): string;

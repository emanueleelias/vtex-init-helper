/**
 * Genera un nombre de rama sugerido a partir del ID del ticket y el summary de Jira.
 * Ejemplo: "feature/ONIL-558-nombre-del-ticket"
 */
export function suggestBranchName(ticketId: string, summary: string): string {
    const sanitized = summary
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[^a-z0-9\s-]/g, '')   // Solo alfanuméricos, espacios y guiones
        .trim()
        .replace(/\s+/g, '-')           // Espacios a guiones
        .replace(/-+/g, '-');            // Múltiples guiones a uno

    const branchName = `feature/${ticketId}-${sanitized}`;

    // Truncar a 80 caracteres
    return branchName.length > 80 ? branchName.substring(0, 80) : branchName;
}

/**
 * Genera un nombre de workspace VTEX a partir del ticket ID.
 * Ejemplo: "ONIL-558" → "onil558"
 */
export function generateWorkspaceName(ticketId: string): string {
    return ticketId.toLowerCase().replace(/-/g, '');
}

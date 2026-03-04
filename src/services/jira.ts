import axios from 'axios';
import { getConfig } from '../utils/config.js';

export interface JiraIssue {
    key: string;
    summary: string;
}

/**
 * Obtiene los datos de un ticket de Jira.
 */
export async function getIssue(ticketId: string): Promise<JiraIssue> {
    const { jiraDomain, jiraEmail, jiraToken } = getConfig();

    const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');

    try {
        const response = await axios.get(
            `https://${jiraDomain}/rest/api/3/issue/${ticketId}`,
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    Accept: 'application/json',
                },
                params: {
                    fields: 'summary',
                },
            }
        );

        return {
            key: response.data.key,
            summary: response.data.fields.summary,
        };
    } catch (error: any) {
        if (error.response?.status === 404) {
            throw new Error(`Ticket "${ticketId}" no encontrado en Jira.`);
        }
        if (error.response?.status === 401) {
            throw new Error(
                'Credenciales de Jira inválidas. Ejecutá "vtex-init config" para reconfigurar.'
            );
        }
        throw new Error(
            `Error al conectar con Jira: ${error.message}`
        );
    }
}

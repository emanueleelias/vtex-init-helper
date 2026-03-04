import chalk from 'chalk';
import inquirer from 'inquirer';
import { config } from '../utils/config.js';

export async function configCommand(): Promise<void> {
    console.log(
        chalk.cyan('\n🔧 Configuración de vtex-init\n')
    );

    console.log(chalk.dim('── Credenciales de Jira ──\n'));

    const jiraAnswers = await inquirer.prompt([
        {
            type: 'input',
            name: 'jiraDomain',
            message: 'Dominio de Jira (ej. empresa.atlassian.net):',
            default: config.get('jiraDomain') || undefined,
            validate: (input: string) =>
                input.trim().length > 0 || 'El dominio es obligatorio',
        },
        {
            type: 'input',
            name: 'jiraEmail',
            message: 'Email de Jira:',
            default: config.get('jiraEmail') || undefined,
            validate: (input: string) =>
                input.includes('@') || 'Ingresá un email válido',
        },
        {
            type: 'password',
            name: 'jiraToken',
            message: 'API Token de Jira:',
            mask: '*',
            validate: (input: string) =>
                input.trim().length > 0 || 'El token es obligatorio',
        },
    ]);

    console.log(chalk.dim('\n── Credenciales de Bitbucket ──\n'));

    const bbAnswers = await inquirer.prompt([
        {
            type: 'input',
            name: 'bitbucketWorkspace',
            message: 'Workspace de Bitbucket (nombre de la organización):',
            default: config.get('bitbucketWorkspace') || undefined,
            validate: (input: string) =>
                input.trim().length > 0 || 'El workspace es obligatorio',
        },
        {
            type: 'input',
            name: 'bitbucketUsername',
            message: 'Username de Bitbucket:',
            default: config.get('bitbucketUsername') || undefined,
            validate: (input: string) =>
                input.trim().length > 0 || 'El username es obligatorio',
        },
        {
            type: 'password',
            name: 'bitbucketAppPassword',
            message: 'App Password de Bitbucket:',
            mask: '*',
            validate: (input: string) =>
                input.trim().length > 0 || 'El app password es obligatorio',
        },
    ]);

    // Guardar todo en conf
    config.set('jiraDomain', jiraAnswers.jiraDomain.trim());
    config.set('jiraEmail', jiraAnswers.jiraEmail.trim());
    config.set('jiraToken', jiraAnswers.jiraToken.trim());
    config.set('bitbucketWorkspace', bbAnswers.bitbucketWorkspace.trim());
    config.set('bitbucketUsername', bbAnswers.bitbucketUsername.trim());
    config.set('bitbucketAppPassword', bbAnswers.bitbucketAppPassword.trim());

    console.log(
        chalk.green('\n✅ Configuración guardada exitosamente.')
    );
    console.log(
        chalk.dim(`   Ubicación: ${config.path}\n`)
    );
}

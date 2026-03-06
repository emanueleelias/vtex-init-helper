import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import AutocompletePrompt from 'inquirer-autocomplete-prompt';
import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { getConfig } from '../utils/config.js';
import { suggestBranchName, generateWorkspaceName } from '../utils/branch.js';
import { exec } from '../utils/shell.js';
import { getIssue, addRemoteLink } from '../services/jira.js';
import {
    getRepositories,
    createBranch,
    createBranchFrom,
    type BitbucketRepo,
} from '../services/bitbucket.js';

// Registrar plugin de autocomplete
inquirer.registerPrompt('autocomplete', AutocompletePrompt);

export async function initCommand(ticketId: string): Promise<void> {
    // ─── 1. Validar configuración ───
    try {
        getConfig();
    } catch {
        console.log(
            chalk.red('\n❌ No se encontró configuración.')
        );
        console.log(
            chalk.yellow('   Ejecutá ') +
            chalk.cyan('vtex-init config') +
            chalk.yellow(' para configurar las credenciales.\n')
        );
        process.exit(1);
    }

    console.log(
        chalk.cyan(`\n🚀 Iniciando tarea ${chalk.bold(ticketId)}\n`)
    );

    // ─── 2. Obtener datos de Jira ───
    const jiraSpinner = ora('Obteniendo datos de Jira...').start();
    let issueKey: string;
    let issueSummary: string;

    try {
        const issue = await getIssue(ticketId);
        issueKey = issue.key;
        issueSummary = issue.summary;
        jiraSpinner.succeed(
            `Ticket: ${chalk.bold(issueKey)} — ${issueSummary}`
        );
    } catch (error: any) {
        jiraSpinner.fail(error.message);
        process.exit(1);
    }

    // ─── 3. Nombre de rama ───
    const suggestedBranch = suggestBranchName(issueKey, issueSummary);

    const { branchName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'branchName',
            message: 'Nombre de la rama:',
            default: suggestedBranch,
            validate: (input: string) =>
                input.trim().length > 0 || 'El nombre de rama no puede estar vacío',
        },
    ]);

    // ─── 4. Obtener repositorios de Bitbucket ───
    const repoSpinner = ora('Obteniendo repositorios de Bitbucket...').start();
    let repos: BitbucketRepo[];

    try {
        repos = await getRepositories();
        repoSpinner.succeed(`${repos.length} repositorios encontrados`);
    } catch (error: any) {
        repoSpinner.fail(error.message);
        process.exit(1);
    }

    // ─── 5. Seleccionar repositorio con autocomplete ───
    const { selectedRepo } = await inquirer.prompt([
        {
            type: 'autocomplete',
            name: 'selectedRepo',
            message: 'Seleccioná el repositorio:',
            source: (_answers: any, input: string) => {
                const searchTerm = (input || '').toLowerCase();
                return repos
                    .filter((r) => r.name.toLowerCase().includes(searchTerm))
                    .map((r) => ({
                        name: `${r.name} ${chalk.dim(`(${r.slug})`)}`,
                        value: r,
                    }));
            },
        },
    ] as any);

    const repo = selectedRepo as BitbucketRepo;

    // ─── 6. Crear rama remota ───
    const branchSpinner = ora('Creando rama remota...').start();

    try {
        const sourceBranch = await createBranch(repo.slug, branchName);

        if (sourceBranch) {
            branchSpinner.succeed(
                `Rama ${chalk.bold(branchName)} creada desde ${chalk.dim(sourceBranch)}`
            );
        } else {
            // Ni main ni master funcionaron, preguntar al usuario
            branchSpinner.warn(
                'No se pudo crear la rama desde "main" ni "master".'
            );

            const { customSource } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'customSource',
                    message: 'Nombre de la rama principal del repositorio:',
                    default: 'dev',
                    validate: (input: string) =>
                        input.trim().length > 0 || 'El nombre es obligatorio',
                },
            ]);

            const retrySpinner = ora(
                `Creando rama desde "${customSource}"...`
            ).start();

            try {
                await createBranchFrom(repo.slug, branchName, customSource.trim());
                retrySpinner.succeed(
                    `Rama ${chalk.bold(branchName)} creada desde ${chalk.dim(customSource)}`
                );
            } catch (retryError: any) {
                retrySpinner.fail(retryError.message);
                process.exit(1);
            }
        }
    } catch (error: any) {
        branchSpinner.fail(error.message);
        process.exit(1);
    }

    // ─── 7. Clonar repositorio localmente ───
    const folderName = generateWorkspaceName(ticketId);
    const projectDir = resolve(process.cwd(), folderName);

    if (existsSync(projectDir)) {
        console.log(
            chalk.yellow(`\n⚠️  La carpeta "${folderName}" ya existe.`)
        );
        const { overwrite } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: '¿Continuar usando esa carpeta?',
                default: false,
            },
        ]);
        if (!overwrite) {
            console.log(chalk.red('Operación cancelada.'));
            process.exit(0);
        }
    } else {
        mkdirSync(projectDir, { recursive: true });
    }

    console.log('');
    const cloneSpinner = ora('Clonando repositorio...').start();
    cloneSpinner.stop();

    try {
        exec(`git clone ${repo.cloneUrl} .`, projectDir);
        console.log(chalk.green('✔ Repositorio clonado'));
    } catch (error: any) {
        console.log(chalk.red(`✖ Error al clonar: ${error.message}`));
        process.exit(1);
    }

    try {
        exec(`git checkout ${branchName}`, projectDir);
        console.log(chalk.green(`✔ Checkout a ${branchName}`));
    } catch (error: any) {
        console.log(chalk.red(`✖ Error en checkout: ${error.message}`));
        process.exit(1);
    }

    // ─── 8. Entorno VTEX ───
    console.log(chalk.dim('\n── Configuración VTEX ──\n'));

    // Intentar detectar vendor desde manifest.json
    let detectedVendor: string | undefined;
    const manifestPath = resolve(projectDir, 'manifest.json');

    if (existsSync(manifestPath)) {
        try {
            const manifestRaw = readFileSync(manifestPath, 'utf-8');
            const manifest = JSON.parse(manifestRaw);
            if (manifest.vendor && typeof manifest.vendor === 'string') {
                detectedVendor = manifest.vendor;
                console.log(
                    chalk.green(`✔ Vendor detectado desde manifest.json: ${chalk.bold(detectedVendor)}`)
                );
            }
        } catch {
            // Si falla la lectura/parseo, seguir con prompt manual
        }
    }

    const { vendor } = await inquirer.prompt([
        {
            type: 'input',
            name: 'vendor',
            message: 'Nombre del Vendor (tienda) en VTEX:',
            default: detectedVendor,
            validate: (input: string) =>
                input.trim().length > 0 || 'El vendor es obligatorio',
        },
    ]);

    const workspaceName = generateWorkspaceName(ticketId);
    console.log(
        chalk.dim(`   Workspace: ${chalk.cyan(workspaceName)}\n`)
    );

    // ─── 9. Comandos VTEX ───
    try {
        console.log(chalk.dim(`\n→ vtex switch ${vendor.trim()}`));
        exec(`vtex switch ${vendor.trim()}`, projectDir);

        console.log(chalk.dim(`\n→ vtex use ${workspaceName}`));
        exec(`vtex use ${workspaceName}`, projectDir);

        // ─── Agregar enlace de workspace al ticket de Jira ───
        const workspaceUrl = `https://${workspaceName}--${vendor.trim()}.myvtex.com`;
        try {
            const linkSpinner = ora('Agregando enlace de workspace en Jira...').start();
            await addRemoteLink(issueKey, workspaceUrl, 'Workspace de prueba');
            linkSpinner.succeed(
                `Enlace agregado en Jira: ${chalk.dim(workspaceUrl)}`
            );
        } catch (error: any) {
            console.log(
                chalk.yellow(`\n⚠️  No se pudo agregar el enlace en Jira: ${error.message}`)
            );
            console.log(
                chalk.dim('   Podés agregarlo manualmente desde el ticket.\n')
            );
        }

        console.log(chalk.dim(`\n→ vtex link`));
        exec('vtex link', projectDir);
    } catch (error: any) {
        console.log(
            chalk.red(`\n✖ Error ejecutando VTEX Toolbelt: ${error.message}`)
        );
        console.log(
            chalk.yellow('   Podés ejecutar los comandos manualmente en la carpeta del proyecto.\n')
        );
        process.exit(1);
    }

    // ─── 10. Mensaje final ───
    console.log(
        chalk.green.bold('\n════════════════════════════════════════')
    );
    console.log(
        chalk.green.bold('  ✅ ¡Entorno listo para codificar!')
    );
    console.log(
        chalk.green.bold('════════════════════════════════════════\n')
    );
    console.log(`  📁 Carpeta: ${chalk.cyan(projectDir)}`);
    console.log(`  🌿 Rama:    ${chalk.cyan(branchName)}`);
    console.log(`  🏪 Vendor:  ${chalk.cyan(vendor.trim())}`);
    console.log(`  🔧 Workspace: ${chalk.cyan(workspaceName)}`);
    console.log('');
}

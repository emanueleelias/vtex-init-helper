#!/usr/bin/env node
import { Command } from 'commander';
import { createRequire } from 'module';
import { configCommand } from './commands/config.js';
import { initCommand } from './commands/init.js';
const require = createRequire(import.meta.url);
const { version } = require('../package.json');
const program = new Command();
program
    .name('vtex-init')
    .description('CLI para automatizar el inicio de tareas VTEX desde tickets de Jira')
    .version(version);
program
    .command('config')
    .description('Configurar credenciales de Jira y Bitbucket')
    .action(configCommand);
program
    .argument('<ticketId>', 'ID del ticket de Jira (ej. ONIL-558)')
    .option('--dry-run', 'Simular la ejecución sin realizar cambios en repositorios o VTEX')
    .action(async (ticketId, options) => {
    await initCommand(ticketId, options);
});
program.parse();
//# sourceMappingURL=index.js.map
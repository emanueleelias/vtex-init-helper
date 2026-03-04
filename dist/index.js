#!/usr/bin/env node
import { Command } from 'commander';
import { configCommand } from './commands/config.js';
import { initCommand } from './commands/init.js';
const program = new Command();
program
    .name('vtex-init')
    .description('CLI para automatizar el inicio de tareas VTEX desde tickets de Jira')
    .version('1.0.0');
program
    .command('config')
    .description('Configurar credenciales de Jira y Bitbucket')
    .action(configCommand);
program
    .argument('<ticketId>', 'ID del ticket de Jira (ej. ONIL-558)')
    .action(async (ticketId) => {
    await initCommand(ticketId);
});
program.parse();
//# sourceMappingURL=index.js.map
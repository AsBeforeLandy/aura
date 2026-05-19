#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('aura')
  .description('Aura UI CLI — AI-friendly component library tools')
  .version('0.0.1');

program
  .command('mcp')
  .description('Start MCP Server for AI IDE integration')
  .action(async () => {
    const { startMcpServer } = await import('./mcp/server.js');
    await startMcpServer();
  });

program
  .command('skill')
  .description('Install Aura skills to current IDE')
  .action(async () => {
    const { installSkill } = await import('./commands/skill.js');
    await installSkill();
  });

program
  .command('doc')
  .description('Show component documentation')
  .argument('<component>', 'Component name')
  .action(async (component: string) => {
    const { showDoc } = await import('./commands/doc.js');
    await showDoc(component);
  });

program.parse();

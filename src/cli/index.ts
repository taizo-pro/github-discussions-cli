#!/usr/bin/env node

import { Command } from 'commander';
import { listCommand } from './commands/list.js';
import { showCommand } from './commands/show.js';
import { commentCommand } from './commands/comment.js';
import { createCommand } from './commands/create.js';
import { editCommand } from './commands/edit.js';
import { configCommand } from './commands/config.js';
import { searchCommand } from './commands/search.js';
import { statsCommand } from './commands/stats.js';

const program = new Command();

program
  .name('gh-discussions')
  .description('CLI tool for GitHub Discussions')
  .version('1.2.0');

program.addCommand(listCommand);
program.addCommand(showCommand);
program.addCommand(commentCommand);
program.addCommand(createCommand);
program.addCommand(editCommand);
program.addCommand(configCommand);
program.addCommand(searchCommand);
program.addCommand(statsCommand);

program.parse();
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { GitHubClient, FileAuthManager, FileConfigManager } from '../../core/index.js';
import { handleError } from '../utils/error-handler.js';
import { Spinner } from '../utils/spinner.js';

export const editCommand = new Command()
  .name('edit')
  .description('Edit discussion title and/or description')
  .argument('<discussionId>', 'Discussion ID to edit')
  .argument('[repo]', 'Repository (owner/repo format)')
  .option('-t, --title <title>', 'New title for the discussion')
  .option('-b, --body <body>', 'New body/description for the discussion')
  .option('--interactive', 'Use interactive mode to edit title and body')
  .action(async (discussionId: string, repo?: string, options?: any) => {
    const spinner = new Spinner();
    try {
      const authManager = new FileAuthManager();
      const configManager = new FileConfigManager();
      
      const token = await authManager.getToken();
      if (!token) {
        console.error(chalk.red('GitHub token not found. Please run: config auth'));
        process.exit(1);
      }

      const targetRepo = repo || (await configManager.getDefaultRepo());
      if (!targetRepo) {
        console.error(chalk.red('No repository specified and no default repository configured.'));
        console.log(chalk.yellow('Use: edit <discussionId> <owner/repo>'));
        console.log(chalk.yellow('Or configure a default repository with: config set-repo <owner/repo>'));
        process.exit(1);
      }

      const client = new GitHubClient(token);
      
      spinner.start('Fetching discussion details...');

      // Get current discussion details
      const currentDiscussion = await client.getDiscussion(targetRepo, discussionId);
      spinner.stop();

      let newTitle = options?.title;
      let newBody = options?.body;

      // Interactive mode or no options provided
      if (options?.interactive || (!newTitle && !newBody)) {
        console.log(chalk.blue(`\nCurrent Discussion: ${currentDiscussion.title}`));
        console.log(chalk.gray(`Current Body: ${currentDiscussion.body.slice(0, 100)}${currentDiscussion.body.length > 100 ? '...' : ''}`));
        console.log();

        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'title',
            message: 'New title (leave empty to keep current):',
            default: '',
          },
          {
            type: 'editor',
            name: 'body',
            message: 'Edit description (will open in your default editor):',
            default: currentDiscussion.body,
            when: () => !newBody,
          },
        ]);

        if (answers.title.trim()) {
          newTitle = answers.title.trim();
        }
        if (answers.body !== undefined) {
          newBody = answers.body.trim();
        }
      }

      // Check if any changes were made
      const titleChanged = newTitle && newTitle !== currentDiscussion.title;
      const bodyChanged = newBody && newBody !== currentDiscussion.body;
      
      if (!titleChanged && !bodyChanged) {
        console.log(chalk.yellow('No changes detected. Nothing to update.'));
        return;
      }

      // Confirm changes
      if (titleChanged || bodyChanged) {
        console.log(chalk.blue('\nChanges to be made:'));
        if (titleChanged) {
          console.log(chalk.green(`Title: ${currentDiscussion.title} → ${newTitle}`));
        }
        if (bodyChanged) {
          console.log(chalk.green(`Description: Updated (${newBody.length} characters)`));
        }
        console.log();

        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Do you want to update this discussion?',
            default: true,
          },
        ]);

        if (!confirm) {
          console.log(chalk.yellow('Update cancelled.'));
          return;
        }
      }

      spinner.start('Updating discussion...');

      // Get the discussion node ID for the update
      const nodeId = currentDiscussion.id;
      
      const updatedDiscussion = await client.updateDiscussion(
        nodeId,
        titleChanged ? newTitle : undefined,
        bodyChanged ? newBody : undefined
      );

      spinner.succeed('Discussion updated successfully!');
      console.log();
      console.log(chalk.blue('Updated Discussion:'));
      console.log(`Title: ${chalk.bold(updatedDiscussion.title)}`);
      console.log(`URL: ${chalk.cyan(updatedDiscussion.url)}`);
      console.log(`Updated: ${chalk.gray(updatedDiscussion.updatedAt.toLocaleString())}`);

    } catch (error) {
      spinner.fail();
      handleError(error);
    }
  });
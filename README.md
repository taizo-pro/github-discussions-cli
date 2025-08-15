# GitHub Discussions CLI

A powerful command-line tool for interacting with GitHub Discussions without opening a browser. Perfect for developers who want to quickly access, read, and contribute to discussions while staying in their terminal.

## Features

- 📋 List discussions in any repository
- 🔍 Search discussions with text matching and filters
- 👀 View discussion details and comments
- 💬 Post comments to discussions
- ✨ Create new discussions
- ✏️ Edit discussion titles and descriptions
- 📊 Repository statistics and analytics
- 🏷️ Filter by category, author, or comment count
- ⚙️ Configurable settings and authentication
- 🎨 Multiple output formats (table, JSON, markdown)
- 🚀 Fast and lightweight CLI interface
- 🔒 Secure token management
- ⚡ Enhanced error handling with retry logic
- 🎯 Visual feedback with spinners and progress bars

## Installation

### Via npm (Recommended)

Install globally from npm registry:

```bash
npm install -g @taizo-pro/github-discussions-cli
```

After installation, both the `gh-discussions` and `ghd` commands will be available globally in your terminal. You can use either command interchangeably.

### Alternative: npx (No Installation Required)

You can also use the tool without installing it globally:

```bash
npx @taizo-pro/github-discussions-cli --help
```

> **Note**: Replace `gh-discussions` with `npx @taizo-pro/github-discussions-cli` in all usage examples if using npx.

## Quick Start

1. **Install the CLI tool**:
   ```bash
   npm install -g @taizo-pro/github-discussions-cli
   ```

2. **Set up authentication**:
   ```bash
   # Use either command
   gh-discussions config
   # or the shorter alias
   ghd config
   ```

3. **Test with a public repository**:
   ```bash
   # Use either command format
   gh-discussions list microsoft/vscode
   # or shorter version
   ghd list microsoft/vscode
   ```

4. **View a specific discussion**:
   ```bash
   gh-discussions show 1 microsoft/vscode
   ```

5. **Try the new search and statistics features**:
   ```bash
   # Search for discussions about bugs
   gh-discussions search "bug" microsoft/vscode
   
   # View repository statistics
   gh-discussions stats microsoft/vscode
   ```

## Setup

### 1. Create a GitHub Personal Access Token

Before using the CLI, you need to create a GitHub Personal Access Token with the required permissions:

1. **Sign in to GitHub** and go to your account settings
   
2. **Navigate to Developer Settings**
   - Click your profile picture (top-right corner)
   - Select **Settings**
   - Scroll down and click **Developer settings** (left sidebar)

3. **Access Personal Access Tokens**
   - Click **Personal access tokens**
   - Select **Tokens (classic)** or **Fine-grained tokens**

4. **Create New Token (Classic)**
   - Click **Generate new token** → **Generate new token (classic)**
   - Give your token a descriptive name (e.g., "GitHub Discussions CLI")
   - Set expiration (recommended: 90 days or custom)
   - **Select the following scopes** (⚠️ Important - choose based on your needs):

   **For Private Repositories:**
   - ✅ **repo** (Full control of private repositories)
   - This single scope provides access to discussions in private repositories

   **For Public Repositories Only:**
   - ✅ **public_repo** (Access public repositories)
   - This is sufficient if you only work with public repository discussions

   **Additional Recommended Scopes:**
   - ✅ **read:user** (Read user profile data) - For displaying author information
   - ✅ **user:email** (Access user email) - For proper attribution

   ⚠️ **Security Note**: Only select `repo` if you need private repository access, as it grants broad permissions.

   - Click **Generate token**

5. **Alternative: Fine-grained Personal Access Tokens (Beta)**
   If you prefer more granular control, you can use fine-grained tokens:
   
   - Click **Generate new token** → **Generate new token (beta)**
   - **Resource owner**: Select your account or organization
   - **Repository access**: Choose specific repositories or "All repositories"
   - **Repository permissions**:
     - ✅ **Discussions**: Read and write
     - ✅ **Metadata**: Read (required)
     - ✅ **Contents** (if creating discussions with file references): Read
   
   📝 **Note**: Fine-grained tokens are currently in beta and may have limitations.

6. **Copy Your Token**
   - **⚠️ Important**: Copy the token immediately - you won't be able to see it again
   - Store it securely (you'll need it in the next step)

### 2. Configure the CLI Tool

Run the interactive configuration setup:

```bash
gh-discussions config
```

The setup will prompt you for:
- **GitHub Token**: Paste the token you created above
- **Default Repository**: Enter a repo in `owner/repository` format (optional)
- **Output Format**: Choose table, json, or markdown (default: table)

### 3. Verify Setup

Test your configuration:

```bash
# Show current configuration
gh-discussions config --show

# Test by listing discussions (replace with actual repo)
gh-discussions list owner/repository
```

### Troubleshooting Token Issues

#### Common Error Messages and Solutions:

**❌ "Bad credentials" / "Invalid token"**
- Double-check that you copied the token correctly (no extra spaces)
- Ensure the token hasn't expired
- Try generating a new token

**❌ "Resource not accessible by integration"**
- For **private repositories**: You need the `repo` scope (classic tokens)
- For **public repositories**: `public_repo` scope is sufficient
- For **fine-grained tokens**: Ensure "Discussions" permission is set to "Read and write"

**❌ "Not Found" errors**
- Verify the repository exists and you have access to it
- Check that Discussions are enabled in the repository settings
- Ensure your token has access to the specific repository (for fine-grained tokens)

**❌ "API rate limit exceeded"**
- Wait for the rate limit to reset (usually 1 hour)
- Authenticated requests have higher rate limits than anonymous ones

#### Permission Requirements by Action:

| Action | Classic Token Scope | Fine-grained Permission |
|--------|--------------------|-----------------------|
| List discussions | `public_repo` (public) / `repo` (private) | Discussions: Read |
| View discussion details | `public_repo` (public) / `repo` (private) | Discussions: Read |
| Create comments | `public_repo` (public) / `repo` (private) | Discussions: Write |
| Create discussions | `public_repo` (public) / `repo` (private) | Discussions: Write |
| Edit discussions | `public_repo` (public) / `repo` (private) | Discussions: Write |

#### Quick Setup Guide:

**🎯 Most Common Setup (Public + Private repos):**
```
✅ repo (Full control of private repositories)
```

**🎯 Public Repositories Only:**
```
✅ public_repo (Access public repositories)
✅ read:user (Read user profile data)
```

**🎯 Fine-grained Token (Recommended for specific repos):**
```
Repository permissions:
✅ Discussions: Read and write
✅ Metadata: Read
```

### Security Best Practices

- **Never share your token** or commit it to version control
- **Use the minimum required scopes** for your use case
- **Set reasonable expiration dates** and rotate tokens regularly
- **Revoke unused tokens** from GitHub settings
- **Use fine-grained tokens** when possible for better security
- **Test with public repositories first** before granting private repo access

## Usage

> **Note**: If using npx instead of global installation, replace `gh-discussions` with `npx @taizo-pro/github-discussions-cli` in all examples below.

### List Discussions
```bash
# List discussions in current/default repository
gh-discussions list

# List discussions in specific repository
gh-discussions list owner/repository

# Limit number of results
gh-discussions list --first 10

# Filter by category
gh-discussions list --category General

# Filter by author
gh-discussions list --author username

# Show only discussions with comments
gh-discussions list --has-comments

# Show only discussions without comments
gh-discussions list --no-comments

# Sort by creation date (ascending)
gh-discussions list --sort created --order asc

# Output as JSON
gh-discussions list --format json

# Output as markdown table
gh-discussions list --format markdown
```

### View Discussion Details
```bash
# Show discussion by number
gh-discussions show 42

# Show discussion in specific repository
gh-discussions show 42 owner/repository
```

### Create Comments
```bash
# Add comment with message
gh-discussions comment 42 "Great discussion!"

# Open editor for longer comments
gh-discussions comment 42 --editor

# Comment in specific repository
gh-discussions comment 42 "Thanks!" owner/repository
```

### Search Discussions
```bash
# Search for discussions containing "bug"
gh-discussions search "bug"

# Search in specific repository
gh-discussions search "feature request" owner/repository

# Search only in titles
gh-discussions search "announcement" --in title

# Search with author filter
gh-discussions search "help" --author username

# Search with category filter
gh-discussions search "question" --category General

# Sort search results by comments
gh-discussions search "popular" --sort comments --order desc

# Limit search results
gh-discussions search "recent" --limit 5

# Output search results as JSON
gh-discussions search "api" --format json
```

### Repository Statistics
```bash
# Show basic statistics for current/default repository
gh-discussions stats

# Show statistics for specific repository
gh-discussions stats owner/repository

# Show detailed statistics with recent activity
gh-discussions stats --detailed
```

### Create Discussions
```bash
# Interactive creation
gh-discussions create

# With title and body
gh-discussions create "Bug Report" "I found a bug..."

# Open editor for body
gh-discussions create "Feature Request" --editor

# Specify category
gh-discussions create "Question" "How do I..." --category general
```

### Edit Discussions
```bash
# Interactive editing (opens editor)
gh-discussions edit 42

# Edit title only
gh-discussions edit 42 --title "Updated Title"

# Edit description only
gh-discussions edit 42 --body "Updated description"

# Edit both title and description
gh-discussions edit 42 --title "New Title" --body "New description"

# Force interactive mode
gh-discussions edit 42 --interactive

# Edit in specific repository
gh-discussions edit 42 --title "Update" owner/repository
```

### Configuration
```bash
# Show current configuration
gh-discussions config --show

# Set GitHub token
gh-discussions config --token ghp_xxxxxxxxxxxx

# Set default repository
gh-discussions config --repo owner/repository

# Set default output format
gh-discussions config --format table

# Clear all configuration
gh-discussions config --clear
```

## Configuration Files

The tool stores configuration in `~/.github-discussions/`:
- `config.json` - General settings (default repo, output format)
- `token` - GitHub Personal Access Token (stored securely)

## Development

For developers who want to contribute to this project:

### Prerequisites
- Node.js 18+
- TypeScript
- npm

### Setup for Development
```bash
git clone https://github.com/taizo-pro/github-discussions-cli.git
cd github-discussions-cli
npm install
```

### Development Commands
```bash
# Build the project
npm run build

# Build and watch for changes during development
npm run build:watch

# Run in development mode (uses ts-node)
npm run dev

# Run tests
npm test

# Watch tests during development
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

### Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm test github-client.test.ts
```

> **Note**: This section is for contributors and developers. End users should install via npm as described in the Installation section.


## Command Reference

### Available Commands

| Command | Description | Features |
|---------|-------------|----------|
| `list [repo]` | List discussions in a repository | Enhanced with filters (v1.1.0) |
| `show <number> [repo]` | Show discussion details and comments | Core feature |
| `comment <number> <message> [repo]` | Add a comment to a discussion | Core feature |
| `create [title] [body] [repo]` | Create a new discussion | Core feature |
| `edit <number> [repo]` | Edit discussion title and/or description | Added in v1.3.0 |
| `search <query> [repo]` | Search discussions by text | Added in v1.1.0 |
| `stats [repo]` | Show repository discussion statistics | Added in v1.1.0 |
| `config` | Configure authentication and settings | Core feature |

### Command Options

#### List Command
- `--first <number>` - Number of discussions to fetch (default: 20)
- `--category <name>` - Filter by category name
- `--author <username>` - Filter by author username
- `--has-comments` - Only show discussions with comments
- `--no-comments` - Only show discussions without comments
- `--sort <field>` - Sort by field (created, updated)
- `--order <direction>` - Sort order (asc, desc)
- `--format <format>` - Output format (table, json, markdown)

#### Search Command
- `--in <fields>` - Search in specific fields (title, body, comments)
- `--author <username>` - Filter by author
- `--category <category>` - Filter by category
- `--state <state>` - Filter by state (open, closed)
- `--sort <field>` - Sort by field (created, updated, comments)
- `--order <direction>` - Sort order (asc, desc)
- `--limit <number>` - Maximum results to return
- `--format <format>` - Output format (table, json, markdown)

#### Edit Command
- `--title <title>` - New title for the discussion
- `--body <body>` - New body/description for the discussion
- `--interactive` - Force interactive mode to edit title and body

#### Stats Command
- `--detailed` - Show detailed statistics with recent activity

## API Documentation

### Core Classes

#### GitHubClient
Main client for interacting with GitHub's GraphQL API.

#### AuthManager
Handles secure storage and validation of GitHub tokens.

#### ConfigManager
Manages user configuration and preferences.

#### EnhancedErrorHandler
Provides comprehensive error handling with retry logic and user-friendly messages.

## Error Handling

The tool provides detailed error messages and suggestions:

- **Authentication errors**: Invalid or expired tokens
- **Network errors**: Connection issues
- **API errors**: GitHub API-specific errors
- **Configuration errors**: Invalid settings or file permissions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Support

- 🐛 Report bugs by creating an issue
- 💡 Request features by creating an issue
- 💬 Ask questions in GitHub Discussions
- 📖 Check the documentation in this README

## Roadmap

- [x] Basic CLI functionality
- [x] Authentication and configuration
- [x] Discussion listing and viewing
- [x] Comment creation
- [x] Discussion creation
- [x] Discussion editing (title and description)
- [x] Short command alias (`ghd`)
- [x] npm package publication
- [x] Discussion search and filtering
- [x] Repository statistics and analytics
- [x] Enhanced error handling with retry logic
- [x] GitHub Actions CI/CD
- [ ] Reaction support (👍, ❤️, 🎉, etc.)
- [ ] Markdown editing improvements
- [ ] Configuration import/export
- [ ] Bulk operations
- [ ] Discussion templates
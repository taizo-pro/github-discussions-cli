import { graphql } from '@octokit/graphql';
import {
  Discussion,
  DiscussionDetail,
  Comment,
  ListOptions,
  AppError,
  ErrorType,
} from './types.js';

interface GraphQLWithAuth {
  (query: string, parameters?: any): Promise<any>;
  defaults: (options: any) => GraphQLWithAuth;
}

export interface GitHubDiscussionsClient {
  listDiscussions(repo: string, options?: ListOptions): Promise<Discussion[]>;
  getDiscussion(repo: string, discussionId: string): Promise<DiscussionDetail>;
  createComment(
    repo: string,
    discussionId: string,
    body: string
  ): Promise<Comment>;
  createDiscussion(
    repo: string,
    title: string,
    body: string,
    categoryId?: string
  ): Promise<Discussion>;
  updateDiscussion(
    discussionId: string,
    title?: string,
    body?: string
  ): Promise<Discussion>;
}

export class GitHubClient implements GitHubDiscussionsClient {
  private graphqlWithAuth: GraphQLWithAuth;

  constructor(token: string) {
    this.graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });
  }

  async listDiscussions(
    repo: string,
    options: ListOptions = {}
  ): Promise<Discussion[]> {
    try {
      const [owner, name] = repo.split('/');
      const { first = 20, after, orderBy } = options;

      const query = `
        query GetDiscussions($owner: String!, $name: String!, $first: Int!, $after: String, $orderBy: DiscussionOrder) {
          repository(owner: $owner, name: $name) {
            discussions(first: $first, after: $after, orderBy: $orderBy) {
              nodes {
                id
                title
                createdAt
                updatedAt
                url
                locked
                comments {
                  totalCount
                }
                author {
                  login
                  avatarUrl
                }
                category {
                  id
                  name
                }
              }
            }
          }
        }
      `;

      const variables = {
        owner,
        name,
        first,
        after,
        orderBy: orderBy || { field: 'UPDATED_AT', direction: 'DESC' },
      };

      const response = await this.graphqlWithAuth(query, variables);

      return response.repository.discussions.nodes.map((node: any) => ({
        id: node.id,
        title: node.title,
        author: {
          login: node.author.login,
          avatarUrl: node.author.avatarUrl,
        },
        createdAt: new Date(node.createdAt),
        updatedAt: new Date(node.updatedAt),
        commentCount: node.comments.totalCount,
        category: node.category
          ? { id: node.category.id, name: node.category.name }
          : undefined,
        url: node.url,
        locked: node.locked,
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDiscussion(
    repo: string,
    discussionId: string
  ): Promise<DiscussionDetail> {
    try {
      const [owner, name] = repo.split('/');

      const query = `
        query GetDiscussion($owner: String!, $name: String!, $number: Int!) {
          repository(owner: $owner, name: $name) {
            discussion(number: $number) {
              id
              title
              body
              createdAt
              updatedAt
              url
              locked
              author {
                login
                avatarUrl
              }
              category {
                id
                name
              }
              comments(first: 100) {
                totalCount
                nodes {
                  id
                  body
                  createdAt
                  url
                  author {
                    login
                    avatarUrl
                  }
                }
              }
            }
          }
        }
      `;

      const discussionNumber = parseInt(discussionId, 10);
      const response = await this.graphqlWithAuth(query, {
        owner,
        name,
        number: discussionNumber,
      });

      const discussion = response.repository.discussion;
      const comments = discussion.comments.nodes.map((comment: any) => ({
        id: comment.id,
        author: {
          login: comment.author.login,
          avatarUrl: comment.author.avatarUrl,
        },
        body: comment.body,
        createdAt: new Date(comment.createdAt),
        url: comment.url,
      }));

      return {
        id: discussion.id,
        title: discussion.title,
        body: discussion.body,
        author: {
          login: discussion.author.login,
          avatarUrl: discussion.author.avatarUrl,
        },
        createdAt: new Date(discussion.createdAt),
        updatedAt: new Date(discussion.updatedAt),
        commentCount: discussion.comments.totalCount,
        category: discussion.category
          ? { id: discussion.category.id, name: discussion.category.name }
          : undefined,
        url: discussion.url,
        locked: discussion.locked,
        comments,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createComment(
    repo: string,
    discussionId: string,
    body: string
  ): Promise<Comment> {
    try {
      const mutation = `
        mutation AddDiscussionComment($discussionId: ID!, $body: String!) {
          addDiscussionComment(input: { discussionId: $discussionId, body: $body }) {
            comment {
              id
              body
              createdAt
              url
              author {
                login
                avatarUrl
              }
            }
          }
        }
      `;

      const response = await this.graphqlWithAuth(mutation, {
        discussionId,
        body,
      });

      const comment = response.addDiscussionComment.comment;
      return {
        id: comment.id,
        author: {
          login: comment.author.login,
          avatarUrl: comment.author.avatarUrl,
        },
        body: comment.body,
        createdAt: new Date(comment.createdAt),
        url: comment.url,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createDiscussion(
    repo: string,
    title: string,
    body: string,
    categoryId?: string
  ): Promise<Discussion> {
    try {
      const [owner, name] = repo.split('/');

      if (!categoryId) {
        const categoriesQuery = `
          query GetCategories($owner: String!, $name: String!) {
            repository(owner: $owner, name: $name) {
              discussionCategories(first: 10) {
                nodes {
                  id
                  name
                }
              }
            }
          }
        `;

        const categoriesResponse = await this.graphqlWithAuth(categoriesQuery, {
          owner,
          name,
        });

        const generalCategory = categoriesResponse.repository.discussionCategories.nodes.find(
          (cat: any) => cat.name.toLowerCase() === 'general'
        );

        if (generalCategory) {
          categoryId = generalCategory.id;
        } else {
          categoryId = categoriesResponse.repository.discussionCategories.nodes[0]?.id;
        }
      }

      const mutation = `
        mutation CreateDiscussion($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
          createDiscussion(input: { repositoryId: $repositoryId, categoryId: $categoryId, title: $title, body: $body }) {
            discussion {
              id
              title
              createdAt
              updatedAt
              url
              locked
              author {
                login
                avatarUrl
              }
              category {
                id
                name
              }
              comments {
                totalCount
              }
            }
          }
        }
      `;

      const repositoryQuery = `
        query GetRepositoryId($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            id
          }
        }
      `;

      const repoResponse = await this.graphqlWithAuth(repositoryQuery, {
        owner,
        name,
      });

      const response = await this.graphqlWithAuth(mutation, {
        repositoryId: repoResponse.repository.id,
        categoryId,
        title,
        body,
      });

      const discussion = response.createDiscussion.discussion;
      return {
        id: discussion.id,
        title: discussion.title,
        author: {
          login: discussion.author.login,
          avatarUrl: discussion.author.avatarUrl,
        },
        createdAt: new Date(discussion.createdAt),
        updatedAt: new Date(discussion.updatedAt),
        commentCount: discussion.comments.totalCount,
        category: discussion.category
          ? { id: discussion.category.id, name: discussion.category.name }
          : undefined,
        url: discussion.url,
        locked: discussion.locked,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateDiscussion(
    discussionId: string,
    title?: string,
    body?: string
  ): Promise<Discussion> {
    try {
      const mutation = `
        mutation UpdateDiscussion($discussionId: ID!, $title: String, $body: String) {
          updateDiscussion(input: { discussionId: $discussionId, title: $title, body: $body }) {
            discussion {
              id
              title
              createdAt
              updatedAt
              url
              locked
              author {
                login
                avatarUrl
              }
              category {
                id
                name
              }
              comments {
                totalCount
              }
            }
          }
        }
      `;

      const variables: any = { discussionId };
      if (title !== undefined) variables.title = title;
      if (body !== undefined) variables.body = body;

      const response = await this.graphqlWithAuth(mutation, variables);

      const discussion = response.updateDiscussion.discussion;
      return {
        id: discussion.id,
        title: discussion.title,
        author: {
          login: discussion.author.login,
          avatarUrl: discussion.author.avatarUrl,
        },
        createdAt: new Date(discussion.createdAt),
        updatedAt: new Date(discussion.updatedAt),
        commentCount: discussion.comments.totalCount,
        category: discussion.category
          ? { id: discussion.category.id, name: discussion.category.name }
          : undefined,
        url: discussion.url,
        locked: discussion.locked,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): AppError {
    if (error.errors) {
      const graphqlError = error.errors[0];
      if (graphqlError.type === 'UNAUTHORIZED') {
        return {
          type: ErrorType.AUTHENTICATION_ERROR,
          message: 'Invalid or expired GitHub token',
          suggestions: [
            'Check your GitHub Personal Access Token',
            'Ensure the token has discussions scope',
            'Run gh-discussions config to update your token',
          ],
        };
      }
      return {
        type: ErrorType.API_ERROR,
        message: graphqlError.message,
        details: error.errors,
      };
    }

    if ((error.code && (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED')) || 
        (error.status && (error.status === 'ENOTFOUND' || error.status === 'ECONNREFUSED'))) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network connection failed',
        suggestions: ['Check your internet connection', 'Try again later'],
      };
    }

    return {
      type: ErrorType.API_ERROR,
      message: error.message || 'Unknown error occurred',
      details: error,
    };
  }
}
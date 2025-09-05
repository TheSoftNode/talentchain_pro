// GitHub API Service - Real integration with GitHub REST API

import { AI_CONFIG, getEnvConfig } from '../../config';
import { 
  GitHubProfile, 
  GitHubRepository, 
  GitHubCommit, 
  APIResponse, 
  PaginatedResponse 
} from '../../types';

export class GitHubAPIService {
  private token: string;
  private baseURL = AI_CONFIG.GITHUB_API_BASE;
  private rateLimitRemaining = AI_CONFIG.GITHUB_RATE_LIMIT;
  private rateLimitReset = 0;

  constructor(token?: string) {
    const env = getEnvConfig();
    this.token = token || env.GITHUB_TOKEN || '';
    
    if (!this.token) {
      console.warn('GitHub token not provided. API calls will be limited.');
    }
  }

  /**
   * Get headers for GitHub API requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'TalentChain-Pro-AI-Verification'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make authenticated request to GitHub API
   */
  private async makeRequest<T>(endpoint: string): Promise<APIResponse<T>> {
    try {
      // Check rate limit
      if (this.rateLimitRemaining <= 0 && Date.now() < this.rateLimitReset) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: this.getHeaders(),
        timeout: AI_CONFIG.API_TIMEOUT
      });

      // Update rate limit info
      this.rateLimitRemaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');
      this.rateLimitReset = parseInt(response.headers.get('X-RateLimit-Reset') || '0') * 1000;

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Resource not found. Please check the username/repository.');
        }
        if (response.status === 403) {
          throw new Error('Access forbidden. Please check your GitHub token permissions.');
        }
        if (response.status === 401) {
          throw new Error('Unauthorized. Please check your GitHub token.');
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown GitHub API error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(username: string): Promise<APIResponse<GitHubProfile>> {
    console.log(`🔍 Fetching GitHub profile for: ${username}`);
    
    const response = await this.makeRequest<any>(`/users/${username}`);
    
    if (!response.success || !response.data) {
      return response as APIResponse<GitHubProfile>;
    }

    const profile: GitHubProfile = {
      username: response.data.login,
      publicRepos: response.data.public_repos || 0,
      followers: response.data.followers || 0,
      following: response.data.following || 0,
      createdAt: new Date(response.data.created_at),
      bio: response.data.bio,
      location: response.data.location,
      company: response.data.company,
      blog: response.data.blog
    };

    return {
      success: true,
      data: profile,
      timestamp: new Date()
    };
  }

  /**
   * Get user repositories with language and activity data
   */
  async getUserRepositories(
    username: string, 
    page = 1, 
    perPage = 30
  ): Promise<APIResponse<PaginatedResponse<GitHubRepository>>> {
    console.log(`📁 Fetching repositories for: ${username} (page ${page})`);
    
    const response = await this.makeRequest<any[]>(
      `/users/${username}/repos?sort=updated&per_page=${perPage}&page=${page}`
    );
    
    if (!response.success || !response.data) {
      return response as APIResponse<PaginatedResponse<GitHubRepository>>;
    }

    // Process repositories and get additional data
    const repositories: GitHubRepository[] = [];
    
    for (const repo of response.data.slice(0, AI_CONFIG.MAX_REPOS_TO_ANALYZE)) {
      const repository: GitHubRepository = {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: repo.language || 'Unknown',
        stargazersCount: repo.stargazers_count || 0,
        forksCount: repo.forks_count || 0,
        size: repo.size || 0,
        createdAt: new Date(repo.created_at),
        updatedAt: new Date(repo.updated_at),
        topics: repo.topics || [],
        commits: [] // Will be populated separately if needed
      };
      
      repositories.push(repository);
    }

    const paginatedResponse: PaginatedResponse<GitHubRepository> = {
      items: repositories,
      page,
      perPage,
      total: response.data.length,
      hasNextPage: response.data.length === perPage
    };

    return {
      success: true,
      data: paginatedResponse,
      timestamp: new Date()
    };
  }

  /**
   * Get repository languages
   */
  async getRepositoryLanguages(owner: string, repo: string): Promise<APIResponse<Record<string, number>>> {
    const response = await this.makeRequest<Record<string, number>>(`/repos/${owner}/${repo}/languages`);
    return response;
  }

  /**
   * Get recent commits for a repository
   */
  async getRepositoryCommits(
    owner: string, 
    repo: string, 
    author?: string,
    limit = 10
  ): Promise<APIResponse<GitHubCommit[]>> {
    console.log(`📝 Fetching commits for: ${owner}/${repo}`);
    
    let endpoint = `/repos/${owner}/${repo}/commits?per_page=${limit}`;
    if (author) {
      endpoint += `&author=${author}`;
    }

    const response = await this.makeRequest<any[]>(endpoint);
    
    if (!response.success || !response.data) {
      return response as APIResponse<GitHubCommit[]>;
    }

    const commits: GitHubCommit[] = [];
    
    for (const commit of response.data.slice(0, AI_CONFIG.MAX_COMMITS_PER_REPO)) {
      // Get detailed commit info including stats
      const detailResponse = await this.makeRequest<any>(`/repos/${owner}/${repo}/commits/${commit.sha}`);
      
      if (detailResponse.success && detailResponse.data) {
        const detailData = detailResponse.data;
        
        const gitHubCommit: GitHubCommit = {
          sha: commit.sha,
          message: commit.commit.message,
          author: {
            name: commit.commit.author.name,
            email: commit.commit.author.email,
            date: new Date(commit.commit.author.date)
          },
          stats: {
            additions: detailData.stats?.additions || 0,
            deletions: detailData.stats?.deletions || 0,
            total: detailData.stats?.total || 0
          },
          files: detailData.files?.map((file: any) => file.filename) || []
        };
        
        commits.push(gitHubCommit);
      }
      
      // Add delay to avoid rate limiting
      if (commits.length % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      success: true,
      data: commits,
      timestamp: new Date()
    };
  }

  /**
   * Search repositories by topic or language
   */
  async searchRepositories(
    query: string, 
    user?: string,
    language?: string
  ): Promise<APIResponse<GitHubRepository[]>> {
    let searchQuery = query;
    
    if (user) {
      searchQuery += ` user:${user}`;
    }
    if (language) {
      searchQuery += ` language:${language}`;
    }

    const response = await this.makeRequest<any>(`/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc`);
    
    if (!response.success || !response.data) {
      return response as APIResponse<GitHubRepository[]>;
    }

    const repositories: GitHubRepository[] = response.data.items.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language || 'Unknown',
      stargazersCount: repo.stargazers_count || 0,
      forksCount: repo.forks_count || 0,
      size: repo.size || 0,
      createdAt: new Date(repo.created_at),
      updatedAt: new Date(repo.updated_at),
      topics: repo.topics || [],
      commits: []
    }));

    return {
      success: true,
      data: repositories,
      timestamp: new Date()
    };
  }

  /**
   * Get user's contribution activity
   */
  async getUserActivity(username: string): Promise<APIResponse<any>> {
    // Note: GitHub doesn't provide a direct API for contribution graphs
    // This would require scraping or using GitHub GraphQL API
    console.log(`📈 Getting activity data for: ${username}`);
    
    // For now, return mock structure - would need GraphQL implementation
    return {
      success: true,
      data: {
        totalContributions: 0,
        contributionYears: [],
        mostActiveLanguages: [],
        contributionStreak: 0
      },
      timestamp: new Date()
    };
  }

  /**
   * Validate GitHub token
   */
  async validateToken(): Promise<boolean> {
    if (!this.token) return false;
    
    try {
      const response = await this.makeRequest<any>('/user');
      return response.success;
    } catch {
      return false;
    }
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus() {
    return {
      remaining: this.rateLimitRemaining,
      resetTime: new Date(this.rateLimitReset),
      isLimited: this.rateLimitRemaining <= 0 && Date.now() < this.rateLimitReset
    };
  }
}

// Export singleton instance
export const githubAPI = new GitHubAPIService();
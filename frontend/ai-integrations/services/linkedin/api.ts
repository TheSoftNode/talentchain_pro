// LinkedIn API Service - Real integration with LinkedIn API

import { AI_CONFIG, getEnvConfig } from '../../config';
import { 
  LinkedInProfile, 
  LinkedInPosition, 
  LinkedInSkill, 
  LinkedInEducation,
  APIResponse 
} from '../../types';

export class LinkedInAPIService {
  private token: string;
  private baseURL = AI_CONFIG.LINKEDIN_API_BASE;

  constructor(token?: string) {
    const env = getEnvConfig();
    this.token = token || env.LINKEDIN_TOKEN || '';
    
    if (!this.token) {
      console.warn('LinkedIn token not provided. LinkedIn integration will be limited.');
    }
  }

  /**
   * Get headers for LinkedIn API requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': '202401',
      'X-Restli-Protocol-Version': '2.0.0'
    };

    return headers;
  }

  /**
   * Make authenticated request to LinkedIn API
   */
  private async makeRequest<T>(endpoint: string): Promise<APIResponse<T>> {
    try {
      if (!this.token) {
        throw new Error('LinkedIn token is required for API access');
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: this.getHeaders(),
        timeout: AI_CONFIG.API_TIMEOUT
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('LinkedIn token is invalid or expired');
        }
        if (response.status === 403) {
          throw new Error('Access forbidden. Check LinkedIn API permissions');
        }
        if (response.status === 429) {
          throw new Error('LinkedIn API rate limit exceeded');
        }
        throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
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
        error: error instanceof Error ? error.message : 'Unknown LinkedIn API error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get current user's profile information
   */
  async getUserProfile(): Promise<APIResponse<LinkedInProfile>> {
    console.log('👤 Fetching LinkedIn profile...');

    const response = await this.makeRequest<any>('/people/~:(id,firstName,lastName,headline,summary,location,industry,numConnections)');
    
    if (!response.success || !response.data) {
      return response as APIResponse<LinkedInProfile>;
    }

    const profileData = response.data;
    
    const profile: LinkedInProfile = {
      id: profileData.id,
      firstName: profileData.firstName?.localized?.[Object.keys(profileData.firstName.localized)[0]] || '',
      lastName: profileData.lastName?.localized?.[Object.keys(profileData.lastName.localized)[0]] || '',
      headline: profileData.headline?.localized?.[Object.keys(profileData.headline.localized)[0]],
      summary: profileData.summary?.localized?.[Object.keys(profileData.summary.localized)[0]],
      location: profileData.location?.name,
      industry: profileData.industry,
      numConnections: profileData.numConnections,
      positions: [], // Will be populated separately
      skills: [], // Will be populated separately
      educations: [] // Will be populated separately
    };

    return {
      success: true,
      data: profile,
      timestamp: new Date()
    };
  }

  /**
   * Get user's work positions/experience
   */
  async getUserPositions(): Promise<APIResponse<LinkedInPosition[]>> {
    console.log('💼 Fetching LinkedIn work experience...');

    const response = await this.makeRequest<any>('/people/~/positions:(id,title,company,location,startDate,endDate,description,isCurrent)');
    
    if (!response.success || !response.data) {
      return response as APIResponse<LinkedInPosition[]>;
    }

    const positions: LinkedInPosition[] = [];
    
    if (response.data.elements) {
      for (const pos of response.data.elements) {
        const position: LinkedInPosition = {
          id: pos.id,
          title: pos.title?.localized?.[Object.keys(pos.title.localized)[0]] || '',
          companyName: pos.company?.name || '',
          location: pos.location?.name,
          startDate: pos.startDate ? new Date(pos.startDate.year, (pos.startDate.month || 1) - 1) : new Date(),
          endDate: pos.endDate ? new Date(pos.endDate.year, (pos.endDate.month || 1) - 1) : undefined,
          description: pos.description?.localized?.[Object.keys(pos.description.localized)[0]],
          isCurrent: pos.isCurrent || false
        };
        
        positions.push(position);
      }
    }

    return {
      success: true,
      data: positions,
      timestamp: new Date()
    };
  }

  /**
   * Get user's skills and endorsements
   */
  async getUserSkills(): Promise<APIResponse<LinkedInSkill[]>> {
    console.log('🎯 Fetching LinkedIn skills...');

    const response = await this.makeRequest<any>('/people/~/skills:(name,numEndorsements)');
    
    if (!response.success || !response.data) {
      return response as APIResponse<LinkedInSkill[]>;
    }

    const skills: LinkedInSkill[] = [];
    
    if (response.data.elements) {
      for (const skill of response.data.elements) {
        const linkedInSkill: LinkedInSkill = {
          name: skill.name?.localized?.[Object.keys(skill.name.localized)[0]] || '',
          endorsements: skill.numEndorsements || 0,
          endorsers: [] // LinkedIn API doesn't provide endorser details in basic response
        };
        
        skills.push(linkedInSkill);
      }
    }

    return {
      success: true,
      data: skills,
      timestamp: new Date()
    };
  }

  /**
   * Get user's education information
   */
  async getUserEducation(): Promise<APIResponse<LinkedInEducation[]>> {
    console.log('🎓 Fetching LinkedIn education...');

    const response = await this.makeRequest<any>('/people/~/educations:(schoolName,degreeName,fieldOfStudy,startDate,endDate)');
    
    if (!response.success || !response.data) {
      return response as APIResponse<LinkedInEducation[]>;
    }

    const educations: LinkedInEducation[] = [];
    
    if (response.data.elements) {
      for (const edu of response.data.elements) {
        const education: LinkedInEducation = {
          schoolName: edu.schoolName?.localized?.[Object.keys(edu.schoolName.localized)[0]] || '',
          degreeName: edu.degreeName?.localized?.[Object.keys(edu.degreeName.localized)[0]],
          fieldOfStudy: edu.fieldOfStudy?.localized?.[Object.keys(edu.fieldOfStudy.localized)[0]],
          startDate: edu.startDate ? new Date(edu.startDate.year, (edu.startDate.month || 1) - 1) : undefined,
          endDate: edu.endDate ? new Date(edu.endDate.year, (edu.endDate.month || 1) - 1) : undefined
        };
        
        educations.push(education);
      }
    }

    return {
      success: true,
      data: educations,
      timestamp: new Date()
    };
  }

  /**
   * Get complete user profile with all details
   */
  async getCompleteProfile(): Promise<APIResponse<LinkedInProfile>> {
    console.log('🔄 Fetching complete LinkedIn profile...');

    try {
      // Get basic profile
      const profileResponse = await this.getUserProfile();
      if (!profileResponse.success) {
        return profileResponse;
      }

      const profile = profileResponse.data!;

      // Get positions
      const positionsResponse = await this.getUserPositions();
      if (positionsResponse.success && positionsResponse.data) {
        profile.positions = positionsResponse.data;
      }

      // Get skills
      const skillsResponse = await this.getUserSkills();
      if (skillsResponse.success && skillsResponse.data) {
        profile.skills = skillsResponse.data;
      }

      // Get education
      const educationResponse = await this.getUserEducation();
      if (educationResponse.success && educationResponse.data) {
        profile.educations = educationResponse.data;
      }

      return {
        success: true,
        data: profile,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch complete profile',
        timestamp: new Date()
      };
    }
  }

  /**
   * Search for skills in user's profile text
   */
  async searchSkillsInProfile(skillKeywords: string[]): Promise<{
    foundSkills: string[];
    context: Record<string, string[]>;
  }> {
    try {
      const profileResponse = await this.getCompleteProfile();
      if (!profileResponse.success || !profileResponse.data) {
        return { foundSkills: [], context: {} };
      }

      const profile = profileResponse.data;
      const foundSkills: string[] = [];
      const context: Record<string, string[]> = {};

      // Search in various profile sections
      const searchTexts = [
        profile.headline || '',
        profile.summary || '',
        ...profile.positions.map(p => p.description || ''),
        ...profile.skills.map(s => s.name),
        ...profile.educations.map(e => e.fieldOfStudy || '')
      ];

      const allText = searchTexts.join(' ').toLowerCase();

      for (const skill of skillKeywords) {
        const skillLower = skill.toLowerCase();
        if (allText.includes(skillLower)) {
          foundSkills.push(skill);
          
          // Find context where skill was mentioned
          const contexts: string[] = [];
          
          if (profile.headline?.toLowerCase().includes(skillLower)) {
            contexts.push(`Headline: ${profile.headline}`);
          }
          
          if (profile.summary?.toLowerCase().includes(skillLower)) {
            contexts.push(`Summary: ${profile.summary.substring(0, 100)}...`);
          }
          
          for (const position of profile.positions) {
            if (position.description?.toLowerCase().includes(skillLower)) {
              contexts.push(`Experience at ${position.companyName}: ${position.description.substring(0, 100)}...`);
            }
          }
          
          if (profile.skills.some(s => s.name.toLowerCase().includes(skillLower))) {
            const matchingSkill = profile.skills.find(s => s.name.toLowerCase().includes(skillLower));
            if (matchingSkill) {
              contexts.push(`Listed skill: ${matchingSkill.name} (${matchingSkill.endorsements} endorsements)`);
            }
          }
          
          context[skill] = contexts;
        }
      }

      return { foundSkills, context };

    } catch (error) {
      console.error('LinkedIn skill search failed:', error);
      return { foundSkills: [], context: {} };
    }
  }

  /**
   * Validate LinkedIn token
   */
  async validateToken(): Promise<boolean> {
    if (!this.token) return false;
    
    try {
      const response = await this.getUserProfile();
      return response.success;
    } catch {
      return false;
    }
  }

  /**
   * Get OAuth URL for LinkedIn authentication
   */
  static getOAuthUrl(clientId: string, redirectUri: string, scopes: string[] = ['r_liteprofile', 'r_emailaddress']): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      state: crypto.randomUUID() // CSRF protection
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<{ access_token: string; expires_in: number } | null> {
    try {
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri
        })
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LinkedIn token exchange failed:', error);
      return null;
    }
  }
}

// Export singleton instance
export const linkedInAPI = new LinkedInAPIService();
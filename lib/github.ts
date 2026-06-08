// Helper to extract GitHub username from a full URL
export function extractGithubUsername(input: string): string {
  const trimmed = input.trim();
  if (trimmed.includes('github.com/')) {
    const parts = trimmed.split('github.com/');
    if (parts[1]) {
      return parts[1].split('/')[0].split('?')[0].split('#')[0];
    }
  }
  return trimmed;
}

// Fetch public GitHub repos and parse them + user commits to extract tech skills
export async function fetchGithubSkills(username: string): Promise<{ skills: string[]; repos: any[] }> {
  try {
    // Fetch up to 30 repositories
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`);
    if (!response.ok) throw new Error('Failed to fetch repositories');
    const repos = await response.json();
    
    const detectedSkills = new Set<string>();
    
    // Skill mapping dictionary based on languages and topics/names/commit messages
    const skillKeywords: Record<string, string> = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'python': 'Python',
      'java': 'Java',
      'go ': 'Go',
      'golang': 'Go',
      'rust': 'Rust',
      'c++': 'C++',
      'cpp': 'C++',
      'c#': 'C#',
      'csharp': 'C#',
      'ruby': 'Ruby',
      'php': 'PHP',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'react': 'React',
      'next.js': 'Next.js',
      'nextjs': 'Next.js',
      'node': 'Node.js',
      'nodejs': 'Node.js',
      'express': 'Express',
      'vue': 'Vue.js',
      'angular': 'Angular',
      'docker': 'Docker',
      'kubernetes': 'Kubernetes',
      'k8s': 'Kubernetes',
      'aws': 'AWS',
      'gcp': 'Google Cloud',
      'azure': 'Azure',
      'sql': 'SQL',
      'mysql': 'MySQL',
      'postgres': 'PostgreSQL',
      'postgresql': 'PostgreSQL',
      'mongodb': 'MongoDB',
      'redis': 'Redis',
      'html': 'HTML',
      'css': 'CSS',
      'tailwind': 'Tailwind CSS',
      'git': 'Git',
      'graphql': 'GraphQL',
      'tensorflow': 'TensorFlow',
      'pytorch': 'PyTorch',
      'django': 'Django',
      'flask': 'Flask',
      'laravel': 'Laravel',
      'spring': 'Spring Boot',
      'firebase': 'Firebase',
      'supabase': 'Supabase',
      'figma': 'Figma',
      'jira': 'Jira'
    };

    // Parse repository metadata
    repos.forEach((repo: any) => {
      if (repo.language) {
        const langLower = repo.language.toLowerCase();
        if (skillKeywords[langLower]) {
          detectedSkills.add(skillKeywords[langLower]);
        }
      }
      
      const textToSearch = `${repo.name} ${repo.description || ''}`.toLowerCase();
      Object.keys(skillKeywords).forEach(key => {
        if (textToSearch.includes(key)) {
          detectedSkills.add(skillKeywords[key]);
        }
      });
    });

    // Fetch commits for every repository to extract skills from commit messages
    // Note: limit loop to prevent hitting API rate limits on large number of repos
    for (const repo of repos) {
      try {
        const commitsRes = await fetch(
          `https://api.github.com/repos/${username}/${repo.name}/commits?author=${username}&per_page=10`
        );
        if (commitsRes.ok) {
          const commitsData = await commitsRes.json();
          if (Array.isArray(commitsData)) {
            commitsData.forEach((c: any) => {
              const msg = (c.commit?.message || '').toLowerCase();
              Object.keys(skillKeywords).forEach(key => {
                if (msg.includes(key)) {
                  detectedSkills.add(skillKeywords[key]);
                }
              });
            });
          }
        }
      } catch (err) {
        console.error(`Failed to fetch commits for repo ${repo.name}:`, err);
      }
    }

    return {
      skills: Array.from(detectedSkills),
      repos
    };
  } catch (err) {
    console.error('Failed to sync GitHub skills:', err);
    return { skills: [], repos: [] };
  }
}

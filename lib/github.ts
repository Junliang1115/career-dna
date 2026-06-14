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
    // 1. Fetch repositories owned by the user
    let ownedRepos: any[] = [];
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
      if (response.ok) {
        ownedRepos = await response.json();
      }
    } catch (err) {
      console.error('Failed to fetch owned repositories:', err);
    }

    // 2. Fetch commits authored by the user to find repositories they contributed to (fetch 3 pages of 100 items each, total 300 commits scanned)
    let contributedRepos: any[] = [];
    try {
      const pagePromises = [1, 2, 3].map(page =>
        fetch(
          `https://api.github.com/search/commits?q=author:${username}&sort=author-date&order=desc&per_page=100&page=${page}`,
          {
            headers: {
              Accept: 'application/vnd.github+json'
            }
          }
        )
          .then(res => (res.ok ? res.json() : null))
          .catch(err => {
            console.error(`Error fetching commits page ${page}:`, err);
            return null;
          })
      );
      const pagesData = await Promise.all(pagePromises);
      const uniqueReposMap = new Map<number, any>();
      pagesData.forEach(data => {
        if (data && data.items && Array.isArray(data.items)) {
          data.items.forEach((item: any) => {
            if (item.repository) {
              uniqueReposMap.set(item.repository.id, item.repository);
            }
          });
        }
      });
      contributedRepos = Array.from(uniqueReposMap.values());
    } catch (err) {
      console.error('Failed to fetch contributed commits search:', err);
    }

    // 3. Combine and deduplicate repositories by ID
    const allReposMap = new Map<number, any>();
    ownedRepos.forEach((r: any) => allReposMap.set(r.id, r));
    contributedRepos.forEach((r: any) => {
      if (!allReposMap.has(r.id)) {
        allReposMap.set(r.id, r);
      }
    });

    const repos = Array.from(allReposMap.values());
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

    // Fetch commits for repos to extract more skills (limit to first 10 repositories to avoid rate limits)
    const reposToScan = repos.slice(0, 10);
    for (const repo of reposToScan) {
      try {
        const repoFullName = repo.full_name || `${username}/${repo.name}`;
        const commitsRes = await fetch(
          `https://api.github.com/repos/${repoFullName}/commits?author=${username}&per_page=10`
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

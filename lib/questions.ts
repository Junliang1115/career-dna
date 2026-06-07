export interface Option {
  text: string;
}

export interface Question {
  id: number;
  text: string;
  optionA: Option;
  optionB: Option;
}

export const questions: Question[] = [
  // ─────────────────────────────────────────────
  // How do you learn a new technology?
  // ─────────────────────────────────────────────
  {
    id: 1,
    text: 'You want to add a new skill to your toolkit — something relevant to your field. What do you do?',
    optionA: {
      text: 'Jump straight into a project with it. Build first, understand later.',
    },
    optionB: {
      text: 'Start with the documentation, tutorials, or a course. Get the foundation right before touching anything real.',
    },
  },

  // ─────────────────────────────────────────────
  // How do you approach a deadline?
  // ─────────────────────────────────────────────
  {
    id: 2,
    text: 'Your team has a project deadline in two weeks. The spec is mostly clear. How do you approach it?',
    optionA: {
      text: 'Start building immediately. Learn what you need as you go and iterate as the deadline approaches.',
    },
    optionB: {
      text: 'Plan the approach first. Understand the requirements fully before you write a single line.',
    },
  },

  // ─────────────────────────────────────────────
  // Preferred work pace
  // ─────────────────────────────────────────────
  {
    id: 3,
    text: 'Which work pace sounds more like you?',
    optionA: {
      text: 'Fast. Ship early, get feedback, iterate. Speed means learning fast.',
    },
    optionB: {
      text: 'Steady. Understand something completely before moving on. Rushing leads to rework.',
    },
  },

  // ─────────────────────────────────────────────
  // When something breaks
  // ─────────────────────────────────────────────
  {
    id: 4,
    text: 'A critical system goes down at work. The clock is ticking. You:',
    optionA: {
      text: 'Open the logs, try three things quickly, fix it fast, understand why later.',
    },
    optionB: {
      text: 'Trace the error step by step. You need to understand the root cause or it will happen again.',
    },
  },

  // ─────────────────────────────────────────────
  // Side project style
  // ─────────────────────────────────────────────
  {
    id: 5,
    text: 'You have a weekend with no obligations. You want to work on a personal project. The reality is:',
    optionA: {
      text: 'You want to finish something — a working prototype you can show someone by Sunday.',
    },
    optionB: {
      text: 'You want to go deep into something — even if Sunday comes and you\'ve barely scratched the surface but you understand it now.',
    },
  },

  // ─────────────────────────────────────────────
  // Work structure preference
  // ─────────────────────────────────────────────
  {
    id: 6,
    text: 'Think about your ideal work environment. It looks like:',
    optionA: {
      text: 'Clear processes, defined roles, stable expectations. You know what\'s expected of you this month and this quarter.',
    },
    optionB: {
      text: 'Fast-changing priorities, wearing different hats, ambiguity. You thrive when the playbook hasn\'t been written yet.',
    },
  },

  // ─────────────────────────────────────────────
  // Job security vs opportunity
  // ─────────────────────────────────────────────
  {
    id: 7,
    text: 'A startup offers you a 25% pay cut but meaningful equity and the chance to build something from scratch. Your current job has a clear promotion track and solid benefits. You:',
    optionA: {
      text: 'Take the startup. The experience and upside are worth more at this stage of your career.',
    },
    optionB: {
      text: 'Stay. You need financial stability before you can afford high-risk moves.',
    },
  },

  // ─────────────────────────────────────────────
  // Success metric
  // ─────────────────────────────────────────────
  {
    id: 8,
    text: 'What does success in a job mean to you?',
    optionA: {
      text: 'Your work is measurable: ships, metrics, revenue, uptime. You want to see your impact reflected in numbers.',
    },
    optionB: {
      text: 'Your work solves a meaningful problem. Whether or not it\'s easily measurable matters less than whether it matters.',
    },
  },

  // ─────────────────────────────────────────────
  // When a new system is needed
  // ─────────────────────────────────────────────
  {
    id: 9,
    text: 'Your team needs to solve a recurring operational problem. The manager asks for your recommendation. You:',
    optionA: {
      text: 'Propose a pragmatic solution that solves today\'s problem. You can improve it once it\'s working.',
    },
    optionB: {
      text: 'Push for a proper system — one that\'s maintainable, documented, and built to last even if it takes longer to ship.',
    },
  },

  // ─────────────────────────────────────────────
  // Preferred company size/type
  // ─────────────────────────────────────────────
  {
    id: 10,
    text: 'Which company sounds more appealing to you?',
    optionA: {
      text: 'A large, established tech company or bank. Strong brand, structured processes, clear advancement.',
    },
    optionB: {
      text: 'A growing startup or product company. Fast-moving, high ownership, direct customer impact.',
    },
  },

  // ─────────────────────────────────────────────
  // Expertise vs breadth
  // ─────────────────────────────────────────────
  {
    id: 11,
    text: 'You\'re deciding what to focus on in the next year. You lean toward:',
    optionA: {
      text: 'Going deeper in one area. You want to be the person your team comes to for this specific thing.',
    },
    optionB: {
      text: 'Broadening your skills. You want to be useful across many areas, not boxed into one.',
    },
  },

  // ─────────────────────────────────────────────
  // Problem-solving identity
  // ─────────────────────────────────────────────
  {
    id: 12,
    text: 'When a teammate has a hard technical problem, what do they usually get from you?',
    optionA: {
      text: 'A precise, focused answer — you tend to zero in on exactly what\'s wrong.',
    },
    optionB: {
      text: 'A broader perspective — you often connect their problem to something in a different domain that helps them see it differently.',
    },
  },

  // ─────────────────────────────────────────────
  // In a team, you are usually the...
  // ─────────────────────────────────────────────
  {
    id: 13,
    text: 'In group projects or team work, you usually end up being the person who:',
    optionA: {
      text: 'Owns the hardest technical part. People know if they have a deep problem, they come to you.',
    },
    optionB: {
      text: 'Connects everyone together. You see how the pieces fit and make sure the team moves as one.',
    },
  },

  // ─────────────────────────────────────────────
  // Learning something new
  // ─────────────────────────────────────────────
  {
    id: 14,
    text: 'When you decide to learn something outside your main skill set, you tend to:',
    optionA: {
      text: 'Find the best resource and go deep. You want to reach a high level of competence, not just scratch the surface.',
    },
    optionB: {
      text: 'Pick up enough to be useful. You\'d rather know a little about many things and expand as needed.',
    },
  },

  // ─────────────────────────────────────────────
  // Your satisfaction source
  // ─────────────────────────────────────────────
  {
    id: 15,
    text: 'You get the most satisfaction from work when:',
    optionA: {
      text: 'You\'ve mastered something difficult. The feeling of expertise — knowing this domain better than almost anyone on your team.',
    },
    optionB: {
      text: 'You\'ve helped the team succeed. Seeing the group achieve something none of you could have done alone.',
    },
  },

  // ─────────────────────────────────────────────
  // Starting a new project
  // ─────────────────────────────────────────────
  {
    id: 16,
    text: 'You\'re starting a new project — something you\'ll own from scratch. You prefer to:',
    optionA: {
      text: 'Define the outcome first. What does success look like? Then build toward it.',
    },
    optionB: {
      text: 'Start building and see where it goes. The best outcomes come from exploration, not rigid plans.',
    },
  },

  // ─────────────────────────────────────────────
  // Decision-making style
  // ─────────────────────────────────────────────
  {
    id: 17,
    text: 'When making an important decision at work, you usually:',
    optionA: {
      text: 'Lean on data, benchmarks, and what the numbers say. Gut feelings are unreliable.',
    },
    optionB: {
      text: 'Trust your intuition and judgment, especially when data is incomplete or ambiguous.',
    },
  },

  // ─────────────────────────────────────────────
  // Type of problems you enjoy
  // ─────────────────────────────────────────────
  {
    id: 18,
    text: 'Which kind of problem would you choose if you could pick any for your next project?',
    optionA: {
      text: 'An optimization problem — something that\'s working but can be made significantly better with the right approach.',
    },
    optionB: {
      text: 'A design problem — something that doesn\'t have a clear right answer yet and you get to shape what it becomes.',
    },
  },

  // ─────────────────────────────────────────────
  // Success definition
  // ─────────────────────────────────────────────
  {
    id: 19,
    text: 'Five years from now, what does career success look like to you?',
    optionA: {
      text: 'Achieving something measurable — leading a team that ships, or solving a problem at scale, or a title and compensation that reflects your expertise.',
    },
    optionB: {
      text: 'Building something that didn\'t exist before — a product, a capability, or a way of working that changes how things are done.',
    },
  },

  // ─────────────────────────────────────────────
  // Ideal work culture
  // ─────────────────────────────────────────────
  {
    id: 20,
    text: 'Think about the last time you did your best work. The environment was:',
    optionA: {
      text: 'Structured and goal-oriented. Clear OKRs, regular check-ins, everyone knows what\'s winning.',
    },
    optionB: {
      text: 'Open and exploratory. Lots of freedom to try things, even if they fail, as long as you\'re learning.',
    },
  },
];

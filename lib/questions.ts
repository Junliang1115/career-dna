// ─────────────────────────────────────────────────────────────
// CareerScope — Full Assessment v5.0
// 18 RIASEC questions + 12 DISC questions = 30 total
// Output: 24 career archetypes (6 RIASEC × 4 DISC)
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type RIASECType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export type DISCType = 'D' | 'I' | 'S' | 'C';

export interface RIASECOption {
  type: RIASECType;
  text: string;
}

export interface DISCOption {
  type: DISCType;
  text: string;
}

export interface RIASECQuestion {
  id: number;
  section: 'RIASEC';
  text: string;
  options: [RIASECOption, RIASECOption, RIASECOption, RIASECOption];
}

export interface DISCQuestion {
  id: number;
  section: 'DISC';
  text: string;
  options: [DISCOption, DISCOption, DISCOption, DISCOption];
}

export type Question = RIASECQuestion | DISCQuestion;

// ─────────────────────────────────────────────────────────────
// FRAMEWORK REFERENCE
// ─────────────────────────────────────────────────────────────
//
// RIASEC — WORK PREFERENCE (what kind of work energises you)
//
//   R — BUILDER (Realistic)
//       You make things. Code, systems, infrastructure, tools.
//       You think in implementation. Satisfaction = it works.
//       CS jobs: Backend Engineer, DevOps, SRE, Cloud Engineer
//
//   I — ANALYST (Investigative)
//       You understand things. Research, model, find patterns.
//       You think in why. Satisfaction = insight that changes thinking.
//       CS jobs: Data Scientist, ML Researcher, Security Analyst
//
//   A — DESIGNER (Artistic)
//       You shape things. Interfaces, experiences, ideas.
//       You think in feel. Satisfaction = something elegant and new.
//       CS jobs: UX Designer, Frontend Engineer, Creative Technologist
//
//   S — COLLABORATOR (Social)
//       You align things. People, teams, communication, culture.
//       You think in who. Satisfaction = team succeeding together.
//       CS jobs: Engineering Manager, Developer Advocate, Tech Lead
//
//   E — DRIVER (Enterprising)
//       You move things. Products, outcomes, decisions, momentum.
//       You think in impact. Satisfaction = something shipped that matters.
//       CS jobs: Product Manager, Startup Engineer, Growth Engineer
//
//   C — OPERATOR (Conventional)
//       You maintain things. Reliability, process, rigour, precision.
//       You think in correctness. Satisfaction = system runs as intended.
//       CS jobs: Data Engineer, Security Engineer, Platform Engineer
//
// ─────────────────────────────────────────────────────────────
//
// DISC — WORK PERSONALITY (how you behave and work with others)
//
//   D — DOMINANT
//       Direct, decisive, results-driven, competitive.
//       "I make the call and move forward."
//
//   I — INFLUENTIAL
//       Enthusiastic, social, creative, persuasive.
//       "I bring people along with the idea."
//
//   S — STEADY
//       Patient, reliable, empathetic, team-first.
//       "I make sure everyone succeeds together."
//
//   C — CONSCIENTIOUS
//       Precise, analytical, process-driven, thorough.
//       "I make sure it's correct before it ships."
//
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// SECTION 1 — RIASEC QUESTIONS (18 questions, 3 per type)
// Each question: 4 options, one per RIASEC type
// User picks the option that feels most like them
// ─────────────────────────────────────────────────────────────

export const riasecQuestions: RIASECQuestion[] = [

  // ─────────────────────────────────────────────
  // R1 — What kind of task excites you most?
  // ─────────────────────────────────────────────
  {
    id: 1,
    section: 'RIASEC',
    text: 'A new project just landed on your desk. No constraints, no deadlines. Which task genuinely excites you most?',
    options: [
      {
        type: 'R',
        text: 'Set up the entire backend infrastructure — server, database, API, deployment pipeline. Build something that actually runs.',
      },
      {
        type: 'I',
        text: 'Dig into the data behind the problem. Understand what\'s actually happening before anyone starts building anything.',
      },
      {
        type: 'A',
        text: 'Design the user experience from scratch — the flows, the visual language, the feeling of using it for the first time.',
      },
      {
        type: 'E',
        text: 'Define the roadmap, align the stakeholders, and figure out how this becomes something people actually adopt.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // R2 — Free weekend project
  // ─────────────────────────────────────────────
  {
    id: 2,
    section: 'RIASEC',
    text: 'You have a free weekend and decide to work on something technical for fun. You naturally gravitate toward:',
    options: [
      {
        type: 'R',
        text: 'Building a working tool — a CLI app, a home automation script, a browser extension. You want something deployed and running by Sunday.',
      },
      {
        type: 'I',
        text: 'Exploring a dataset — football stats, stock prices, Reddit comments. You want to find a pattern or insight nobody has surfaced before.',
      },
      {
        type: 'A',
        text: 'Designing and building a polished UI — something that looks and feels genuinely good, not just functional.',
      },
      {
        type: 'C',
        text: 'Hardening a system — writing tests, setting up monitoring, automating backups. Making something reliable that was fragile before.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // R3 — Which role sounds like you?
  // ─────────────────────────────────────────────
  {
    id: 3,
    section: 'RIASEC',
    text: 'A friend asks what kind of engineer you are. Which description fits you best?',
    options: [
      {
        type: 'R',
        text: '"I build things. Give me a problem and I\'ll have something working by end of week."',
      },
      {
        type: 'S',
        text: '"I help teams work better. I\'m the person who unblocks people and makes sure everyone is aligned."',
      },
      {
        type: 'E',
        text: '"I drive products forward. I care more about whether it ships and gets used than whether the code is perfect."',
      },
      {
        type: 'C',
        text: '"I make sure things don\'t break. Reliability, process, correctness — that\'s where I add value."',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // I1 — How you approach a problem
  // ─────────────────────────────────────────────
  {
    id: 4,
    section: 'RIASEC',
    text: 'Your team is facing a problem nobody fully understands yet. What\'s your instinct?',
    options: [
      {
        type: 'R',
        text: 'Build a quick prototype to see what happens. You learn faster by doing than by analysing.',
      },
      {
        type: 'I',
        text: 'Investigate first. Pull the data, read the logs, form a hypothesis before touching anything.',
      },
      {
        type: 'S',
        text: 'Talk to the people affected. The people experiencing the problem usually know more about it than the data does.',
      },
      {
        type: 'E',
        text: 'Frame the problem in terms of business impact. What does solving this unlock, and is it worth prioritising over everything else?',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // I2 — Research vs ship
  // ─────────────────────────────────────────────
  {
    id: 5,
    section: 'RIASEC',
    text: 'You are building an ML model to predict customer churn. After two weeks of work, it\'s at 85% accuracy. You could spend another week getting to 91%. You:',
    options: [
      {
        type: 'I',
        text: 'Keep going. Understanding why certain features matter more than others is as interesting as the accuracy number itself.',
      },
      {
        type: 'E',
        text: 'Ship it at 85%. It\'s already better than what the business has now. The extra week is better spent on the next problem.',
      },
      {
        type: 'C',
        text: 'Audit the model for bias and edge cases first. Accuracy alone doesn\'t tell you if the model is actually trustworthy in production.',
      },
      {
        type: 'R',
        text: 'Deploy it and set up monitoring. Real-world data will teach you more in a week than another week of offline tuning.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // I3 — Reading habits
  // ─────────────────────────────────────────────
  {
    id: 6,
    section: 'RIASEC',
    text: 'You have an hour to read something technical. You choose:',
    options: [
      {
        type: 'I',
        text: 'A research paper on a topic you\'ve been curious about — even if it\'s dense and takes the full hour to get through.',
      },
      {
        type: 'R',
        text: 'A tutorial on a tool you\'ve been meaning to try. You want to walk away being able to build something with it.',
      },
      {
        type: 'A',
        text: 'A case study on how a product you admire was designed — the design decisions, the tradeoffs, the evolution over time.',
      },
      {
        type: 'C',
        text: 'The documentation for a system you use daily but don\'t fully understand. You want to close the knowledge gaps properly.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // A1 — Output you care about
  // ─────────────────────────────────────────────
  {
    id: 7,
    section: 'RIASEC',
    text: 'Which kind of output makes you most proud when you look back at your work?',
    options: [
      {
        type: 'A',
        text: 'An interface or experience that feels genuinely polished — where every detail was thought through.',
      },
      {
        type: 'R',
        text: 'A system or tool that works reliably and solves a real problem at scale.',
      },
      {
        type: 'I',
        text: 'An analysis or model that revealed something non-obvious and changed how the team thought about a problem.',
      },
      {
        type: 'S',
        text: 'A team that worked well together because of how you communicated, unblocked, and supported people.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // A2 — Design sensitivity
  // ─────────────────────────────────────────────
  {
    id: 8,
    section: 'RIASEC',
    text: 'You are using a product that works perfectly but has a confusing, cluttered interface. You:',
    options: [
      {
        type: 'A',
        text: 'Feel genuinely bothered by it. Bad design is a failure even if the underlying logic works. You mentally redesign it.',
      },
      {
        type: 'C',
        text: 'Accept it. If it works correctly and reliably, the interface is secondary. You learn the layout and move on.',
      },
      {
        type: 'E',
        text: 'Think about the business impact. Bad UX means lower adoption. You wonder if the team knows how much this is costing them.',
      },
      {
        type: 'I',
        text: 'Get curious about why it was designed this way. What constraints led to these decisions? Was it intentional?',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // A3 — Creative vs functional
  // ─────────────────────────────────────────────
  {
    id: 9,
    section: 'RIASEC',
    text: 'You are building a public-facing feature. The functional version is done. You have two extra days. You spend them:',
    options: [
      {
        type: 'A',
        text: 'Refining the visual design, micro-interactions, and copy. The difference between good and great is in the details.',
      },
      {
        type: 'R',
        text: 'Adding robustness — edge case handling, performance optimisation, better error messages.',
      },
      {
        type: 'I',
        text: 'Setting up analytics so you can measure how users actually interact with it after launch.',
      },
      {
        type: 'E',
        text: 'Planning the launch — writing the announcement, thinking about distribution, making sure people actually see it.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // S1 — Team vs solo
  // ─────────────────────────────────────────────
  {
    id: 10,
    section: 'RIASEC',
    text: 'You do your best work when:',
    options: [
      {
        type: 'S',
        text: 'You are working closely with a team. Collaboration, discussion, and shared ownership energise you.',
      },
      {
        type: 'R',
        text: 'You have a clear task and the space to execute it alone. You produce your best output without interruption.',
      },
      {
        type: 'I',
        text: 'You have a hard, open-ended problem to think through. Deep focus on a difficult question is where you thrive.',
      },
      {
        type: 'C',
        text: 'You have a well-defined system to work within. Clear processes, documented expectations, and consistent standards.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // S2 — Helping others
  // ─────────────────────────────────────────────
  {
    id: 11,
    section: 'RIASEC',
    text: 'A junior developer on your team is struggling with a concept you understand well. You:',
    options: [
      {
        type: 'S',
        text: 'Sit with them and walk through it step by step. Helping someone understand something properly is genuinely satisfying.',
      },
      {
        type: 'R',
        text: 'Show them a working example. The fastest way to understand something in code is to see it running.',
      },
      {
        type: 'C',
        text: 'Point them to the best documentation or resource you know of. You want them to develop the skill of learning independently.',
      },
      {
        type: 'E',
        text: 'Give them a quick answer and get back to what you were doing. You respect their time and yours — deep mentoring sessions can wait for one-on-ones.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // S3 — What drains vs energises you
  // ─────────────────────────────────────────────
  {
    id: 12,
    section: 'RIASEC',
    text: 'After a full day of work, which kind of day leaves you feeling most fulfilled?',
    options: [
      {
        type: 'S',
        text: 'A day of meetings, alignment sessions, and helping teammates. You moved the people side of the project forward.',
      },
      {
        type: 'R',
        text: 'A day of deep building. You wrote a lot of code, deployed something, and the output is visible.',
      },
      {
        type: 'I',
        text: 'A day of investigation. You went deep on a hard problem and came out with a clear understanding you didn\'t have in the morning.',
      },
      {
        type: 'A',
        text: 'A day of creative work. You made design decisions, explored ideas, and shaped how something looks and feels.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // E1 — Ownership vs execution
  // ─────────────────────────────────────────────
  {
    id: 13,
    section: 'RIASEC',
    text: 'Which role sounds most appealing to you in a team?',
    options: [
      {
        type: 'E',
        text: 'The person who owns the product outcome — decides what gets built, prioritises ruthlessly, and is accountable for whether it succeeds.',
      },
      {
        type: 'R',
        text: 'The person who executes the hardest technical parts — the one whose code makes the core of the product work.',
      },
      {
        type: 'I',
        text: 'The person who informs the decisions — brings the data, the research, and the analysis that tells the team what to build.',
      },
      {
        type: 'C',
        text: 'The person who ensures quality and reliability — the one who catches the edge cases, writes the tests, and makes sure nothing breaks.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // E2 — Impact vs craft
  // ─────────────────────────────────────────────
  {
    id: 14,
    section: 'RIASEC',
    text: 'You are evaluating two job offers. The work is similar, but:',
    options: [
      {
        type: 'E',
        text: 'Company A gives you direct ownership of a product used by 500,000 people. Your decisions ship to users weekly.',
      },
      {
        type: 'R',
        text: 'Company B gives you the hardest technical problems in the company. You\'ll work on infrastructure that serves millions of requests per second.',
      },
      {
        type: 'I',
        text: 'Company C gives you a dedicated research role. You spend 80% of your time on deep technical investigation with no delivery pressure.',
      },
      {
        type: 'A',
        text: 'Company D gives you full creative ownership of the product\'s design language and user experience.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // E3 — Risk tolerance
  // ─────────────────────────────────────────────
  {
    id: 15,
    section: 'RIASEC',
    text: 'Your friend is starting a company and wants you as co-founder. It means leaving your stable job. You:',
    options: [
      {
        type: 'E',
        text: 'Are genuinely tempted. Building something from zero with full ownership is exactly the kind of work you want to be doing.',
      },
      {
        type: 'R',
        text: 'Would consider it if the technical problem is interesting enough. You want to build something meaningful, not just something that grows fast.',
      },
      {
        type: 'C',
        text: 'Would need to see a solid plan first — market research, financial model, clear roles. You take risk seriously and want to go in with your eyes open.',
      },
      {
        type: 'S',
        text: 'Would think carefully about the team dynamic. Working closely with this person for years is as important as the idea itself.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // C1 — Process vs speed
  // ─────────────────────────────────────────────
  {
    id: 16,
    section: 'RIASEC',
    text: 'Your team has been moving fast and skipping documentation, testing, and code reviews. The product is growing but the codebase is getting messy. You feel:',
    options: [
      {
        type: 'C',
        text: 'Uncomfortable. Technical debt compounds silently and you\'ve seen what happens to teams that ignore it. You advocate for slowing down to build it right.',
      },
      {
        type: 'E',
        text: 'Fine for now. Speed matters early. You can clean up the codebase once the product has proven itself.',
      },
      {
        type: 'R',
        text: 'Mildly concerned. You prefer clean code, but you understand the tradeoffs. You\'d start adding tests quietly without making it a big debate.',
      },
      {
        type: 'I',
        text: 'Curious about the failure modes. You\'d analyse which parts of the codebase are highest risk and focus improvement efforts there.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // C2 — Precision and rigour
  // ─────────────────────────────────────────────
  {
    id: 17,
    section: 'RIASEC',
    text: 'You are reviewing a data pipeline that processes financial transactions. You find an edge case that affects 0.3% of transactions. Fixing it properly requires two days of work. You:',
    options: [
      {
        type: 'C',
        text: 'Fix it properly. Financial data must be correct. 0.3% of transactions is not a rounding error — it\'s real money and real people.',
      },
      {
        type: 'E',
        text: 'Log it, estimate the business impact, and let the team prioritise it against other work. Not everything needs to be fixed immediately.',
      },
      {
        type: 'I',
        text: 'Investigate further first. How long has this been happening? What is the actual downstream impact? You want to understand the full scope before fixing.',
      },
      {
        type: 'R',
        text: 'Write a quick patch for the symptom today and schedule the proper fix for next sprint. Partial mitigation now is better than nothing while you wait for time.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // C3 — Systems and reliability
  // ─────────────────────────────────────────────
  {
    id: 18,
    section: 'RIASEC',
    text: 'You are joining a team that has no on-call rotation, no incident runbooks, and no monitoring dashboards. The system has been stable for six months. You:',
    options: [
      {
        type: 'C',
        text: 'Immediately propose setting up proper monitoring, an on-call schedule, and incident runbooks. Six months of stability is not a reason to stay unprepared.',
      },
      {
        type: 'E',
        text: 'Focus on shipping features first. The team is moving fast and the system is stable. Adding process overhead right now would slow everyone down.',
      },
      {
        type: 'S',
        text: 'Discuss it with the team first before proposing anything. You want to understand why things are the way they are before suggesting changes.',
      },
      {
        type: 'R',
        text: 'Set up a basic monitoring dashboard for yourself. You don\'t need to formalise everything, but you want visibility into the system you\'re working on.',
      },
    ],
  },

];

// ─────────────────────────────────────────────────────────────
// SECTION 2 — DISC QUESTIONS (12 questions, 3 per type)
// Each question: 4 options, one per DISC type
// User picks the option that feels most like them
// ─────────────────────────────────────────────────────────────

export const discQuestions: DISCQuestion[] = [

  // ─────────────────────────────────────────────
  // D1 — Decision making under pressure
  // ─────────────────────────────────────────────
  {
    id: 19,
    section: 'DISC',
    text: 'Production is down. Three engineers are debating the cause. Every minute costs the company money. You:',
    options: [
      {
        type: 'D',
        text: 'Call it. "We\'re rolling back now. Debate the root cause after the service is back up." You make the call and move.',
      },
      {
        type: 'I',
        text: 'Get everyone on a call fast. More heads, faster resolution. You energise the team and coordinate the response.',
      },
      {
        type: 'S',
        text: 'Make sure the person who knows this system best is leading. You support them and make sure they have everything they need.',
      },
      {
        type: 'C',
        text: 'Trace the logs methodically. A wrong fix under pressure extends the downtime. Two minutes of careful reading saves twenty minutes of trial and error.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // D2 — Conflict and disagreement
  // ─────────────────────────────────────────────
  {
    id: 20,
    section: 'DISC',
    text: 'In an architecture meeting, a decision is made that you strongly disagree with technically. You:',
    options: [
      {
        type: 'D',
        text: 'Say so directly, explain your reasoning, and ask the team to reconsider before committing. You won\'t stay quiet on a decision you believe is wrong.',
      },
      {
        type: 'I',
        text: 'Ask questions that surface the risks you\'re worried about. You find it more effective to let the team arrive at the concern themselves.',
      },
      {
        type: 'S',
        text: 'Raise it privately with the decision-maker after the meeting. You don\'t want to derail the session or put anyone on the defensive in public.',
      },
      {
        type: 'C',
        text: 'Write a short technical comparison with evidence and send it to the group. Let the data make the argument, not your opinion.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // D3 — Pace and ambiguity
  // ─────────────────────────────────────────────
  {
    id: 21,
    section: 'DISC',
    text: 'A PM drops a vague ticket into your sprint with no spec, no mockup, and no success metric. The deadline is Friday. You:',
    options: [
      {
        type: 'D',
        text: 'Make a call. You interpret it, build a reasonable version, and ship. You\'ll define success by the before/after comparison.',
      },
      {
        type: 'I',
        text: 'Grab the PM for a quick whiteboard session. You think better collaboratively and it\'s faster than an async back-and-forth.',
      },
      {
        type: 'S',
        text: 'Write up your understanding and send it to the PM for validation before starting. You\'d rather spend 30 minutes aligning than a day building the wrong thing.',
      },
      {
        type: 'C',
        text: 'Ask the PM to provide a proper spec — what is the success metric, what are the edge cases, what does done look like? You won\'t start without clarity.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // I1 — Communication style
  // ─────────────────────────────────────────────
  {
    id: 22,
    section: 'DISC',
    text: 'You need to explain a complex technical decision to a non-technical stakeholder. You:',
    options: [
      {
        type: 'D',
        text: 'Keep it short. Business impact, one recommendation, one decision needed. You respect their time and don\'t over-explain.',
      },
      {
        type: 'I',
        text: 'Tell a story. You use an analogy that makes the concept click, then connect it back to what they care about. You want them to genuinely understand, not just nod.',
      },
      {
        type: 'S',
        text: 'Ask what their real concern is first — cost, risk, timeline — then address exactly that. You tailor the explanation to what they actually need to know.',
      },
      {
        type: 'C',
        text: 'Prepare a written summary: the problem, the options considered, the recommendation, and the reasoning. You want a clear record they can refer back to.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // I2 — Energy in collaboration
  // ─────────────────────────────────────────────
  {
    id: 23,
    section: 'DISC',
    text: 'Your team is kicking off a major new project. The first week involves a lot of meetings, brainstorming sessions, and team alignment. You feel:',
    options: [
      {
        type: 'I',
        text: 'Energised. This is when the best ideas emerge. You love the creative energy of early-stage alignment and you tend to contribute a lot in these sessions.',
      },
      {
        type: 'D',
        text: 'Impatient to start building. The alignment is necessary but you want to get to execution. You push to move from discussion to decision as fast as possible.',
      },
      {
        type: 'S',
        text: 'Focused on listening. You want to understand everyone\'s perspective and make sure quieter voices are heard before the team converges.',
      },
      {
        type: 'C',
        text: 'Taking detailed notes. You want to capture decisions, open questions, and dependencies before they get lost in the energy of the kickoff.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // I3 — Presenting work
  // ─────────────────────────────────────────────
  {
    id: 24,
    section: 'DISC',
    text: 'You have 10 minutes to present your work to a leadership team who haven\'t seen it before. You structure it as:',
    options: [
      {
        type: 'D',
        text: 'Two slides: what it does and what decision it enables. Then a live demo. You want them to see the value in three minutes.',
      },
      {
        type: 'I',
        text: 'Start with the problem story — why this mattered — then reveal the solution. You want them to feel the need before seeing the product.',
      },
      {
        type: 'S',
        text: 'Ask beforehand what they care most about seeing and tailor the demo to their specific concerns, not what you think is impressive.',
      },
      {
        type: 'C',
        text: 'Walk through each component methodically: context, approach, results, limitations, and next steps. You want them to trust the work, not just like it.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // S1 — Supporting teammates
  // ─────────────────────────────────────────────
  {
    id: 25,
    section: 'DISC',
    text: 'A teammate has been quiet in meetings for two weeks and seems disengaged. Nobody else has said anything. You:',
    options: [
      {
        type: 'S',
        text: 'Reach out privately and check in on how they\'re doing — not about work, just genuinely asking. You\'ve noticed and you care.',
      },
      {
        type: 'I',
        text: 'Invite them to grab lunch or coffee. Sometimes people just need to talk in a different context to open up.',
      },
      {
        type: 'D',
        text: 'Bring it up with your manager. If it\'s affecting the team, it\'s worth addressing directly rather than letting it linger.',
      },
      {
        type: 'C',
        text: 'Wait and observe more before doing anything. You don\'t want to make assumptions. Maybe they\'re just deep in focused work.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // S2 — Receiving critical feedback
  // ─────────────────────────────────────────────
  {
    id: 26,
    section: 'DISC',
    text: 'In your quarterly review, your manager gives you feedback you didn\'t expect and partially disagree with. Your reaction is:',
    options: [
      {
        type: 'D',
        text: 'You ask for a specific example, assess whether it\'s valid, and decide quickly whether to act on it or push back. You don\'t sit on feedback.',
      },
      {
        type: 'I',
        text: 'You listen openly and try to understand their perspective before reacting. You find that feedback often contains a truth you didn\'t see before.',
      },
      {
        type: 'S',
        text: 'You take it seriously and feel it for a while. You want to understand it fully and will reflect on it before deciding how to respond.',
      },
      {
        type: 'C',
        text: 'You go away and think carefully. You want to assess the feedback objectively — where is it valid, where is it based on incomplete information?',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // S3 — Working environment preference
  // ─────────────────────────────────────────────
  {
    id: 27,
    section: 'DISC',
    text: 'You work best in an environment that is:',
    options: [
      {
        type: 'S',
        text: 'Collaborative and stable. You have a strong team, clear roles, and consistent ways of working together.',
      },
      {
        type: 'D',
        text: 'High-autonomy and fast-moving. You own your work, make your own calls, and move quickly without a lot of check-ins.',
      },
      {
        type: 'I',
        text: 'Creative and social. Lots of discussion, whiteboarding, shared energy. You thrive when ideas are in the air.',
      },
      {
        type: 'C',
        text: 'Structured and well-documented. Clear processes, defined standards, and time to do things properly.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // C1 — Handling mistakes
  // ─────────────────────────────────────────────
  {
    id: 28,
    section: 'DISC',
    text: 'A bug you introduced last week made it to production and affected real users. Your manager finds out. You:',
    options: [
      {
        type: 'D',
        text: 'Own it immediately, fix it fast, and move on. You don\'t dwell — you take responsibility and get back to work.',
      },
      {
        type: 'I',
        text: 'Acknowledge it openly to the team. You believe transparency about mistakes is part of a healthy engineering culture.',
      },
      {
        type: 'S',
        text: 'Apologise sincerely to anyone affected and make sure you understand exactly what went wrong before you close it.',
      },
      {
        type: 'C',
        text: 'Write a thorough postmortem: what failed, why, what the impact was, and what process change will prevent it from happening again.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // C2 — Quality vs speed
  // ─────────────────────────────────────────────
  {
    id: 29,
    section: 'DISC',
    text: 'Two days before a product launch, QA finds a non-critical bug affecting 4% of users. Fixing it cleanly takes a full day. You recommend:',
    options: [
      {
        type: 'D',
        text: 'Launch as planned. Write a quick hotfix for the most visible symptom and ship the proper fix next week. 96% of users have a working product.',
      },
      {
        type: 'I',
        text: 'Put it to the team. This is a shared decision — how the team handles it matters as much as the technical call.',
      },
      {
        type: 'S',
        text: 'Ask the PM and affected users what they\'d prefer. The right answer depends on how much this bug actually matters to the people experiencing it.',
      },
      {
        type: 'C',
        text: 'Fix it properly before launch. Shipping known bugs sets a precedent. A one-day delay is far cheaper than the trust cost of a broken product.',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // C3 — Planning and structure
  // ─────────────────────────────────────────────
  {
    id: 30,
    section: 'DISC',
    text: 'You are starting a large, complex feature that will take three weeks. Your first move is:',
    options: [
      {
        type: 'C',
        text: 'Write a detailed technical spec: data model, API design, edge cases, dependencies, and a day-by-day breakdown. You want to find the hard problems on paper before you find them in code.',
      },
      {
        type: 'D',
        text: 'Start building the core immediately. You\'ll figure out the details as you go — over-planning is how features take six weeks instead of three.',
      },
      {
        type: 'I',
        text: 'Sketch the approach with a teammate first. Talking through the design out loud almost always surfaces something you wouldn\'t have caught alone.',
      },
      {
        type: 'S',
        text: 'Make sure you understand who else is depending on this feature and when. You want to coordinate with the right people before going heads-down.',
      },
    ],
  },

];

// ─────────────────────────────────────────────────────────────
// ALL QUESTIONS COMBINED (for rendering)
// ─────────────────────────────────────────────────────────────

export const allQuestions: Question[] = [
  ...riasecQuestions,
  ...discQuestions,
];

// ─────────────────────────────────────────────────────────────
// SCORING ALGORITHM
// ─────────────────────────────────────────────────────────────
//
// STEP 1 — RIASEC Score (from questions 1–18)
//
//   riasecScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
//   For each RIASEC question answered:
//     riasecScores[answer.type]++
//
//   Max possible per type = 3 (3 questions per type)
//   dominantRIASEC = type with highest score
//   Tie-break: natural RIASEC order (R > I > A > S > E > C)
//
// STEP 2 — DISC Score (from questions 19–30)
//
//   discScores = { D: 0, I: 0, S: 0, C: 0 }
//   For each DISC question answered:
//     discScores[answer.type]++
//
//   Max possible per type = 3 (3 questions per type)
//   dominantDISC = type with highest score
//   Tie-break: natural DISC order (D > I > S > C)
//
// STEP 3 — Final Career Type
//   careerType = dominantDISC + '-' + dominantRIASEC
//   e.g. "D-E", "C-I", "I-A", "S-R"
//
// ─────────────────────────────────────────────────────────────

export function calculateCareerType(answers: Record<number, string>): {
  riasecScores: Record<RIASECType, number>;
  discScores: Record<DISCType, number>;
  dominantRIASEC: RIASECType;
  dominantDISC: DISCType;
  careerType: string;
  archetype: CareerArchetype;
} {
  const riasecScores: Record<RIASECType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const discScores: Record<DISCType, number> = { D: 0, I: 0, S: 0, C: 0 };

  riasecQuestions.forEach(q => {
    const answer = answers[q.id];
    if (answer) {
      const option = q.options.find(o => o.text === answer);
      if (option) riasecScores[option.type]++;
    }
  });

  discQuestions.forEach(q => {
    const answer = answers[q.id];
    if (answer) {
      const option = q.options.find(o => o.text === answer);
      if (option) discScores[option.type]++;
    }
  });

  const riasecOrder: RIASECType[] = ['R', 'I', 'A', 'S', 'E', 'C'];
  const discOrder: DISCType[] = ['D', 'I', 'S', 'C'];

  const dominantRIASEC = riasecOrder.reduce((a, b) =>
    riasecScores[a] >= riasecScores[b] ? a : b
  );
  const dominantDISC = discOrder.reduce((a, b) =>
    discScores[a] >= discScores[b] ? a : b
  );

  const careerType = `${dominantDISC}-${dominantRIASEC}`;
  const archetype = careerArchetypes[careerType];

  return { riasecScores, discScores, dominantRIASEC, dominantDISC, careerType, archetype };
}

// ─────────────────────────────────────────────────────────────
// 24 CAREER ARCHETYPES (6 RIASEC × 4 DISC)
// ─────────────────────────────────────────────────────────────

export interface CareerArchetype {
  type: string;               // e.g. "D-R"
  name: string;               // e.g. "The Execution Engineer"
  tagline: string;            // one-line identity statement
  description: string;        // 2-3 sentence profile
  topJobs: string[];          // 4-5 job titles
  fields: string[];           // 2-3 CS career map fields
  strengths: string[];        // 3 key strengths
  workStyle: string;          // one sentence on how they work
}

export const careerArchetypes: Record<string, CareerArchetype> = {

  // ── R (Builder) × DISC ──────────────────────────────────────

  'D-R': {
    type: 'D-R',
    name: 'The Execution Engineer',
    tagline: 'I build fast, ship faster, and fix it in production.',
    description: 'You combine a builder\'s instinct with decisive, results-driven energy. You don\'t wait for perfect specifications — you start building, course-correct quickly, and get things shipped. You thrive in high-velocity environments where speed of execution is valued over process.',
    topJobs: ['Backend Engineer', 'Full-Stack Developer', 'Startup Engineer', 'Platform Engineer', 'DevOps Engineer'],
    fields: ['Software Engineering', 'Cloud Engineering', 'DevOps'],
    strengths: ['Shipping fast under pressure', 'Making calls without full information', 'Unblocking teams'],
    workStyle: 'Autonomous, fast-moving, outcome-focused. You push scope, not people.',
  },

  'I-R': {
    type: 'I-R',
    name: 'The Startup Engineer',
    tagline: 'I build things people love, with people I love working with.',
    description: 'You are a builder who thrives in collaborative, energetic environments. You write code, ship features, and bring people along with your enthusiasm. You do your best work in teams where ideas flow freely and everyone is excited about what they\'re building.',
    topJobs: ['Full-Stack Developer', 'Mobile Developer', 'Frontend Engineer', 'Developer Advocate', 'Founding Engineer'],
    fields: ['Software Engineering', 'Mobile Development'],
    strengths: ['Building and communicating simultaneously', 'Energising teams around technical work', 'Rapid prototyping'],
    workStyle: 'Collaborative and creative. You build best when the team is excited.',
  },

  'S-R': {
    type: 'S-R',
    name: 'The Reliable Engineer',
    tagline: 'I build things properly and make sure everyone can depend on them.',
    description: 'You are a steady, dependable builder who takes pride in work done right. You prefer to understand a system fully before making changes, and you naturally support teammates around you. Teams rely on you not just for your technical output but for your consistency and care.',
    topJobs: ['Senior Backend Engineer', 'Software Engineer', 'API Developer', 'Platform Engineer', 'Mobile Developer'],
    fields: ['Software Engineering', 'Cloud Engineering'],
    strengths: ['Consistent, high-quality delivery', 'Deep system understanding', 'Mentoring junior engineers'],
    workStyle: 'Steady and thorough. You are the engineer teams build around.',
  },

  'C-R': {
    type: 'C-R',
    name: 'The Systems Engineer',
    tagline: 'I build systems that never break, because I thought of everything.',
    description: 'You combine a builder\'s instinct with a deep need for correctness and rigour. You write tests, document your work, and think about edge cases before they become incidents. You are the engineer who prevents problems that other engineers don\'t even know could happen.',
    topJobs: ['DevOps Engineer', 'Site Reliability Engineer', 'Platform Engineer', 'Infrastructure Engineer', 'Cloud Engineer'],
    fields: ['DevOps', 'Cloud Engineering', 'Software Engineering'],
    strengths: ['Building for reliability and scale', 'Anticipating failure modes', 'Infrastructure as code'],
    workStyle: 'Methodical and precise. You build once and build it right.',
  },

  // ── I (Analyst) × DISC ──────────────────────────────────────

  'D-I': {
    type: 'D-I',
    name: 'The Data Lead',
    tagline: 'I find the insight and make the call.',
    description: 'You combine analytical depth with decisive, results-driven leadership. You don\'t just surface insights — you act on them. You move quickly from analysis to recommendation to decision, and you are comfortable owning the outcomes of data-driven choices.',
    topJobs: ['Senior Data Scientist', 'Analytics Lead', 'Head of Data', 'Machine Learning Lead', 'Data Engineering Manager'],
    fields: ['Data Science', 'AI / Machine Learning'],
    strengths: ['Moving from analysis to action fast', 'Owning data-driven decisions', 'Leading data teams'],
    workStyle: 'Direct and output-focused. You use data to move, not just to understand.',
  },

  'I-I': {
    type: 'I-I',
    name: 'The Research Communicator',
    tagline: 'I understand hard things and explain them to everyone.',
    description: 'You love going deep on technical problems but you have an unusual gift — you can bring others along on the journey. You explain complex concepts in ways that click, write documentation people actually read, and bridge the gap between research and the rest of the team.',
    topJobs: ['ML Engineer', 'Developer Relations Engineer', 'Technical Educator', 'AI Research Engineer', 'Data Scientist'],
    fields: ['AI / Machine Learning', 'Data Science'],
    strengths: ['Deep research and clear communication', 'Making complex ideas accessible', 'Building technical communities'],
    workStyle: 'Curious and social. You learn out loud and bring people with you.',
  },

  'S-I': {
    type: 'S-I',
    name: 'The Research Analyst',
    tagline: 'I go deep, stay careful, and make sure the answer is right.',
    description: 'You are a patient, thorough analyst who takes time to understand problems fully before drawing conclusions. You care about getting it right more than getting it fast, and you are the person a team trusts when the stakes are high and the data is complex.',
    topJobs: ['Data Analyst', 'Business Intelligence Analyst', 'Research Analyst', 'Quantitative Analyst', 'Data Scientist'],
    fields: ['Data Science', 'Business Analysis'],
    strengths: ['Thorough, reliable analysis', 'Earning trust with careful work', 'Explaining findings to stakeholders'],
    workStyle: 'Patient and methodical. You take the time to be right.',
  },

  'C-I': {
    type: 'C-I',
    name: 'The ML Engineer',
    tagline: 'I build models that are correct, tested, and production-ready.',
    description: 'You combine analytical rigour with engineering precision. You care about model correctness, reproducibility, and production reliability as much as accuracy. You are the person who builds ML systems that actually work in the real world, not just in notebooks.',
    topJobs: ['ML Engineer', 'MLOps Engineer', 'Research Engineer', 'Data Engineer', 'AI Infrastructure Engineer'],
    fields: ['AI / Machine Learning', 'Data Science', 'DevOps'],
    strengths: ['Rigorous model development', 'ML systems design', 'Production reliability for AI'],
    workStyle: 'Precise and systematic. You don\'t ship until it\'s right.',
  },

  // ── A (Designer) × DISC ─────────────────────────────────────

  'D-A': {
    type: 'D-A',
    name: 'The Creative Director',
    tagline: 'I have a vision for how this should feel, and I make it happen.',
    description: 'You combine strong creative instincts with decisive, opinionated leadership. You know what good looks like, you move fast on design decisions, and you raise the quality of everything you touch. You are the person teams turn to when they need to know if something is good enough.',
    topJobs: ['Product Designer', 'Design Lead', 'Creative Technologist', 'Frontend Engineering Lead', 'Head of Design'],
    fields: ['UI/UX Design', 'Software Engineering'],
    strengths: ['Strong design vision and taste', 'Moving fast on creative decisions', 'Raising the quality bar'],
    workStyle: 'Opinionated and fast. You know what you want and you go get it.',
  },

  'I-A': {
    type: 'I-A',
    name: 'The Product Designer',
    tagline: 'I design experiences people love and tell stories about.',
    description: 'You are a designer who thrives on collaboration, creativity, and communicating your vision. You bring energy to design reviews, sketch ideas prolifically, and get excited about sharing work early. You do your best work when the team is engaged in the design process alongside you.',
    topJobs: ['Product Designer', 'UX Designer', 'UI Engineer', 'Design System Engineer', 'Frontend Developer'],
    fields: ['UI/UX Design'],
    strengths: ['Visual design and interaction', 'Communicating design intent', 'Collaborative design process'],
    workStyle: 'Social and creative. You design with others, not for them.',
  },

  'S-A': {
    type: 'S-A',
    name: 'The UX Researcher',
    tagline: 'I design from the human side of the problem.',
    description: 'You are a designer driven by empathy and deep understanding of the people who use what you build. You listen before you sketch, test before you ship, and advocate for users in every product discussion. You create experiences that feel human because they were built from human insight.',
    topJobs: ['UX Researcher', 'UX Designer', 'Product Designer', 'Accessibility Engineer', 'Customer Experience Designer'],
    fields: ['UI/UX Design', 'Business Analysis'],
    strengths: ['User research and empathy', 'Translating insight into design', 'Advocating for the user'],
    workStyle: 'Empathetic and deliberate. You understand before you design.',
  },

  'C-A': {
    type: 'C-A',
    name: 'The Technical Writer',
    tagline: 'I make complex systems understandable to everyone who needs to use them.',
    description: 'You sit at the intersection of design, engineering, and communication. You care deeply about clarity, consistency, and correctness in everything you produce. You create documentation, design systems, and developer experiences that are so well-crafted people actually enjoy using them.',
    topJobs: ['Technical Writer', 'Developer Experience Engineer', 'Design Systems Engineer', 'API Documentation Lead', 'Frontend Engineer'],
    fields: ['Technical Writing', 'Software Engineering', 'UI/UX Design'],
    strengths: ['Clarity and precision in communication', 'Design systems thinking', 'Documentation that people read'],
    workStyle: 'Thorough and craft-focused. You care about every detail of the experience.',
  },

  // ── S (Collaborator) × DISC ─────────────────────────────────

  'D-S': {
    type: 'D-S',
    name: 'The Engineering Manager',
    tagline: 'I build teams that build great things.',
    description: 'You combine people-first instincts with decisive, results-focused leadership. You care about your team\'s growth and wellbeing, but you also drive performance, make hard calls, and hold the team accountable. You are the manager engineers want and companies need.',
    topJobs: ['Engineering Manager', 'Tech Lead', 'Director of Engineering', 'VP of Engineering', 'CTO (startup)'],
    fields: ['Software Engineering', 'Product Management'],
    strengths: ['Team leadership and accountability', 'Balancing people and performance', 'Building engineering culture'],
    workStyle: 'Direct and people-focused. You lead from the front with empathy.',
  },

  'I-S': {
    type: 'I-S',
    name: 'The Developer Advocate',
    tagline: 'I connect engineers to ideas, tools, and each other.',
    description: 'You love people, love technology, and love connecting the two. You teach, speak, write, and inspire. You are the person who makes a room of engineers excited about a new tool, and who comes back from a conference with three new ideas and five new contacts.',
    topJobs: ['Developer Advocate', 'Developer Relations Engineer', 'Technical Educator', 'Community Engineer', 'Solutions Engineer'],
    fields: ['Software Engineering', 'Technical Writing'],
    strengths: ['Community building and education', 'Technical communication', 'Energising developer ecosystems'],
    workStyle: 'Energetic and human. You bring people into the room, not just the room to people.',
  },

  'S-S': {
    type: 'S-S',
    name: 'The Engineering Coach',
    tagline: 'I grow people and the team grows the product.',
    description: 'You are the steady, trusted presence that every engineering team needs. You mentor, listen, unblock, and support. You are less interested in your own output than in the collective output of the people around you. Teams that have you in them perform better and feel better.',
    topJobs: ['Staff Engineer', 'Engineering Coach', 'Senior Engineer (People Track)', 'Technical Program Manager', 'Scrum Master'],
    fields: ['Software Engineering'],
    strengths: ['Mentoring and people development', 'Building psychological safety', 'Long-term team health'],
    workStyle: 'Patient and giving. You invest in people as the highest-leverage activity.',
  },

  'C-S': {
    type: 'C-S',
    name: 'The Delivery Lead',
    tagline: 'I make sure the team ships what it promises, on time, every time.',
    description: 'You combine a deep care for people with a rigorous, process-driven approach to delivery. You document, plan, track, and coordinate with precision, while making sure the team feels supported and informed throughout. You are the person who transforms chaotic teams into reliable ones.',
    topJobs: ['Technical Program Manager', 'Scrum Master', 'Engineering Program Manager', 'Delivery Manager', 'Project Lead'],
    fields: ['Software Engineering', 'Business Analysis'],
    strengths: ['Process design and delivery rigour', 'Keeping teams aligned and informed', 'Risk management'],
    workStyle: 'Structured and caring. You build the systems that let people do their best work.',
  },

  // ── E (Driver) × DISC ───────────────────────────────────────

  'D-E': {
    type: 'D-E',
    name: 'The Product Lead',
    tagline: 'I own the outcome. Everything else is a detail.',
    description: 'You are a product-obsessed, outcome-driven operator who combines sharp business instincts with the decisiveness to act on them. You define what gets built, why it matters, and when it ships. You are most alive when you have ownership, a deadline, and something real at stake.',
    topJobs: ['Product Manager', 'Technical Product Manager', 'Head of Product', 'Startup CTO', 'Founding Engineer'],
    fields: ['Product Management', 'Software Engineering'],
    strengths: ['Product vision and prioritisation', 'Owning outcomes end to end', 'Moving fast with conviction'],
    workStyle: 'Driven and decisive. You own what you ship.',
  },

  'I-E': {
    type: 'I-E',
    name: 'The Growth Engineer',
    tagline: 'I make products grow by understanding people and building for them.',
    description: 'You combine product instincts with engineering skills and a social, experimental mindset. You run experiments, analyse funnels, build growth loops, and get excited when a metric moves. You thrive at the intersection of engineering, product, and data.',
    topJobs: ['Growth Engineer', 'Product Engineer', 'Full-Stack Product Developer', 'Marketing Engineer', 'Conversion Optimisation Engineer'],
    fields: ['Software Engineering', 'Data Science', 'Product Management'],
    strengths: ['Experimentation and rapid iteration', 'User acquisition and retention thinking', 'Building and analysing simultaneously'],
    workStyle: 'Experimental and social. You learn by shipping and measuring.',
  },

  'S-E': {
    type: 'S-E',
    name: 'The Product Owner',
    tagline: 'I build what users actually need, not what looks good on a roadmap.',
    description: 'You are a product person who leads with empathy. You talk to users, listen to engineers, and advocate for real human needs over abstract metrics. You are the product manager engineers trust and users love, because you actually care about the people on both sides.',
    topJobs: ['Product Manager', 'Product Owner', 'Customer Success Engineer', 'Technical Account Manager', 'Solutions Manager'],
    fields: ['Product Management', 'Business Analysis'],
    strengths: ['User empathy and advocacy', 'Building trust across teams', 'Translating needs into product'],
    workStyle: 'Human-centred and collaborative. You build for people, with people.',
  },

  'C-E': {
    type: 'C-E',
    name: 'The Operator',
    tagline: 'I make things run — on time, on spec, and without surprises.',
    description: 'You bring rigour and precision to product and operations work. You are the person who builds the processes, tracks the metrics, and makes sure the machine runs smoothly. You combine a driver\'s focus on outcomes with a conscientious need to do things properly.',
    topJobs: ['Technical Operations Manager', 'Platform Reliability Manager', 'Engineering Operations Lead', 'DevOps Lead', 'Release Manager'],
    fields: ['DevOps', 'Business Analysis', 'Cloud Engineering'],
    strengths: ['Process design and operational rigour', 'Metrics-driven decision making', 'Reliable delivery at scale'],
    workStyle: 'Structured and outcome-focused. You build systems that run themselves.',
  },

  // ── C (Operator) × DISC ─────────────────────────────────────

  'D-C': {
    type: 'D-C',
    name: 'The Platform Architect',
    tagline: 'I design the systems that everything else runs on.',
    description: 'You combine deep systems thinking with the decisiveness to make hard architectural calls and own them. You design platforms, set technical direction, and make choices that other engineers will live with for years. You are fast, opinionated, and almost always right.',
    topJobs: ['Principal Engineer', 'Platform Architect', 'Solutions Architect', 'CTO', 'Distinguished Engineer'],
    fields: ['Cloud Engineering', 'Software Engineering', 'DevOps'],
    strengths: ['Architectural vision and decisiveness', 'Setting technical direction', 'System design at scale'],
    workStyle: 'Opinionated and strategic. You design the foundation others build on.',
  },

  'I-C': {
    type: 'I-C',
    name: 'The Tech Consultant',
    tagline: 'I understand your system better than you do, and I know how to fix it.',
    description: 'You combine technical depth with the social intelligence to understand what a client or stakeholder actually needs. You are curious about systems, precise in your analysis, and energised by explaining what you find. You are the person who walks into a complex situation and brings clarity.',
    topJobs: ['Solutions Architect', 'Technical Consultant', 'Pre-Sales Engineer', 'Cloud Consultant', 'Systems Analyst'],
    fields: ['Business Analysis', 'Cloud Engineering', 'Software Engineering'],
    strengths: ['Technical depth across multiple domains', 'Translating complexity into clarity', 'Client-facing communication'],
    workStyle: 'Curious and communicative. You understand systems and explain them.',
  },

  'S-C': {
    type: 'S-C',
    name: 'The BI Analyst',
    tagline: 'I turn data into decisions that the whole team can trust.',
    description: 'You are a careful, people-oriented analyst who builds trust through rigorous work and clear communication. You make sure the data is right before saying anything, and when you do say something, people listen. You are the analyst teams rely on when the stakes are high.',
    topJobs: ['Business Intelligence Analyst', 'Data Analyst', 'Reporting Engineer', 'Analytics Engineer', 'Operations Analyst'],
    fields: ['Data Science', 'Business Analysis'],
    strengths: ['Rigorous, trustworthy analysis', 'Data storytelling for non-technical audiences', 'Stakeholder communication'],
    workStyle: 'Careful and collaborative. You earn trust through accuracy.',
  },

  'C-C': {
    type: 'C-C',
    name: 'The Security Engineer',
    tagline: 'I find every way the system can break before someone else does.',
    description: 'You are meticulous, precise, and deeply analytical — with a particular satisfaction in finding things that shouldn\'t exist. You think like an attacker to protect like a defender. You are the person who reads the fine print, tests the edge cases, and flags the risk nobody else noticed.',
    topJobs: ['Cybersecurity Engineer', 'Penetration Tester', 'Security Analyst', 'Compliance Engineer', 'Cryptography Engineer'],
    fields: ['Cybersecurity'],
    strengths: ['Adversarial thinking and threat modelling', 'Rigorous security testing', 'Detail-oriented risk assessment'],
    workStyle: 'Methodical and paranoid (in a good way). You find what others miss.',
  },

};

// ─────────────────────────────────────────────────────────────
// RIASEC TYPE DESCRIPTIONS (for results breakdown display)
// ─────────────────────────────────────────────────────────────

export const riasecDescriptions: Record<RIASECType, { name: string; summary: string }> = {
  R: {
    name: 'Builder',
    summary: 'You are energised by making things. Code, systems, tools, infrastructure — you find deep satisfaction in building something that works.',
  },
  I: {
    name: 'Analyst',
    summary: 'You are energised by understanding things. Research, data, investigation — you want to know why, not just how.',
  },
  A: {
    name: 'Designer',
    summary: 'You are energised by shaping things. Interfaces, experiences, ideas — you care about how things feel, not just how they function.',
  },
  S: {
    name: 'Collaborator',
    summary: 'You are energised by people. Mentoring, aligning, communicating — you do your best work when you\'re making others around you more effective.',
  },
  E: {
    name: 'Driver',
    summary: 'You are energised by impact. Shipping products, owning outcomes, moving fast — you care about whether it matters, not just whether it works.',
  },
  C: {
    name: 'Operator',
    summary: 'You are energised by correctness. Reliability, process, rigour — you find satisfaction in systems that run exactly as intended.',
  },
};

// ─────────────────────────────────────────────────────────────
// DISC TYPE DESCRIPTIONS (for results breakdown display)
// ─────────────────────────────────────────────────────────────

export const discDescriptions: Record<DISCType, { name: string; summary: string }> = {
  D: {
    name: 'Dominant',
    summary: 'You are direct, decisive, and results-driven. You make calls quickly, move fast, and take ownership of outcomes. You lead from the front.',
  },
  I: {
    name: 'Influential',
    summary: 'You are enthusiastic, social, and persuasive. You bring energy to teams, communicate ideas compellingly, and do your best work with people around you.',
  },
  S: {
    name: 'Steady',
    summary: 'You are patient, reliable, and team-oriented. You listen before acting, care about the people around you, and build trust through consistency.',
  },
  C: {
    name: 'Conscientious',
    summary: 'You are precise, analytical, and process-driven. You think before acting, value correctness over speed, and take pride in work done thoroughly.',
  },
};

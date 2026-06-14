import { careerFields, positionsByField } from "./careerTaxonomy";

export interface JobScenarioStep {
  task: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface JobScenario {
  title: string;
  context: string;
  challenge: string;
  steps: JobScenarioStep[];
  impact: string;
}

export function getJobScenario(jobTitle: string, fieldId?: string): JobScenario {
  // 1. Locate the field and position to extract keywords
  let matchedFieldId = fieldId;
  let keywords: string[] = [];

  if (!matchedFieldId) {
    for (const [fid, positions] of Object.entries(positionsByField)) {
      const pos = positions.find((p) => p.title.toLowerCase() === jobTitle.toLowerCase());
      if (pos) {
        matchedFieldId = fid;
        keywords = pos.keywords;
        break;
      }
    }
  } else {
    const pos = (positionsByField[matchedFieldId] || []).find(
      (p) => p.title.toLowerCase() === jobTitle.toLowerCase()
    );
    if (pos) {
      keywords = pos.keywords;
    }
  }

  const fieldObj = careerFields.find((f) => f.id === matchedFieldId);
  const cluster = fieldObj?.cluster || "engineering";
  const techStack = keywords.slice(0, 4).map(k => k.toUpperCase()).join(", ") || "standard industry tools";

  // 2. Generate customized cluster-specific scenarios
  switch (cluster) {
    case "design":
      return {
        title: `E-Commerce Checkout Optimization`,
        context: `The year is 2026. You are a ${jobTitle} at a high-growth consumer SaaS brand. The product team has flagged a high drop-off rate (64%) at the final payment step in the mobile app.`,
        challenge: `Users are abandoning their shopping carts due to layout confusion and form friction. You must redesign the flow to optimize cognitive load and user confidence.`,
        steps: [
          {
            task: "Analyze user session logs and customer complaints to find the friction point.",
            question: "What is the primary cause of user drop-offs in a complex 5-step form checkout layout?",
            options: [
              "A. The form requires too many inputs on a single page without progressive disclosure.",
              "B. The checkout button does not flash in neon colors.",
              "C. The application lacks user profile avatars on the payment page."
            ],
            correctIndex: 0,
            explanation: "Progressive disclosure breaks long, intimidating forms into step-by-step chunks, preventing cognitive overload and boosting completion rates."
          },
          {
            task: "Build interactive prototypes in Figma using the company's design tokens.",
            question: "How should you design call-to-action (CTA) buttons to ensure a clear visual hierarchy?",
            options: [
              "A. Make all buttons gray to keep the layout neutral.",
              "B. Place the CTA inside a hover-only tooltip to save screen space.",
              "C. Apply high-contrast brand colors, generous touch targets, and clear labels to the primary CTA."
            ],
            correctIndex: 2,
            explanation: "A prominent, high-contrast primary CTA guides users' eyes and actions, clarifying the path to completion."
          },
          {
            task: "Conduct usability testing on the redesigned flow.",
            question: "Which metric is the most appropriate KPI to evaluate if your design solved the checkout drop-off?",
            options: [
              "A. Daily active users (DAU).",
              "B. Conversion rate and time-to-complete checkout.",
              "C. Server response time (TTFB)."
            ],
            correctIndex: 1,
            explanation: "Conversion rate directly tracks successful purchases, and time-to-complete measures the reduction of form friction."
          }
        ],
        impact: `Your new onboarding experience reduces checkout time by 35% and increases conversions by 18.2%! The executive team is thrilled.`
      };

    case "data":
      return {
        title: `Real-Time Recommendation Service`,
        context: `You are working as a ${jobTitle} for a popular streaming platform. Business stakeholders want to launch a personalized 'Recommended For You' feed to boost engagement.`,
        challenge: `The current SQL query to recommend content takes 1.2 seconds to run, which slows down the homepage. You need to design an optimized model or pipeline to compute recommendations in under 50ms.`,
        steps: [
          {
            task: "Clean and filter streaming logs and user clicks using ${techStack}.",
            question: "What step is critical during data preprocessing to prevent skewed recommendation results?",
            options: [
              "A. Arbitrarily duplicating data points to make the dataset larger.",
              "B. Handling null values, filtering out bot clicks, and normalizing interaction counts.",
              "C. Discarding all user profiles with over 10 hours of active streaming time."
            ],
            correctIndex: 1,
            explanation: "Filtering out automated bots and normalizing user activities prevents outliers from corrupting recommendation vectors."
          },
          {
            task: "Select the optimal architectural pattern for serving recommendations.",
            question: "How can you serve personalized recommendations in under 50ms during peak traffic?",
            options: [
              "A. Precompute recommendation vectors offline in a cache (like Redis) or serve via optimized vector database endpoints.",
              "B. Run a full database scan for all users synchronously inside the API route on every single request.",
              "C. Ask the client browser to train a neural network locally in Javascript."
            ],
            correctIndex: 0,
            explanation: "Caching precomputed values or querying low-latency index tables avoids expensive real-time calculations on the primary relational database."
          },
          {
            task: "Validate recommendation accuracy before shipping to production.",
            question: "Which evaluation metric is the industry standard for measuring ranking relevance?",
            options: [
              "A. Mean Average Precision (MAP) or Normalized Discounted Cumulative Gain (NDCG).",
              "B. Accuracy percentage on random string lookups.",
              "C. CPU utilization on the local developer laptop."
            ],
            correctIndex: 0,
            explanation: "MAP and NDCG are specifically designed to measure ranking quality, ensuring that the most relevant items appear at the top of the feed."
          }
        ],
        impact: `Latency drops to 15ms, and recommendation click-through rates increase by 22.4%! User average daily session length increases by 12 minutes.`
      };

    case "infrastructure":
      return {
        title: `Viral Scalability Incident`,
        context: `As a ${jobTitle}, you manage infrastructure for a rapidly growing SaaS. A celebrity tweets about the platform, sending a tidal wave of 200,000 concurrent visitors to your app.`,
        challenge: `The service is throwing '502 Bad Gateway' errors as CPU resources hit 100%. You must scale server resources, manage connection pools, and establish observability.`,
        steps: [
          {
            task: "Configure automated scaling to absorb the incoming traffic spike.",
            question: "What is the best way to scale application servers dynamically during traffic bursts?",
            options: [
              "A. Manually spin up cloud instances in the control panel as servers go down.",
              "B. Set up auto-scaling groups behind a Load Balancer, configured to launch new nodes when CPU exceeds 75%.",
              "C. Drop incoming HTTP requests randomly to save memory."
            ],
            correctIndex: 1,
            explanation: "Auto-scaling groups dynamically increase instances when metrics breach thresholds, and load balancers distribute connections evenly."
          },
          {
            task: "Mitigate database bottlenecking due to the scaled app instances.",
            question: "How do you prevent the database from exhausting its connection limit when application instances double?",
            options: [
              "A. Implement connection pooling (like PgBouncer) and add a caching layer (like Redis) for read-heavy queries.",
              "B. Shut down the database every 10 minutes to clear old active connections.",
              "C. Tell developers not to write any SQL queries for 24 hours."
            ],
            correctIndex: 0,
            explanation: "Connection pools multiplex connections to keep database handles low, and caching offsets database hits for static or frequent queries."
          },
          {
            task: "Verify system health and set up alerts for the team.",
            question: "Which set of metrics represents the standard 'Four Golden Signals' of site reliability?",
            options: [
              "A. CPU brand, disk speed, screen resolution, and monitor brightness.",
              "B. Commit counts, code coverage, pull request size, and build duration.",
              "C. Latency, Traffic volume, Error rates, and system Saturation."
            ],
            correctIndex: 2,
            explanation: "Latency, Traffic, Errors, and Saturation are the four golden signals that capture operational health and identify service degradation."
          }
        ],
        impact: `You restore 100% uptime, secure system health, and save the company RM 50,000 in SLA penalties. Auto-scaling handles the spike flawlessly.`
      };

    case "security":
      return {
        title: `Securing a Vulnerable Auth API`,
        context: `You are a ${jobTitle} at a fintech group. During a routine audit, an automated security scanner flags a critical security vulnerability in the transaction authentication endpoint.`,
        challenge: `The endpoint is susceptible to input injection attacks, risking account takeovers. You must identify the exploit vector, patch it, and strengthen API credentials storage.`,
        steps: [
          {
            task: "Identify the critical vulnerability type present in the endpoint query.",
            question: "What vulnerability occurs when user input is concatenated directly into database search queries?",
            options: [
              "A. SQL Injection (SQLi).",
              "B. Cross-Site Scripting (XSS).",
              "C. Distributed Denial of Service (DDoS)."
            ],
            correctIndex: 0,
            explanation: "Concatenating strings directly allows attackers to append database commands. Using parameterized queries ensures input is treated strictly as data, not code."
          },
          {
            task: "Securely hash credentials before saving them to the persistent storage layer.",
            question: "Which cryptographic hashing scheme is secure for storing database passwords?",
            options: [
              "A. MD5 or SHA1.",
              "B. Base64 encoding.",
              "C. bcrypt, Argon2, or PBKDF2 with unique salts."
            ],
            correctIndex: 2,
            explanation: "bcrypt and Argon2 are computationally slow, preventing brute-force attacks. Unique salts prevent lookup dictionary (rainbow table) exploits."
          },
          {
            task: "Deploy defensive security headers and filters at the network gate.",
            question: "Which tool inspects incoming HTTP traffic to block SQL injection and cross-site scripting at the edge?",
            options: [
              "A. A Web Application Firewall (WAF).",
              "B. An SSL/TLS handshake certificate.",
              "C. An antivirus scanner on the local developer's hard drive."
            ],
            correctIndex: 0,
            explanation: "WAFs inspect incoming request payloads against signature libraries (like OWASP Top 10) to block malicious injection attempts before they reach the backend."
          }
        ],
        impact: `You patch the exploit vector, secure the database, and verify the patch passes auditing. The system passes its SOC2 compliance test!`
      };

    case "emerging":
      return {
        title: `Low-Resource Sensor Optimization`,
        context: `You are a ${jobTitle} working on an embedded firmware module. The hardware is experiencing high data packet loss (22%) and runtime crashes during stress tests.`,
        challenge: `You must choose an efficient lightweight protocol, debug memory allocation issues, and optimize high-frequency sensor readings using ${techStack}.`,
        steps: [
          {
            task: "Choose a lightweight protocol for sending telemetry data over unstable cellular networks.",
            question: "Which messaging protocol is optimized for high latency, low-bandwidth, and constrained hardware?",
            options: [
              "A. SOAP over HTTP/1.1.",
              "B. MQTT (Message Queuing Telemetry Transport).",
              "C. XML-RPC Web Services."
            ],
            correctIndex: 1,
            explanation: "MQTT has a minimal 2-byte header overhead and uses a publish-subscribe model, making it ideal for low-power IoT networks."
          },
          {
            task: "Investigate and resolve a memory leak causing progressive hardware restarts.",
            question: "What is the primary cause of system crashes due to memory exhaustion in low-level languages (like C/C++ or Rust)?",
            options: [
              "A. Allocating memory on the heap (e.g. malloc) without freeing it.",
              "B. Writing too many comments in the header files.",
              "C. Running too many compiler warnings during compilation."
            ],
            correctIndex: 0,
            explanation: "Failing to deallocate heap memory causes memory exhaustion, which eventually leads to runtime failures on resource-constrained embedded systems."
          },
          {
            task: "Optimize high-frequency sensor readings from the hardware bus (SPI/I2C).",
            question: "How do you read high-frequency sensor feeds without blocking the main operational CPU event loops?",
            options: [
              "A. Wait in a busy-loop inside the main loop until the sensor is ready.",
              "B. Store all sensor values in an array and write them to disk once a day.",
              "C. Use hardware Interrupts and Direct Memory Access (DMA) to process readings asynchronously."
            ],
            correctIndex: 2,
            explanation: "Interrupts and DMA let the hardware handle data transit, freeing the CPU to execute core application tasks without blocking on slow I/O."
          }
        ],
        impact: `Packet loss is reduced to 0.4%, CPU usage drops by 45%, and the device operates smoothly under stress for 7 consecutive days!`
      };

    case "product":
      return {
        title: `Enterprise Cloud Advisory`,
        context: `As a ${jobTitle}, you are supporting a major banking client. They are migrating their core transaction ledger from a legacy mainframe to a modern cloud setup.`,
        challenge: `The client's technical leads are resistant and confused, posing a threat to the migration timeline. You must clarify the architecture and create integration strategies.`,
        steps: [
          {
            task: "Resolve developer onboarding hurdles and client documentation confusion.",
            question: "What developer asset is most effective in accelerating adoption of a complex new REST API?",
            options: [
              "A. A zip file of raw database schema export scripts.",
              "B. A clear Quick-Start Guide, interactive SDK samples, and auto-generated API references (Swagger/OpenAPI).",
              "C. Sending them links to community chat forums."
            ],
            correctIndex: 1,
            explanation: "Quick-start guides and interactive playgrounds give developers immediate feedback, drastically lowering onboarding friction."
          },
          {
            task: "Address ledger formatting differences between legacy mainframe schemas and cloud APIs.",
            question: "Which software design pattern is ideal for allowing two incompatible data interfaces to interact?",
            options: [
              "A. The Adapter (or Wrapper) pattern.",
              "B. The Singleton pattern.",
              "C. The Observer pattern."
            ],
            correctIndex: 0,
            explanation: "An Adapter layer translates data models between incompatible formats, allowing legacy and cloud systems to connect seamlessly."
          },
          {
            task: "Verify that the client team has successfully adopted the new platform.",
            question: "What is the primary indicator of a successful technology consulting engagement?",
            options: [
              "A. Delivering a report that is over 200 pages long.",
              "B. The client's developer team operating independently, with migration milestones completed on time.",
              "C. Getting the client's executive sponsor to follow you on LinkedIn."
            ],
            correctIndex: 1,
            explanation: "Ensuring client autonomy and successfully launching the production system are the ultimate KPIs of technical advisory."
          }
        ],
        impact: `The bank completes its migration 3 weeks ahead of schedule. Transaction throughput increases by 150%, and client trust is solid!`
      };

    case "science":
      return {
        title: `Algorithmic Optimization for Graph Search`,
        context: `You are a ${jobTitle} at a robotics research facility. The navigation subsystem needs to calculate paths through grid maps that have millions of cells.`,
        challenge: `The current pathfinder runs at $O(N^2)$ quadratic complexity, causing the robot to freeze for 4 seconds before moving. You must design a linearithmic algorithm.`,
        steps: [
          {
            task: "Evaluate pathfinding time complexity to ensure scalability.",
            question: "Which Big-O runtime notation is the most scalable for search algorithms processing millions of nodes?",
            options: [
              "A. O(2^N) - Exponential time.",
              "B. O(N log N) - Linearithmic time.",
              "C. O(N^2) - Quadratic time."
            ],
            correctIndex: 1,
            explanation: "Linearithmic complexity ($O(N \log N)$) grows almost linearly, ensuring fast computation times even for large-scale grid matrices."
          },
          {
            task: "Select the data structure to optimize neighbor node lookups.",
            question: "Which data structure provides an average constant-time $O(1)$ search and insert complexity?",
            options: [
              "A. A Hash Map (or Hash Set).",
              "B. A sorted Doubly Linked List.",
              "C. A Binary Search Tree."
            ],
            correctIndex: 0,
            explanation: "Hash maps resolve keys using hashing algorithms to point directly to memory buckets, offering constant-time access on average."
          },
          {
            task: "Publish the algorithm findings for review and reproducibility.",
            question: "What is essential to include in a computer science research paper to ensure peers can reproduce your results?",
            options: [
              "A. A repository link to the clean source code, the exact dataset inputs, and execution parameters.",
              "B. Photographs of the lab equipment.",
              "C. A list of all meetings held during the project."
            ],
            correctIndex: 0,
            explanation: "Providing source code, detailed parameters, and input datasets allows other researchers to verify, replicate, and build upon your findings."
          }
        ],
        impact: `Your pathfinding algorithm runs in 8 milliseconds, and your research paper is accepted at a prestigious AI conference!`
      };

    default: // engineering
      return {
        title: `Real-Time Collaboration Sync`,
        context: `You are a ${jobTitle} working on a collaborative design workspace. Users are complaining that when two people edit the same canvas concurrently, changes are lost or overwritten.`,
        challenge: `Synchronizing state across multiple users concurrently in real-time is creating major server load and race conditions. You must implement robust syncing using ${techStack}.`,
        steps: [
          {
            task: "Profile client render cycles to eliminate layout rendering lag during updates.",
            question: "What is the primary cause of slow rendering in Web pages handling high-frequency state updates?",
            options: [
              "A. Using too many custom fonts.",
              "B. Excessive layout reflows (layout thrashing) and unmemoized component re-renders.",
              "C. Loading images with modern webp formats."
            ],
            correctIndex: 1,
            explanation: "Repeated DOM queries and unoptimized component trees force the browser to recalculate layouts, creating rendering lag."
          },
          {
            task: "Select a web communication channel to sync changes with sub-50ms latency.",
            question: "Which technology is best suited for bi-directional, persistent real-time communication?",
            options: [
              "A. WebSockets.",
              "B. HTTP GET polling in an interval loop.",
              "C. REST API requests triggered manually by the user."
            ],
            correctIndex: 0,
            explanation: "WebSockets establish a persistent TCP link, allowing low-overhead, bi-directional message dispatch with sub-50ms latency."
          },
          {
            task: "Resolve data conflicts from concurrent users without a central server lock.",
            question: "Which algorithmic concept allows conflict-free, distributed state synchronization in collaborative text and canvas editors?",
            options: [
              "A. Overwriting the server database with the latest client save every time.",
              "B. Locking the document so only one person can type per day.",
              "C. Conflict-free Replicated Data Types (CRDTs) or Operational Transformation (OT)."
            ],
            correctIndex: 2,
            explanation: "CRDTs and OT mathematically resolve concurrent edits automatically without requiring global locking."
          }
        ],
        impact: `Sync errors drop to 0%, canvas latency falls to 12ms, and the app successfully supports 500 concurrent users per canvas!`
      };
  }
}

export function getChatbotResponse(jobTitle: string, userMessage: string, fieldId?: string): string {
  const query = userMessage.toLowerCase();

  // Find keywords to customize answers
  let matchedFieldId = fieldId;
  let keywords: string[] = [];

  if (!matchedFieldId) {
    for (const [fid, positions] of Object.entries(positionsByField)) {
      const pos = positions.find((p) => p.title.toLowerCase() === jobTitle.toLowerCase());
      if (pos) {
        matchedFieldId = fid;
        keywords = pos.keywords;
        break;
      }
    }
  } else {
    const pos = (positionsByField[matchedFieldId] || []).find(
      (p) => p.title.toLowerCase() === jobTitle.toLowerCase()
    );
    if (pos) {
      keywords = pos.keywords;
    }
  }

  const techStack = keywords.slice(0, 4).map(k => k.toUpperCase()).join(", ") || "modern tech stacks";

  if (query.includes("salary") || query.includes("pay") || query.includes("earn") || query.includes("rm") || query.includes("money")) {
    return `For a ${jobTitle} in Malaysia, the salary range typically depends on experience:
• **Junior Level**: RM 4,500 – RM 6,500 / month
• **Mid-Level**: RM 7,000 – RM 10,500 / month
• **Senior/Lead**: RM 11,000 – RM 16,000+ / month

In high-demand sectors like Fintech, AI, or cybersecurity, these figures can go even higher!`;
  }

  if (query.includes("skill") || query.includes("learn") || query.includes("technology") || query.includes("tool") || query.includes("study")) {
    return `To build a successful career as a ${jobTitle}, you should focus on mastering:
• **Core Tech Stack**: ${techStack}
• **System Design**: Knowing how components fit together, API design, and performance optimizations.
• **Core Principles**: Version control (Git), writing clean/testable code, and understanding database basics.
• **Soft Skills**: Collaboration, technical communication, and problem-solving.`;
  }

  if (query.includes("stress") || query.includes("stressful") || query.includes("hard") || query.includes("difficult") || query.includes("wlb") || query.includes("life")) {
    return `The role of a ${jobTitle} can be fast-paced. Challenges typically involve:
• Meeting tight sprint deadlines.
• Debugging complex, high-severity issues in production environments.
• Staying updated with rapidly evolving technology stacks.

However, organizations with strong engineering cultures prioritize a healthy work-life balance through agile planning, collaborative peer reviews, and automated testing to reduce stress.`;
  }

  if (query.includes("tasks") || query.includes("daily") || query.includes("do") || query.includes("day") || query.includes("routine")) {
    return `On a typical day as a ${jobTitle}, you might:
• **Code & Implement**: Write code to build features or optimize systems using ${keywords.slice(0, 2).join(", ") || "core frameworks"}.
• **Collaborate**: Meet with Product Managers or UI/UX Designers to review requirements.
• **Review & Test**: Participate in pull request code reviews and write automated tests.
• **Monitor**: Check telemetry dashboards to ensure services are operating smoothly.`;
  }

  if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
    return `Hello! 👋 I'm your CareerScope Assistant. I'm here to help you learn about the **${jobTitle}** role. 

You can ask me about:
• Average **salary** and demand
• Key **skills** and technologies to learn
• A **typical day** on the job
• Or click **"Experience the Job"** below to try a simulated work scenario!`;
  }

  return `I'm happy to help you explore the **${jobTitle}** career path! 

Here are some things you can ask me:
• "What is the average **salary** for this role?"
• "What **skills** and tools should I learn?"
• "What does a **typical day** look like?"
• "Is the job **stressful**?"

*Tip: You can also click "Experience the Job" in the simulator tab to try a hands-on work scenario!*`;
}

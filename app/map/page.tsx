"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { fieldNodes, fieldEdges, FieldNode } from "@/lib/fieldGraph";
import { jobs, Job, DemandLevel, calculateJobMatches } from "@/lib/jobData";
import { careerFields, positionsByField } from "@/lib/careerTaxonomy";
import { useApp } from "@/lib/context";
import { useTheme } from "@/lib/theme-context";
import Link from "next/link";
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw, MessageSquare, Send, X, CheckCircle2, Sparkles, HelpCircle, Briefcase, Trophy } from "lucide-react";
import { getJobScenario, getChatbotResponse } from "@/lib/jobScenarios";

const ACCENT = "#2D6A4F";

function demandColor(d: DemandLevel): string {
  switch (d) {
    case "Rare":
      return ACCENT;
    case "Competitive":
      return "#787774";
    case "Oversaturated":
      return "#C1453A";
    default:
      return "#A8A49E";
  }
}

const fieldToIdMap: Record<string, string> = {
  "Software Engineering": "fullstack",
  "Cloud Engineering": "cloud",
  "DevOps": "devops",
  "Data Science": "datascience",
  "AI / Machine Learning": "mlai",
  "UI/UX Design": "ux",
  "Product Management": "productdesign",
  "Mobile Development": "mobile",
  "Cybersecurity": "cybersec",
  "Business Analysis": "analytics",
};

type DrillLevel = 0 | 1 | 2;

export default function MapPage() {
  const { profile } = useApp();
  const { theme } = useTheme();

  const userHasSkill = (skillName: string): boolean => {
    const normalized = skillName.trim().toLowerCase();
    const userSkills = [...(profile.skills || []), ...(profile.courses || [])];
    return userSkills.some((s) => {
      const ns = s.trim().toLowerCase();
      return ns === normalized || ns.includes(normalized) || normalized.includes(ns);
    });
  };

  const [drillLevel, setDrillLevel] = useState<DrillLevel>(0);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [visiblePositions, setVisiblePositions] = useState<Set<string>>(
    new Set(),
  );
  // Level 0 zoom state — for interactive hover/zoom drill-down
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null); // Zoom & Pan state
  const [hoveredPositionL1, setHoveredPositionL1] = useState<string | null>(null);
  const [hoveredSkillL1, setHoveredSkillL1] = useState<string | null>(null);
  const [hoveredRelatedL1, setHoveredRelatedL1] = useState<string | null>(null);
  const [hoveredDotL0, setHoveredDotL0] = useState<{ fieldId: string; title: string; color: string } | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Chatbot & Sim States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [scenario, setScenario] = useState<any>(null);
  const [scenarioStep, setScenarioStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Watch for job selection changes to initialize or reset chatbot
  useEffect(() => {
    if (selectedPosition) {
      setChatMessages([
        {
          sender: "ai",
          text: `Hi there! 👋 Let's explore the role of **${selectedPosition}** together! Ask me questions about this job, or select **"Experience the Job 🚀"** below to try a simulated work scenario!`,
        },
      ]);
      setScenario(null);
      setScenarioStep(0);
      setSelectedAnswer(null);
      setAnswerFeedback(null);
    }
  }, [selectedPosition]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  const startChatSimulation = () => {
    if (!selectedPosition) return;
    const sc = getJobScenario(selectedPosition, selectedField || undefined);
    setScenario(sc);
    setScenarioStep(0);
    setSelectedAnswer(null);
    setAnswerFeedback(null);

    setChatMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: `🚀 **Starting Job Simulator: ${sc.title}**\n\n**Context:** ${sc.context}\n\n**Challenge:** ${sc.challenge}\n\nLet's begin! Here is your first task:`,
      },
      {
        sender: "ai",
        text: `**Step 1: ${sc.steps[0].task}**\n\n${sc.steps[0].question}`,
      }
    ]);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || !selectedPosition) return;
    const userMsg = text.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    if (!textToSend) setChatInput("");

    // Intercept to start simulation
    const normalizedMsg = userMsg.toLowerCase();
    if (
      normalizedMsg.includes("experience the job") ||
      normalizedMsg.includes("simulator") ||
      normalizedMsg.includes("simulation") ||
      normalizedMsg.includes("start sim") ||
      normalizedMsg.includes("experience job")
    ) {
      setTimeout(() => {
        startChatSimulation();
      }, 450);
      return;
    }

    setTimeout(() => {
      const response = getChatbotResponse(selectedPosition, userMsg, selectedField || undefined);
      setChatMessages((prev) => [...prev, { sender: "ai", text: response }]);
    }, 450);
  };

  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null || !scenario) return;
    setSelectedAnswer(index);
    const step = scenario.steps[scenarioStep];
    if (index === step.correctIndex) {
      setAnswerFeedback(`Correct! ${step.explanation}`);
    } else {
      setAnswerFeedback(`Incorrect. Try another choice!`);
    }
  };

  const handleNextStep = () => {
    if (!scenario || !selectedPosition) return;
    const step = scenario.steps[scenarioStep];
    const isCorrect = selectedAnswer === step.correctIndex;

    if (isCorrect) {
      // Add user selection and AI explanation to history
      setChatMessages((prev) => [
        ...prev,
        { sender: "user", text: `I choose: ${step.options[selectedAnswer!]}` },
        { sender: "ai", text: `✓ **Correct!** ${step.explanation}` },
      ]);

      if (scenarioStep < 2) {
        const nextStepIndex = scenarioStep + 1;
        setScenarioStep(nextStepIndex);
        setSelectedAnswer(null);
        setAnswerFeedback(null);

        // Push next step AI message
        const nextStep = scenario.steps[nextStepIndex];
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `**Step ${nextStepIndex + 1}: ${nextStep.task}**\n\n${nextStep.question}`,
          },
        ]);
      } else {
        // Complete simulation
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `🏆 **Simulation Completed successfully!**\n\n${scenario.impact}\n\n🎉 Great job! You successfully resolved the technical crisis and saved the day. You've demonstrated excellent decision-making and problem-solving skills typical of a successful **${selectedPosition}**!`,
          },
        ]);
        setScenario(null);
        setScenarioStep(0);
        setSelectedAnswer(null);
        setAnswerFeedback(null);
      }
    } else {
      // Allow retry
      setSelectedAnswer(null);
      setAnswerFeedback(null);
    }
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheelRaw = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1.1;
      setZoom((prev) => {
        const newZoom =
          e.deltaY < 0
            ? Math.min(5.0, prev * zoomFactor)
            : Math.max(0.4, prev / zoomFactor);
        return newZoom;
      });
    };

    svg.addEventListener("wheel", handleWheelRaw, { passive: false });
    return () => {
      svg.removeEventListener("wheel", handleWheelRaw);
    };
  }, []);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsPanning(true);
    setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - panStart.x,
      y: touch.clientY - panStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(5.0, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.4, prev / 1.2));
  };

  const handleReset = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
  };

  const careerType = profile.careerType;
  const normalizeText = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9+#]+/g, " ")
      .trim();

  const selectedFieldNode: FieldNode | null = useMemo(() => {
    if (!selectedField) return null;
    return fieldNodes.find((n) => n.id === selectedField) || null;
  }, [selectedField]);

  // (zoom overlay removed)

  // Precompute position dots for each field (for Level 0 distribution display)
  // Returns map of fieldId → array of {x, y, color} for position dots
  const fieldPositionDots = useMemo(() => {
    const map = new Map<
      string,
      Array<{ x: number; y: number; color: string; title: string }>
    >();
    fieldNodes.forEach((field) => {
      const positions = positionsByField[field.id] || [];
      const dots: Array<{
        x: number;
        y: number;
        color: string;
        title: string;
      }> = [];
      const count = positions.length;
      positions.forEach((pos, i) => {
        // Spread dots in a small circle around the field node
        const angleOffset =
          (i / Math.max(count, 1)) * 2 * Math.PI - Math.PI / 2;
        const dist = 18 + (i % 3) * 5; // varying distance 18-28px
        dots.push({
          x: field.x + dist * Math.cos(angleOffset),
          y: field.y + dist * Math.sin(angleOffset),
          color: field.color,
          title: pos.title,
        });
      });
      map.set(field.id, dots);
    });
    return map;
  }, []);

  // ─── Skill nodes — top bridge skills that span multiple fields ───
  // Skills appear in the outer ring (r=370), connected to their relevant fields
  const { skillNodes, skillFieldMap } = useMemo(() => {
    const bannedSkills = new Set([
      "optimization",
      "research",
      "leadership",
      "communication",
      "management",
      "strategy",
      "problem solving",
      "agile",
      "scrum",
      "planning",
      "mentoring",
      "negotiation",
      "teamwork",
      "coaching",
      "operations",
      "writing",
      "architecture",
      "design",
      "testing",
      "security",
      "performance",
      "analytics",
      "production",
      "infrastructure",
      "deployment",
      "troubleshooting",
      "analysis",
      "problem-solving",

      // New banned skills (non-technical, generic conceptual, domain, or role terms)
      "publications",
      "stakeholder",
      "prototyping",
      "team lead",
      "real-time",
      "automotive",
      "embedded",
      "platform engineering",
      "developer experience",
      "automation",
      "dx",
      "regression",
      "team management",
      "data platform",
      "pipelines",
      "algorithms",
      "systems",
      "sensors",
      "perception",
      "navigation",
      "control",
      "product",
      "requirements",
      "demo",
      "compliance",
      "threat detection",
      "incident response",
      "incident management",
      "monitoring",
      "reliability",
      "solutions",
      "implementation",
      "support",
      "governance",
      "integration",
    ]);

    // Extract all skills and count how many fields they appear in
    const skillFieldCount = new Map<string, Set<string>>();
    Object.entries(positionsByField).forEach(([fieldId, positions]) => {
      const fieldNode = fieldNodes.find((n) => n.id === fieldId);
      positions.forEach((pos) => {
        pos.keywords.forEach((kw) => {
          let skill = kw.trim().toLowerCase();
          if (skill === "ml") skill = "machine learning";
          if (skill === "ai") skill = "artificial intelligence";
          if (!skill || bannedSkills.has(skill)) return;

          // Capitalize appropriately
          skill = skill
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          // Exception for typical casing
          if (skill === "Machine Learning") skill = "Machine Learning";

          if (!skillFieldCount.has(skill))
            skillFieldCount.set(skill, new Set());
          skillFieldCount.get(skill)!.add(fieldId);
        });
      });
    });
    // Keep skills that appear in 2+ fields (bridge skills)
    const CX = 500,
      CY = 400;
    const bridgeSkills = [...skillFieldCount.entries()]
      .filter(([skill, fields]) => fields.size >= 2)
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 48); // top 48 skills

    // Group skills by their field keys to avoid overlapping at the same centroid
    const groups = new Map<
      string,
      Array<{ skill: string; fields: Set<string> }>
    >();
    bridgeSkills.forEach(([skill, fields]) => {
      const key = [...fields].sort().join(",");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push({ skill, fields });
    });

    const nodes: Array<{
      skill: string;
      x: number;
      y: number;
      fieldCount: number;
      fieldIds: string[];
    }> = [];

    groups.forEach((groupItems, key) => {
      const fieldIds = key.split(",");

      // Calculate raw centroid
      let sumX = 0;
      let sumY = 0;
      let count = 0;
      fieldIds.forEach((fieldId) => {
        const field = fieldNodes.find((n) => n.id === fieldId);
        if (field) {
          sumX += field.x;
          sumY += field.y;
          count++;
        }
      });

      const centerX = count > 0 ? sumX / count : CX;
      const centerY = count > 0 ? sumY / count : CY;

      // Layout nodes in a small circle around the centroid
      const K = groupItems.length;

      groupItems.forEach((item, index) => {
        // Deterministic offset based on skill name
        let hash = 0;
        for (let charIndex = 0; charIndex < item.skill.length; charIndex++) {
          hash = item.skill.charCodeAt(charIndex) + ((hash << 5) - hash);
        }

        let dx = 0;
        let dy = 0;
        if (K === 1) {
          // Add a small pseudo-random offset so single skills aren't perfectly aligned
          const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
          const dist = 18 + (Math.abs(hash) % 8); // 18-25px from centroid
          dx = Math.cos(angle) * dist;
          dy = Math.sin(angle) * dist;
        } else {
          // Distribute multi-skill group around centroid
          const angle = (index / K) * 2 * Math.PI + (Math.abs(hash) % 10) * 0.1;
          const dist = 20 + K * 1.5; // push out slightly further if more skills share this centroid
          dx = Math.cos(angle) * dist;
          dy = Math.sin(angle) * dist;
        }

        nodes.push({
          skill: item.skill,
          x: centerX + dx,
          y: centerY + dy,
          fieldCount: item.fields.size,
          fieldIds,
        });
      });
    });

    return { skillNodes: nodes, skillFieldMap: skillFieldCount };
  }, []);

  // Skills connected to currently hovered field
  const skillsForHoveredField = useMemo(() => {
    if (!hoveredField) return new Set<string>();
    return new Set(
      skillNodes
        .filter((n) => n.fieldIds.includes(hoveredField!))
        .map((n) => n.skill),
    );
  }, [hoveredField, skillNodes]);

  // Fields connected to currently hovered skill
  const fieldsForHoveredSkill = useMemo(() => {
    if (!hoveredSkill) return new Set<string>();
    const node = skillNodes.find((n) => n.skill === hoveredSkill);
    return node ? new Set(node.fieldIds) : new Set<string>();
  }, [hoveredSkill, skillNodes]);

  // Connected field IDs for a given field (via edges)
  const connectedFieldIds = useMemo(() => {
    const connected = new Set<string>();
    if (!hoveredField) return connected;
    fieldEdges.forEach((edge) => {
      if (edge.source === hoveredField) connected.add(edge.target);
      if (edge.target === hoveredField) connected.add(edge.source);
    });
    return connected;
  }, [hoveredField]);

  const fieldJobs = useMemo(() => {
    if (!selectedFieldNode) return [];
    return jobs.filter((j) => j.field === selectedFieldNode.label);
  }, [selectedFieldNode]);

  const fieldNodeByLabel = useMemo(() => {
    return new Map(fieldNodes.map((node) => [node.label, node]));
  }, []);

  const getFieldPositions = (fieldId: string) => {
    return positionsByField[fieldId]?.map((p) => p.title) || [];
  };

  const typeFieldIds = useMemo(() => {
    if (!careerType) return new Set<string>();
    const { fieldByType } = require("@/lib/fieldGraph");
    return new Set<string>(fieldByType[careerType] || []);
  }, [careerType]);

  const resultFieldIds = useMemo(() => {
    if (!careerType) return new Set<string>();
    const matches = calculateJobMatches(
      careerType,
      profile.skills || [],
      profile.courses || [],
    );
    return new Set(matches.slice(0, 5).map((m) => m.job.fieldId));
  }, [careerType, profile.skills, profile.courses]);

  const fieldPositions = useMemo(() => {
    if (!selectedField) return [];
    return getFieldPositions(selectedField);
  }, [selectedField]);

  const fieldSkills = useMemo(() => {
    if (!selectedFieldNode) return [];
    const bannedSkills = new Set([
      "optimization",
      "research",
      "leadership",
      "communication",
      "management",
      "strategy",
      "problem solving",
      "agile",
      "scrum",
      "planning",
      "mentoring",
      "negotiation",
      "teamwork",
      "coaching",
      "operations",
      "writing",
      "architecture",
      "design",
      "testing",
      "security",
      "performance",
      "analytics",
      "production",
      "infrastructure",
      "deployment",
      "troubleshooting",
      "analysis",
      "problem-solving",
    ]);
    const counts = new Map<string, number>();
    fieldJobs.forEach((job) => {
      job.skillsRequired.forEach((skill) => {
        let key = skill.trim().toLowerCase();
        if (key === "ml") key = "machine learning";
        if (key === "ai") key = "artificial intelligence";
        if (!key || bannedSkills.has(key)) return;

        // Capitalize
        key = key
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });

    return [...counts.entries()]
      .filter(([, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 25)
      .map(([skill]) => skill);
  }, [fieldJobs, selectedFieldNode]);

  const positionSkillMap = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!selectedField) return map;
    const positions = positionsByField[selectedField] || [];
    positions.forEach(({ title, keywords }) => {
      map.set(title, keywords);
    });
    return map;
  }, [selectedField]);

  const skillPositionMap = useMemo(() => {
    const map = new Map<string, string[]>();
    fieldSkills.forEach((skill) => {
      const matchedPositions = fieldPositions.filter((title) =>
        (positionSkillMap.get(title) || []).some(
          (positionSkill) =>
            positionSkill.toLowerCase() === skill.toLowerCase() ||
            positionSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(positionSkill.toLowerCase()),
        ),
      );
      map.set(skill, matchedPositions);
    });
    return map;
  }, [fieldPositions, fieldSkills, positionSkillMap]);

  const relatedJobs = useMemo(() => {
    if (!selectedFieldNode) return [];

    const currentFieldSkills = new Set(
      fieldJobs.flatMap((job) =>
        job.skillsRequired.map((skill) => normalizeText(skill)),
      ),
    );

    const scored = jobs
      .filter((job) => job.field !== selectedFieldNode.label)
      .map((job) => {
        const sharedSkills = job.skillsRequired.filter((skill) => {
          const normalizedSkill = normalizeText(skill);
          return [...currentFieldSkills].some(
            (currentSkill) =>
              currentSkill === normalizedSkill ||
              currentSkill.includes(normalizedSkill) ||
              normalizedSkill.includes(currentSkill),
          );
        });

        const jobFieldNode = fieldNodeByLabel.get(job.field);
        const fieldConnected = jobFieldNode
          ? fieldEdges.some(
              (edge) =>
                (edge.source === selectedFieldNode.id &&
                  edge.target === jobFieldNode.id) ||
                (edge.target === selectedFieldNode.id &&
                  edge.source === jobFieldNode.id),
            )
          : false;

        const score = sharedSkills.length * 3 + (fieldConnected ? 2 : 0);
        return score > 0 ? { job, score, sharedSkills, fieldConnected } : null;
      })
      .filter(
        (
          value,
        ): value is {
          job: Job;
          score: number;
          sharedSkills: string[];
          fieldConnected: boolean;
        } => value !== null,
      )
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.job.field.localeCompare(b.job.field) ||
          a.job.title.localeCompare(b.job.title),
      )
      .slice(0, 7);

    return scored;
  }, [fieldEdges, fieldJobs, fieldNodeByLabel, selectedFieldNode]);

  const positionJobs = useMemo(() => {
    if (!selectedPosition) return [];
    return jobs.filter((j) => j.title === selectedPosition);
  }, [selectedPosition]);

  const mockMatches = useMemo(() => {
    const quizAnswers = profile.answers || {};
    if (!profile.careerType && Object.keys(quizAnswers).length === 0) return [];
    const { calculateCareerType, generateMockJobMatches } = require("@/lib/scoring");
    const { getArchetype } = require("@/lib/types");
    const result = calculateCareerType(quizAnswers);
    const type = profile.careerType || result.careerType;
    const archetype = getArchetype(type);
    return generateMockJobMatches(type, archetype);
  }, [profile.careerType, profile.answers]);

  const topMatchFieldId = useMemo(() => {
    const topMatch = mockMatches[0];
    if (!topMatch) return null;
    return fieldToIdMap[topMatch.field] || "fullstack";
  }, [mockMatches]);

  const getMockMatchScore = (jobTitle: string): number | null => {
    const match = mockMatches.find((m: any) => {
      const a = jobTitle.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
      const b = m.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
      if (a === b || a.includes(b) || b.includes(a)) return true;
      const wordsA = new Set(a.split(/\s+/).filter((w: string) => w.length > 2));
      const wordsB = new Set(b.split(/\s+/).filter((w: string) => w.length > 2));
      let shared = 0;
      for (const w of wordsA) {
        if (wordsB.has(w)) shared++;
      }
      return (
        shared >= 2 || (shared >= 1 && Math.min(wordsA.size, wordsB.size) <= 2)
      );
    });
    return match ? match.totalScore : null;
  };

  const matchPct = (job: Job): number => {
    const mockScore = getMockMatchScore(job.title);
    if (mockScore !== null) {
      return mockScore;
    }

    let score = 0;
    if (careerType && job.typeFit.includes(careerType)) score += 40;
    const userSkillsLower = [...job.skillsUser, ...profile.courses].map((s) =>
      s.toLowerCase(),
    );
    const overlap = job.skillsRequired.filter((skill) =>
      userSkillsLower.some(
        (us) =>
          us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us),
      ),
    ).length;
    score += Math.round((overlap / job.skillsRequired.length) * 60);

    // If score is low, fallback to a stable deterministic mock score (45% to 75%) for demo purposes
    if (score < 55) {
      let hash = 0;
      for (let i = 0; i < job.title.length; i++) {
        hash = job.title.charCodeAt(i) + ((hash << 5) - hash);
      }
      return 45 + (Math.abs(hash) % 31);
    }

    return Math.min(100, score);
  };

  const positionMatchesCareer = (title: string): boolean => {
    if (!careerType) return false;
    const titleJobs = jobs.filter((j) => j.title === title);
    return titleJobs.some((j) => j.typeFit.includes(careerType));
  };

  const getRadialPos = (
    index: number,
    total: number,
    cx: number,
    cy: number,
    r: number,
    offset = 0,
  ) => {
    const angle = -Math.PI / 2 + offset + (index / total) * 2 * Math.PI;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // Unified entry to Level 1. If `fieldId` provided, set field-specific state;
  // otherwise just step to Level 1 (used when returning from Level 2).
  const drillToLevel1 = (fieldId?: string) => {
    if (fieldId) {
      const positions = getFieldPositions(fieldId);
      setSelectedField(fieldId);
      setSelectedSkill(null);
      setVisiblePositions(new Set(positions));
    }
    // Clear any selected position and ensure level is 1
    setSelectedPosition(null);
    setDrillLevel(1);
    setHoveredPositionL1(null);
    setHoveredSkillL1(null);
    setHoveredRelatedL1(null);
  };

  const drillToLevel2 = (title: string) => {
    setSelectedPosition(title);
    setDrillLevel(2);
  };

  const drillToLevel2FromL0 = (fieldId: string, title: string) => {
    setSelectedField(fieldId);
    setSelectedPosition(title);
    setSelectedSkill(null);
    setDrillLevel(2);
  };

  const backToLevel0 = () => {
    setDrillLevel(0);
    setSelectedField(null);
    setSelectedPosition(null);
    setSelectedSkill(null);
    setVisiblePositions(new Set());
    setHoveredPositionL1(null);
    setHoveredSkillL1(null);
    setHoveredRelatedL1(null);
  };

  // Load initial field from query parameter if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const fieldParam = params.get("field");
      if (fieldParam) {
        const match = fieldNodes.find(
          (n) =>
            n.id.toLowerCase() === fieldParam.toLowerCase() ||
            n.label.toLowerCase() === fieldParam.toLowerCase()
        );
        if (match) {
          setSelectedField(match.id);
          setDrillLevel(0);
        }
      }
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 56px)",
        background: "var(--bg)",
        color: "var(--text)",
        overflow: "hidden",
      }}
    >
      {/* ══════════════════════════════════════════
          LEVEL 0 — Interactive Field Map
          - All 37 field nodes + position distribution dots
          - Hover: highlight connections
          - Click: zoom to field → show position labels
      ══════════════════════════════════════════ */}
      {drillLevel === 0 && (
        <div
          style={{
            padding: "16px 24px 0",
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 56px)",
          }}
        >
          {/* Zoomed-in field panel (overlays the map) */}
          {/* Zoom overlay removed — entering Level 1 opens the field detail instead */}

          {/* Controls bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* Zoom controls */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={handleZoomOut}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "6px 8px",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Zoom Out"
                >
                  <ZoomOut size={12} />
                </button>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--text-secondary)",
                    padding: "0 4px",
                    minWidth: 32,
                    textAlign: "center",
                    fontWeight: 600,
                    userSelect: "none",
                  }}
                >
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "6px 8px",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Zoom In"
                >
                  <ZoomIn size={12} />
                </button>
              </div>

              <button
                onClick={handleReset}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  fontSize: 11,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <RotateCcw size={11} /> Reset Map
              </button>
            </div>
          </div>

          {/* SVG Map */}
          <div
            style={{
              position: "relative",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              minHeight: 0,
            }}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 1000 800"
              style={{
                width: "100%",
                maxWidth: 1000,
                height: "100%",
                maxHeight: "75vh",
                display: "block",
                margin: "0 auto",
                opacity: 1,
                transition: "opacity 0.2s",
                cursor: isPanning ? "grabbing" : "grab",
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <g
                transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
                style={{
                  transformOrigin: "500px 400px",
                  transition: isPanning ? "none" : "transform 0.15s ease-out",
                }}
              >
                {/* Edges — highlight on hover */}
                {fieldEdges.map((edge, i) => {
                  const src = fieldNodes.find((n) => n.id === edge.source);
                  const tgt = fieldNodes.find((n) => n.id === edge.target);
                  if (!src || !tgt) return null;
                  const isHighlighted =
                    hoveredField &&
                    (edge.source === hoveredField ||
                      edge.target === hoveredField);
                  const isDimmed = hoveredField && !isHighlighted;
                  return (
                    <line
                      key={i}
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke={isHighlighted ? ACCENT : "var(--border)"}
                      strokeWidth={isHighlighted ? 1.5 : 0.5}
                      strokeOpacity={
                        isDimmed ? 0.08 : isHighlighted ? 0.7 : 0.2
                      }
                      style={{
                        transition:
                          "stroke 0.15s, stroke-opacity 0.15s, stroke-width 0.15s",
                        vectorEffect: "non-scaling-stroke",
                      }}
                    />
                  );
                })}

                {/* ── Skill → Field curved edges ── */}
                {skillNodes.map((node) => {
                  const isHoveredSkill = hoveredSkill === node.skill;
                  const isFieldHovered = !!hoveredField;
                  const isSkillSelected = selectedSkill === node.skill;
                  const isFieldSelected = !!selectedField;

                  return node.fieldIds.map((fieldId) => {
                    const isActive =
                      isHoveredSkill ||
                      isSkillSelected ||
                      (isFieldHovered && fieldId === hoveredField) ||
                      (isFieldSelected && fieldId === selectedField);

                    if (!isActive) return null;

                    const field = fieldNodes.find((n) => n.id === fieldId);
                    if (!field) return null;
                    const dx = field.x - node.x;
                    const dy = field.y - node.y;
                    const dist = Math.hypot(dx, dy);
                    const curveOffset = Math.min(20, dist * 0.2);
                    let midX = (node.x + field.x) / 2;
                    let midY = (node.y + field.y) / 2;
                    if (dist > 1) {
                      const px = -dy / dist;
                      const py = dx / dist;
                      midX += px * curveOffset;
                      midY += py * curveOffset;
                    }
                    const d = `M ${node.x} ${node.y} Q ${midX} ${midY} ${field.x} ${field.y}`;
                    return (
                      <path
                        key={`${node.skill}-${fieldId}`}
                        d={d}
                        stroke={ACCENT}
                        strokeWidth={1.5}
                        strokeOpacity={
                          isHoveredSkill || isSkillSelected ? 0.7 : 0.4
                        }
                        fill="none"
                        style={{
                          transition: "stroke 0.15s, stroke-opacity 0.15s",
                          pointerEvents: "none",
                          vectorEffect: "non-scaling-stroke",
                        }}
                      />
                    );
                  });
                })}

                {/* ── Skill diamond nodes ── */}
                {skillNodes.map((node) => {
                  const isHoveredSkill = hoveredSkill === node.skill;
                  const isConnected = skillsForHoveredField.has(node.skill);
                  const isDimmed =
                    (!!hoveredSkill && !isHoveredSkill) ||
                    (!!hoveredField && !isConnected);
                  const isOwned = userHasSkill(node.skill);

                  const primaryField = fieldNodes.find(
                    (n) => n.id === node.fieldIds[0],
                  );
                  const skillColor = primaryField?.color || ACCENT;
                  const baseR = 6;
                  const r = baseR / Math.pow(zoom, 0.75);
                  const pts = `${node.x},${node.y - r} ${node.x + r},${node.y} ${node.x},${node.y + r} ${node.x - r},${node.y}`;

                  const showLabel = isHoveredSkill || zoom >= 1.6;
                  const labelOpacity = isHoveredSkill
                    ? 0.9
                    : zoom >= 1.6
                      ? Math.min(0.75, (zoom - 1.5) * 2)
                      : 0;

                  return (
                    <g
                      key={node.skill}
                      onMouseEnter={() => setHoveredSkill(node.skill)}
                      onMouseLeave={() => setHoveredSkill(null)}
                      onClick={() =>
                        setHoveredSkill(isHoveredSkill ? null : node.skill)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {isHoveredSkill && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={r + 7 / Math.pow(zoom, 0.75)}
                          fill="none"
                          stroke={skillColor}
                          strokeWidth={1.5}
                          strokeOpacity={0.45}
                          style={{
                            transition: "all 0.15s",
                            vectorEffect: "non-scaling-stroke",
                          }}
                        />
                      )}
                      <polygon
                        points={pts}
                        fill={skillColor}
                        fillOpacity={
                          isDimmed ? 0.1 : isHoveredSkill ? 0.95 : isOwned ? 0.95 : 0.5
                        }
                        stroke={isHoveredSkill ? skillColor : isOwned ? (theme === "dark" ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.85)") : "var(--border)"}
                        strokeWidth={isHoveredSkill ? 1.5 : isOwned ? 1.75 : 0.75}
                        strokeOpacity={isDimmed ? 0.2 : 0.7}
                        style={{
                          transition: "all 0.15s",
                          vectorEffect: "non-scaling-stroke",
                        }}
                      />
                      {showLabel && (
                        <text
                          x={node.x + (baseR + 5) / Math.pow(zoom, 0.75)}
                          y={node.y + 3.5 / Math.pow(zoom, 0.75)}
                          style={{
                            fontSize: `${8.5 / Math.pow(zoom, 0.75)}px`,
                            fontWeight: 600,
                            fill: isOwned ? "#95D5B2" : "var(--text)",
                            opacity: labelOpacity,
                            pointerEvents: "none",
                            transition: "opacity 0.15s ease",
                          }}
                        >
                          {node.skill}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Position distribution dots (small background dots around each field) */}
                {Array.from(fieldPositionDots.entries()).map(
                  ([fieldId, dots]) => {
                    const field = fieldNodes.find((n) => n.id === fieldId);
                    if (!field) return null;
                    const isHovered = hoveredField === fieldId;
                    return dots.map((dot, i) => {
                      const baseDotR = 2.5;
                      const r = baseDotR / Math.pow(zoom, 0.75);
                      const showLabel = zoom >= 1.6;
                      const labelOpacity = showLabel
                        ? Math.min(0.85, (zoom - 1.5) * 2)
                        : 0;
                      return (
                        <g
                          key={`${fieldId}-dot-${i}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            drillToLevel2FromL0(fieldId, dot.title);
                          }}
                          onMouseEnter={() => setHoveredDotL0({ fieldId, title: dot.title, color: dot.color })}
                          onMouseLeave={() => setHoveredDotL0(null)}
                          style={{ cursor: "pointer" }}
                        >
                          {/* Interactive hover circle for easier click targets */}
                          <circle
                            cx={dot.x}
                            cy={dot.y}
                            r={r + 3 / Math.pow(zoom, 0.75)}
                            fill="transparent"
                            style={{ pointerEvents: "all" }}
                          />
                          <circle
                            cx={dot.x}
                            cy={dot.y}
                            r={r}
                            fill={dot.color}
                            fillOpacity={isHovered ? 0.75 : 0.25}
                            style={{
                              transition: "fill-opacity 0.2s",
                              vectorEffect: "non-scaling-stroke",
                            }}
                          />
                          {showLabel && (
                            <text
                              x={dot.x + (baseDotR + 4) / Math.pow(zoom, 0.75)}
                              y={dot.y + 2.5 / Math.pow(zoom, 0.75)}
                              style={{
                                fontSize: `${8.5 / Math.pow(zoom, 0.75)}px`,
                                fontWeight: 500,
                                fill: "var(--text-secondary)",
                                opacity: labelOpacity,
                                pointerEvents: "none",
                                transition: "opacity 0.15s ease",
                              }}
                            >
                              {dot.title}
                            </text>
                          )}
                        </g>
                      );
                    });
                  },
                )}

                {/* Field nodes — all 37 always visible */}
                {fieldNodes.map((node) => {
                  const fJobs = jobs.filter((j) => j.field === node.label);
                  let avgMatch = fJobs.length
                    ? Math.round(fJobs.reduce((sum, j) => sum + matchPct(j), 0) / fJobs.length)
                    : 0;
                  if (node.id === topMatchFieldId) {
                    const topMatchScore = mockMatches[0]?.totalScore || 93;
                    avgMatch = Math.max(93, topMatchScore);
                  }
                  const isResultField = avgMatch >= 90;
                  const isHovered = hoveredField === node.id;
                  const isConnected = connectedFieldIds.has(node.id);
                  const isDimmedByField =
                    hoveredField && !isHovered && !isConnected;
                  const isDimmedBySkill =
                    !!hoveredSkill && !fieldsForHoveredSkill.has(node.id);
                  const isDimmed =
                    (isDimmedByField || isDimmedBySkill) && !isResultField;

                  const baseR =
                    isHovered || isResultField ? node.radius + 1 : node.radius;
                  const r = baseR / Math.pow(zoom, 0.75);

                  return (
                    <g
                      key={node.id}
                      onClick={() => {
                        setHoveredField(null);
                        drillToLevel1(node.id);
                      }}
                      onMouseEnter={() => setHoveredField(node.id)}
                      onMouseLeave={() => setHoveredField(null)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Hover: glow ring */}
                      {isHovered && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={r + 9 / Math.pow(zoom, 0.75)}
                          fill="none"
                          stroke={node.color}
                          strokeWidth={1.5}
                          strokeOpacity={0.5}
                          style={{
                            transition: "all 0.15s",
                            vectorEffect: "non-scaling-stroke",
                          }}
                        />
                      )}
                      {/* Result field: dashed outer ring */}
                      {isResultField && !isHovered && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={r + 8 / Math.pow(zoom, 0.75)}
                          fill="none"
                          stroke="#52B788"
                          strokeWidth={1.5}
                          strokeDasharray="2 2"
                          strokeOpacity={0.8}
                          style={{
                            transition: "all 0.15s",
                            vectorEffect: "non-scaling-stroke",
                          }}
                        />
                      )}
                      {/* Connected field: subtle ring */}
                      {isConnected && !isResultField && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={r + 5 / Math.pow(zoom, 0.75)}
                          fill="none"
                          stroke={ACCENT}
                          strokeWidth={0.75}
                          strokeOpacity={0.2}
                          style={{ vectorEffect: "non-scaling-stroke" }}
                        />
                      )}
                      {/* Node dot */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={r}
                        fill={node.color}
                        fillOpacity={
                          isDimmed
                            ? 0.15
                            : isHovered || isResultField
                              ? 0.95
                              : 0.7
                        }
                        stroke={
                          isHovered || isResultField
                            ? node.color
                            : "var(--border)"
                        }
                        strokeWidth={
                          isHovered
                            ? 2
                            : isResultField
                              ? 1.5
                              : 0.75
                        }
                        strokeOpacity={isDimmed ? 0.15 : 0.7}
                        style={{
                          transition: "all 0.15s",
                          vectorEffect: "non-scaling-stroke",
                        }}
                      />
                      {/* Label */}
                      <text
                        x={node.x + (baseR + 6) / Math.pow(zoom, 0.75)}
                        y={node.y + 3.5 / Math.pow(zoom, 0.75)}
                        style={{
                          fontSize: `${(isHovered ? 12.5 : 11) / Math.pow(zoom, 0.75)}px`,
                          fontWeight:
                            isHovered || isResultField
                              ? 600
                              : 400,
                          fill: isHovered || isResultField
                            ? "var(--text)"
                            : "var(--text-secondary)",
                          fillOpacity: isDimmed ? 0.3 : 1,
                          pointerEvents: "none",
                          transition: "all 0.15s",
                        }}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Hover tooltip */}
            {hoveredField &&
              (() => {
                const field = fieldNodes.find((n) => n.id === hoveredField);
                const positions = positionsByField[hoveredField] || [];
                if (!field) return null;
                const fJobs = jobs.filter((j) => j.field === field.label);
                let avgMatch = fJobs.length > 0
                  ? Math.round(fJobs.reduce((sum, j) => sum + matchPct(j), 0) / fJobs.length)
                  : 0;
                if (field.id === topMatchFieldId) {
                  const topMatchScore = mockMatches[0]?.totalScore || 93;
                  avgMatch = Math.max(93, topMatchScore);
                }
                return (
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#1E1E1E",
                      color: "#FFFFFF",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      padding: "6px 14px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      animation: "fadeIn 0.12s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ color: field.color }}>●</span>
                    <span>{field.label}</span>
                    <span style={{ opacity: 0.6 }}>|</span>
                    <span style={{ opacity: 0.8 }}>{positions.length} positions</span>
                    <span style={{ opacity: 0.6 }}>|</span>
                    <span style={{ color: "#52B788", fontWeight: 600 }}>{avgMatch}% Match</span>
                  </div>
                );
              })()}

            {hoveredDotL0 &&
              (() => {
                const job = jobs.find((j) => j.title === hoveredDotL0.title);
                if (!job) return null;
                const pct = matchPct(job);
                return (
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#1E1E1E",
                      color: "#FFFFFF",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      padding: "6px 14px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      animation: "fadeIn 0.12s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ color: hoveredDotL0.color }}>●</span>
                    <span>{job.title}</span>
                    <span style={{ opacity: 0.6 }}>|</span>
                    <span style={{ color: "#52B788", fontWeight: 600 }}>{pct}% Match</span>
                  </div>
                );
              })()}

            {/* ── Skill hover info card ── */}
            {hoveredSkill &&
              (() => {
                const node = skillNodes.find((n) => n.skill === hoveredSkill);
                if (!node) return null;
                const isOwned = userHasSkill(node.skill);
                const connectedFields = node.fieldIds
                  .map((id) => fieldNodes.find((n) => n.id === id))
                  .filter(Boolean);
                const allPositions = node.fieldIds.flatMap((fid) =>
                  (positionsByField[fid] || []).map((p) => ({
                    ...p,
                    fieldId: fid,
                  })),
                );
                return (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 24,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "14px 18px",
                      width: 340,
                      maxWidth: "90vw",
                      zIndex: 20,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      animation: "fadeIn 0.15s ease",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          background: ACCENT,
                          borderRadius: 2,
                          transform: "rotate(45deg)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text)",
                        }}
                      >
                        {node.skill}
                      </span>
                      {isOwned && (
                        <span
                          style={{
                            fontSize: 9,
                            padding: "1px 5px",
                            borderRadius: 4,
                            background: `${ACCENT}15`,
                            color: ACCENT,
                            fontWeight: 600,
                          }}
                        >
                          Owned
                        </span>
                      )}
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 10,
                          color: "var(--text-tertiary)",
                          fontWeight: 600,
                        }}
                      >
                        {node.fieldCount} FIELDS
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 4,
                        marginBottom: allPositions.length > 0 ? 8 : 0,
                      }}
                    >
                      {connectedFields.map(
                        (field) =>
                          field && (
                            <span
                              key={field.id}
                              style={{
                                fontSize: 10,
                                padding: "2px 7px",
                                borderRadius: 3,
                                background: `${field.color}18`,
                                color: field.color,
                                fontWeight: 600,
                              }}
                            >
                              {field.label}
                            </span>
                          ),
                      )}
                    </div>
                    {allPositions.length > 0 && (
                      <div>
                        <p
                          style={{
                            fontSize: 10,
                            color: "var(--text-tertiary)",
                            marginBottom: 4,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Sample positions
                        </p>
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 3 }}
                        >
                          {[...new Set(allPositions.map((p) => p.title))]
                            .slice(0, 6)
                            .map((title) => (
                              <span
                                key={title}
                                style={{
                                  fontSize: 10,
                                  padding: "2px 6px",
                                  borderRadius: 3,
                                  background: "var(--bg)",
                                  color: "var(--text-secondary)",
                                  border: "1px solid var(--border)",
                                }}
                              >
                                {title}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "var(--text-tertiary)",
              marginTop: 10,
              marginBottom: 16,
              flexShrink: 0,
            }}
          >
            {careerType
              ? "Hover to explore connections · Click to see specialized positions"
              : "Click any field to explore career paths"}
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════
          LEVEL 1 — Field Detail
      ══════════════════════════════════════════ */}
      {drillLevel === 1 && selectedFieldNode && (
        <div style={{ padding: "16px 24px 0", position: "relative" }}>
          <button
            onClick={backToLevel0}
            style={{
              position: "absolute",
              top: 16,
              left: 24,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              padding: "8px",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          {/* Field header */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: selectedFieldNode.color,
                }}
              />
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  color: selectedFieldNode.color,
                  margin: 0,
                  fontFamily: "'Newsreader', serif",
                }}
              >
                {selectedFieldNode.label}
              </h2>
            </div>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-tertiary)",
                marginTop: 4,
              }}
            >
              {fieldPositions.length} specialized positions and{" "}
              {fieldSkills.length} skill nodes — click a node to explore
            </p>
          </div>

          {/* Positions and skills graph */}
          <svg
            viewBox="0 0 1000 600"
            style={{
              width: "100%",
              maxWidth: 960,
              height: "auto",
              display: "block",
              margin: "0 auto",
            }}
          >
            {(() => {
              const centerX = 500;
              const centerY = 260;
              const dotR = 6;
              const skillR = 6;
              const positionCount = Math.max(fieldPositions.length, 1);
              const skillCount = Math.max(fieldSkills.length, 1);
              const relatedCount = Math.max(relatedJobs.length, 1);

              // Helper for Position Relevance (0 to 100)
              const getPositionRelevance = (title: string): number => {
                const titleJobs = jobs.filter((j) => j.title === title);
                if (titleJobs.length === 0) return 0;
                const scores = titleJobs.map((j) => matchPct(j));
                return Math.max(...scores);
              };

              // Helper for Skill Relevance (0 to 1)
              const getSkillRelevance = (skillName: string): number => {
                const count = fieldJobs.filter((job) => 
                  job.skillsRequired.some((s) => s.toLowerCase() === skillName.toLowerCase())
                ).length;
                const maxCount = Math.max(...fieldJobs.map((j) => j.skillsRequired.length), 1);
                const freqScore = count / maxCount;
                
                const userHas = [...(profile.skills || []), ...(profile.courses || [])].some(
                  (s) => s.toLowerCase() === skillName.toLowerCase()
                );
                return freqScore * 0.5 + (userHas ? 0.5 : 0);
              };

              // Helper for Related Job Relevance (0 to 1)
              const maxRelatedScore = relatedJobs.length > 0 ? Math.max(...relatedJobs.map((r) => r.score)) : 1;

              // 1. Position Nodes (distributed in a full circle around the center)
              const positionsWithRelevance = fieldPositions
                .map((title) => {
                  const relevance = getPositionRelevance(title);
                  return { title, relevance };
                })
                .sort((a, b) => b.relevance - a.relevance);

              const positionNodes = positionsWithRelevance.map((entry, i) => {
                const relevance = entry.relevance;
                // Radial distance: 140px (highest relevance) to 180px (lowest relevance)
                const r = 140 + (1 - relevance / 100) * 40;
                const angle = -Math.PI / 2 + (i / positionCount) * 2 * Math.PI;
                return {
                  title: entry.title,
                  relevance,
                  angle,
                  r,
                  x: centerX + r * Math.cos(angle),
                  y: centerY + r * Math.sin(angle),
                  type: "position" as const,
                  radius: 16,
                };
              });

              // 2. Skill Nodes (placed at centroids or radially adjacent to their connected positions)
              const skillConnections = fieldSkills.map((skill) => {
                const connectedPos = positionNodes.filter((posNode) => {
                  const keywords = positionSkillMap.get(posNode.title) || [];
                  return keywords.some(
                    (kw) =>
                      kw.toLowerCase() === skill.toLowerCase() ||
                      kw.toLowerCase().includes(skill.toLowerCase()) ||
                      skill.toLowerCase().includes(kw.toLowerCase())
                  );
                });
                return { skill, connectedPos };
              });

              // Group skills by their connections key to prevent overlapping
              const skillGroups = new Map<string, Array<{ skill: string; connectedPos: typeof positionNodes }>>();
              skillConnections.forEach(({ skill, connectedPos }) => {
                const key = connectedPos.map((p) => p.title).sort().join("|");
                if (!skillGroups.has(key)) skillGroups.set(key, []);
                skillGroups.get(key)!.push({ skill, connectedPos });
              });

              const skillNodes: Array<{ skill: string; relevance: number; x: number; y: number; type: "skill"; radius: number; connectedPositionTitles: string[] }> = [];
              
              skillGroups.forEach((groupItems, key) => {
                const firstItem = groupItems[0];
                const connectedPos = firstItem.connectedPos;
                const K = groupItems.length;

                let centroidX = centerX;
                let centroidY = centerY;
                let isBridge = connectedPos.length >= 2;

                if (connectedPos.length > 0) {
                  let sumX = 0;
                  let sumY = 0;
                  let totalWeight = 0;
                  connectedPos.forEach((p) => {
                    // Pull bridge skills closer to more relevant position nodes
                    const weight = p.relevance + 20;
                    sumX += p.x * weight;
                    sumY += p.y * weight;
                    totalWeight += weight;
                  });
                  centroidX = sumX / totalWeight;
                  centroidY = sumY / totalWeight;
                }

                groupItems.forEach((item, index) => {
                  const relevance = getSkillRelevance(item.skill);
                  let sx = centroidX;
                  let sy = centroidY;

                  // Deterministic offset based on skill name hash
                  let hash = 0;
                  for (let c = 0; c < item.skill.length; c++) {
                    hash = item.skill.charCodeAt(c) + ((hash << 5) - hash);
                  }

                  if (!isBridge && connectedPos.length === 1) {
                    // Single position connection: place radially outward from position node
                    const posNode = connectedPos[0];
                    const angle = posNode.angle + (index - (K - 1) / 2) * 0.18; // spread offset
                    // Higher relevance = closer to the job node (smaller distance)
                    const distFromJob = 19 + (1 - relevance) * 22 + (Math.abs(hash) % 4);
                    const dist = posNode.r + distFromJob;
                    sx = centerX + dist * Math.cos(angle);
                    sy = centerY + dist * Math.sin(angle);
                  } else if (isBridge) {
                    // Bridge skill: distribute around centroid
                    const angle = (index / K) * 2 * Math.PI + (Math.abs(hash) % 10) * 0.1;
                    // Higher relevance = tighter distribution around centroid (closer to positions overall)
                    const dist = (12 + K * 1.5) * (1.25 - relevance * 0.45);
                    sx = centroidX + Math.cos(angle) * dist;
                    sy = centerY + Math.sin(angle) * dist;
                  } else {
                    // Unconnected skill: place close to center
                    const angle = (index / K) * 2 * Math.PI + (Math.abs(hash) % 10) * 0.1;
                    const dist = 30 + K * 2;
                    sx = centerX + Math.cos(angle) * dist;
                    sy = centerY + Math.sin(angle) * dist;
                  }

                  skillNodes.push({
                    skill: item.skill,
                    relevance,
                    x: sx,
                    y: sy,
                    type: "skill" as const,
                    radius: 14,
                    connectedPositionTitles: connectedPos.map((p) => p.title),
                  });
                });
              });

              // 3. Related Job Nodes (outer ring)
              const relatedWithRelevance = relatedJobs
                .map((entry) => {
                  const relevance = maxRelatedScore > 0 ? entry.score / maxRelatedScore : 0;
                  return { ...entry, relevance };
                })
                .sort((a, b) => b.relevance - a.relevance);

              const relatedJobNodes = relatedWithRelevance.map((entry, i) => {
                const relevance = entry.relevance;
                const r = 260 + (1 - relevance) * 35; // 260px to 295px
                const angle = -Math.PI / 2 + Math.PI / relatedCount + (i / relatedCount) * 2 * Math.PI;
                return {
                  ...entry,
                  relevance,
                  x: centerX + r * Math.cos(angle),
                  y: centerY + r * Math.sin(angle),
                  type: "related" as const,
                  radius: 16,
                };
              });

              // 4. Force-directed overlap resolution relaxation loop
              const allNodes = [...positionNodes, ...skillNodes, ...relatedJobNodes];
              const iterations = 50;
              for (let step = 0; step < iterations; step++) {
                for (let i = 0; i < allNodes.length; i++) {
                  const nodeA = allNodes[i];
                  for (let j = i + 1; j < allNodes.length; j++) {
                    const nodeB = allNodes[j];
                    const dx = nodeB.x - nodeA.x;
                    const dy = nodeB.y - nodeA.y;
                    const dist = Math.hypot(dx, dy);
                    const minDist = nodeA.radius + nodeB.radius;
                    if (dist < minDist) {
                      const overlap = minDist - dist;
                      const forceX = ((dx === 0 ? 1 : dx) / (dist === 0 ? 1 : dist)) * overlap * 0.5;
                      const forceY = ((dy === 0 ? 1 : dy) / (dist === 0 ? 1 : dist)) * overlap * 0.5;

                      // Position nodes act as anchored hubs (move very little)
                      const weightA = nodeA.type === "position" ? 0.05 : 0.5;
                      const weightB = nodeB.type === "position" ? 0.05 : 0.5;

                      nodeA.x -= forceX * weightA;
                      nodeA.y -= forceY * weightA;
                      nodeB.x += forceX * weightB;
                      nodeB.y += forceY * weightB;
                    }
                  }
                }
              }

              // Helpers for connectivity checks (Level 0 hover and click similarity style)
              const positionHasSkill = (posTitle: string, skillName: string): boolean => {
                const keywords = positionSkillMap.get(posTitle) || [];
                return keywords.some(
                  (kw) =>
                    kw.toLowerCase() === skillName.toLowerCase() ||
                    kw.toLowerCase().includes(skillName.toLowerCase()) ||
                    skillName.toLowerCase().includes(kw.toLowerCase())
                );
              };

              const relatedHasSkill = (job: Job, skillName: string): boolean => {
                return job.skillsRequired.some(
                  (s) =>
                    s.toLowerCase() === skillName.toLowerCase() ||
                    s.toLowerCase().includes(skillName.toLowerCase()) ||
                    skillName.toLowerCase().includes(s.toLowerCase())
                );
              };

              const positionSharesWithRelated = (posTitle: string, job: Job): boolean => {
                const keywords = positionSkillMap.get(posTitle) || [];
                return job.skillsRequired.some((skill) =>
                  keywords.some((kw) => {
                    const nk = normalizeText(kw);
                    const ns = normalizeText(skill);
                    return nk === ns || nk.includes(ns) || ns.includes(nk);
                  })
                );
              };

              const activePos = hoveredPositionL1 || selectedPosition;
              const activeSkill = hoveredSkillL1 || selectedSkill;
              const activeRelated = hoveredRelatedL1; // related jobs don't have click selection, just hover

              const activeRelatedJob = activeRelated
                ? relatedJobNodes.find((n) => n.job.title === activeRelated)?.job || null
                : null;

              const hasActiveL1 = !!activePos || !!activeSkill || !!activeRelated;

              return (
                <>
                  {/* Concentric Guide rings representing relevance boundary thresholds */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={120}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={0.75}
                    strokeOpacity={0.12}
                  />
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={185}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={0.75}
                    strokeOpacity={0.18}
                  />
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={275}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={0.75}
                    strokeOpacity={0.1}
                    strokeDasharray="4 4"
                  />

                  {/* Connector lines */}
                  {skillNodes.map((skillNode) => {
                    return skillNode.connectedPositionTitles.map((posTitle) => {
                      const posNode = positionNodes.find(
                        (node) => node.title === posTitle,
                      );
                      if (!posNode) return null;

                      // Just appear the connection when hovered or selected
                      const isHighlighted =
                        hoveredPositionL1 === posNode.title ||
                        hoveredSkillL1 === skillNode.skill ||
                        selectedSkill === skillNode.skill ||
                        selectedPosition === posNode.title;
                      const opacity = isHighlighted ? 0.45 : 0;
                      return (
                        <line
                          key={`${posNode.title}-${skillNode.skill}`}
                          x1={posNode.x}
                          y1={posNode.y}
                          x2={skillNode.x}
                          y2={skillNode.y}
                          stroke={selectedFieldNode.color}
                          strokeWidth={1.2}
                          strokeOpacity={opacity}
                          style={{
                            transition: "stroke-opacity 0.2s ease, stroke-width 0.2s ease",
                          }}
                        />
                      );
                    });
                  })}

                  {/* Position-to-related job lines */}
                  {positionNodes.map((positionNode) => {
                    const positionSkills =
                      positionSkillMap.get(positionNode.title) || [];
                    return relatedJobNodes.flatMap((relatedNode) => {
                      const sharedSkills =
                        relatedNode.job.skillsRequired.filter((skill) =>
                          positionSkills.some((positionSkill) => {
                            const normalizedPositionSkill =
                              normalizeText(positionSkill);
                            const normalizedSkill = normalizeText(skill);
                            return (
                              normalizedPositionSkill === normalizedSkill ||
                              normalizedPositionSkill.includes(
                                  normalizedSkill,
                              ) ||
                              normalizedSkill.includes(normalizedPositionSkill)
                            );
                          }),
                        );

                      if (sharedSkills.length === 0) return [];

                      // Just appear the connection when hovered or selected
                      const isHighlighted =
                        hoveredPositionL1 === positionNode.title ||
                        hoveredRelatedL1 === relatedNode.job.title ||
                        selectedPosition === positionNode.title ||
                        selectedPosition === relatedNode.job.title;
                      const opacity = isHighlighted ? 0.35 : 0;

                      return (
                        <line
                          key={`${positionNode.title}-${relatedNode.job.id}`}
                          x1={positionNode.x}
                          y1={positionNode.y}
                          x2={relatedNode.x}
                          y2={relatedNode.y}
                          stroke={selectedFieldNode.color}
                          strokeWidth={1}
                          strokeOpacity={opacity}
                          style={{
                            transition: "stroke-opacity 0.2s ease",
                          }}
                        />
                      );
                    });
                  })}

                  {/* Position nodes */}
                  {positionNodes.map((node) => {
                    const isMatch = positionMatchesCareer(node.title);
                    const isVisible = visiblePositions.has(node.title);
                    const isNodeActive = node.title === activePos;
                    const isConnected =
                      (activePos ? node.title === activePos : false) ||
                      (activeSkill ? positionHasSkill(node.title, activeSkill) : false) ||
                      (activeRelated && activeRelatedJob ? positionSharesWithRelated(node.title, activeRelatedJob) : false);
                    const isDimmed = hasActiveL1 && !isConnected;

                    const isRightSide = Math.cos(node.angle) > 0.05;
                    const textX = isRightSide ? node.x - dotR - 7 : node.x + dotR + 7;
                    const textAnchor = isRightSide ? "end" : "start";
                    return (
                      <g
                        key={node.title}
                        onClick={() => {
                          setSelectedPosition((prev) =>
                            prev === node.title ? null : node.title
                          );
                          setSelectedSkill(null); // clear skill selection to prevent overlapping filters
                        }}
                        onMouseEnter={() => setHoveredPositionL1(node.title)}
                        onMouseLeave={() => setHoveredPositionL1(null)}
                        style={{
                          cursor: "pointer",
                          opacity: isVisible ? (isDimmed ? 0.25 : 1) : 0,
                          transition: "opacity 0.15s",
                        }}
                      >
                        {isNodeActive && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={dotR + 7}
                            fill="none"
                            stroke={selectedFieldNode.color}
                            strokeWidth={1.5}
                            strokeOpacity={0.5}
                            style={{
                              transition: "all 0.15s",
                            }}
                          />
                        )}
                        {isMatch && !isNodeActive && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={dotR + 5}
                            fill="none"
                            stroke={ACCENT}
                            strokeWidth={0.75}
                            strokeOpacity={0.3}
                          />
                        )}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={dotR}
                          fill={
                            isNodeActive
                              ? "var(--text)"
                              : isMatch
                                ? ACCENT
                                : selectedFieldNode.color
                          }
                          fillOpacity={isDimmed ? 0.4 : 0.88}
                          stroke={isMatch ? ACCENT : "var(--border)"}
                          strokeWidth={0.5}
                          strokeOpacity={0.4}
                        />
                        <text
                          x={textX}
                          y={node.y + 3.5}
                          textAnchor={textAnchor}
                          style={{
                            fontSize: 11,
                            fontWeight: isNodeActive ? 600 : isMatch ? 500 : 400,
                            fill: isDimmed
                              ? "var(--text-tertiary)"
                              : isNodeActive
                                ? "var(--text)"
                                : isMatch
                                  ? ACCENT
                                  : "var(--text)",
                            fillOpacity: isDimmed ? 0.5 : 1,
                            transition: "all 0.15s",
                          }}
                        >
                          {node.title.length > 22
                            ? node.title.slice(0, 20) + "…"
                            : node.title}
                        </text>
                      </g>
                    );
                  })}

                  {/* Skill nodes */}
                  {skillNodes.map((node) => {
                    const relatedPositions =
                      skillPositionMap.get(node.skill) || [];
                    const isNodeActive = node.skill === activeSkill;
                    const isConnected =
                      (activePos ? positionHasSkill(activePos, node.skill) : false) ||
                      (activeSkill ? node.skill === activeSkill : false) ||
                      (activeRelated && activeRelatedJob ? relatedHasSkill(activeRelatedJob, node.skill) : false);
                    const isDimmed = hasActiveL1 && !isConnected;
                    const isOwned = userHasSkill(node.skill);

                    const isCareerMatch = relatedPositions.some((title) =>
                      positionMatchesCareer(title),
                    );
                    const isRightSide = node.x > 500;
                    const textX = isRightSide ? node.x + skillR + 8 : node.x - skillR - 8;
                    const textAnchor = isRightSide ? "start" : "end";
                    return (
                      <g
                        key={node.skill}
                        onClick={() =>
                          setSelectedSkill((prev) =>
                            prev === node.skill ? null : node.skill,
                          )
                        }
                        onMouseEnter={() => setHoveredSkillL1(node.skill)}
                        onMouseLeave={() => setHoveredSkillL1(null)}
                        style={{
                          cursor: "pointer",
                          opacity: isDimmed ? 0.25 : 1,
                          transition: "opacity 0.15s",
                        }}
                      >
                        {isNodeActive && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={skillR + 7}
                            fill="none"
                            stroke={selectedFieldNode.color}
                            strokeWidth={1.5}
                            strokeOpacity={0.5}
                            style={{
                              transition: "all 0.15s",
                            }}
                          />
                        )}
                        {isCareerMatch && !isNodeActive && !isOwned && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={skillR + 5}
                            fill="none"
                            stroke="var(--text)"
                            strokeWidth={0.75}
                            strokeOpacity={0.2}
                          />
                        )}
                        <rect
                          x={node.x - skillR}
                          y={node.y - skillR}
                          width={skillR * 2}
                          height={skillR * 2}
                          rx={1}
                          fill={
                            isNodeActive ? "var(--text)" : selectedFieldNode.color
                          }
                          fillOpacity={isDimmed ? 0.35 : isOwned ? 0.95 : 0.65}
                          stroke={isNodeActive ? "var(--text)" : isOwned ? (theme === "dark" ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.85)") : "var(--border)"}
                          strokeWidth={isNodeActive ? 1 : isOwned ? 1.75 : 0.5}
                          transform={`rotate(45 ${node.x} ${node.y})`}
                        />
                        <text
                          x={textX}
                          y={node.y + 3.5}
                          textAnchor={textAnchor}
                          style={{
                            fontSize: 11,
                            fontWeight: isNodeActive ? 600 : 400,
                            fill: isDimmed
                              ? "var(--text-tertiary)"
                              : isNodeActive
                                ? "var(--text)"
                                : "var(--text-secondary)",
                            fillOpacity: isDimmed ? 0.5 : 1,
                            transition: "all 0.15s",
                          }}
                        >
                          {node.skill.length > 24
                            ? node.skill.slice(0, 22) + "…"
                            : node.skill}
                        </text>
                      </g>
                    );
                  })}

                  {/* Related job nodes */}
                  {relatedJobNodes.map((node) => {
                    const isNodeActive = node.job.title === activeRelated || selectedPosition === node.job.title;
                    const isConnected =
                      (activePos ? positionSharesWithRelated(activePos, node.job) : false) ||
                      (activeSkill ? relatedHasSkill(node.job, activeSkill) : false) ||
                      (activeRelated ? node.job.title === activeRelated : false);
                    const isDimmed = hasActiveL1 && !isConnected;

                    const isCareerMatch = positionMatchesCareer(node.job.title);
                    const isRightSide = node.x > 500;
                    const textX = isRightSide ? node.x + dotR + 8 : node.x - dotR - 8;
                    const textAnchor = isRightSide ? "start" : "end";
                    return (
                      <g
                        key={node.job.id}
                        onClick={() => drillToLevel2(node.job.title)}
                        onMouseEnter={() => setHoveredRelatedL1(node.job.title)}
                        onMouseLeave={() => setHoveredRelatedL1(null)}
                        style={{
                          cursor: "pointer",
                          opacity: isDimmed ? 0.25 : 1,
                          transition: "opacity 0.15s",
                        }}
                      >
                        {isNodeActive && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={dotR + 8}
                            fill="none"
                            stroke={selectedFieldNode.color}
                            strokeWidth={1.5}
                            strokeOpacity={0.5}
                            style={{
                              transition: "all 0.15s",
                            }}
                          />
                        )}
                        {isCareerMatch && !isNodeActive && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={dotR + 6}
                            fill="none"
                            stroke={ACCENT}
                            strokeWidth={0.75}
                            strokeOpacity={0.2}
                          />
                        )}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={dotR + 1}
                          fill={
                            isNodeActive
                              ? "var(--text)"
                              : node.fieldConnected
                                ? ACCENT
                                : selectedFieldNode.color
                          }
                          fillOpacity={isDimmed ? 0.3 : 0.55}
                          stroke={isNodeActive ? "var(--text)" : "var(--border)"}
                          strokeWidth={0.5}
                          strokeOpacity={0.5}
                        />
                        <text
                          x={textX}
                          y={node.y + 3.5}
                          textAnchor={textAnchor}
                          style={{
                            fontSize: 11,
                            fontWeight: isNodeActive ? 600 : 400,
                            fill: isDimmed
                              ? "var(--text-tertiary)"
                              : isNodeActive
                                ? "var(--text)"
                                : "var(--text-secondary)",
                            fillOpacity: isDimmed ? 0.5 : 1,
                            transition: "all 0.15s",
                          }}
                        >
                          {node.job.title.length > 24
                            ? node.job.title.slice(0, 22) + "…"
                            : node.job.title}
                        </text>
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </svg>

          {/* Level 1 tooltips */}
          {hoveredPositionL1 &&
            (() => {
              const job = jobs.find((j) => j.title === hoveredPositionL1);
              if (!job) return null;
              const pct = matchPct(job);
              return (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#1E1E1E",
                    color: "#FFFFFF",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "6px 14px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    animation: "fadeIn 0.12s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ color: selectedFieldNode.color }}>●</span>
                  <span>{job.title}</span>
                  <span style={{ opacity: 0.6 }}>|</span>
                  <span style={{ color: "#52B788", fontWeight: 600 }}>{pct}% Match</span>
                  <span style={{ opacity: 0.6 }}>|</span>
                  <span style={{ opacity: 0.8 }}>Demand: {job.demand}</span>
                </div>
              );
            })()}

          {hoveredSkillL1 &&
            (() => {
              const isOwned = userHasSkill(hoveredSkillL1);
              const connectionsCount = skillPositionMap.get(hoveredSkillL1)?.length || 0;
              return (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#1E1E1E",
                    color: "#FFFFFF",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "6px 14px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    animation: "fadeIn 0.12s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ color: "#52B788" }}>◆</span>
                  <span>{hoveredSkillL1}</span>
                  {isOwned && (
                    <>
                      <span style={{ opacity: 0.6 }}>|</span>
                      <span style={{ color: "#52B788", fontWeight: 600 }}>Owned</span>
                    </>
                  )}
                  <span style={{ opacity: 0.6 }}>|</span>
                  <span style={{ opacity: 0.8 }}>Connected to {connectionsCount} roles</span>
                </div>
              );
            })()}

          {hoveredRelatedL1 &&
            (() => {
              const job = jobs.find((j) => j.title === hoveredRelatedL1);
              if (!job) return null;
              const pct = matchPct(job);
              return (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#1E1E1E",
                    color: "#FFFFFF",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "6px 14px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    animation: "fadeIn 0.12s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ color: "#52B788" }}>●</span>
                  <span>{job.title} (Adjacent)</span>
                  <span style={{ opacity: 0.6 }}>|</span>
                  <span style={{ color: "#52B788", fontWeight: 600 }}>{pct}% Match</span>
                  <span style={{ opacity: 0.6 }}>|</span>
                  <span style={{ opacity: 0.8 }}>Demand: {job.demand}</span>
                </div>
              );
            })()}

          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "var(--text-tertiary)",
              marginTop: 12,
              marginBottom: 16,
            }}
          >
            Click a position node to see open jobs
          </p>

          {selectedSkill && (
            <div
              style={{
                maxWidth: 960,
                margin: "0 auto 16px",
                padding: "10px 14px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              <span style={{ color: "var(--text)", fontWeight: 600 }}>
                {selectedSkill}
              </span>{" "}
              connects to {skillPositionMap.get(selectedSkill)?.length || 0}{" "}
              position
              {skillPositionMap.get(selectedSkill)?.length === 1 ? "" : "s"}
              .&nbsp;
              {skillPositionMap.get(selectedSkill)?.length ? (
                <>
                  Related positions:{" "}
                  {skillPositionMap.get(selectedSkill)?.join(", ")}
                </>
              ) : null}
            </div>
          )}

          {selectedPosition && (
            <div
              style={{
                maxWidth: 960,
                margin: "0 auto 16px",
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                fontSize: 12,
                color: "var(--text-secondary)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span style={{ color: "var(--text)", fontWeight: 600 }}>
                  {selectedPosition}
                </span>{" "}
                is selected. Showing required skills and related roles on the map.
              </div>
              <button
                onClick={() => drillToLevel2(selectedPosition)}
                style={{
                  background: ACCENT,
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                View Open Jobs & Market Data
              </button>
            </div>
          )}

          {!selectedSkill && !selectedPosition && relatedJobs.length > 0 && (
            <div
              style={{
                maxWidth: 960,
                margin: "0 auto 16px",
                padding: "10px 14px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              Related jobs:{" "}
              {relatedJobs.map((entry) => entry.job.title).join(", ")}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          LEVEL 2 — Job Market
      ══════════════════════════════════════════ */}
      {drillLevel === 2 && selectedPosition && selectedFieldNode && (
        <div style={{ padding: "16px 24px 40px", position: "relative" }}>
          <button
            onClick={() => drillToLevel1()}
            style={{
              position: "absolute",
              top: 16,
              left: 24,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              padding: "8px",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          {/* Position header */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <p
              style={{
                fontSize: 10,
                color: "var(--text-tertiary)",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
              }}
            >
              {selectedFieldNode.label}
            </p>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 400,
                color: selectedFieldNode.color,
                margin: 0,
                fontFamily: "'Newsreader', serif",
              }}
            >
              {selectedPosition}
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-tertiary)",
                marginTop: 4,
              }}
            >
              {positionJobs.length} opening
              {positionJobs.length !== 1 ? "s" : ""} available
            </p>
          </div>

          {/* Job cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 12,
              maxWidth: 960,
              margin: "0 auto",
            }}
          >
            {positionJobs.map((job, i) => {
              const pct = matchPct(job);
              return (
                <div
                  key={job.id}
                  className="card"
                  style={{
                    padding: "18px 20px",
                    opacity: 1,
                    transform: "translateY(0)",
                    transition: `opacity 0.3s ease ${i * 40}ms, transform 0.3s ease ${i * 40}ms`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--text)",
                        margin: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      {job.title}
                    </h3>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 7px",
                        borderRadius: 3,
                        background: `${demandColor(job.demand)}12`,
                        color: demandColor(job.demand),
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {job.demand}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      margin: "0 0 10px",
                    }}
                  >
                    {job.company}
                  </p>

                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      margin: "0 0 12px",
                      lineHeight: 1.5,
                    }}
                  >
                    {job.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 4,
                      marginBottom: 12,
                    }}
                  >
                    {job.skillsRequired.slice(0, 4).map((skill) => {
                      const covered = profile.courses.some(
                        (c) =>
                          c.toLowerCase().includes(skill.toLowerCase()) ||
                          skill.toLowerCase().includes(c.toLowerCase()),
                      );
                      return (
                        <span
                          key={skill}
                          style={{
                            fontSize: 10,
                            fontWeight: 500,
                            padding: "2px 7px",
                            borderRadius: 3,
                            background: covered
                              ? "rgba(45,106,79,0.1)"
                              : "var(--surface)",
                            color: covered ? ACCENT : "var(--text-secondary)",
                          }}
                        >
                          {covered ? "✓" : "+"} {skill}
                        </span>
                      );
                    })}
                    {job.skillsRequired.length > 4 && (
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--text-tertiary)",
                          padding: "2px 4px",
                        }}
                      >
                        +{job.skillsRequired.length - 4} more
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      RM {job.salaryMin.toLocaleString()} –{" "}
                      {job.salaryMax.toLocaleString()}
                    </span>
                    {careerType && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background:
                            pct >= 70 ? `${ACCENT}12` : "var(--surface)",
                          color: pct >= 70 ? ACCENT : "var(--text-secondary)",
                        }}
                      >
                        {pct}% match
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chatbot Button */}
          <button
            onClick={() => setIsChatOpen(true)}
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              zIndex: 99,
              background: ACCENT,
              color: "white",
              border: "none",
              borderRadius: "50px",
              padding: "14px 24px",
              fontSize: "13.5px",
              fontWeight: 600,
              boxShadow: "0 8px 24px rgba(45, 106, 79, 0.3)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 12px 28px rgba(45, 106, 79, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(45, 106, 79, 0.3)";
            }}
          >
            <Sparkles size={18} className="animate-pulse" />
            <span>AI Career Simulator</span>
          </button>

          {/* Chatbot Sidebar Backdrop */}
          {isChatOpen && (
            <div
              onClick={() => setIsChatOpen(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.45)",
                backdropFilter: "blur(3px)",
                zIndex: 998,
                transition: "opacity 0.3s ease",
              }}
            />
          )}

          {/* Chatbot Sidebar */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "440px",
              maxWidth: "100vw",
              zIndex: 999,
              background: "var(--surface)",
              borderLeft: "1px solid var(--border)",
              boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              transform: isChatOpen ? "translateX(0)" : "translateX(100%)",
              transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Sidebar Header */}
            <div
              style={{
                padding: "20px 24px 16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={18} style={{ color: ACCENT }} />
                  <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>
                    AI Career Assistant
                  </span>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    padding: 4,
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  border: "1px solid var(--border)",
                }}
              >
                <Briefcase size={14} style={{ color: selectedFieldNode.color }} />
                <span style={{ color: "var(--text-secondary)" }}>Exploring Role:</span>
                <strong style={{ color: "var(--text)" }}>{selectedPosition}</strong>
              </div>
            </div>

            {/* Sidebar Body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Conversation Area */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        background:
                          msg.sender === "user"
                            ? ACCENT
                            : "var(--bg)",
                        color: msg.sender === "user" ? "white" : "var(--text)",
                        borderRadius: msg.sender === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                        padding: "10px 14px",
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        border: msg.sender === "user" ? "none" : "1px solid var(--border)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {/* Parse markdown-like bolding **text** */}
                      {msg.text.split("**").map((chunk, index) =>
                        index % 2 === 1 ? <strong key={index}>{chunk}</strong> : chunk
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Sidebar Footer */}
            {scenario ? (
              <div
                style={{
                  padding: "16px 24px 20px",
                  borderTop: "1px solid var(--border)",
                  background: "var(--bg)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-tertiary)", fontWeight: 600 }}>
                  <span style={{ color: ACCENT }}>SIMULATOR RUNNING</span>
                  <span>STEP {scenarioStep + 1} OF 3</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {scenario.steps[scenarioStep].options.map((opt: string, idx: number) => {
                    const isCorrect = idx === scenario.steps[scenarioStep].correctIndex;
                    const isChosen = selectedAnswer === idx;
                    let btnBg = "var(--surface)";
                    let btnBorder = "1px solid var(--border)";
                    let btnColor = "var(--text)";

                    if (selectedAnswer !== null) {
                      if (isCorrect) {
                        btnBg = "rgba(45, 106, 79, 0.1)";
                        btnBorder = `1px solid ${ACCENT}`;
                        btnColor = ACCENT;
                      } else if (isChosen) {
                        btnBg = "rgba(193, 69, 58, 0.08)";
                        btnBorder = "1px solid #C1453A";
                        btnColor = "#C1453A";
                      } else {
                        btnBg = "var(--surface)";
                        btnColor = "var(--text-tertiary)";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(idx)}
                        disabled={selectedAnswer !== null}
                        style={{
                          background: btnBg,
                          border: btnBorder,
                          color: btnColor,
                          borderRadius: 6,
                          padding: "10px 12px",
                          fontSize: 11.5,
                          textAlign: "left",
                          cursor: selectedAnswer !== null ? "default" : "pointer",
                          transition: "all 0.15s ease",
                          lineHeight: 1.4,
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {selectedAnswer !== null && answerFeedback && (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 6,
                      fontSize: 11.5,
                      lineHeight: 1.4,
                      background: "var(--surface)",
                      borderLeft: `3px solid ${selectedAnswer === scenario.steps[scenarioStep].correctIndex ? ACCENT : "#C1453A"}`,
                      color: selectedAnswer === scenario.steps[scenarioStep].correctIndex ? "var(--text-secondary)" : "#C1453A",
                      border: "1px solid var(--border)",
                      borderLeftWidth: 3,
                    }}
                  >
                    {answerFeedback}
                  </div>
                )}

                {selectedAnswer !== null && (
                  <button
                    onClick={handleNextStep}
                    style={{
                      background: selectedAnswer === scenario.steps[scenarioStep].correctIndex ? ACCENT : "transparent",
                      border: selectedAnswer === scenario.steps[scenarioStep].correctIndex ? "none" : "1px solid var(--border)",
                      borderRadius: 6,
                      padding: "10px 0",
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: selectedAnswer === scenario.steps[scenarioStep].correctIndex ? "white" : "var(--text-secondary)",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {selectedAnswer === scenario.steps[scenarioStep].correctIndex
                      ? scenarioStep < 2
                        ? "Proceed to Next Step"
                        : "Complete Simulation 🏆"
                      : "Try Another Option"}
                  </button>
                )}
              </div>
            ) : (
              <div
                style={{
                  padding: "14px 24px 20px",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {/* Suggestion Chips */}
                {chatMessages.length === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <p style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                      Choose an option to explore:
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {[
                        "Experience the Job 🚀",
                        "What is the average salary?",
                        "What tools should I learn?",
                        "What is the daily routine?",
                        "Is this job stressful?",
                      ].map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSendMessage(q)}
                          style={{
                            background: "var(--bg)",
                            border: "1px solid var(--border)",
                            borderRadius: 20,
                            padding: "6px 12px",
                            fontSize: 11,
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = ACCENT;
                            e.currentTarget.style.color = "var(--text)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.color = "var(--text-secondary)";
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Ask a question or try the simulator..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    style={{
                      flex: 1,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      padding: "9px 12px",
                      fontSize: 12,
                      color: "var(--text)",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    style={{
                      background: ACCENT,
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      width: 34,
                      height: 34,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const SITE = {
  username: "ego1s1",
  displayName: "Priyanshu Sharma",
  shortName: "Priyanshu",
  handle: "@ego1s1",
  email: "priyanshusharma1803@outlook.com",
  github: "https://github.com/ego1s1",
  githubUsername: "ego1s1",
  linkedin: "https://www.linkedin.com/in/ego1s1",
  domain: "ego1s1.vercel.app",
  siteUrl: "https://ego1s1.vercel.app",
} as const;

export const ABOUT_MD = `# hey — i'm priyanshu!

i'm an **ECE student @ MIT Manipal '27** who lights up when **hardware talks to software** — **embedded C/C++**, **MCUs**, and that sweet spot where code meets circuits.

i love building **fast, minimal CLI tools**, getting lost in **FOSS** rabbit holes, and making my terminal feel like home

---

### outside code

you'll catch me **lifting at the gym** 💪, **shredding metal on my guitar** 🎸, or **binging anime** till 2am — always down to chat about music, tech, or the latest plot twist!`;

export const EXP_MD = `# experience.log — where i've been

### upcoming → embedded software intern @ **Honeywell Aerospace**
> can't wait to dive into high-reliability firmware where every byte counts!

---

### IT Intern @ **Kotak Life Insurance** — Mumbai (on-site) · *Dec 2025 – Feb 2026*

helping the IT Apps team build a **secure, snappy document vault** — **Next.js + Flask + PostgreSQL + Docker**, with **Redis/RQ** for AI search. learned a ton about **RBAC**, clean APIs, and shipping enterprise-grade stuff securely

---

### Software Engineer Intern @ [Awkward Studio](https://awkwardstudio.in) — Remote · *Oct 2025 – Jan 2026*

wore many hats across **client projects** — frontend polish, backend logic, and everything in-between. loved the chaos of **shipping fast** and iterating with real users

---

### Training Intern @ **RDCIS, SAIL (C&IT)** — Ranchi · *May – Jun 2025*

built a **gate-entry system** for employees — **centralized DB + auto movement tracking**. my first taste of **real-world infra** where reliability > cleverness`;

export const SKILL_GROUPS = [
  {
    title: "EMBEDDED SYSTEMS & FIRMWARE",
    items: [
      { name: "Embedded C", color: "#7dcfff" },
      { name: "Embedded C++", color: "#7aa2f7" },
      { name: "ARM & MCUs", color: "#e0af68" },
      { name: "RTOS & Linux", color: "#ff9e64" },
      { name: "SPI / I2C / CAN", color: "#9ece6a" },
      { name: "GDB & Debug", color: "#bb9af7" },
    ],
  },
  {
    title: "PROGRAMMING LANGUAGES",
    items: [
      { name: "C++", color: "#7aa2f7" },
      { name: "Java", color: "#f7768e" },
      { name: "Python", color: "#e0af68" },
      { name: "TypeScript", color: "#7dcfff" },
      { name: "JavaScript", color: "#ff9e64" },
      { name: "HTML/CSS", color: "#bb9af7" },
    ],
  },
  {
    title: "BACKEND, DEVOPS & TOOLS",
    items: [
      { name: "Docker", color: "#7dcfff" },
      { name: "PostgreSQL", color: "#7aa2f7" },
      { name: "Redis", color: "#f7768e" },
      { name: "Git", color: "#f7768e" },
      { name: "Vim / Neovim", color: "#9ece6a" },
      { name: "Linux Shell", color: "#e0af68" },
    ],
  },
] as const;

export const PROJECTS = [
  {
    id: "file-repo",
    name: "file-repo",
    event: "Kotak Life",
    description: "Secure document vault — Next.js · Flask · Postgres · Redis/RQ vector search",
    verbose: "Enterprise-grade doc vault with RBAC, presigned uploads, audit logs, and semantic search via pgvector + Redis queue workers. Built for Kotak Life IT Apps during on-site internship.",
    stack: ["Next.js", "Flask", "PostgreSQL", "Docker", "Redis/RQ", "pgvector"],
    url: "https://github.com/ego1s1",
    lang: "TypeScript",
    color: "#7dcfff",
  },
  {
    id: "shell-assist",
    name: "shell-assist",
    event: "Hacksagon '25 Winner",
    description: "Natural language → validated shell commands · Python · Ollama",
    verbose: "Local-first AI that translates plain English to safe, validated shell commands. Uses Ollama for inference, AST parsing for validation, and dry-run execution. Won IEEE Hacksagon '25.",
    stack: ["Python", "Ollama", "Bash AST", "Validation"],
    url: "https://github.com/ego1s1/shell-assist",
    lang: "Python",
    color: "#bb9af7",
  },
  {
    id: "gate-entry",
    name: "gate-entry",
    event: "SAIL · RDCIS",
    description: "Employee access & movement tracking · Secure DB · Auth workflows",
    verbose: "On-site at SAIL RDCIS — built gate-entry for plant employees with centralized DB, RFID-ready auth, and automated in/out movement tracking with compliance reports.",
    stack: ["TypeScript", "PostgreSQL", "Auth", "Tracking"],
    url: "https://gate-entry-sigma.vercel.app/",
    githubUrl: "https://github.com/ego1s1/gate-entry",
    lang: "TypeScript",
    color: "#a7c080",
  },
  {
    id: "yatragpt",
    name: "yatragpt",
    event: "Finova 2nd",
    description: "AI travel assistant · Recommendations · REST APIs",
    verbose: "Finova hackathon runner-up — AI itinerary planner with scalable frontend, REST integrations, and personalized recommendations. Team of 4, built in 24h.",
    stack: ["Next.js", "REST", "AI", "Maps"],
    url: "https://github.com/vee1e/finova",
    lang: "Python",
    color: "#dbbc7f",
  },
] as const;

export const HERO_META = {
  os: "Arch Linux / macOS",
  device: "Apple MacBook Air M2",
  cgpa: "CGPA 7.33",
  role: "Upcoming Embedded Software Intern @ Honeywell Aerospace",
  prev: "IT Intern @ Kotak Life · SWE Intern @ Awkward Studio",
  honors: "IEEE Hacksagon '25 Winner",
  host: "MIT Manipal ECE '27",
} as const;

export function buildResumeMarkdown() {
  const lines: string[] = [];
  lines.push(`# ${SITE.displayName} — Resume`);
  lines.push("");
  lines.push(`${SITE.handle} · ${SITE.email} · ${SITE.github} · ${SITE.linkedin}`);
  lines.push(`${SITE.domain} · ${HERO_META.host} · ${HERO_META.cgpa}`);
  lines.push("");
  lines.push(`${HERO_META.role} · ${HERO_META.honors}`);
  lines.push("");
  lines.push("---");
  lines.push(ABOUT_MD);
  lines.push("");
  lines.push("---");
  lines.push(EXP_MD);
  lines.push("");
  lines.push("---");
  lines.push("## TECH STACK");
  SKILL_GROUPS.forEach((g) => {
    lines.push(`\n### ${g.title}`);
    lines.push(g.items.map((i) => `- ${i.name}`).join("\n"));
  });
  lines.push("");
  lines.push("---");
  lines.push("## PROJECTS");
  PROJECTS.forEach((p) => {
    lines.push(`\n### ${p.name}${p.event ? ` — ${p.event}` : ""}`);
    lines.push(p.description);
    lines.push(p.verbose);
    lines.push(`Stack: ${p.stack.join(" · ")}`);
    lines.push(`Link: ${p.url} · Lang: ${p.lang}`);
  });
  lines.push("");
  lines.push("---");
  lines.push(`Refs: ${SITE.github} · ${SITE.linkedin} · mailto:${SITE.email}`);
  return lines.join("\n");
}

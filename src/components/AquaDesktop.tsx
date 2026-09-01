/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect } from "react";
import LZString from "lz-string";
import { SITE, ABOUT_MD, EXP_MD, SKILL_GROUPS, PROJECTS, HERO_META, buildResumeMarkdown } from "@/lib/portfolio";

export default function AquaDesktop() {
  useEffect(() => {
    // load aqua web-components for <aqua-progress>
    const wc = document.createElement("script");
    wc.type = "module";
    wc.src = "/packages/web-components/dist/index.js";
    document.head.appendChild(wc);

    // expose portfolio globally for any legacy scripts (optional)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).PORTFOLIO = { SITE, ABOUT_MD, EXP_MD, SKILL_GROUPS, PROJECTS, HERO_META, buildResumeMarkdown };

    // --- boot (original boot.js, now integrated, with Apple + chime) ---
    const bootParams = new URLSearchParams(window.location.search);
    const shouldBoot = bootParams.get("boot") !== "0";
    const chimeOn = bootParams.get("sound") !== "0" && bootParams.get("chime") !== "0";
    const DURATION = bootParams.get("boot") === "slow" ? 6000 : 700;

    let bootEl: HTMLElement | null = null;
    if (shouldBoot) {
      bootEl = document.createElement("div");
      bootEl.className = "boot aqua";
      bootEl.innerHTML =
        '<div class="boot-panel">' +
        '<div class="boot-apple" aria-hidden="true"></div>' +
        '<div class="boot-word">Mac OS X</div>' +
        '<aqua-progress class="boot-bar" value="0" max="100"></aqua-progress>' +
        "</div>";
      document.body.appendChild(bootEl);
      document.documentElement.classList.add("booting");

      let chimeAudio: HTMLAudioElement | null = null;
      const playChime = () => {
        if (!chimeOn) return;
        try {
          if (!chimeAudio) {
            chimeAudio = new Audio("/assets/startup.wav");
            chimeAudio.volume = 0.85;
            chimeAudio.preload = "auto";
          }
          const p = chimeAudio.play();
          if (p && (p as Promise<void>).catch) (p as Promise<void>).catch(() => fallbackChime());
        } catch {
          fallbackChime();
        }
      };
      const fallbackChime = () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (!AC) return;
          const ctx: AudioContext = new AC();
          if (ctx.state === "suspended") ctx.resume().catch(() => {});
          const now = ctx.currentTime;
          const freqs = [174.61, 220.0, 261.63, 349.23];
          freqs.forEach((f) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filt = ctx.createBiquadFilter();
            osc.type = "triangle";
            osc.frequency.value = f;
            filt.type = "lowpass";
            filt.frequency.value = 4200;
            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);
            osc.connect(filt).connect(gain).connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 1.4);
          });
          setTimeout(() => {
            try {
              ctx.close();
            } catch {}
          }, 1800);
        } catch {}
      };
      let chimed = false;
      const tryChime = () => {
        if (chimed || !chimeOn) return;
        chimed = true;
        playChime();
      };
      setTimeout(tryChime, 80);
      window.addEventListener("click", tryChime, { once: true });
      window.addEventListener("keydown", tryChime, { once: true });
      bootEl.addEventListener("click", tryChime, { once: true });

      const bar = bootEl.querySelector(".boot-bar") as HTMLElement | null;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        bootEl?.classList.add("out");
        document.documentElement.classList.remove("booting");
        bootEl?.addEventListener("transitionend", () => bootEl?.remove(), { once: true });
        setTimeout(() => bootEl?.remove(), 1200);
      };
      const ease = (t: number) => t * t * (3 - 2 * t);
      const t0 = performance.now();
      const frame = () => {
        if (done) return;
        const p = Math.min(1, (performance.now() - t0) / DURATION);
        bar?.setAttribute("value", (100 * ease(p)).toFixed(1));
        if (p >= 1) {
          setTimeout(finish, 180);
          return;
        }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
      setTimeout(finish, DURATION + 1500);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).replayBoot = () => window.location.reload();
      window.addEventListener("keydown", finish, { once: true });
      bootEl.addEventListener("click", finish);
    }

    // --- clock ---
    const clockEl = document.getElementById("menu-clock");
    const tick = () => {
      if (!clockEl) return;
      const d = new Date();
      let h = d.getHours();
      const m = d.getMinutes();
      const ap = h < 12 ? "AM" : "PM";
      h = h % 12 || 12;
      clockEl.textContent = h + ":" + String(m).padStart(2, "0") + " " + ap;
    };
    tick();
    const clockIv = setInterval(tick, 10000);

    // --- desktop window manager (ported from js/desktop.js) ---
    const desk = document.querySelector(".desktop") as HTMLElement | null;
    if (!desk) return;
    let z = 10;
    let cascade = 0;
    const openWins: Record<string, HTMLElement> = {};

    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const focusWin = (win: HTMLElement) => {
      win.style.zIndex = String(++z);
      document.querySelectorAll(".win").forEach((w) => w.classList.toggle("inactive", w !== win));
      win.classList.remove("inactive");
    };

    const drag = (win: HTMLElement, handle: HTMLElement) => {
      handle.style.touchAction = "none";
      handle.addEventListener("pointerdown", (e: PointerEvent) => {
        if ((e.target as HTMLElement).closest(".title-bar-controls")) return;
        focusWin(win);
        const sx = e.clientX, sy = e.clientY;
        const ox = win.offsetLeft, oy = win.offsetTop;
        (handle as HTMLElement).setPointerCapture(e.pointerId);
        const mv = (ev: PointerEvent) => {
          win.style.left = Math.min(Math.max(0, ox + ev.clientX - sx), window.innerWidth - 60) + "px";
          win.style.top = Math.min(Math.max(22, oy + ev.clientY - sy), window.innerHeight - 40) + "px";
        };
        const up = () => {
          handle.removeEventListener("pointermove", mv as EventListener);
          handle.removeEventListener("pointerup", up as EventListener);
          handle.removeEventListener("pointercancel", up as EventListener);
        };
        handle.addEventListener("pointermove", mv as EventListener);
        handle.addEventListener("pointerup", up as EventListener);
        handle.addEventListener("pointercancel", up as EventListener);
      });
    };

    const makeWin = (o: { title: string; bodyHTML: string; cls?: string; w?: number; x?: number; y?: number; id?: string }) => {
      const win = document.createElement("div");
      win.className = "win aqua portfolio " + (o.cls || "");
      if (o.id) win.dataset.winId = o.id;
      if (o.w) win.style.width = Math.min(o.w, window.innerWidth - 12) + "px";
      const ww = Math.min(o.w || 380, window.innerWidth - 12);
      win.style.left = Math.max(6, Math.min(o.x ?? 120 + cascade * 26, window.innerWidth - ww - 6)) + "px";
      win.style.top = Math.max(22, Math.min(o.y ?? 64 + cascade * 26, window.innerHeight - 120)) + "px";
      win.innerHTML =
        '<div class="title-bar">' +
        '<div class="title-bar-controls">' +
        '<button aria-label="Close"><span>&times;</span></button>' +
        '<button aria-label="Minimize"><span>&minus;</span></button>' +
        '<button aria-label="Zoom"><span>+</span></button>' +
        "</div>" +
        '<div class="title-bar-text">' + esc(o.title) + "</div>" +
        '<div style="width:49px;flex:0 0 auto"></div>' +
        "</div>" +
        '<div class="win-content">' + o.bodyHTML + "</div>";
      desk.appendChild(win);

      const closeBtn = win.querySelector('[aria-label="Close"]') as HTMLElement;
      const minBtn = win.querySelector('[aria-label="Minimize"]') as HTMLElement;
      const zoomBtn = win.querySelector('[aria-label="Zoom"]') as HTMLElement;
      closeBtn.addEventListener("click", () => {
        win.remove();
        if (o.id && openWins[o.id] === win) delete openWins[o.id];
        if (win.dataset.winId && openWins[win.dataset.winId] === win) delete openWins[win.dataset.winId];
      });
      minBtn.addEventListener("click", () => win.classList.toggle("inactive"));
      let zoomed = false;
      zoomBtn.addEventListener("click", () => {
        const content = win.querySelector(".win-content") as HTMLElement;
        if (!zoomed) {
          win.dataset._w = win.style.width;
          win.dataset._l = win.style.left;
          win.dataset._t = win.style.top;
          win.style.left = "6px";
          win.style.top = "22px";
          win.style.width = window.innerWidth - 12 + "px";
          win.style.height = window.innerHeight - 28 + "px";
          if (content) content.style.height = "calc(100% - 26px)";
        } else {
          win.style.width = win.dataset._w || "";
          win.style.left = win.dataset._l || "";
          win.style.top = win.dataset._t || "";
          win.style.height = "";
          if (content) content.style.height = "";
        }
        zoomed = !zoomed;
      });

      drag(win, win.querySelector(".title-bar") as HTMLElement);
      win.addEventListener("pointerdown", () => focusWin(win));
      focusWin(win);
      cascade = (cascade + 1) % 8;
      return win;
    };

    const aboutBody = () =>
      '<div class="doc">' +
      '<div class="about-head">' +
      '<img src="/assets/avatar.jpeg" alt="Priyanshu">' +
      "<div>" +
      '<div class="name">' + esc(SITE.displayName) + "</div>" +
      '<div class="role">' + esc(HERO_META.role) + "</div>" +
      '<div class="meta">' + esc(HERO_META.host) + " · " + esc(HERO_META.cgpa) + " · " + esc(HERO_META.honors) + "</div>" +
      "</div>" +
      "</div>" +
      '<div class="info-grid"><dt>OS</dt><dd>' + esc(HERO_META.os) + '</dd><dt>Device</dt><dd>' + esc(HERO_META.device) + '</dd><dt>Host</dt><dd>' + esc(HERO_META.host) + '</dd><dt>Prev</dt><dd>' + esc(HERO_META.prev) + '</dd><dt>Handle</dt><dd>' + esc(SITE.handle) + " · " + esc(SITE.domain) + "</dd></div>" +
      '<hr class="separator">' +
      "<p>" + esc(ABOUT_MD).replace(/\n/g, "<br>") + "</p>" +
      '<div class="contact-row">' +
      '<a href="' + SITE.github + '" target="_blank" rel="noopener"><button class="default">GitHub</button></a>' +
      '<a href="' + SITE.linkedin + '" target="_blank" rel="noopener"><button>LinkedIn</button></a>' +
      '<a href="mailto:' + SITE.email + '"><button>Email</button></a>' +
      "</div>" +
      '<div class="status-bar" style="margin:12px -16px -16px"><span>Finder · About This Mac</span></div>' +
      "</div>";

    const skillsBody = (activeIdx = 0) => {
      const shortTitles = ["Embedded", "Languages", "Backend"];
      const tabs = SKILL_GROUPS.map((g, i) => '<button data-tab="' + i + '" ' + (i === activeIdx ? 'aria-selected="true"' : "") + ">" + esc(shortTitles[i] || g.title.split(" ")[0]) + "</button>").join("");
      const group = SKILL_GROUPS[activeIdx];
      const chips = group.items.map((it) => '<div class="skill-chip"><span class="dot" style="background:' + it.color + '"></span>' + esc(it.name) + "</div>").join("");
      return '<div class="doc"><h3>Skills — ' + esc(group.title) + '</h3><div class="tabs">' + tabs + '</div><div class="tab-panel"><div class="skill-grid">' + chips + '</div></div><p class="muted">Click a tab to switch category.</p></div>';
    };

    const projectsBody = () => {
      const rows = PROJECTS.map((pr) => '<tr data-project="' + pr.id + '"><td><strong>' + esc(pr.name) + '</strong><br><span class="stack">' + esc(pr.lang) + '</span></td><td><span class="evt">' + esc(pr.event || "") + '</span></td><td>' + esc(pr.description) + '<br><span class="stack">' + esc(pr.stack.join(" · ")) + "</span></td></tr>").join("");
      return '<div class="finder-toolbar"><span>Projects — ' + PROJECTS.length + ' items</span><span style="margin-left:auto">Kind: Aqua Finder</span></div><table class="finder-table"><thead><tr><th>Name</th><th>Event</th><th>Description</th></tr></thead><tbody>' + rows + '</tbody></table><div class="status-bar"><span>' + PROJECTS.length + ' items, Aqua Finder</span><span class="spacer" style="flex:1"></span><span>Double-click a row to open</span></div>';
    };

    const projectDetailBody = (id: string) => {
      const pr = PROJECTS.find((x) => x.id === id);
      if (!pr) return '<div class="doc"><p>Not found</p></div>';
      const pills = pr.stack.map((s) => "<span>" + esc(s) + "</span>").join("");
      const gh = (pr as unknown as { githubUrl?: string }).githubUrl;
      return '<div class="doc"><div class="proj-header"><div class="proj-icon" style="background:' + pr.color + '">◈</div><div><div class="proj-title">' + esc(pr.name) + '</div><div class="proj-event">' + esc(pr.event || "") + '</div><div class="muted">' + esc(pr.lang) + " · " + esc(pr.description) + "</div></div></div><hr class=\"separator\"><p>" + esc(pr.verbose) + '</p><div class="stack-pills">' + pills + '</div><div class="contact-row"><a href="' + pr.url + '" target="_blank" rel="noopener"><button class="default">Open Project</button></a>' + (gh && gh !== pr.url ? '<a href="' + gh + '" target="_blank" rel="noopener"><button>Source</button></a>' : "") + "</div></div>";
    };

    const experienceBody = () => {
      let md = esc(EXP_MD);
      md = md.replace(/^### (.+)$/gm, '<span class="h">$1</span>');
      md = md.replace(/^> (.+)$/gm, '<span class="accent">▸ $1</span>');
      md = md.replace(/---/g, '<hr class="separator">');
      return '<div class="doc"><h3>Experience.log</h3><div class="markdown-pre">' + md.replace(/\n/g, "<br>") + '</div><div class="status-bar" style="margin:12px -16px -16px"><span>TextEdit · 22 lines</span></div></div>';
    };

    const resumeBody = () => {
      const md = esc(buildResumeMarkdown());
      return '<div class="doc"><h3>Resume.md — ' + esc(SITE.displayName) + '</h3><div class="markdown-pre">' + md.replace(/\n/g, "<br>") + '</div><div class="contact-row"><a href="mailto:' + SITE.email + '"><button class="default">Email</button></a><a href="' + SITE.github + '" target="_blank" rel="noopener"><button>GitHub</button></a><a href="' + SITE.linkedin + '" target="_blank" rel="noopener"><button>LinkedIn</button></a></div></div>';
    };

    const contactBody = () =>
      '<div class="doc"><h3>Contact</h3><p>Reach me via any of these — I reply fastest on email.</p><div class="info-grid"><dt>Email</dt><dd><a href="mailto:' + SITE.email + '">' + esc(SITE.email) + '</a></dd><dt>GitHub</dt><dd><a href="' + SITE.github + '" target="_blank" rel="noopener">' + esc(SITE.github) + '</a></dd><dt>LinkedIn</dt><dd><a href="' + SITE.linkedin + '" target="_blank" rel="noopener">' + esc(SITE.linkedin) + '</a></dd><dt>Domain</dt><dd>' + esc(SITE.domain) + "</dd></div><hr class=\"separator\"><div class=\"contact-row\"><a href=\"mailto:" + SITE.email + '"><button class="default">Send Email</button></a><a href="' + SITE.github + '" target="_blank" rel="noopener"><button>GitHub</button></a><a href="' + SITE.linkedin + '" target="_blank" rel="noopener"><button>LinkedIn</button></a></div><p class="muted">Tip: double-click Mail in the Dock to reopen this.</p></div>';

    const openAbout = () => {
      if (openWins.about) { focusWin(openWins.about); return; }
      openWins.about = makeWin({ id: "about", title: "About This Mac — Priyanshu", bodyHTML: aboutBody(), cls: "large", w: 520, x: 70, y: 56 });
    };
    const openSkills = () => {
      if (openWins.skills) { focusWin(openWins.skills); return; }
      const win = makeWin({ id: "skills", title: "Skills.txt — TextEdit", bodyHTML: skillsBody(0), cls: "medium", w: 520, x: 110, y: 86 });
      openWins.skills = win;
      win.addEventListener("click", (e) => {
        const t = (e.target as HTMLElement).closest(".tabs button") as HTMLElement | null;
        if (!t) return;
        const idx = parseInt(t.dataset.tab || "0", 10);
        const content = win.querySelector(".win-content") as HTMLElement;
        if (content) content.innerHTML = skillsBody(idx);
      });
    };
    const openProjects = () => {
      if (openWins.projects) { focusWin(openWins.projects); return; }
      const win = makeWin({ id: "projects", title: "Projects — Finder", bodyHTML: projectsBody(), cls: "large", w: 560, x: 90, y: 72 });
      openWins.projects = win;
      win.querySelectorAll("tr[data-project]").forEach((tr) => {
        tr.addEventListener("dblclick", () => openProjectDetail((tr as HTMLElement).dataset.project || ""));
        tr.addEventListener("click", () => {
          win.querySelectorAll("tr").forEach((r) => r.classList.remove("selected"));
          tr.classList.add("selected");
        });
      });
    };
    const openProjectDetail = (id: string) => {
      const key = "proj:" + id;
      if (openWins[key]) { focusWin(openWins[key]); return; }
      const pr = PROJECTS.find((x) => x.id === id);
      const title = pr ? pr.name + " — Preview" : id;
      openWins[key] = makeWin({ id: key, title, bodyHTML: projectDetailBody(id), cls: "medium", w: 460 });
    };
    const openExperience = () => {
      if (openWins.experience) { focusWin(openWins.experience); return; }
      openWins.experience = makeWin({ id: "experience", title: "Experience.log — TextEdit", bodyHTML: experienceBody(), cls: "medium", w: 480, x: 100, y: 86 });
    };
    const openResume = () => {
      if (openWins.resume) { focusWin(openWins.resume); return; }
      openWins.resume = makeWin({ id: "resume", title: "Resume.md — Preview", bodyHTML: resumeBody(), cls: "large", w: 540, x: 80, y: 64 });
    };
    const openContact = () => {
      if (openWins.contact) { focusWin(openWins.contact); return; }
      openWins.contact = makeWin({ id: "contact", title: "Contact — Mail", bodyHTML: contactBody(), cls: "small", w: 400, x: 140, y: 110 });
    };
    const openGithub = () => window.open(SITE.github, "_blank");

    // --- Bad Apple terminal — EmirXK/bad_apple (framesData.lz + bad_apple.mp3) ---
    const openTerminal = () => {
      if (openWins.terminal) { focusWin(openWins.terminal); return; }
      const termHTML =
        '<div class="terminal-screen">' +
        '<div class="terminal-bar"><span class="dot" style="background:#ff5f56"></span><span class="dot" style="background:#ffbd2e"></span><span class="dot" style="background:#27c93f"></span><span style="margin-left:8px">ego1s1@aqua — Terminal — Bad Apple</span><span class="terminal-title">EmirXK/bad_apple</span></div>' +
        '<pre class="terminal-output" id="badapple-output" style="font-size:4.5px;line-height:1;white-space:pre;text-align:center;overflow:hidden;display:flex;justify-content:center;align-items:center;min-height:340px">loading Bad Apple... (2.2MB)</pre>' +
        '<audio id="badapple-audio" preload="auto" style="display:none"><source src="/bad_apple/bad_apple.mp3" type="audio/mp3"></audio>' +
        '<div class="terminal-prompt"><span style="color:#8a8a8a">ego1s1@aqua:~$</span> ./badapple.sh<span class="cursor"></span></div>' +
        '<div class="terminal-controls"><button data-action="play" class="primary">▶ Play</button><button data-action="pause">⏸ Pause</button><button data-action="restart">↺ Restart</button><span style="margin-left:auto;font-size:9px;color:#666">30fps · click Play (audio needs gesture)</span></div>' +
        '</div>';
      const win = makeWin({ id: "terminal", title: "Terminal — Bad Apple", bodyHTML: termHTML, cls: "terminal-win", w: 640, x: 60, y: 50 });
      openWins.terminal = win;
      win.classList.add("terminal-win");

      const out = win.querySelector("#badapple-output") as HTMLElement;
      const audio = win.querySelector("#badapple-audio") as HTMLAudioElement;
      const playBtn = win.querySelector('[data-action="play"]') as HTMLElement;
      const pauseBtn = win.querySelector('[data-action="pause"]') as HTMLElement;
      const restartBtn = win.querySelector('[data-action="restart"]') as HTMLElement;

      if (audio) audio.volume = 0.9;

      let frames: string[] = [];
      let playing = false;
      let raf = 0;
      let startTime = 0;
      const fps = 30;
      const frameDuration = 1000 / fps;

      const renderAt = (elapsed: number) => {
        if (!frames.length || !out) return;
        const idx = Math.min(Math.floor(elapsed / frameDuration), frames.length - 1);
        out.textContent = frames[idx].replace(/\\n/g, "\n");
      };

      const loop = () => {
        if (!playing) return;
        const elapsed = performance.now() - startTime;
        // sync to audio if playing
        const t = audio && !audio.paused && audio.currentTime ? audio.currentTime * 1000 : elapsed;
        renderAt(t);
        if (t < frames.length * frameDuration - 16) {
          raf = requestAnimationFrame(loop);
        } else {
          playing = false;
        }
      };

      const start = () => {
        if (!frames.length) return;
        playing = true;
        startTime = performance.now() - (audio?.currentTime || 0) * 1000;
        if (audio) audio.play().catch(() => {});
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      };
      const pause = () => {
        playing = false;
        cancelAnimationFrame(raf);
        if (audio) audio.pause();
      };
      const restart = () => {
        if (audio) { audio.currentTime = 0; }
        startTime = performance.now();
        playing = true;
        start();
      };

      playBtn?.addEventListener("click", start);
      pauseBtn?.addEventListener("click", pause);
      restartBtn?.addEventListener("click", restart);
      if (audio) {
        audio.addEventListener("play", () => { if (!playing) { playing = true; startTime = performance.now() - audio.currentTime * 1000; raf = requestAnimationFrame(loop); } });
        audio.addEventListener("pause", () => { playing = false; cancelAnimationFrame(raf); });
      }

      // fetch + decompress framesData.lz (EmirXK/bad_apple)
      fetch("/bad_apple/framesData.lz")
        .then((r) => r.text())
        .then((data) => {
          const decompressed = LZString.decompressFromBase64(data);
          if (!decompressed) throw new Error("decompress failed");
          frames = JSON.parse(decompressed) as string[];
          if (out) out.textContent = "ready — " + frames.length + " frames · click Play";
          // auto-play after load (may be blocked until gesture, then play button)
          setTimeout(() => { if (win.isConnected) start(); }, 120);
        })
        .catch((e) => {
          if (out) out.textContent = "failed to load Bad Apple: " + (e as Error).message;
        });

      // responsive font-size like original bad_apple (4:3)
      const adjust = () => {
        if (!out || !win.isConnected) return;
        const w = Math.min(win.clientWidth - 20, 620);
        out.style.fontSize = Math.max(3.5, w / 88) + "px";
      };
      adjust();
      const ro = new ResizeObserver(adjust);
      ro.observe(win);
      win.addEventListener("pointerdown", adjust);

      const closeBtn = win.querySelector('[aria-label="Close"]') as HTMLElement;
      const cleanup = () => {
        playing = false;
        cancelAnimationFrame(raf);
        if (audio) { audio.pause(); audio.src = ""; }
        ro.disconnect();
      };
      closeBtn?.addEventListener("click", cleanup);
      const origRemove = win.remove.bind(win);
      win.remove = (() => { cleanup(); return origRemove(); }) as typeof win.remove;

      win.addEventListener("keydown", (e) => {
        if ((e as KeyboardEvent).key === "Escape") pause();
        if ((e as KeyboardEvent).key === " ") { e.preventDefault(); if (playing) pause(); else start(); }
      });
      win.tabIndex = 0;
      win.focus();
    };

    const openApp = (id: string) => {
      switch (id) {
        case "about": return openAbout();
        case "skills": return openSkills();
        case "projects": return openProjects();
        case "experience": return openExperience();
        case "resume": return openResume();
        case "contact": return openContact();
        case "terminal": return openTerminal();
        case "github": return openGithub();
        default: if (id.indexOf("proj:") === 0) return openProjectDetail(id.slice(5));
      }
    };

    // expose for menus
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).AquaPortfolio = { openApp, openAbout, openSkills, openProjects, openExperience, openResume, openContact, openProjectDetail, openGithub };

    document.querySelectorAll<HTMLElement>("[data-launch]").forEach((el) => el.addEventListener("click", () => openApp(el.dataset.launch || "")));
    document.querySelectorAll<HTMLElement>(".desktop-icon[data-open]").forEach((el) => {
      el.addEventListener("dblclick", () => openApp(el.dataset.open || ""));
      el.addEventListener("click", () => {
        document.querySelectorAll(".desktop-icon").forEach((i) => i.classList.remove("selected"));
        el.classList.add("selected");
      });
      el.addEventListener("keydown", (e) => { if ((e as KeyboardEvent).key === "Enter") openApp(el.dataset.open || ""); });
    });
    document.addEventListener("click", (e) => {
      if (!(e.target as HTMLElement).closest(".desktop-icon") && !(e.target as HTMLElement).closest(".win") && !(e.target as HTMLElement).closest(".dock") && !(e.target as HTMLElement).closest(".menubar")) {
        document.querySelectorAll(".desktop-icon").forEach((i) => i.classList.remove("selected"));
      }
    });

    openAbout();
    setTimeout(openProjects, 180);

    // --- menus (ported from js/menus.js) ---
    const ACTIONS: Record<string, () => void> = {
      about: () => openAbout(),
      resume: () => openResume(),
      contact: () => openContact(),
      projects: () => openProjects(),
      skills: () => openSkills(),
      experience: () => openExperience(),
      github: () => openGithub(),
      linkedin: () => window.open("https://www.linkedin.com/in/ego1s1", "_blank"),
      closewin: () => {
        const wins = Array.from(document.querySelectorAll<HTMLElement>(".win"));
        if (!wins.length) return;
        wins.sort((a, b) => (+(b.style.zIndex || 0) - +(a.style.zIndex || 0)));
        const front = wins[0];
        (front.querySelector('[aria-label="Close"]') as HTMLElement)?.click();
      },
      closeall: () => document.querySelectorAll<HTMLElement>(".win").forEach((w) => (w.querySelector('[aria-label="Close"]') as HTMLElement)?.click()),
      minall: () => document.querySelectorAll(".win").forEach((w) => w.classList.add("inactive")),
      cascade: () => document.querySelectorAll<HTMLElement>(".win").forEach((w, i) => { w.style.left = 80 + i * 26 + "px"; w.style.top = 56 + i * 26 + "px"; }),
      tile: () => {
        const list = Array.from(document.querySelectorAll<HTMLElement>(".win"));
        if (!list.length) return;
        const cols = Math.ceil(Math.sqrt(list.length)) || 1;
        list.forEach((w, i) => { w.style.left = 24 + (i % cols) * 320 + "px"; w.style.top = 40 + Math.floor(i / cols) * 220 + "px"; });
      },
      shutdown: () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Aqua = (window as any).Aqua;
        if (Aqua?.alert) Aqua.alert({ message: "Are you sure you want to shut down?", informative: "Your portfolio will stay open — this is just Aqua nostalgia.", icon: "/icons/Finder.png", buttons: [{ id: "cancel", label: "Cancel", cancel: true }, { id: "shut", label: "Shut Down", def: true }] }).then((r: string) => { if (r === "shut") document.body.style.filter = "brightness(0)"; });
        else if (confirm("Shut down? (just dims the screen)")) document.body.style.filter = "brightness(0)";
      },
    };

    document.addEventListener("aqua:menuselect", ((e: CustomEvent) => {
      const id = e.detail?.id as string | undefined;
      if (!id) return;
      if (id.indexOf("proj:") === 0) return openProjectDetail(id.slice(5));
      const fn = ACTIONS[id];
      if (fn) fn();
    }) as EventListener);

    desk.addEventListener("contextmenu", (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(".win, .dock, .menubar")) return;
      e.preventDefault();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Aqua = (window as any).Aqua;
      if (Aqua?.menu) Aqua.menu([{ id: "about", label: "About This Mac" }, "-", { id: "projects", label: "Projects" }, { id: "skills", label: "Skills" }, { id: "resume", label: "Resume.md" }, "-", { id: "cascade", label: "Cascade Windows" }, { id: "tile", label: "Tile Windows" }, "-", { id: "closeall", label: "Close All Windows" }], e.clientX, e.clientY).then((r: { id: string } | null) => { if (r && ACTIONS[r.id]) ACTIONS[r.id](); });
    });

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "w" || e.key === "W") { e.preventDefault(); ACTIONS.closewin(); }
        if (e.key === "p" || e.key === "P") { e.preventDefault(); openProjects(); }
        if (e.key === "k" || e.key === "K") { e.preventDefault(); openSkills(); }
        if (e.key === "r" || e.key === "R") { e.preventDefault(); openResume(); }
      }
    });

    return () => clearInterval(clockIv);
  }, []);

  return (
    <div className="desktop">
      <div className="menubar" role="menubar">
        <span className="apple" data-menu="#m-apple"><span className="apple-glyph" aria-hidden="true"></span></span>
        <span className="app-name" data-menu="#m-app">Priyanshu</span>
        <span className="menu-title" data-menu="#m-file">File</span>
        <span className="menu-title" data-menu="#m-view">View</span>
        <span className="menu-title" data-menu="#m-window">Window</span>
        <span className="menu-title" data-menu="#m-help">Help</span>
        <span className="spacer"></span>
        <span className="clock-text" id="menu-clock">--:--</span>
      </div>

      <ul className="menu" id="m-apple" hidden>
        <li data-id="about"><span className="label">About This Mac</span></li>
        <li className="separator"></li>
        <li data-id="resume"><span className="label">Resume.md</span></li>
        <li data-id="contact"><span className="label">Contact…</span></li>
        <li className="separator"></li>
        <li data-id="shutdown"><span className="label">Shut Down…</span></li>
      </ul>

      <ul className="menu" id="m-app" hidden>
        <li data-id="about"><span className="label">About Priyanshu</span></li>
        <li className="separator"></li>
        <li data-id="resume"><span className="label">Resume…</span><span className="shortcut">⌘R</span></li>
        <li className="separator"></li>
        <li data-id="github"><span className="label">GitHub</span></li>
        <li data-id="linkedin"><span className="label">LinkedIn</span></li>
      </ul>

      <ul className="menu" id="m-file" hidden>
        <li data-id="projects"><span className="label">Projects</span><span className="shortcut">⌘P</span></li>
        <li data-id="skills"><span className="label">Skills</span><span className="shortcut">⌘K</span></li>
        <li data-id="experience"><span className="label">Experience</span></li>
        <li data-id="resume"><span className="label">Resume.md</span></li>
        <li className="separator"></li>
        <li data-id="closewin"><span className="label">Close Window</span><span className="shortcut">⌘W</span></li>
        <li data-id="closeall"><span className="label">Close All</span></li>
      </ul>

      <ul className="menu" id="m-view" hidden>
        <li data-id="tile"><span className="label">Tile Windows</span></li>
        <li data-id="cascade"><span className="label">Cascade Windows</span></li>
      </ul>

      <ul className="menu" id="m-window" hidden>
        <li data-id="minall"><span className="label">Minimize All</span></li>
        <li data-id="closeall"><span className="label">Close All</span></li>
      </ul>

      <ul className="menu" id="m-help" hidden>
        <li data-id="about"><span className="label">Aqua Help</span></li>
        <li data-id="github"><span className="label">View Source…</span></li>
      </ul>

      <div className="desktop-icons">
        <div className="desktop-icon" data-open="about" tabIndex={0}><img src="/icons/HardDisk.png" alt="Macintosh HD" /><span>Macintosh HD</span></div>
        <div className="desktop-icon" data-open="projects" tabIndex={0}><img src="/icons/GenericFolder.png" alt="Projects" /><span>Projects</span></div>
        <div className="desktop-icon" data-open="skills" tabIndex={0}><img src="/icons/TextEdit.png" alt="Skills" /><span>Skills.txt</span></div>
        <div className="desktop-icon" data-open="experience" tabIndex={0}><img src="/icons/GenericDocument.png" alt="Experience" /><span>Experience.log</span></div>
        <div className="desktop-icon" data-open="resume" tabIndex={0}><img src="/icons/preview.png" alt="Resume" /><span>Resume.md</span></div>
        <div className="desktop-icon" data-open="contact" tabIndex={0}><img src="/icons/Mail.png" alt="Contact" /><span>Contact</span></div>
        <div className="desktop-icon" data-open="terminal" tabIndex={0}><img src="/icons/Terminal.png" alt="Terminal" /><span>Terminal</span></div>
      </div>

      <div className="dock-wrap">
        <div className="dock">
          <div className="dock-item running" data-launch="about"><span className="dock-label">Finder</span><img src="/icons/Finder.png" alt="Finder" /></div>
          <div className="dock-item" data-launch="projects"><span className="dock-label">Projects</span><img src="/icons/GenericFolder.png" alt="Projects" /></div>
          <div className="dock-item" data-launch="skills"><span className="dock-label">Skills</span><img src="/icons/TextEdit.png" alt="Skills" /></div>
          <div className="dock-item" data-launch="experience"><span className="dock-label">Experience</span><img src="/icons/GenericDocument.png" alt="Experience" /></div>
          <div className="dock-item" data-launch="resume"><span className="dock-label">Resume</span><img src="/icons/preview.png" alt="Preview" /></div>
          <div className="dock-item" data-launch="contact"><span className="dock-label">Contact</span><img src="/icons/Mail.png" alt="Mail" /></div>
          <div className="dock-divider"></div>
          <div className="dock-item" data-launch="terminal"><span className="dock-label">Terminal</span><img src="/icons/Terminal.png" alt="Terminal" /></div>
          <div className="dock-item" data-trash><span className="dock-label">Trash</span><img src="/icons/TrashEmpty.png" alt="Trash" /></div>
        </div>
      </div>
    </div>
  );
}

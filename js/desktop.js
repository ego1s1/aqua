(function () {
  "use strict";

  var desk = document.querySelector(".desktop");
  var z = 10, cascade = 0;
  var openWins = {};

  function focusWin(win) {
    win.style.zIndex = ++z;
    document.querySelectorAll(".win").forEach(function (w) { w.classList.toggle("inactive", w !== win); });
    win.classList.remove("inactive");
  }

  function drag(win, handle) {
    handle.style.touchAction = "none";
    handle.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".title-bar-controls")) return;
      focusWin(win);
      var sx = e.clientX, sy = e.clientY;
      var ox = win.offsetLeft, oy = win.offsetTop;
      handle.setPointerCapture(e.pointerId);
      function mv(ev) {
        win.style.left = Math.min(Math.max(0, ox + ev.clientX - sx), innerWidth - 60) + "px";
        win.style.top  = Math.min(Math.max(22, oy + ev.clientY - sy), innerHeight - 40) + "px";
      }
      function up() { handle.removeEventListener("pointermove", mv); handle.removeEventListener("pointerup", up); handle.removeEventListener("pointercancel", up); }
      handle.addEventListener("pointermove", mv);
      handle.addEventListener("pointerup", up);
      handle.addEventListener("pointercancel", up);
    });
  }

  function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  function makeWin(o) {
    var title = o.title, bodyHTML = o.bodyHTML, cls = o.cls || "", w = o.w, x = o.x, y = o.y, id = o.id;
    var win = document.createElement("div");
    win.className = "win aqua portfolio " + cls;
    if (id) win.dataset.winId = id;
    if (w) win.style.width = Math.min(w, innerWidth - 12) + "px";
    var ww = Math.min(w || 380, innerWidth - 12);
    win.style.left = Math.max(6, Math.min(x != null ? x : (120 + cascade * 26), innerWidth - ww - 6)) + "px";
    win.style.top  = Math.max(22, Math.min(y != null ? y : (64 + cascade * 26), innerHeight - 120)) + "px";
    win.innerHTML =
      '<div class="title-bar">' +
        '<div class="title-bar-controls">' +
          '<button aria-label="Close"><span>&times;</span></button>' +
          '<button aria-label="Minimize"><span>&minus;</span></button>' +
          '<button aria-label="Zoom"><span>+</span></button>' +
        '</div>' +
        '<div class="title-bar-text">' + esc(title) + '</div>' +
        '<div style="width:49px;flex:0 0 auto"></div>' +
      '</div>' +
      '<div class="win-content">' + bodyHTML + '</div>';
    desk.appendChild(win);

    var closeBtn = win.querySelector('[aria-label="Close"]');
    var minBtn = win.querySelector('[aria-label="Minimize"]');
    var zoomBtn = win.querySelector('[aria-label="Zoom"]');

    closeBtn.addEventListener("click", function () {
      win.remove();
      if (id && openWins[id] === win) delete openWins[id];
      // if project detail window (dynamic id), also delete
      if (win.dataset.winId && openWins[win.dataset.winId] === win) delete openWins[win.dataset.winId];
    });
    minBtn.addEventListener("click", function () {
      win.classList.toggle("inactive");
      // simple minimize: toggle opacity collapse — for now just send to back
      if (win.style.display === "none") win.style.display = "";
      else { /* keep visible but unfocused, as Aqua did */ }
      // actual hide: if already inactive, hide; else focus
      // we cheat: if user clicks minimize twice, hide
      if (win.classList.contains("inactive") && document.querySelectorAll(".win:not(.inactive)").length === 0) {
        // leave as inactive, don't hide
      }
    });
    var zoomed = false;
    zoomBtn.addEventListener("click", function () {
      if (!zoomed) {
        win.dataset._w = win.style.width;
        win.dataset._l = win.style.left;
        win.dataset._t = win.style.top;
        win.style.left = "6px";
        win.style.top = "22px";
        win.style.width = (innerWidth - 12) + "px";
        win.style.height = (innerHeight - 28) + "px";
        win.querySelector(".win-content").style.height = "calc(100% - 26px)";
      } else {
        win.style.width = win.dataset._w || "";
        win.style.left = win.dataset._l || "";
        win.style.top = win.dataset._t || "";
        win.style.height = "";
        win.querySelector(".win-content").style.height = "";
      }
      zoomed = !zoomed;
    });

    drag(win, win.querySelector(".title-bar"));
    win.addEventListener("pointerdown", function () { focusWin(win); });
    focusWin(win);
    cascade = (cascade + 1) % 8;
    return win;
  }

  // portfolio data (from js/data.js)
  function P(){ return window.PORTFOLIO; }

  function aboutBody() {
    var p = P();
    return '' +
      '<div class="doc">' +
        '<div class="about-head">' +
          '<img src="assets/avatar.jpeg" alt="Priyanshu">' +
          '<div>' +
            '<div class="name">' + esc(p.SITE.displayName) + '</div>' +
            '<div class="role">' + esc(p.HERO_META.role) + '</div>' +
            '<div class="meta">' + esc(p.HERO_META.host) + ' · ' + esc(p.HERO_META.cgpa) + ' · ' + esc(p.HERO_META.honors) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="info-grid"><dt>OS</dt><dd>' + esc(p.HERO_META.os) + '</dd><dt>Device</dt><dd>' + esc(p.HERO_META.device) + '</dd><dt>Host</dt><dd>' + esc(p.HERO_META.host) + '</dd><dt>Prev</dt><dd>' + esc(p.HERO_META.prev) + '</dd><dt>Handle</dt><dd>' + esc(p.SITE.handle) + ' · ' + esc(p.SITE.domain) + '</dd></div>' +
        '<hr class="separator">' +
        '<p>' + esc(p.ABOUT_MD).replace(/\n/g,"<br>") + '</p>' +
        '<div class="contact-row">' +
          '<a href="' + p.SITE.github + '" target="_blank" rel="noopener"><button class="default">GitHub</button></a>' +
          '<a href="' + p.SITE.linkedin + '" target="_blank" rel="noopener"><button>LinkedIn</button></a>' +
          '<a href="mailto:' + p.SITE.email + '"><button>Email</button></a>' +
        '</div>' +
        '<div class="status-bar" style="margin:12px -16px -16px"><span>Finder · About This Mac</span></div>' +
      '</div>';
  }

  function skillsBody(activeIdx) {
    var p = P();
    activeIdx = activeIdx || 0;
    var shortTitles = ["Embedded","Languages","Backend"];
    var tabs = p.SKILL_GROUPS.map(function(g,i){
      return '<button data-tab="'+i+'" '+(i===activeIdx ? 'aria-selected="true"' : '')+'>'+esc(shortTitles[i] || g.title.split(" ")[0])+'</button>';
    }).join("");
    var group = p.SKILL_GROUPS[activeIdx];
    var chips = group.items.map(function(it){
      return '<div class="skill-chip"><span class="dot" style="background:'+it.color+'"></span>' + esc(it.name) + '</div>';
    }).join("");
    return '' +
      '<div class="doc">' +
        '<h3>Skills — ' + esc(group.title) + '</h3>' +
        '<div class="tabs">' + tabs + '</div>' +
        '<div class="tab-panel"><div class="skill-grid">' + chips + '</div></div>' +
        '<p class="muted">Click a tab to switch category. Pure Aqua tabs from aqua.css.</p>' +
      '</div>';
  }

  function projectsBody() {
    var p = P();
    var rows = p.PROJECTS.map(function(pr){
      return '<tr data-project="'+pr.id+'"><td><strong>' + esc(pr.name) + '</strong><br><span class="stack">' + esc(pr.lang) + '</span></td><td><span class="evt">'+esc(pr.event || "")+'</span></td><td>' + esc(pr.description) + '<br><span class="stack">' + esc(pr.stack.join(" · ")) + '</span></td></tr>';
    }).join("");
    return '' +
      '<div class="finder-toolbar"><span>Projects — ' + p.PROJECTS.length + ' items</span><span style="margin-left:auto">Kind: Aqua Finder</span></div>' +
      '<table class="finder-table"><thead><tr><th>Name</th><th>Event</th><th>Description</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<div class="status-bar"><span>' + p.PROJECTS.length + ' items, Aqua Finder</span><span class="spacer" style="flex:1"></span><span>Double-click a row to open</span></div>';
  }

  function projectDetailBody(id) {
    var p = P();
    var pr = p.PROJECTS.find(function(x){ return x.id===id; });
    if (!pr) return '<div class="doc"><p>Not found</p></div>';
    var pills = pr.stack.map(function(s){ return '<span>'+esc(s)+'</span>'; }).join("");
    return '' +
      '<div class="doc">' +
        '<div class="proj-header"><div class="proj-icon" style="background:'+pr.color+'">◈</div><div><div class="proj-title">'+esc(pr.name)+'</div><div class="proj-event">'+esc(pr.event||"")+'</div><div class="muted">'+esc(pr.lang)+' · '+esc(pr.description)+'</div></div></div>' +
        '<hr class="separator">' +
        '<p>' + esc(pr.verbose) + '</p>' +
        '<div class="stack-pills">' + pills + '</div>' +
        '<div class="contact-row"><a href="'+pr.url+'" target="_blank" rel="noopener"><button class="default">Open Project</button></a>' + (pr.githubUrl && pr.githubUrl!==pr.url ? '<a href="'+pr.githubUrl+'" target="_blank" rel="noopener"><button>Source</button></a>' : '') + '</div>' +
      '</div>';
  }

  function experienceBody() {
    var p = P();
    // render EXP_MD with minimal markdown: keep as pre but with separators
    var md = esc(p.EXP_MD);
    md = md.replace(/^### (.+)$/gm, '<span class="h">$1</span>');
    md = md.replace(/^> (.+)$/gm, '<span class="accent">▸ $1</span>');
    md = md.replace(/---/g, '<hr class="separator">');
    return '<div class="doc"><h3>Experience.log</h3><div class="markdown-pre">' + md.replace(/\n/g,"<br>") + '</div><div class="status-bar" style="margin:12px -16px -16px"><span>TextEdit · 22 lines</span></div></div>';
  }

  function resumeBody() {
    var p = P();
    var md = esc(p.buildResumeMarkdown());
    return '<div class="doc"><h3>Resume.md — ' + esc(p.SITE.displayName) + '</h3><div class="markdown-pre">' + md.replace(/\n/g,"<br>") + '</div><div class="contact-row"><a href="mailto:'+p.SITE.email+'"><button class="default">Email</button></a><a href="'+p.SITE.github+'" target="_blank" rel="noopener"><button>GitHub</button></a><a href="'+p.SITE.linkedin+'" target="_blank" rel="noopener"><button>LinkedIn</button></a></div></div>';
  }

  function contactBody() {
    var p = P();
    return '' +
      '<div class="doc">' +
        '<h3>Contact</h3>' +
        '<p>Reach me via any of these — I reply fastest on email.</p>' +
        '<div class="info-grid"><dt>Email</dt><dd><a href="mailto:'+p.SITE.email+'">'+esc(p.SITE.email)+'</a></dd><dt>GitHub</dt><dd><a href="'+p.SITE.github+'" target="_blank" rel="noopener">'+esc(p.SITE.github)+'</a></dd><dt>LinkedIn</dt><dd><a href="'+p.SITE.linkedin+'" target="_blank" rel="noopener">'+esc(p.SITE.linkedin)+'</a></dd><dt>Domain</dt><dd>'+esc(p.SITE.domain)+'</dd></div>' +
        '<hr class="separator">' +
        '<div class="contact-row"><a href="mailto:'+p.SITE.email+'"><button class="default">Send Email</button></a><a href="'+p.SITE.github+'" target="_blank" rel="noopener"><button>GitHub</button></a><a href="'+p.SITE.linkedin+'" target="_blank" rel="noopener"><button>LinkedIn</button></a></div>' +
        '<p class="muted">Tip: double-click Mail in the Dock to reopen this.</p>' +
      '</div>';
  }

  // openers
  function openAbout(){ if(openWins.about){ focusWin(openWins.about); return; } openWins.about = makeWin({id:"about", title:"About This Mac — Priyanshu", bodyHTML: aboutBody(), cls:"large", w:520, x:70, y:56}); }
  function openSkills(){ if(openWins.skills){ focusWin(openWins.skills); return; }
    var win = makeWin({id:"skills", title:"Skills.txt — TextEdit", bodyHTML: skillsBody(0), cls:"medium", w:520, x:110, y:86});
    openWins.skills = win;
    win.addEventListener("click", function(e){
      var t = e.target.closest(".tabs button");
      if(!t) return;
      var idx = parseInt(t.dataset.tab,10);
      win.querySelector(".win-content").innerHTML = skillsBody(idx);
    });
  }
  function openProjects(){
    if(openWins.projects){ focusWin(openWins.projects); return; }
    var win = makeWin({id:"projects", title:"Projects — Finder", bodyHTML: projectsBody(), cls:"large", w:560, x:90, y:72});
    openWins.projects = win;
    win.querySelectorAll("tr[data-project]").forEach(function(tr){
      tr.addEventListener("dblclick", function(){ openProjectDetail(tr.dataset.project); });
      tr.addEventListener("click", function(){
        win.querySelectorAll("tr").forEach(function(r){ r.classList.remove("selected"); });
        tr.classList.add("selected");
      });
    });
  }
  function openProjectDetail(id){
    var key = "proj:"+id;
    if(openWins[key]){ focusWin(openWins[key]); return; }
    var pr = P().PROJECTS.find(function(x){ return x.id===id; });
    var title = pr ? pr.name + " — Preview" : id;
    var win = makeWin({id:key, title: title, bodyHTML: projectDetailBody(id), cls:"medium", w:460 });
    openWins[key] = win;
  }
  function openExperience(){ if(openWins.experience){ focusWin(openWins.experience); return; } openWins.experience = makeWin({id:"experience", title:"Experience.log — TextEdit", bodyHTML: experienceBody(), cls:"medium", w:480, x:100, y:86}); }
  function openResume(){ if(openWins.resume){ focusWin(openWins.resume); return; } openWins.resume = makeWin({id:"resume", title:"Resume.md — Preview", bodyHTML: resumeBody(), cls:"large", w:540, x:80, y:64}); }
  function openContact(){ if(openWins.contact){ focusWin(openWins.contact); return; } openWins.contact = makeWin({id:"contact", title:"Contact — Mail", bodyHTML: contactBody(), cls:"small", w:400, x:140, y:110}); }
  function openGithub(){
    var p = P();
    window.open(p.SITE.github, "_blank");
  }

  function openApp(id){
    switch(id){
      case "about": return openAbout();
      case "skills": return openSkills();
      case "projects": return openProjects();
      case "experience": return openExperience();
      case "resume": return openResume();
      case "contact": return openContact();
      case "github": return openGithub();
      default: if(id && id.indexOf("proj:")===0) return openProjectDetail(id.slice(5));
    }
  }

  // expose
  window.AquaPortfolio = { openApp: openApp, openAbout: openAbout, openSkills: openSkills, openProjects: openProjects, openExperience: openExperience, openResume: openResume, openContact: openContact, openProjectDetail: openProjectDetail, openGithub: openGithub };

  // dock + desktop icon bindings
  document.querySelectorAll("[data-launch]").forEach(function(el){
    el.addEventListener("click", function(){ openApp(el.dataset.launch); });
    el.addEventListener("dblclick", function(e){ e.preventDefault(); openApp(el.dataset.launch); });
  });
  document.querySelectorAll(".desktop-icon[data-open]").forEach(function(el){
    el.addEventListener("dblclick", function(){ openApp(el.dataset.open); });
    el.addEventListener("click", function(){
      document.querySelectorAll(".desktop-icon").forEach(function(i){ i.classList.remove("selected"); });
      el.classList.add("selected");
    });
    el.addEventListener("keydown", function(e){ if(e.key==="Enter") openApp(el.dataset.open); });
  });
  // single click also opens after selection (like Aqua) — double-click required, but allow Enter
  document.addEventListener("click", function(e){
    if(!e.target.closest(".desktop-icon") && !e.target.closest(".win") && !e.target.closest(".dock") && !e.target.closest(".menubar")){
      document.querySelectorAll(".desktop-icon").forEach(function(i){ i.classList.remove("selected"); });
    }
  });

  // initial windows
  openAbout();
  setTimeout(openProjects, 180);

})();

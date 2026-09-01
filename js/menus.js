(function () {
  "use strict";
  var desk = document.querySelector(".desktop");
  var AP = window.AquaPortfolio;

  var ACTIONS = {
    about: function(){ AP.openAbout(); },
    resume: function(){ AP.openResume(); },
    contact: function(){ AP.openContact(); },
    projects: function(){ AP.openProjects(); },
    skills: function(){ AP.openSkills(); },
    experience: function(){ AP.openExperience(); },
    github: function(){ AP.openGithub(); },
    linkedin: function(){ window.open("https://www.linkedin.com/in/ego1s1", "_blank"); },
    closewin: function(){
      var wins = Array.from(document.querySelectorAll(".win"));
      if(!wins.length) return;
      wins.sort(function(a,b){ return (+b.style.zIndex||0) - (+a.style.zIndex||0); });
      var front = wins[0];
      var btn = front.querySelector('[aria-label="Close"]');
      if(btn) btn.click();
    },
    closeall: function(){
      document.querySelectorAll(".win").forEach(function(w){
        var b = w.querySelector('[aria-label="Close"]');
        if(b) b.click();
      });
    },
    minall: function(){
      document.querySelectorAll(".win").forEach(function(w){ w.classList.add("inactive"); });
    },
    cascade: function(){
      document.querySelectorAll(".win").forEach(function(w,i){
        w.style.left = (80 + i*26) + "px";
        w.style.top = (56 + i*26) + "px";
      });
    },
    tile: function(){
      var list = Array.from(document.querySelectorAll(".win"));
      if(!list.length) return;
      var cols = Math.ceil(Math.sqrt(list.length)) || 1;
      list.forEach(function(w,i){
        w.style.left = (24 + (i % cols) * 320) + "px";
        w.style.top  = (40 + Math.floor(i/cols) * 220) + "px";
      });
    },
    shutdown: function(){
      // Aqua alert if available, else confirm
      if(window.Aqua && Aqua.alert){
        Aqua.alert({
          message: "Are you sure you want to shut down?",
          informative: "Your portfolio will stay open — this is just Aqua nostalgia.",
          icon: "icons/Finder.png",
          buttons: [{ id:"cancel", label:"Cancel", cancel:true }, { id:"shut", label:"Shut Down", def:true }]
        }).then(function(r){ if(r==="shut") document.body.style.filter="brightness(0)"; });
      } else {
        if(confirm("Shut down? (just dims the screen)")) document.body.style.filter="brightness(0)";
      }
    }
  };

  document.addEventListener("aqua:menuselect", function(e){
    var id = e.detail && e.detail.id;
    if(!id) return;
    if(id.indexOf("proj:")===0) return AP.openProjectDetail(id.slice(5));
    var fn = ACTIONS[id];
    if(fn) fn();
  });

  // desktop right-click menu
  desk.addEventListener("contextmenu", function(e){
    if(e.target.closest(".win, .dock, .menubar")) return;
    e.preventDefault();
    if(window.Aqua && Aqua.menu){
      Aqua.menu([
        { id:"about", label:"About This Mac" },
        "-",
        { id:"projects", label:"Projects" },
        { id:"skills", label:"Skills" },
        { id:"resume", label:"Resume.md" },
        "-",
        { id:"cascade", label:"Cascade Windows" },
        { id:"tile", label:"Tile Windows" },
        "-",
        { id:"closeall", label:"Close All Windows" }
      ], e.clientX, e.clientY).then(function(r){ if(r && ACTIONS[r.id]) ACTIONS[r.id](); });
    }
  });

  // keyboard shortcuts
  document.addEventListener("keydown", function(e){
    if(e.metaKey || e.ctrlKey){
      if(e.key==="w" || e.key==="W"){ e.preventDefault(); ACTIONS.closewin(); }
      if(e.key==="p" || e.key==="P"){ e.preventDefault(); AP.openProjects(); }
      if(e.key==="k" || e.key==="K"){ e.preventDefault(); AP.openSkills(); }
      if(e.key==="r" || e.key==="R"){ e.preventDefault(); AP.openResume(); }
    }
  });

})();

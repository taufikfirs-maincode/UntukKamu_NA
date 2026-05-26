document.addEventListener("DOMContentLoaded", () => {
  const TARGET_PASSWORD = "04032003";

  const passwordInput = document.getElementById("password-input");
  const btnLogin      = document.getElementById("btn-login");
  const errorMsg      = document.getElementById("error-msg");

  const phase1       = document.getElementById("phase-1");
  const phase2       = document.getElementById("phase-2");
  const phase3       = document.getElementById("phase-3");
  const phase4  = document.getElementById("phase-4");
  const phase5  = document.getElementById("phase-5");

  const btnNext2 = document.getElementById("btn-next-2");
  const btnNext3 = document.getElementById("btn-next-3");
  const btnNext4 = document.getElementById("btn-next-4");
  const btnNext5 = document.getElementById("btn-next-5");
  const btnYes   = document.getElementById("btn-yes");
  const btnNo    = document.getElementById("btn-no");

  // === FLOATING PETALS ===
  const petalSymbols = ["✿", "❀", "✾", "❁", "✽"];

  function createPetals() {
    for (let i = 0; i < 15; i++) {
      const petal = document.createElement("div");
      petal.classList.add("petal");
      petal.textContent = petalSymbols[Math.floor(Math.random() * petalSymbols.length)];
      petal.style.left             = Math.random() * 100 + "vw";
      petal.style.fontSize         = Math.random() * 10 + 9 + "px";
      petal.style.animationDuration = Math.random() * 14 + 10 + "s";
      petal.style.animationDelay   = -(Math.random() * 20) + "s";
      document.body.appendChild(petal);
    }
  }
  createPetals();

  // === TYPEWRITER ===
  function typeWriter(elementId, text, speed) {
    speed = speed || 85;
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = "";

    const cursor = document.createElement("span");
    cursor.classList.add("cursor");
    el.appendChild(cursor);

    let i = 0;
    function type() {
      if (i < text.length) {
        el.insertBefore(document.createTextNode(text[i]), cursor);
        i++;
        setTimeout(type, speed);
      } else {
        setTimeout(function () {
          cursor.style.animation = "none";
          cursor.style.opacity   = "0";
        }, 2800);
      }
    }
    setTimeout(type, 500);
  }

  typeWriter("greeting-text", "Halo, Cantik.");

  // === PHASE TRANSITION ===
  function switchPhase(current, next) {
    current.classList.remove("active");
    setTimeout(function () {
      current.classList.add("hidden");
      next.classList.remove("hidden");
      void next.offsetWidth; // trigger reflow
      next.classList.add("active");
    }, 820);
  }

  // === LOGIN ===
  btnLogin.addEventListener("click", function () {
    var val = passwordInput.value.trim();
    if (val === TARGET_PASSWORD) {
      errorMsg.classList.add("hidden");
      switchPhase(phase1, phase2);
    } else {
      errorMsg.classList.remove("hidden");
      passwordInput.value = "";
      passwordInput.focus();
    }
  });

  passwordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") btnLogin.click();
  });

  // === NAVIGASI BABAK (per-card dalam fase 2 & 3) ===
  function setupBabakNav(phaseEl, nextPhaseEl, btnEl, dotsId, lastLabel) {
    if (!phaseEl || !btnEl) return;
    var cards   = Array.from(phaseEl.querySelectorAll(".babak-card"));
    var dotsEl  = document.getElementById(dotsId);
    var current = 0;

    // Buat dot sesuai jumlah card
    cards.forEach(function (_, i) {
      var dot = document.createElement("span");
      dot.classList.add("babak-dot");
      if (i === 0) dot.classList.add("active");
      dotsEl.appendChild(dot);
    });

    function getDots() {
      return Array.from(dotsEl.querySelectorAll(".babak-dot"));
    }

    // Update label tombol: "Lanjut →" atau label khusus di babak terakhir
    function updateBtn(index) {
      if (!nextPhaseEl && index === cards.length - 1) {
        btnEl.classList.add("nav-end-hidden");
      } else {
        btnEl.classList.remove("nav-end-hidden");
        btnEl.textContent = (index === cards.length - 1 && lastLabel)
          ? lastLabel
          : "Lanjut →";
      }
    }

    updateBtn(0);

    function showCard(index) {
      var dots = getDots();
      cards[current].classList.remove("active");
      dots[current].classList.remove("active");
      var prev = current;
      current = index;

      setTimeout(function () {
        cards[prev].scrollTop = 0;
        cards[current].classList.add("active");
        dots[current].classList.add("active");
        updateBtn(current);
      }, 550);
    }

    function resetNav() {
      var dots = getDots();
      cards.forEach(function (c) { c.classList.remove("active"); });
      dots.forEach(function (d)  { d.classList.remove("active"); });
      cards[0].classList.add("active");
      dots[0].classList.add("active");
      current = 0;
      updateBtn(0);
    }

    btnEl.addEventListener("click", function () {
      if (current < cards.length - 1) {
        showCard(current + 1);
      } else if (nextPhaseEl) {
        switchPhase(phaseEl, nextPhaseEl);
        setTimeout(resetNav, 900);
      }
    });
  }

  setupBabakNav(phase2, phase3, btnNext2, "p2-dots", null);
  setupBabakNav(phase3, phase4, btnNext3, "p3-dots", "Satu hal lagi →");

  // === NAVIGASI FASE 4 — tanpa dots, tombol hilang di halaman terakhir ===
  (function () {
    if (!phase4) return;
    var p4Cards  = Array.from(phase4.querySelectorAll(".babak-card"));
    var p4Current = 0;

    if (!btnNext4 || p4Cards.length === 0) return;

    function showP4Card(index) {
      p4Cards[p4Current].classList.remove("active");
      var prev = p4Current;
      p4Current = index;

      setTimeout(function () {
        p4Cards[prev].scrollTop = 0;
        p4Cards[p4Current].classList.add("active");

        // Sembunyikan tombol navigasi saat tiba di halaman pertanyaan
        if (p4Current === p4Cards.length - 1) {
          btnNext4.classList.add("p4-nav-hidden");
        }
      }, 550);
    }

    btnNext4.addEventListener("click", function () {
      if (p4Current < p4Cards.length - 1) {
        showP4Card(p4Current + 1);
      }
    });
  })();

  // === NO BUTTON RUNS AWAY ===
  function moveNoButton() {
    var maxX = window.innerWidth  - btnNo.offsetWidth  - 20;
    var maxY = window.innerHeight - btnNo.offsetHeight - 20;
    btnNo.style.position   = "fixed";
    btnNo.style.transition = "left 0.18s ease, top 0.18s ease";
    btnNo.style.left       = Math.max(10, Math.random() * maxX) + "px";
    btnNo.style.top        = Math.max(10, Math.random() * maxY) + "px";
  }

  if (btnNo) {
    btnNo.addEventListener("mouseover",  moveNoButton);
    btnNo.addEventListener("touchstart", function (e) { e.preventDefault(); moveNoButton(); });
  }

  // === FLOATING HEARTS (success) ===
  var heartSymbols = ["♥", "❤️", "♡", "✧", "✦"];

  function launchFloatingHearts() {
    for (var i = 0; i < 14; i++) {
      (function (delay) {
        setTimeout(function () {
          var heart = document.createElement("div");
          heart.classList.add("floating-heart");
          heart.textContent             = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
          heart.style.left              = 12 + Math.random() * 76 + "vw";
          heart.style.bottom            = "6vh";
          heart.style.fontSize          = 1.2 + Math.random() * 1.6 + "rem";
          heart.style.color             = Math.random() > 0.5 ? "#C9A99A" : "#D5BDAF";
          heart.style.animationDuration = 2.2 + Math.random() * 2.6 + "s";
          document.body.appendChild(heart);
          setTimeout(function () { heart.remove(); }, 5500);
        }, delay);
      })(i * 180);
    }
  }

  // === CONFESSION DATE ===
  function setConfessionDate() {
    var now = new Date();
    var formatted = now.toLocaleDateString("id-ID", {
      weekday: "long",
      year:    "numeric",
      month:   "long",
      day:     "numeric"
    });
    var el = document.getElementById("confession-date");
    if (el) el.textContent = formatted;
  }

  // === NAVIGASI FASE 5 — tanpa dots, tombol hilang di halaman terakhir ===
  (function () {
    if (!phase5) return;
    var p5Cards   = Array.from(phase5.querySelectorAll(".babak-card"));
    var p5Dots    = document.getElementById("p5-dots");
    var p5Current = 0;

    if (!btnNext5 || p5Cards.length === 0) return;

    p5Cards.forEach(function (_, i) {
      var dot = document.createElement("span");
      dot.classList.add("babak-dot");
      if (i === 0) dot.classList.add("active");
      p5Dots.appendChild(dot);
    });

    function getP5Dots() {
      return Array.from(p5Dots.querySelectorAll(".babak-dot"));
    }

    function showP5Card(index) {
      var dots = getP5Dots();
      p5Cards[p5Current].classList.remove("active");
      dots[p5Current].classList.remove("active");
      var prev = p5Current;
      p5Current = index;

      setTimeout(function () {
        p5Cards[prev].scrollTop = 0;
        p5Cards[p5Current].classList.add("active");
        dots[p5Current].classList.add("active");

        if (p5Current === p5Cards.length - 1) {
          btnNext5.classList.add("p5-nav-hidden");
        }
      }, 550);
    }

    btnNext5.addEventListener("click", function () {
      if (p5Current < p5Cards.length - 1) {
        showP5Card(p5Current + 1);
      }
    });
  })();

  // === YES BUTTON ===
  if (btnYes) btnYes.addEventListener("click", function () {
    setConfessionDate();
    switchPhase(phase4, phase5);

    setTimeout(function () {
      launchFloatingHearts();

      var end = Date.now() + 4000;
      (function frame() {
        confetti({
          particleCount: 6,
          angle:         60,
          spread:        65,
          origin:        { x: 0, y: 0.85 },
          colors:        ["#D5BDAF", "#F5EBE0", "#E3D5CA", "#EDCFB5", "#ffffff"],
          scalar:        0.9
        });
        confetti({
          particleCount: 6,
          angle:         120,
          spread:        65,
          origin:        { x: 1, y: 0.85 },
          colors:        ["#D5BDAF", "#F5EBE0", "#E3D5CA", "#EDCFB5", "#ffffff"],
          scalar:        0.9
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }, 900);
  });
});

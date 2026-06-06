document.addEventListener("DOMContentLoaded", () => {
  // Credentials stored as SHA-256 hashes — plain values not kept in source
  var PW_HASH =
    "0bb82c1b75ba8e42035c089da44bf7aa2512f33096574a4d216df04bdc90f546";
  var SONG_HASH =
    "0c1a70e4512ee6f78c92820756a4026ce1f93872369624f31cf206614b2e231f";

  function sha256hex(str) {
    return crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(str))
      .then(function (buf) {
        return Array.from(new Uint8Array(buf))
          .map(function (b) {
            return b.toString(16).padStart(2, "0");
          })
          .join("");
      });
  }

  const passwordInput = document.getElementById("password-input");
  const btnLogin = document.getElementById("btn-login");
  const errorMsg = document.getElementById("error-msg");

  const phase1 = document.getElementById("phase-1");
  const phaseAnnounce = document.getElementById("phase-announce");
  const phaseBoombox = document.getElementById("phase-boombox");
  const phaseNav = document.getElementById("phase-nav");
  const phase2 = document.getElementById("phase-2");
  const phase3 = document.getElementById("phase-3");
  const phase4 = document.getElementById("phase-4");
  const phase5 = document.getElementById("phase-5");
  const musSummer = document.getElementById("mus-summer");
  const musChill = [
    document.getElementById("mus-chill-1"),
    document.getElementById("mus-chill-2"),
    document.getElementById("mus-chill-3"),
    document.getElementById("mus-chill-4"),
    document.getElementById("mus-chill-5"),
  ];
  const musNothing = document.getElementById("mus-nothing");
  const musBab2 = document.getElementById("mus-bab2");
  const musBersamamu = document.getElementById("mus-bersamamu");
  const musTenerife = document.getElementById("mus-tenerife");
  const musSatuTuju = document.getElementById("mus-satutuju");

  const btnNext2 = document.getElementById("btn-next-2");
  const btnNext3 = document.getElementById("btn-next-3");
  const btnNext4 = document.getElementById("btn-next-4");
  const btnNext5 = document.getElementById("btn-next-5");
  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");
  const btnHint = document.getElementById("btn-hint");
  const hintMsg = document.getElementById("hint-msg");

  const songIdInput = document.getElementById("song-id-input");
  const btnPlaySong = document.getElementById("btn-play-song");
  const songError = document.getElementById("song-error");

  // === FLOATING PETALS ===
  const petalSymbols = ["✿", "❀", "✾", "❁", "✽"];

  function createPetals() {
    for (let i = 0; i < 15; i++) {
      const petal = document.createElement("div");
      petal.classList.add("petal");
      petal.textContent =
        petalSymbols[Math.floor(Math.random() * petalSymbols.length)];
      petal.style.left = Math.random() * 100 + "vw";
      petal.style.fontSize = Math.random() * 10 + 9 + "px";
      petal.style.animationDuration = Math.random() * 14 + 10 + "s";
      petal.style.animationDelay = -(Math.random() * 20) + "s";
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
          cursor.style.opacity = "0";
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

  // === PHASE-4 TWINKLING STARS ===
  var p4StarsSpawned = false;
  function spawnP4Stars() {
    if (p4StarsSpawned) return;
    p4StarsSpawned = true;
    var container = document.getElementById("p4-stars");
    if (!container) return;
    for (var i = 0; i < 110; i++) {
      (function () {
        var s = document.createElement("span");
        s.className = "p4-star";
        var size = 0.6 + Math.random() * 2.2;
        s.style.width  = size + "px";
        s.style.height = size + "px";
        s.style.left   = Math.random() * 100 + "%";
        s.style.top    = Math.random() * 100 + "%";
        s.style.animationDuration  = (1.5 + Math.random() * 4) + "s";
        s.style.animationDelay     = -(Math.random() * 5) + "s";
        container.appendChild(s);
      })();
    }
  }

  // nav4JumpToCard / nav5JumpToCard — exposed by phase IIFEs
  var nav4JumpToCard = null;
  var nav5JumpToCard = null;

  // === FASE 5 UNLOCK FLAG ===
  var FASE5_KEY = "nabila_fase5";
  var fase5Reached = sessionStorage.getItem(FASE5_KEY) === "1";
  if (fase5Reached) document.body.classList.add("fase5-reached");

  function unlockFase5Nav() {
    if (fase5Reached) return;
    fase5Reached = true;
    sessionStorage.setItem(FASE5_KEY, "1");
    document.body.classList.add("fase5-reached");
  }

  // === SESSION ===
  var SESSION_KEY = "nabila_sesi";
  var authenticated = false;
  var stopInterludioClock = function () {};

  function saveSession(phaseId, cardIdx) {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ phase: phaseId, card: cardIdx || 0 }),
    );
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function loadSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY));
    } catch (e) {
      return null;
    }
  }

  // === INACTIVITY TIMER (auto-logout after 60 s idle) ===
  var inactivityTimer = null;

  function resetInactivityTimer() {
    if (!authenticated) return;
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(doLogout, 180000);
  }

  [
    "mousemove",
    "mousedown",
    "touchstart",
    "keydown",
    "scroll",
    "click",
  ].forEach(function (evt) {
    document.addEventListener(evt, resetInactivityTimer, { passive: true });
  });

  // === LOGOUT ===
  function doLogout() {
    authenticated = false;
    clearTimeout(inactivityTimer);
    clearSession();
    stopInterludioClock();
    fadeOutAllMusic(700);
    var floatingExit = document.getElementById("btn-floating-exit");
    if (floatingExit) floatingExit.classList.add("hidden");
    var floatingNavBtn = document.getElementById("btn-floating-nav");
    if (floatingNavBtn) floatingNavBtn.classList.add("hidden");
    var activePhase = document.querySelector(".phase.active");
    if (activePhase && activePhase !== phase1) {
      activePhase.classList.remove("active");
      setTimeout(function () {
        activePhase.classList.add("hidden");
        phase1.classList.remove("hidden");
        void phase1.offsetWidth;
        phase1.classList.add("active");
        passwordInput.value = "";
        failCount = 0;
        errorMsg.classList.add("hidden");
        quoteMsg.classList.add("hidden");
        btnHint.classList.add("hidden");
        hintMsg.classList.add("hidden");
      }, 820);
    }
  }

  // === LOGIN ===
  const quoteMsg = document.getElementById("quote-msg");
  var failCount = 0;

  const motivasiGagal = [
    "Jangan menyerah ya... aku percaya kamu pasti ingat. ♡",
    "Hmm, salah lagi? Coba tarik napas, lalu pikirkan perlahan~",
    "Kata orang bijak: hadiahnya selalu sepadan dengan usahanya. Semangat!",
    "Aku masih di sini, menunggumu. Jangan buat aku menunggu terlalu lama ya.",
    "Ssstt... di balik pintu ini ada sesuatu yang sangat indah. Coba lagi! ♡",
    "Kamu pasti bisa! Tanggal itu spesial, pasti tersimpan di suatu sudut ingatanmu.",
    "Belum berhasil? Tidak apa-apa. Yang penting jangan menyerah~",
    "Ini bukan ujian, aku janji. Tapi tetap harus usaha sendiri ya, hehe.",
    "Setiap percobaan membawamu satu langkah lebih dekat. Percaya deh!",
    "Kalau kamu menyerah sekarang, kamu tidak akan pernah tahu apa yang menunggumu. ♡",
    "Hmm... sepertinya otakmu sedang cuti. Coba ajak dia kerja dulu ya~",
    "Jangan sampai menyerah hanya karena angka. Kamu lebih dari itu!",
  ];

  btnLogin.addEventListener("click", function () {
    var val = passwordInput.value.trim();
    if (!val) return;
    sha256hex(val).then(function (hash) {
      if (hash === PW_HASH) {
        errorMsg.classList.add("hidden");
        quoteMsg.classList.add("hidden");
        btnHint.classList.add("hidden");
        hintMsg.classList.add("hidden");
        switchPhase(phase1, phaseAnnounce);
        // One Summer's Day — pemberitahuan → prolog (gesture: tombol login)
        playTrack(musSummer);
      } else {
        failCount++;
        errorMsg.classList.remove("hidden");
        passwordInput.value = "";
        passwordInput.focus();

        if (failCount % 2 === 0) {
          var idx = Math.floor(Math.random() * motivasiGagal.length);
          quoteMsg.textContent = motivasiGagal[idx];
          quoteMsg.classList.remove("hidden");
          quoteMsg.style.animation = "none";
          void quoteMsg.offsetWidth;
          quoteMsg.style.animation = "";
        } else {
          quoteMsg.classList.add("hidden");
        }

        if (failCount >= 10) {
          btnHint.classList.remove("hidden");
        }
      }
    });
  });

  passwordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") btnLogin.click();
  });

  // === MUSIC ENGINE — smooth crossfades, one looping track per context ===
  var TARGET_VOL = 0.1;
  var chillActive = false;
  var allMusic = [musSummer]
    .concat(musChill)
    .concat([musNothing, musBab2, musBersamamu, musTenerife, musSatuTuju]);

  allMusic.forEach(function (a) {
    if (a) a.volume = TARGET_VOL;
  });

  // Fade a single audio element out, then pause + reset.
  function fadeAudioOut(a, dur, cb) {
    if (!a) {
      if (cb) cb();
      return;
    }
    if (a.paused) {
      try {
        a.currentTime = 0;
        a.volume = TARGET_VOL;
      } catch (e) {}
      if (cb) cb();
      return;
    }
    var steps = Math.max(1, Math.round((dur || 1500) / 60));
    var startV = a.volume,
      i = 0,
      t;
    t = setInterval(function () {
      i++;
      var v = Math.max(0, startV * (1 - i / steps));
      try {
        a.volume = v;
      } catch (e) {}
      if (i >= steps) {
        clearInterval(t);
        try {
          a.pause();
          a.currentTime = 0;
          a.volume = TARGET_VOL;
        } catch (e) {}
        if (cb) cb();
      }
    }, 60);
  }

  // Fade a single audio element in from 0 to TARGET_VOL.
  function fadeAudioIn(a, dur, startAt) {
    if (!a) return;
    try {
      if (typeof startAt === "number") a.currentTime = startAt;
      a.volume = 0;
      a.play().catch(function () {});
    } catch (e) {}
    var steps = Math.max(1, Math.round((dur || 1800) / 60));
    var i = 0,
      t;
    t = setInterval(function () {
      i++;
      var v = Math.min(TARGET_VOL, TARGET_VOL * (i / steps));
      try {
        a.volume = v;
      } catch (e) {}
      if (i >= steps) clearInterval(t);
    }, 60);
  }

  // Fade out every track that's currently audible.
  function fadeOutAllMusic(dur, cb) {
    chillActive = false;
    var list = allMusic.filter(function (a) {
      return a && !a.paused;
    });
    if (!list.length) {
      if (cb) cb();
      return;
    }
    var done = 0;
    list.forEach(function (a) {
      fadeAudioOut(a, dur, function () {
        done++;
        if (done === list.length && cb) cb();
      });
    });
  }

  // Crossfade into one looping track (fade others out, fade this in).
  function playTrack(audio, opts) {
    opts = opts || {};
    var dur = opts.fadeDur || 1600;
    chillActive = false;
    allMusic.forEach(function (a) {
      if (a && a !== audio && !a.paused) fadeAudioOut(a, dur);
    });
    if (audio && audio.paused) fadeAudioIn(audio, dur, 0);
  }

  // Interlude → fade everything to silence.
  function fadeToSilence(dur) {
    fadeOutAllMusic(dur || 2200);
  }

  // Gerbang → random Chill track, looping to a new random one when it ends.
  function playChillRandom(opts) {
    opts = opts || {};
    var dur = opts.fadeDur || 1600;
    chillActive = true;
    var curChill = null;
    musChill.forEach(function (c) {
      if (c && !c.paused) curChill = c;
    });
    var pick = musChill[Math.floor(Math.random() * musChill.length)];
    if (curChill && pick === curChill && musChill.length > 1) {
      do {
        pick = musChill[Math.floor(Math.random() * musChill.length)];
      } while (pick === curChill);
    }
    allMusic.forEach(function (a) {
      if (a && a !== pick && !a.paused) fadeAudioOut(a, dur);
    });
    if (pick.paused) fadeAudioIn(pick, dur, 0);
  }

  musChill.forEach(function (c) {
    if (!c) return;
    c.addEventListener("ended", function () {
      if (!chillActive) return;
      var nxt = musChill[Math.floor(Math.random() * musChill.length)];
      try {
        nxt.volume = TARGET_VOL;
        nxt.currentTime = 0;
        nxt.play().catch(function () {});
      } catch (e) {}
    });
  });

  // BAB II music helper
  function playBab2Music() {
    playTrack(musBab2);
  }

  // After login + announcement → show the Prolog directly (not the gerbang).
  // Music: One Summer's Day continues from the announcement through the prolog.
  phaseAnnounce.addEventListener("click", function () {
    saveSession("phase-2", 0);
    switchPhase(phaseAnnounce, phase2);
    playTrack(musSummer);
  });

  // === BOOMBOX: Radio Rahasia ===
  if (btnPlaySong) {
    var songFailCount = 0;
    btnPlaySong.addEventListener("click", function () {
      var val = songIdInput.value.trim();
      if (!val) return;
      sha256hex(val).then(function (hash) {
        if (hash === SONG_HASH) {
          songError.classList.add("hidden");
          var boomboxEl = document.getElementById("boombox");
          var lcdEl = document.getElementById("bb-lcd");
          if (boomboxEl) boomboxEl.classList.add("bb-playing");
          if (lcdEl) lcdEl.textContent = "♪ NOW PLAYING ♪";
          setTimeout(function () {
            authenticated = true;
            resetInactivityTimer();
            var floatingExit = document.getElementById("btn-floating-exit");
            if (floatingExit) floatingExit.classList.remove("hidden");
            var floatingNavBtn2 = document.getElementById("btn-floating-nav");
            if (floatingNavBtn2) floatingNavBtn2.classList.remove("hidden");
            navigateToDestination(pendingNavCard.phase, pendingNavCard.card);
          }, 2400);
        } else {
          songFailCount++;
          songIdInput.value = "";
          songIdInput.focus();
          songError.classList.remove("hidden");
          if (songFailCount >= 3) {
            songError.textContent =
              "~ Bukan itu kodemu ~ (Petunjuk: separuh dari kode pertamamu ♥)";
          }
        }
      });
    });
    songIdInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") btnPlaySong.click();
    });
  }

  // === HINT BUTTON ===
  btnHint.addEventListener("click", function () {
    hintMsg.classList.remove("hidden");
    btnHint.classList.add("hidden");
  });

  // === NAVIGASI BABAK (per-card dalam fase 2 & 3) ===
  function setupBabakNav(
    phaseEl,
    nextPhaseEl,
    btnEl,
    dotsId,
    lastLabel,
    onNextPhase,
  ) {
    if (!phaseEl || !btnEl) return;
    var cards = Array.from(phaseEl.querySelectorAll(".babak-card"));
    var dotsEl = document.getElementById(dotsId);
    var wrapper = phaseEl.querySelector(".babak-wrapper");
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
      var curCard = cards[index];
      // Card that routes to the gerbang instead of advancing (e.g. Prolog)
      if (curCard && curCard.dataset.gerbang === "true") {
        btnEl.classList.remove("nav-end-hidden");
        btnEl.textContent =
          curCard.dataset.btnLabel || "✦ Menuju Gerbang Lorong Waktu";
        btnEl.classList.add("btn-interlude-mode");
        return;
      }
      if (!nextPhaseEl && index === cards.length - 1) {
        btnEl.classList.add("nav-end-hidden");
        btnEl.classList.remove("btn-interlude-mode");
      } else {
        btnEl.classList.remove("nav-end-hidden");
        var nextCard = cards[index + 1];
        var advanceLabel = nextCard && nextCard.dataset.advanceLabel;
        btnEl.textContent =
          advanceLabel ||
          (index === cards.length - 1 && lastLabel ? lastLabel : "Lanjut →");
        if (advanceLabel) {
          btnEl.classList.add("btn-interlude-mode");
        } else {
          btnEl.classList.remove("btn-interlude-mode");
        }
      }
    }

    updateBtn(0);

    // Sembunyikan tombol Lanjut + tampilkan fade overlay sampai user scroll ke bawah
    function gateNextBtn(card) {
      if (btnEl.classList.contains("nav-end-hidden")) {
        if (wrapper) wrapper.classList.add("at-bottom");
        return;
      }
      btnEl.classList.add("btn-scroll-hidden");
      if (wrapper) wrapper.classList.remove("at-bottom");
      // Mini-game card: external nav button stays fully hidden — game has its own "next" button
      if (card.dataset.minigame) {
        btnEl.classList.add("nav-end-hidden");
        return;
      }

      function onScroll() {
        if (card.scrollHeight - card.scrollTop - card.clientHeight < 24) {
          btnEl.classList.remove("btn-scroll-hidden");
          if (wrapper) wrapper.classList.add("at-bottom");
          card.removeEventListener("scroll", onScroll);
        }
      }

      if (card.scrollHeight - card.scrollTop - card.clientHeight < 24) {
        btnEl.classList.remove("btn-scroll-hidden");
        if (wrapper) wrapper.classList.add("at-bottom");
      } else {
        card.addEventListener("scroll", onScroll);
      }
    }

    function showCard(index) {
      var dots = getDots();
      cards[current].classList.remove("active");
      dots[current].classList.remove("active");
      if (wrapper) wrapper.classList.remove("at-bottom");
      var prev = current;
      current = index;

      setTimeout(function () {
        cards[prev].scrollTop = 0;
        cards[current].classList.add("active");
        dots[current].classList.add("active");
        updateBtn(current);
        gateNextBtn(cards[current]);
        // Reset mini-game when the user navigates back to it
        if (typeof cards[current]._reset === "function")
          cards[current]._reset();
        saveSession(phaseEl.id, current);
        // Prolog (One Summer's Day) ↔ chapter (Nothing) crossfade — phase-2
        if (phaseEl.id === "phase-2") {
          if (prev === 0 && current !== 0) playTrack(musNothing);
          else if (prev !== 0 && current === 0) playTrack(musSummer);
        }
      }, 550);
    }

    function resetNav() {
      var dots = getDots();
      cards.forEach(function (c) {
        c.classList.remove("active");
      });
      dots.forEach(function (d) {
        d.classList.remove("active");
      });
      cards[0].classList.add("active");
      dots[0].classList.add("active");
      if (wrapper) wrapper.classList.remove("at-bottom");
      current = 0;
      updateBtn(0);
    }

    btnEl.addEventListener("click", function () {
      var curCard = cards[current];
      // Prolog → open the gerbang to choose a starting point
      if (curCard && curCard.dataset.gerbang === "true" && phaseNav) {
        saveSession("phase-nav", 0);
        switchPhase(phaseEl, phaseNav);
        setTimeout(function () { playChillRandom(); }, 950);
        return;
      }
      if (current < cards.length - 1) {
        showCard(current + 1);
      } else if (nextPhaseEl) {
        switchPhase(phaseEl, nextPhaseEl);
        setTimeout(resetNav, 900);
        if (typeof onNextPhase === "function") setTimeout(onNextPhase, 920);
      }
    });

    var btnBack = phaseEl.querySelector(".btn-back-start");
    if (btnBack) {
      btnBack.addEventListener("click", function (e) {
        e.stopPropagation();
        showCard(0);
      });
    }

    var btnLogoutPage = phaseEl.querySelector(".btn-logout-page");
    if (btnLogoutPage) {
      btnLogoutPage.addEventListener("click", function (e) {
        e.stopPropagation();
        doLogout();
      });
    }

    var btnsPrev = Array.from(phaseEl.querySelectorAll(".btn-back-prev"));
    btnsPrev.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (current > 0) showCard(current - 1);
      });
    });

    // Gate tombol awal saat fase pertama kali aktif
    var phaseObserver = new MutationObserver(function () {
      if (phaseEl.classList.contains("active")) {
        phaseObserver.disconnect();
        setTimeout(function () {
          gateNextBtn(cards[0]);
        }, 80);
      }
    });
    phaseObserver.observe(phaseEl, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return {
      jumpToCard: function (index) {
        if (index < 0 || index >= cards.length) return;
        var dots = getDots();
        cards[current].classList.remove("active");
        dots[current].classList.remove("active");
        current = index;
        cards[current].classList.add("active");
        dots[current].classList.add("active");
        updateBtn(current);
        gateNextBtn(cards[current]);
      },
      reset: function () {
        resetNav();
      },
    };
  }

  var nav2 = setupBabakNav(
    phase2,
    phase3,
    btnNext2,
    "p2-dots",
    "BAB II →",
    function () {
      if (nav3) nav3.reset();
    },
  );
  // nextPhaseEl = null → interlude card's own unlock button advances to BAB III
  var nav3 = setupBabakNav(phase3, null, btnNext3, "p3-dots", null);

  if (phase3) {
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.attributeName !== "class") return;
        if (phase3.classList.contains("active")) {
          // Only start BAB II music if the interlude card isn't the active one
          var intCardEl = document.getElementById("interlude-card");
          var onInterlude = intCardEl && intCardEl.classList.contains("active");
          if (!onInterlude) playBab2Music();
        } else {
          stopInterludioClock();
        }
      });
    }).observe(phase3, { attributes: true, attributeFilter: ["class"] });
  }

  // === PHASE NAV: chapter & bab selection ===
  var pendingNavCard = { phase: "phase-2", card: 0 };

  function navigateToDestination(targetPhase, cardIdx) {
    var current = document.querySelector(".phase.active");
    if (!current) return;

    if (targetPhase === "phase-5") {
      var p5live = document.getElementById("phase-5");
      if (!p5live) return;
      saveSession("phase-5", cardIdx);
      switchPhase(current, p5live);
      setTimeout(function () { playTrack(musSatuTuju); }, 950);
      setTimeout(function () { if (nav5JumpToCard) nav5JumpToCard(cardIdx); }, 1100);
    } else if (targetPhase === "phase-4") {
      saveSession("phase-4", cardIdx);
      switchPhase(current, phase4);
      spawnP4Stars();
      // Bagian 1–5 → Bersamamu, Bagian 6 → Tenerife Sea
      setTimeout(function () {
        playTrack(cardIdx >= 5 ? musTenerife : musBersamamu);
      }, 950);
      setTimeout(function () { if (nav4JumpToCard) nav4JumpToCard(cardIdx); }, 1100);
    } else if (targetPhase === "phase-3") {
      saveSession("phase-3", cardIdx);
      switchPhase(current, phase3);
      // phase-3 observer crossfades to BAB II music on activation
      setTimeout(function () { if (nav3) nav3.jumpToCard(cardIdx); }, 1100);
    } else {
      saveSession("phase-2", cardIdx);
      switchPhase(current, phase2);
      // Prolog → One Summer's Day, chapters → Nothing
      setTimeout(function () {
        playTrack(cardIdx === 0 ? musSummer : musNothing);
      }, 950);
      setTimeout(function () { if (nav2) nav2.jumpToCard(cardIdx); }, 1100);
    }
  }

  (function () {
    if (!phaseNav) return;
    Array.from(phaseNav.querySelectorAll(".nav-option-btn")).forEach(
      function (btn) {
        btn.addEventListener("click", function () {
          var cardIdx = parseInt(btn.getAttribute("data-card"), 10) || 0;
          var targetPhase = btn.getAttribute("data-phase") || "phase-2";
          if (!authenticated) {
            pendingNavCard = { phase: targetPhase, card: cardIdx };
            switchPhase(phaseNav, phaseBoombox);
            return;
          }
          navigateToDestination(targetPhase, cardIdx);
        });
      },
    );
  })();

  // === FLOATING NAV BUTTON: kembali ke Gerbang Lorong Waktu ===
  (function () {
    var btnFNav = document.getElementById("btn-floating-nav");
    if (!btnFNav || !phaseNav) return;
    btnFNav.addEventListener("click", function () {
      var current = document.querySelector(".phase.active");
      if (!current || current.id === "phase-nav") return;
      stopInterludioClock();
      saveSession("phase-nav", 0);
      switchPhase(current, phaseNav);
      // Gerbang music: random Chill track
      setTimeout(function () { playChillRandom(); }, 950);
    });
  })();

  // === INTERLUDE: Jeda di Antara Waktu ===
  (function () {
    var intCard = document.getElementById("interlude-card");
    if (!intCard) return;

    var starsEl = document.getElementById("il-stars");
    var starsSpawned = false;

    function spawnStars() {
      if (!starsEl || starsSpawned) return;
      starsSpawned = true;
      for (var i = 0; i < 65; i++) {
        (function () {
          var s = document.createElement("span");
          s.className = "il-star";
          var size = 0.7 + Math.random() * 2.4;
          s.style.width = size + "px";
          s.style.height = size + "px";
          s.style.left = Math.random() * 100 + "%";
          s.style.top = 10 + Math.random() * 110 + "%";
          s.style.animationDuration = 20 + Math.random() * 34 + "s";
          s.style.animationDelay = -(Math.random() * 36) + "s";
          starsEl.appendChild(s);
        })();
      }
    }


    function startTagTypewriter() {
      var tagEl = document.getElementById("il-tag");
      if (!tagEl) return;
      tagEl.textContent = "";
      var text = "[ Interlude — Kunci yang Akhirnya Tiba ]";
      var i = 0;
      setTimeout(function tick() {
        if (i < text.length) {
          tagEl.textContent = text.slice(0, ++i);
          setTimeout(tick, 62);
        }
      }, 450);
    }

    stopInterludioClock = function () {};

    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.attributeName !== "class") return;
        if (intCard.classList.contains("active")) {
          spawnStars();
          startTagTypewriter();
          // Interlude → fade music out into silence
          fadeToSilence(2400);
        } else {
          var tagEl = document.getElementById("il-tag");
          if (tagEl) tagEl.textContent = "";
          // Going back to a BAB II bagian → restore BAB II music
          if (phase3 && phase3.classList.contains("active")) playBab2Music();
        }
      });
    }).observe(intCard, { attributes: true, attributeFilter: ["class"] });

    var btnUnlock = document.getElementById("btn-bab3-unlock");
    if (btnUnlock) {
      btnUnlock.addEventListener("click", function () {
        var current = document.querySelector(".phase.active");
        if (!current || !phase4) return;
        saveSession("phase-4", 0);
        switchPhase(current, phase4);
        spawnP4Stars();
        // BAB III Bagian 1 → Bersamamu
        setTimeout(function () { playTrack(musBersamamu); }, 950);
      });
    }
  })();

  // === NAVIGASI FASE 4 — scroll-triggered typewriter, no-button escalation ===
  (function () {
    if (!phase4) return;
    var p4Cards = Array.from(phase4.querySelectorAll(".babak-card"));
    var p4Current = 0;
    if (!btnNext4 || p4Cards.length === 0) return;

    var lastCardIndex = p4Cards.length - 1;
    var p4Wrapper = phase4.querySelector(".babak-wrapper");

    // Reveal Lanjut only after scrolling to the bottom of the card (like fase 2/3)
    function gateNext4(card) {
      if (p4Current === lastCardIndex) return; // last card → no Lanjut
      btnNext4.classList.add("btn-scroll-hidden");
      if (p4Wrapper) p4Wrapper.classList.remove("at-bottom");
      function reveal() {
        btnNext4.classList.remove("btn-scroll-hidden");
        if (p4Wrapper) p4Wrapper.classList.add("at-bottom");
      }
      function onScroll() {
        if (card.scrollHeight - card.scrollTop - card.clientHeight < 24) {
          reveal();
          card.removeEventListener("scroll", onScroll);
        }
      }
      if (card.scrollHeight - card.scrollTop - card.clientHeight < 24) reveal();
      else card.addEventListener("scroll", onScroll);
    }
    var p4QuestionEl  = document.getElementById("p4-question-typed");
    var p4CursorEl    = document.getElementById("p4-cursor");
    var p4ActionBtns  = document.getElementById("p4-action-buttons");
    var p4NoMsgEl     = document.getElementById("p4-no-msg");
    var p4QuestionWrap = document.getElementById("p4-question-wrap") ||
                         (p4QuestionEl && p4QuestionEl.closest(".p4-question-wrap"));

    var P4_QUESTION = "Nabila Aisyah, lorong waktu yang dimulai dari sebuah permainan ini telah membawaku pada satu-satunya kenyataan yang kuinginkan. Maukah kamu meresmikan kenyataan itu, dan menjadi kekasihku?";
    var typewriterStarted = false;

    function startQuestionTypewriter() {
      if (typewriterStarted || !p4QuestionEl) return;
      typewriterStarted = true;
      p4QuestionEl.textContent = "";
      var i = 0;
      var timer = setInterval(function () {
        p4QuestionEl.textContent = P4_QUESTION.slice(0, ++i);
        if (i >= P4_QUESTION.length) {
          clearInterval(timer);
          setTimeout(function () {
            if (p4CursorEl) p4CursorEl.classList.add("p4-cursor-done");
            if (p4ActionBtns) p4ActionBtns.classList.add("revealed");
          }, 480);
        }
      }, 42);
    }

    // Scroll-triggered typewriter via IntersectionObserver
    function setupScrollTypewriter() {
      if (!p4QuestionWrap) {
        // Fallback: delay-based
        setTimeout(startQuestionTypewriter, 900);
        return;
      }
      var lastCard = p4Cards[lastCardIndex];
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startQuestionTypewriter();
            obs.disconnect();
          }
        });
      }, { root: lastCard, threshold: 0.15 });
      obs.observe(p4QuestionWrap);
    }

    // Back buttons inside phase-4
    p4Cards.forEach(function (card, idx) {
      var backBtn = card.querySelector(".btn-back-prev");
      if (backBtn) {
        backBtn.addEventListener("click", function () {
          if (idx > 0) showP4Card(idx - 1);
        });
      }
    });

    function showP4Card(index) {
      p4Cards[p4Current].classList.remove("active");
      var prev = p4Current;
      p4Current = index;
      setTimeout(function () {
        p4Cards[prev].scrollTop = 0;
        p4Cards[p4Current].classList.add("active");
        // Music: Bagian 1–5 → Bersamamu, Bagian 6 → Tenerife Sea
        playTrack(p4Current >= 5 ? musTenerife : musBersamamu);
        if (p4Current === lastCardIndex) {
          btnNext4.classList.add("p4-nav-hidden");
          // Set up scroll-triggered typewriter after card is visible
          setTimeout(setupScrollTypewriter, 600);
        } else {
          btnNext4.classList.remove("p4-nav-hidden");
          gateNext4(p4Cards[p4Current]);
        }
      }, 550);
    }

    // Expose jump function for gerbang navigation
    nav4JumpToCard = function (index) {
      if (p4Current === index && p4Cards[index].classList.contains("active")) return;
      showP4Card(index);
    };

    btnNext4.addEventListener("click", function () {
      if (p4Current < lastCardIndex) showP4Card(p4Current + 1);
    });

    // Spawn stars + gate the Lanjut button when phase-4 becomes active
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.attributeName !== "class") return;
        if (phase4.classList.contains("active")) {
          spawnP4Stars();
          setTimeout(function () {
            if (p4Current === lastCardIndex) {
              btnNext4.classList.add("p4-nav-hidden");
              setupScrollTypewriter();
            } else {
              btnNext4.classList.remove("p4-nav-hidden");
              gateNext4(p4Cards[p4Current]);
            }
          }, 120);
        }
      });
    }).observe(phase4, { attributes: true, attributeFilter: ["class"] });

    // === NGGAK — escalating personal messages ===
    var noEscapeMessages = [
      "Eh... kayaknya kamu salah tombol deh.",
      "Ini bukan map Mount Kucing — nggak ada rute kabur di sini.",
      "Sapi di padang rumput pun akhirnya ditemukan. Masa kamu nggak?",
      "Indra pernah bilang ‘Kapan lagi, bodoh.’ Aku masih setuju sama dia.",
      "Jujur... aku nggak akan berhenti nyoba. Kamu sudah tahu itu.",
      "— akhirnya tombol ini memilih untuk resign —"
    ];
    var noClickCount = 0;
    var noMsgTimer = null;

    function showNoMsg(text, duration) {
      if (!p4NoMsgEl) return;
      clearTimeout(noMsgTimer);
      p4NoMsgEl.textContent = text;
      p4NoMsgEl.classList.add("visible");
      noMsgTimer = setTimeout(function () {
        p4NoMsgEl.classList.remove("visible");
      }, duration || 2800);
    }

    function moveNoButton() {
      if (!btnNo) return;
      noClickCount++;
      var msg = noEscapeMessages[Math.min(noClickCount - 1, noEscapeMessages.length - 1)];
      showNoMsg(msg, noClickCount >= noEscapeMessages.length ? 3200 : 2600);

      if (noClickCount >= noEscapeMessages.length) {
        // Final message — then disappear
        setTimeout(function () {
          btnNo.style.transition = "opacity 0.8s ease";
          btnNo.style.opacity = "0";
          btnNo.style.pointerEvents = "none";
          setTimeout(function () { btnNo.style.display = "none"; }, 900);
          // Show last line then pulse Iya harder
          showNoMsg("Sepertinya cuma ada satu pilihan yang tersisa…", 3500);
          setTimeout(function () {
            if (btnYes) btnYes.classList.add("pulse-strong");
          }, 3600);
        }, 3300);
        return;
      }

      // Keep it inside a central, easy-to-spot band (avoid edges & corners)
      var bw = btnNo.offsetWidth,
        bh = btnNo.offsetHeight;
      var minX = window.innerWidth * 0.12;
      var maxX = window.innerWidth * 0.88 - bw;
      var minY = window.innerHeight * 0.34;
      var maxY = window.innerHeight * 0.74 - bh;
      if (maxX < minX) maxX = minX;
      if (maxY < minY) maxY = minY;
      btnNo.style.position = "fixed";
      btnNo.style.transition = "left 0.22s ease, top 0.22s ease";
      btnNo.style.left = minX + Math.random() * (maxX - minX) + "px";
      btnNo.style.top = minY + Math.random() * (maxY - minY) + "px";
    }

    if (btnNo) {
      btnNo.addEventListener("mouseover", moveNoButton);
      btnNo.addEventListener("touchstart", function (e) {
        e.preventDefault();
        moveNoButton();
      });
    }
  })();

  // === FLOATING HEARTS (success) ===
  var heartSymbols = ["♥", "❤️", "♡", "✧", "✦"];

  function launchFloatingHearts() {
    for (var i = 0; i < 14; i++) {
      (function (delay) {
        setTimeout(function () {
          var heart = document.createElement("div");
          heart.classList.add("floating-heart");
          heart.textContent =
            heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
          heart.style.left = 12 + Math.random() * 76 + "vw";
          heart.style.bottom = "6vh";
          heart.style.fontSize = 1.2 + Math.random() * 1.6 + "rem";
          heart.style.color = Math.random() > 0.5 ? "#C9A99A" : "#D5BDAF";
          heart.style.animationDuration = 2.2 + Math.random() * 2.6 + "s";
          document.body.appendChild(heart);
          setTimeout(function () {
            heart.remove();
          }, 5500);
        }, delay);
      })(i * 180);
    }
  }

  // === CONFESSION DATE ===
  function setConfessionDate() {
    var now = new Date();
    var formatted = now.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    var el = document.getElementById("confession-date");
    if (el) el.textContent = formatted;
  }

  // === NAVIGASI FASE 5 — diinisialisasi saat phase-5 masuk ke DOM ===
  function initPhase5Nav(p5el) {
    if (!p5el) return;
    var p5Cards = Array.from(p5el.querySelectorAll(".babak-card"));
    var p5Dots  = p5el.querySelector("#p5-dots") || document.getElementById("p5-dots");
    var p5Next  = p5el.querySelector("#btn-next-5") || document.getElementById("btn-next-5");
    var p5Cur   = 0;

    if (!p5Next || p5Cards.length === 0) return;

    p5Cards.forEach(function (_, i) {
      var dot = document.createElement("span");
      dot.classList.add("babak-dot");
      if (i === 0) dot.classList.add("active");
      if (p5Dots) p5Dots.appendChild(dot);
    });

    function getDots() { return p5Dots ? Array.from(p5Dots.querySelectorAll(".babak-dot")) : []; }

    var p5Wrapper = p5el.querySelector(".babak-wrapper");

    // Reveal Lanjut only after scrolling to the bottom (like fase 2/3/4)
    function gateNext5(card) {
      if (p5Cur === p5Cards.length - 1) return; // last card (epilog) → no Lanjut
      p5Next.classList.add("btn-scroll-hidden");
      if (p5Wrapper) p5Wrapper.classList.remove("at-bottom");
      function reveal() {
        p5Next.classList.remove("btn-scroll-hidden");
        if (p5Wrapper) p5Wrapper.classList.add("at-bottom");
      }
      function onScroll() {
        if (card.scrollHeight - card.scrollTop - card.clientHeight < 24) {
          reveal();
          card.removeEventListener("scroll", onScroll);
        }
      }
      if (card.scrollHeight - card.scrollTop - card.clientHeight < 24) reveal();
      else card.addEventListener("scroll", onScroll);
    }

    function showP5Card(index) {
      var dots = getDots();
      p5Cards[p5Cur].classList.remove("active");
      if (dots[p5Cur]) dots[p5Cur].classList.remove("active");
      var prev = p5Cur;
      p5Cur = index;
      setTimeout(function () {
        p5Cards[prev].scrollTop = 0;
        p5Cards[p5Cur].classList.add("active");
        if (dots[p5Cur]) dots[p5Cur].classList.add("active");
        if (p5Cur === p5Cards.length - 1) {
          p5Next.classList.add("p5-nav-hidden");
        } else {
          p5Next.classList.remove("p5-nav-hidden");
          gateNext5(p5Cards[p5Cur]);
        }
      }, 550);
    }

    p5Next.addEventListener("click", function () {
      if (p5Cur < p5Cards.length - 1) showP5Card(p5Cur + 1);
    });

    p5Cards.forEach(function (card, idx) {
      var backBtn = card.querySelector(".btn-back-prev");
      if (backBtn) {
        backBtn.addEventListener("click", function () {
          if (idx > 0) { showP5Card(idx - 1); p5Next.classList.remove("p5-nav-hidden"); }
        });
      }
    });

    // Gate the first card's Lanjut once phase-5 is shown
    setTimeout(function () {
      if (p5Cur !== p5Cards.length - 1) gateNext5(p5Cards[p5Cur]);
    }, 200);

    // Expose jump function for gerbang navigation
    nav5JumpToCard = function (index) {
      if (p5Cur === index && p5Cards[index] && p5Cards[index].classList.contains("active")) return;
      showP5Card(index);
    };

    initEpilog(p5el);
  }

  // === EPILOG INIT ===
  function initEpilog(p5el) {
    if (!p5el) return;

    // Fill dates
    var today = new Date();
    var formatted = today.toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    });
    var readDateEl = p5el.querySelector("#epilog-read-date");
    if (readDateEl) readDateEl.textContent = formatted;
    var footerDateEl = p5el.querySelector("#epilog-footer-date");
    if (footerDateEl) footerDateEl.textContent = formatted;

    // Reply typewriter
    function typeReply(text, el) {
      el.textContent = "";
      var i = 0;
      var t = setInterval(function () {
        el.textContent = text.slice(0, ++i);
        if (i >= text.length) clearInterval(t);
      }, 48);
    }

    var inputWrap  = p5el.querySelector("#epilog-input-wrap");
    var replyEl    = p5el.querySelector("#epilog-reply-typed");
    var inputEl    = p5el.querySelector("#epilog-input");
    var submitBtn  = p5el.querySelector("#epilog-submit");

    // Restore saved reply
    var saved = localStorage.getItem("nabila_reply");
    if (saved && replyEl && inputWrap) {
      inputWrap.classList.add("hidden-wrap");
      setTimeout(function () { typeReply(saved, replyEl); }, 400);
    }

    // Submit handler
    if (submitBtn && inputEl && inputWrap && replyEl) {
      submitBtn.addEventListener("click", function () {
        var val = inputEl.value.trim();
        if (!val) return;
        localStorage.setItem("nabila_reply", val);
        inputWrap.classList.add("hidden-wrap");
        setTimeout(function () { typeReply(val, replyEl); }, 300);
      });
      inputEl.addEventListener("keypress", function (e) {
        if (e.key === "Enter") submitBtn.click();
      });
      // On mobile, scroll the reply box up so the keyboard doesn't cover it
      var epilogCard = inputEl.closest(".epilog-card");
      function scrollInputIntoView() {
        if (!epilogCard) return;
        // Place the input around 30% from the top of the card → above keyboard
        var target = inputEl.offsetTop - epilogCard.clientHeight * 0.3;
        try {
          epilogCard.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
        } catch (e) {
          epilogCard.scrollTop = Math.max(0, target);
        }
      }
      inputEl.addEventListener("focus", function () {
        setTimeout(scrollInputIntoView, 350);
      });
      // visualViewport resize fires when the keyboard finishes opening
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", function () {
          if (document.activeElement === inputEl) scrollInputIntoView();
        });
      }
    }
  }

  // Run for phase-5 if already in DOM (shouldn't be, but safety net)
  if (phase5) initPhase5Nav(phase5);

  // === YES BUTTON — go to phase-yes (intimate pause) ===
  var phaseYes = document.getElementById("phase-yes");

  if (btnYes)
    btnYes.addEventListener("click", function () {
      if (!phaseYes) return;
      unlockFase5Nav();
      setConfessionDate();
      saveSession("phase-yes", 0);
      switchPhase(phase4, phaseYes);
      // Tenerife Sea continues from Bagian 6 through phase-yes
      playTrack(musTenerife);
    });

  // === PHASE-YES CONTINUE BUTTON — then phase-5 with celebration ===
  var btnYesContinue = document.getElementById("btn-yes-continue");
  if (btnYesContinue)
    btnYesContinue.addEventListener("click", function () {
      // Insert phase-5 from template if not yet in DOM
      var p5live = document.getElementById("phase-5");
      if (!p5live) {
        var tmpl = document.getElementById("phase-5-template");
        if (tmpl && tmpl.content) {
          var container = document.querySelector(".container");
          container.appendChild(tmpl.content.cloneNode(true));
          p5live = document.getElementById("phase-5");
          initPhase5Nav(p5live);
        }
      }
      if (!p5live) return;
      saveSession("phase-5", 0);
      switchPhase(phaseYes, p5live);
      // Satu Tuju — fase 5 sampai epilog
      setTimeout(function () { playTrack(musSatuTuju); }, 950);

      setTimeout(function () {
        launchFloatingHearts();
        var end = Date.now() + 4000;
        (function frame() {
          confetti({
            particleCount: 6,
            angle: 60,
            spread: 65,
            origin: { x: 0, y: 0.85 },
            colors: ["#D5BDAF", "#F5EBE0", "#E3D5CA", "#EDCFB5", "#ffffff"],
            scalar: 0.9,
          });
          confetti({
            particleCount: 6,
            angle: 120,
            spread: 65,
            origin: { x: 1, y: 0.85 },
            colors: ["#D5BDAF", "#F5EBE0", "#E3D5CA", "#EDCFB5", "#ffffff"],
            scalar: 0.9,
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        })();
      }, 900);
    });

  // === SCROLL REVEAL — elemen muncul saat discroll dalam kartu ===
  function setupScrollReveal() {
    var selector = [
      "p",
      ".chapter-header",
      ".babak-title",
      ".media-frame",
      ".chapter-end",
      ".lock-icon",
      ".chapter-coming-soon",
      ".chapter-teaser-num",
      ".chapter-teaser-title",
      ".spoiler-sections",
      ".chapter-update-hint",
      ".btn-back-start",
    ].join(", ");

    document
      .querySelectorAll(".babak-card:not(.prolog-card)")
      .forEach(function (card) {
        var targets = Array.from(card.querySelectorAll(selector));

        targets.forEach(function (el) {
          el.classList.add("fade-scroll");
        });

        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
              }
            });
          },
          {
            root: card,
            threshold: 0.05,
            rootMargin: "0px 0px -6px 0px",
          },
        );

        targets.forEach(function (el) {
          observer.observe(el);
        });
      });
  }

  setupScrollReveal();

  // === MINI-GAME: Cari Sapi di Padang Rumput ===
  (function () {
    var meadow = document.getElementById("meadow");
    var hiddenCow = document.getElementById("hidden-cow");
    var gameWin = document.getElementById("game-win");
    var btnGameNext = document.getElementById("btn-game-next");
    var p2Wrapper = phase2 ? phase2.querySelector(".babak-wrapper") : null;
    var gameWon = false;

    if (!hiddenCow || !gameWin || !meadow) return;

    // Cow hide-spots — rotated on each reset so the game feels fresh
    var cowSpots = [
      { l: 24, t: 36 },
      { l: 10, t: 44 },
      { l: 72, t: 32 },
      { l: 80, t: 60 },
      { l: 38, t: 62 },
      { l: 14, t: 22 },
    ];
    var spotIndex = 0;

    function resetGame() {
      gameWon = false;
      hiddenCow.classList.remove("found");
      hiddenCow.style.opacity = "0.72";
      gameWin.classList.add("hidden");
      // Advance to next spot (skip current so position always changes)
      spotIndex =
        (spotIndex + 1 + Math.floor(Math.random() * (cowSpots.length - 1))) %
        cowSpots.length;
      hiddenCow.style.left = cowSpots[spotIndex].l + "%";
      hiddenCow.style.top = cowSpots[spotIndex].t + "%";
    }

    // Populate meadow decorations — z: 0=sky, 1=far bg, 2=animals/mid, 3=foreground plants
    var meadowItems = [
      // --- Sky ---
      { emoji: "☁️", l: 5, t: 1, fs: 1.9, z: 0 },
      { emoji: "☁️", l: 44, t: 0, fs: 1.3, z: 0 },
      { emoji: "☁️", l: 70, t: 1, fs: 1.6, z: 0 },
      { emoji: "🌤️", l: 85, t: 0, fs: 1.4, z: 0 },

      // --- Far background ---
      { emoji: "🏡", l: 1, t: 5, fs: 2.8, z: 1 },
      { emoji: "🌳", l: 20, t: 4, fs: 2.6, z: 1 },
      { emoji: "🌲", l: 88, t: 3, fs: 2.2, z: 1 },
      { emoji: "🌳", l: 52, t: 5, fs: 1.9, z: 1 },
      { emoji: "🌲", l: 36, t: 6, fs: 1.6, z: 1 },
      { emoji: "🚜", l: 68, t: 9, fs: 2.1, z: 1 },
      { emoji: "🦅", l: 40, t: 8, fs: 1.1, z: 1 },
      { emoji: "🦅", l: 74, t: 5, fs: 0.9, z: 1 },

      // --- Animals (many sheep to confuse + decoy bovines) ---
      { emoji: "🐑", l: 4, t: 28, fs: 1.3, z: 2 },
      { emoji: "🐑", l: 26, t: 35, fs: 1.2, z: 2 },
      { emoji: "🐑", l: 58, t: 26, fs: 1.1, z: 2 },
      { emoji: "🐑", l: 76, t: 38, fs: 1.3, z: 2 },
      { emoji: "🐑", l: 46, t: 52, fs: 1.0, z: 2 },
      { emoji: "🐑", l: 16, t: 48, fs: 1.1, z: 2 },
      { emoji: "🐑", l: 90, t: 44, fs: 1.0, z: 2 },
      { emoji: "🐑", l: 64, t: 56, fs: 1.1, z: 2 },
      { emoji: "🐴", l: 84, t: 22, fs: 1.4, z: 2 },
      { emoji: "🐷", l: 6, t: 58, fs: 1.0, z: 2 },
      { emoji: "🐷", l: 34, t: 66, fs: 0.9, z: 2 },
      { emoji: "🦃", l: 48, t: 44, fs: 1.0, z: 2 },
      { emoji: "🐕", l: 82, t: 30, fs: 1.1, z: 2 },
      { emoji: "🐕", l: 10, t: 34, fs: 1.0, z: 2 },
      { emoji: "🐓", l: 14, t: 62, fs: 1.0, z: 2 },
      { emoji: "🐓", l: 78, t: 64, fs: 0.9, z: 2 },
      { emoji: "🐓", l: 60, t: 58, fs: 0.85, z: 2 },
      { emoji: "🐓", l: 30, t: 68, fs: 0.9, z: 2 },
      { emoji: "🦆", l: 36, t: 54, fs: 1.0, z: 2 },
      { emoji: "🦆", l: 72, t: 50, fs: 0.9, z: 2 },
      { emoji: "🐂", l: 54, t: 44, fs: 1.2, z: 2 },
      { emoji: "🐂", l: 22, t: 40, fs: 1.1, z: 2 },
      { emoji: "🐇", l: 68, t: 58, fs: 0.9, z: 2 },
      { emoji: "🐇", l: 40, t: 70, fs: 0.85, z: 2 },
      { emoji: "🦔", l: 18, t: 68, fs: 0.9, z: 2 },
      { emoji: "🦋", l: 58, t: 18, fs: 1.0, z: 2 },
      { emoji: "🦋", l: 28, t: 22, fs: 0.9, z: 2 },
      { emoji: "🐝", l: 36, t: 16, fs: 0.85, z: 2 },
      { emoji: "🐝", l: 76, t: 20, fs: 0.8, z: 2 },
      { emoji: "🐦", l: 22, t: 12, fs: 0.85, z: 2 },
      { emoji: "🐦", l: 56, t: 14, fs: 0.8, z: 2 },

      // --- Mid-ground grass patches ---
      { emoji: "🌿", l: 8, t: 50, fs: 1.1, z: 2 },
      { emoji: "🌿", l: 44, t: 60, fs: 1.0, z: 2 },
      { emoji: "🌿", l: 74, t: 56, fs: 1.1, z: 2 },
      { emoji: "🌿", l: 92, t: 62, fs: 1.0, z: 2 },
      { emoji: "🌱", l: 20, t: 55, fs: 1.0, z: 2 },
      { emoji: "🌱", l: 62, t: 48, fs: 0.9, z: 2 },
      { emoji: "🌱", l: 80, t: 52, fs: 0.9, z: 2 },
      { emoji: "🍃", l: 50, t: 66, fs: 1.0, z: 2 },
      { emoji: "🍃", l: 12, t: 44, fs: 0.9, z: 2 },

      // --- Foreground flowers & large plants ---
      { emoji: "🌻", l: 4, t: 74, fs: 1.5, z: 3 },
      { emoji: "🌻", l: 40, t: 78, fs: 1.3, z: 3 },
      { emoji: "🌻", l: 84, t: 72, fs: 1.4, z: 3 },
      { emoji: "🌼", l: 16, t: 82, fs: 1.2, z: 3 },
      { emoji: "🌼", l: 56, t: 84, fs: 1.1, z: 3 },
      { emoji: "🌼", l: 70, t: 80, fs: 1.2, z: 3 },
      { emoji: "🌼", l: 32, t: 86, fs: 1.0, z: 3 },
      { emoji: "🌸", l: 22, t: 76, fs: 1.0, z: 3 },
      { emoji: "🌸", l: 68, t: 74, fs: 0.9, z: 3 },
      { emoji: "🌾", l: 90, t: 70, fs: 1.4, z: 3 },
      { emoji: "🌾", l: 10, t: 72, fs: 1.2, z: 3 },
      { emoji: "🌾", l: 48, t: 76, fs: 1.3, z: 3 },
      { emoji: "🌾", l: 62, t: 70, fs: 1.1, z: 3 },
      { emoji: "🍀", l: 58, t: 88, fs: 1.0, z: 3 },
      { emoji: "🍀", l: 26, t: 90, fs: 0.9, z: 3 },
      { emoji: "🍀", l: 76, t: 86, fs: 1.0, z: 3 },
      { emoji: "🌿", l: 44, t: 82, fs: 1.1, z: 3 },
      { emoji: "🌿", l: 88, t: 84, fs: 1.0, z: 3 },
      { emoji: "🌱", l: 36, t: 88, fs: 0.9, z: 3 },
      { emoji: "🌱", l: 8, t: 86, fs: 0.85, z: 3 },
      { emoji: "🍄", l: 30, t: 84, fs: 0.9, z: 3 },
      { emoji: "🍄", l: 52, t: 90, fs: 0.85, z: 3 },
      { emoji: "🪨", l: 78, t: 78, fs: 0.9, z: 3 },
      { emoji: "🪨", l: 14, t: 80, fs: 0.85, z: 3 },

      // --- Dense rumput layer at the very bottom (small, tightly spaced) ---
      { emoji: "🌿", l: 2, t: 78, fs: 0.7, z: 3 },
      { emoji: "🌱", l: 12, t: 92, fs: 0.65, z: 3 },
      { emoji: "🌿", l: 24, t: 94, fs: 0.65, z: 3 },
      { emoji: "🌱", l: 38, t: 92, fs: 0.7, z: 3 },
      { emoji: "🍃", l: 50, t: 94, fs: 0.65, z: 3 },
      { emoji: "🌿", l: 64, t: 92, fs: 0.65, z: 3 },
      { emoji: "🌱", l: 72, t: 94, fs: 0.7, z: 3 },
      { emoji: "🍃", l: 82, t: 92, fs: 0.65, z: 3 },
      { emoji: "🌿", l: 94, t: 90, fs: 0.65, z: 3 },
      { emoji: "🌱", l: 6, t: 96, fs: 0.6, z: 3 },
      { emoji: "🌿", l: 18, t: 96, fs: 0.6, z: 3 },
      { emoji: "🍃", l: 32, t: 96, fs: 0.6, z: 3 },
      { emoji: "🌱", l: 46, t: 96, fs: 0.6, z: 3 },
      { emoji: "🌿", l: 60, t: 96, fs: 0.6, z: 3 },
      { emoji: "🍃", l: 74, t: 96, fs: 0.6, z: 3 },
      { emoji: "🌱", l: 86, t: 96, fs: 0.6, z: 3 },
      { emoji: "🌿", l: 96, t: 94, fs: 0.6, z: 3 },
    ];
    meadowItems.forEach(function (item) {
      var el = document.createElement("span");
      el.className = "mi";
      el.textContent = item.emoji;
      el.style.left = item.l + "%";
      el.style.top = item.t + "%";
      el.style.fontSize = item.fs + "rem";
      if (item.z !== undefined) el.style.zIndex = item.z;
      meadow.insertBefore(el, hiddenCow);
    });
    // Initial cow placement (spot 0) — small and slightly transparent
    hiddenCow.style.left = cowSpots[0].l + "%";
    hiddenCow.style.top = cowSpots[0].t + "%";
    hiddenCow.style.fontSize = "0.82rem";
    hiddenCow.style.opacity = "0.72";

    // Attach reset hook so showCard() can call it when returning to this card
    var gameCardEl = meadow.closest(".babak-card");
    if (gameCardEl) gameCardEl._reset = resetGame;

    hiddenCow.addEventListener("click", function () {
      if (gameWon) return;
      gameWon = true;
      hiddenCow.classList.add("found");
      setTimeout(function () {
        gameWin.classList.remove("hidden");
        if (p2Wrapper) p2Wrapper.classList.add("at-bottom");
        // External "Lanjut →" button stays hidden on mini-game card;
        // btnGameNext below handles navigation via btnNext2.click()
      }, 550);
    });

    if (btnGameNext) {
      btnGameNext.addEventListener("click", function () {
        // .click() fires the event listener even when the button is hidden
        if (btnNext2) btnNext2.click();
      });
    }
  })();

  // === FLOATING EXIT BUTTON ===
  var btnFloatingExit = document.getElementById("btn-floating-exit");
  if (btnFloatingExit) {
    btnFloatingExit.addEventListener("click", function () {
      doLogout();
    });
  }

  // === RESTORE SESSION ON REFRESH ===
  (function () {
    var saved = loadSession();
    if (!saved) return;

    authenticated = true;
    resetInactivityTimer();
    if (btnFloatingExit) btnFloatingExit.classList.remove("hidden");
    var btnFNavRestore = document.getElementById("btn-floating-nav");
    if (btnFNavRestore) btnFNavRestore.classList.remove("hidden");

    phase1.classList.remove("active");
    phase1.classList.add("hidden");

    if (saved.phase === "phase-nav" && phaseNav) {
      phaseNav.classList.remove("hidden");
      phaseNav.classList.add("active");
    } else if (saved.phase === "phase-5") {
      // Re-insert phase-5 from template and restore card
      var p5restore = document.getElementById("phase-5");
      if (!p5restore) {
        var tmplR = document.getElementById("phase-5-template");
        if (tmplR && tmplR.content) {
          var containerR = document.querySelector(".container");
          containerR.appendChild(tmplR.content.cloneNode(true));
          p5restore = document.getElementById("phase-5");
          initPhase5Nav(p5restore);
        }
      }
      if (p5restore) {
        p5restore.classList.remove("hidden");
        p5restore.classList.add("active");
        var savedCard5 = saved.card || 0;
        if (savedCard5 > 0) {
          setTimeout(function () { if (nav5JumpToCard) nav5JumpToCard(savedCard5); }, 120);
        }
      }
    } else if (saved.phase === "phase-yes" && phaseYes) {
      phaseYes.classList.remove("hidden");
      phaseYes.classList.add("active");
    } else if (saved.phase === "phase-4" && phase4) {
      phase4.classList.remove("hidden");
      phase4.classList.add("active");
      spawnP4Stars();
    } else if (saved.phase === "phase-3" && phase3) {
      phase3.classList.remove("hidden");
      phase3.classList.add("active");
      if (nav3 && saved.card > 0) {
        setTimeout(function () {
          nav3.jumpToCard(saved.card);
        }, 120);
      }
    } else if (phase2) {
      phase2.classList.remove("hidden");
      phase2.classList.add("active");
      if (nav2 && saved.card > 0) {
        setTimeout(function () {
          nav2.jumpToCard(saved.card);
        }, 120);
      }
    }

    // Music can't autoplay without user gesture — start on first interaction
    var musicStarted = false;
    function startMusicOnce() {
      if (musicStarted) return;
      musicStarted = true;
      var intCardEl = document.getElementById("interlude-card");
      var onInterlude = intCardEl && intCardEl.classList.contains("active");
      var p5el = document.getElementById("phase-5");
      if (onInterlude) {
        // interlude is silent — nothing to play
      } else if (phase3 && phase3.classList.contains("active")) {
        playTrack(musBab2);
      } else if (p5el && p5el.classList.contains("active")) {
        playTrack(musSatuTuju);
      } else if (phaseYes && phaseYes.classList.contains("active")) {
        playTrack(musTenerife);
      } else if (phase4 && phase4.classList.contains("active")) {
        var c4 = saved.card || 0;
        playTrack(c4 >= 5 ? musTenerife : musBersamamu);
      } else if (phase2 && phase2.classList.contains("active")) {
        var c = saved.card || 0;
        playTrack(c === 0 ? musSummer : musNothing);
      } else {
        // phase-nav (gerbang)
        playChillRandom();
      }
      ["click", "touchstart", "keydown"].forEach(function (e) {
        document.removeEventListener(e, startMusicOnce);
      });
    }
    ["click", "touchstart", "keydown"].forEach(function (e) {
      document.addEventListener(e, startMusicOnce);
    });
  })();
});

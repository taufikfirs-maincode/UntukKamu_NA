document.addEventListener("DOMContentLoaded", () => {
  const TARGET_PASSWORD = "13092025";
  const TARGET_SONG_ID = "1309";

  const passwordInput = document.getElementById("password-input");
  const btnLogin = document.getElementById("btn-login");
  const errorMsg = document.getElementById("error-msg");

  const phase1 = document.getElementById("phase-1");
  const phaseAnnounce = document.getElementById("phase-announce");
  const phaseBoombox = document.getElementById("phase-boombox");
  const phase2 = document.getElementById("phase-2");
  const phase3 = document.getElementById("phase-3");
  const phase4 = document.getElementById("phase-4");
  const phase5 = document.getElementById("phase-5");
  const bgMusic1 = document.getElementById("bg-music-1");
  const bgMusic2 = document.getElementById("bg-music-2");
  const bgMusic3 = document.getElementById("bg-music-3");
  const bgMusic4 = document.getElementById("bg-music-4");
  const bgMusic5 = document.getElementById("bg-music-5");

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
    if (val === TARGET_PASSWORD) {
      errorMsg.classList.add("hidden");
      quoteMsg.classList.add("hidden");
      btnHint.classList.add("hidden");
      hintMsg.classList.add("hidden");
      switchPhase(phase1, phaseAnnounce);
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

  passwordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") btnLogin.click();
  });

  // === PLAYLIST — sequential, loops back to track 1 after the last ===
  var playlist = [bgMusic1, bgMusic2, bgMusic3, bgMusic4, bgMusic5];
  var trackIndex = 0;

  playlist.forEach(function (audio) {
    audio.volume = 0.18;
  });

  function playNext() {
    trackIndex = (trackIndex + 1) % playlist.length;
    playlist[trackIndex].play().catch(function () {});
  }

  playlist.forEach(function (audio) {
    audio.addEventListener("ended", playNext);
  });

  phaseAnnounce.addEventListener("click", function () {
    switchPhase(phaseAnnounce, phaseBoombox);
  });

  // === BOOMBOX: Radio Rahasia ===
  if (btnPlaySong) {
    var songFailCount = 0;
    btnPlaySong.addEventListener("click", function () {
      var val = songIdInput.value.trim();
      if (val === TARGET_SONG_ID) {
        songError.classList.add("hidden");
        var boomboxEl = document.getElementById("boombox");
        var lcdEl = document.getElementById("bb-lcd");
        if (boomboxEl) boomboxEl.classList.add("bb-playing");
        if (lcdEl) lcdEl.textContent = "♪ NOW PLAYING ♪";
        trackIndex = 0;
        playlist[0].play().catch(function () {});
        setTimeout(function () {
          switchPhase(phaseBoombox, phase2);
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
  function setupBabakNav(phaseEl, nextPhaseEl, btnEl, dotsId, lastLabel) {
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
      if (!nextPhaseEl && index === cards.length - 1) {
        btnEl.classList.add("nav-end-hidden");
      } else {
        btnEl.classList.remove("nav-end-hidden");
        var nextCard = cards[index + 1];
        var advanceLabel = nextCard && nextCard.dataset.advanceLabel;
        btnEl.textContent = advanceLabel
          || (index === cards.length - 1 && lastLabel ? lastLabel : "Lanjut →");
      }
    }

    updateBtn(0);

    // Sembunyikan tombol Lanjut + tampilkan fade overlay sampai user scroll ke bawah
    function gateNextBtn(card) {
      if (btnEl.classList.contains("nav-end-hidden")) return;
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
      if (current < cards.length - 1) {
        showCard(current + 1);
      } else if (nextPhaseEl) {
        switchPhase(phaseEl, nextPhaseEl);
        setTimeout(resetNav, 900);
      }
    });

    var btnBack = phaseEl.querySelector(".btn-back-start");
    if (btnBack) {
      btnBack.addEventListener("click", function (e) {
        e.stopPropagation();
        showCard(0);
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
  }

  setupBabakNav(phase2, phase3, btnNext2, "p2-dots", null);
  setupBabakNav(phase3, phase4, btnNext3, "p3-dots", "Satu hal lagi →");

  // === NAVIGASI FASE 4 — tanpa dots, tombol hilang di halaman terakhir ===
  (function () {
    if (!phase4) return;
    var p4Cards = Array.from(phase4.querySelectorAll(".babak-card"));
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
    var maxX = window.innerWidth - btnNo.offsetWidth - 20;
    var maxY = window.innerHeight - btnNo.offsetHeight - 20;
    btnNo.style.position = "fixed";
    btnNo.style.transition = "left 0.18s ease, top 0.18s ease";
    btnNo.style.left = Math.max(10, Math.random() * maxX) + "px";
    btnNo.style.top = Math.max(10, Math.random() * maxY) + "px";
  }

  if (btnNo) {
    btnNo.addEventListener("mouseover", moveNoButton);
    btnNo.addEventListener("touchstart", function (e) {
      e.preventDefault();
      moveNoButton();
    });
  }

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

  // === NAVIGASI FASE 5 — tanpa dots, tombol hilang di halaman terakhir ===
  (function () {
    if (!phase5) return;
    var p5Cards = Array.from(phase5.querySelectorAll(".babak-card"));
    var p5Dots = document.getElementById("p5-dots");
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
  if (btnYes)
    btnYes.addEventListener("click", function () {
      setConfessionDate();
      switchPhase(phase4, phase5);

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

    document.querySelectorAll(".babak-card:not(.prolog-card)").forEach(function (card) {
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
});

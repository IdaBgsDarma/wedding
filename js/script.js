// ===== Helper: ambil query param =====
function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

// Rapikan nama: trim, decode, hapus extra spasi, Title Case
function formatGuest(raw) {
  if (!raw) return "";
  const decoded = decodeURIComponent(String(raw).replace(/\+/g, " "))
    .trim()
    .replace(/\s+/g, " ");
  const lowers = new Set(["dan","&","di","ke","dari","of","the","bin","binti"]);
  return decoded
    .split(" ")
    .map((w, i) => {
      const lw = w.toLowerCase();
      if (i !== 0 && lowers.has(lw)) return lw;
      return lw.charAt(0).toUpperCase() + lw.slice(1);
    })
    .join(" ");
}

document.addEventListener('DOMContentLoaded', () => {
  // ===== Nama tamu =====
  const guestRaw = getParam('nama') || getParam('to');
  const guest    = formatGuest(guestRaw);
  const heroGuestEl = document.getElementById('heroGuest');
  const guestEl     = document.getElementById('guestName');
  if (guest && heroGuestEl) heroGuestEl.textContent = guest;
  if (guest && guestEl)     guestEl.textContent     = guest;

  // ===== Splash & Musik =====
  const openBtn = document.getElementById('openInvitation');
  const splash  = document.getElementById('splash');
  const music   = document.getElementById('bgmusic');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      splash.classList.add('hide');
      setTimeout(() => { splash.style.display = 'none'; }, 550);
      if (music && music.src) music.play().catch(()=>{});
    });
  }

  const playBtn = document.getElementById('musicToggle');
  if (playBtn && music) {
    playBtn.addEventListener('click', () => {
      if (music.paused) { music.play(); playBtn.textContent = '❚❚'; }
      else { music.pause(); playBtn.textContent = '►'; }
    });
  }

  // ===== Countdown =====
  const dateEl = document.getElementById('eventDate');
  if (dateEl) {
    const target = new Date(dateEl.dataset.date);
    const ids = ['days','hours','minutes','seconds'];
    function tick(){
      const now = new Date();
      let diff = Math.max(0, target - now);
      const sec = Math.floor(diff / 1000);
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      [d,h,m,s].forEach((v,i) => {
        const el = document.getElementById(ids[i]);
        if (el) el.textContent = v;
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  // ===== Reveal on scroll =====
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ===== LIGHTBOX =====
  (function initLightbox(){
    const grid = document.querySelector('#gallery') || document.querySelector('.gallery');
    const lb   = document.getElementById('lightbox');
    if (!grid || !lb) return;

    const imgEls   = Array.from(grid.querySelectorAll('.item img, img'));
    const lbImg    = lb.querySelector('.lb-image');
    const btnPrev  = lb.querySelector('.lb-prev');
    const btnNext  = lb.querySelector('.lb-next');
    const btnClose = lb.querySelector('.lb-close');

    let idx = 0;

    function open(i){
      idx = (i + imgEls.length) % imgEls.length;
      lbImg.src = imgEls[idx].src;
      lb.classList.add('show');
      document.body.classList.add('noscroll');
      lb.setAttribute('aria-hidden','false');
    }
    function close(){
      lb.classList.remove('show');
      document.body.classList.remove('noscroll');
      lb.setAttribute('aria-hidden','true');
      lbImg.src = '';
    }
    function next(){ open(idx+1); }
    function prev(){ open(idx-1); }

    imgEls.forEach((img, i) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => open(i));
    });

    btnNext.addEventListener('click', next);
    btnPrev.addEventListener('click', prev);
    btnClose.addEventListener('click', close);

    lb.addEventListener('click', (e) => {
      const isUI = e.target.closest('.lb-image, .lb-btn, .lb-close');
      if (!isUI) close();
    });

    window.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('show')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
    }, { passive:true });
  })();

  // ===== HEADER SLIDESHOW (CROSS-FADE) =====
  (function headerSlideshow(){
    const bg1 = document.querySelector('.bg1');
    const bg2 = document.querySelector('.bg2');
    if (!bg1 || !bg2) return;

    // Daftar gambar (pakai path kamu sendiri)
    const imgs = [
      'assets/image/cover.jpg',
      'assets/image/galeri1.jpg',
      'assets/image/galeri2.jpg'
    ];

    // Preload semua gambar dulu biar transisi halus
    let loaded = 0;
    const cache = imgs.map(src => {
      const im = new Image();
      im.src = src;
      im.onload = () => { loaded++; };
      return im;
    });

    let current = 0;
    let showingBg1 = true;
    const FADE_MS = 900;
    const HOLD_MS = 4100; // total ~5s per slide

    // Set awal (hindari flicker)
    bg1.style.backgroundImage = `url('${imgs[current]}')`;
    bg1.style.opacity = 1;
    bg2.style.opacity = 0;

    // Mulai rotasi setelah sejenak (beri waktu render)
    setTimeout(() => {
      setInterval(() => {
        current = (current + 1) % imgs.length;

        if (showingBg1) {
          bg2.style.backgroundImage = `url('${imgs[current]}')`;
          // force reflow agar transition selalu terpacu
          // eslint-disable-next-line no-unused-expressions
          bg2.offsetHeight;
          bg2.style.opacity = 1;
          bg1.style.opacity = 0;
        } else {
          bg1.style.backgroundImage = `url('${imgs[current]}')`;
          // eslint-disable-next-line no-unused-expressions
          bg1.offsetHeight;
          bg1.style.opacity = 1;
          bg2.style.opacity = 0;
        }
        showingBg1 = !showingBg1;
      }, FADE_MS + HOLD_MS);
    }, 200);
  })();

});

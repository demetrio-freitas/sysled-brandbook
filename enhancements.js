/* ============================================
   SYSLED Brandbook — Shared Enhancements JS
   ============================================ */

(function () {
  'use strict';

  // ─── Section data mapping (all 100 sections across 4 files) ───
  const SECTION_MAP = {
    'uxui-fundamentos-v2.html': [1,2,3,4,5,6,7,8,9,10,85,86,87,88],
    'uxui-componentes-v2.html': [11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,77,89,90,91,92],
    'uxui-patterns-v2.html': [31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,78,79,80,83,93,94,95,96],
    'uxui-referencia-v2.html': [56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,81,82,84,97,98,99,100]
  };

  // ─── 1. Auto-assign IDs to sections ───
  function assignSectionIds() {
    document.querySelectorAll('.section-number').forEach(el => {
      const match = el.textContent.match(/^(\d+)/);
      if (match) {
        const id = 'section-' + match[1];
        const section = el.closest('.section') || el.parentElement;
        if (section && !section.id) section.id = id;
      }
    });
  }

  // ─── 2. Reading Progress Bar ───
  function initProgressBar() {
    const bar = document.createElement('div');
    bar.className = 'reading-progress';
    document.body.prepend(bar);
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0%';
    }, { passive: true });
  }

  // ─── 3. Back to Top + Scroll to Bottom FABs ───
  function initBackToTop() {
    // Back to top (appears after scrolling down)
    const btnUp = document.createElement('button');
    btnUp.className = 'back-to-top';
    btnUp.setAttribute('aria-label', 'Voltar ao topo');
    btnUp.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
    document.body.appendChild(btnUp);
    btnUp.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Scroll to bottom (appears when near top)
    const btnDown = document.createElement('button');
    btnDown.className = 'scroll-to-bottom';
    btnDown.setAttribute('aria-label', 'Ir para o fundo');
    btnDown.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
    document.body.appendChild(btnDown);
    btnDown.addEventListener('click', () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }));

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const nearBottom = scrolled > maxScroll - 200;
      // Show up arrow after scrolling 400px
      btnUp.classList.toggle('visible', scrolled > 400);
      // Show down arrow when near top and not near bottom
      btnDown.classList.toggle('visible', scrolled < 400 && !nearBottom);
    }, { passive: true });

    // Initial state: show down arrow
    setTimeout(() => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY < 400 && maxScroll > 200) {
        btnDown.classList.add('visible');
      }
    }, 500);
  }

  // ─── 4. TOC Dropdown ───
  function initTOC() {
    const topBar = document.querySelector('.top-bar');
    if (!topBar) return;

    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;display:inline-flex;';

    const trigger = document.createElement('button');
    trigger.className = 'toc-trigger';
    trigger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> Seções';

    const dropdown = document.createElement('div');
    dropdown.className = 'toc-dropdown';

    document.querySelectorAll('.section-number').forEach(el => {
      const match = el.textContent.match(/^(\d+)\s*[—–-]\s*(.*)/);
      if (match) {
        const num = match[1].padStart(2, '0');
        const title = match[2].replace(/^Manual UX\/UI\s*[—–-]\s*/, '').trim();
        const section = el.closest('.section') || el.parentElement;
        const a = document.createElement('a');
        a.href = '#' + (section ? section.id : '');
        a.innerHTML = '<span class="toc-num">' + num + '</span>' + title;
        a.addEventListener('click', () => dropdown.classList.remove('open'));
        dropdown.appendChild(a);
      }
    });

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));

    // Insert between back-link and theme-toggle
    wrap.appendChild(trigger);
    wrap.appendChild(dropdown);
    const themeToggle = topBar.querySelector('.theme-toggle');
    if (themeToggle) {
      const rightGroup = document.createElement('div');
      rightGroup.style.cssText = 'display:flex;align-items:center;gap:8px;';
      rightGroup.appendChild(wrap);
      themeToggle.parentNode.insertBefore(rightGroup, themeToggle);
      rightGroup.appendChild(themeToggle);
    } else {
      topBar.appendChild(wrap);
    }
  }

  // ─── 5. Search Modal (Cmd+K / Ctrl+K) ───
  function initSearch() {
    // Build section index from all files
    const currentFile = location.pathname.split('/').pop() || 'uxui-fundamentos-v2.html';
    const allSections = [];

    // Get sections from current page
    document.querySelectorAll('.section-number').forEach(el => {
      const match = el.textContent.match(/^(\d+)\s*[—–-]\s*(.*)/);
      if (match) {
        const section = el.closest('.section') || el.parentElement;
        allSections.push({
          num: match[1].padStart(2, '0'),
          title: match[2].replace(/^Manual UX\/UI\s*[—–-]\s*/, '').trim(),
          file: currentFile,
          id: section ? section.id : '',
          local: true
        });
      }
    });

    // Add sections from other files (for cross-file navigation)
    const FILE_TITLES = {
      'uxui-fundamentos-v2.html': 'Fundamentos',
      'uxui-componentes-v2.html': 'Componentes',
      'uxui-patterns-v2.html': 'Patterns',
      'uxui-referencia-v2.html': 'Referência'
    };

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
      <div class="search-modal">
        <div class="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar seções..." autofocus>
          <kbd>ESC</kbd>
        </div>
        <div class="search-results"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('input');
    const results = overlay.querySelector('.search-results');

    function openSearch() {
      overlay.classList.add('open');
      input.value = '';
      results.innerHTML = '';
      setTimeout(() => input.focus(), 50);
    }
    function closeSearch() {
      overlay.classList.remove('open');
    }

    function renderResults(query) {
      results.innerHTML = '';
      if (!query.trim()) return;
      const q = query.toLowerCase();
      const matches = allSections.filter(s =>
        s.num.includes(q) || s.title.toLowerCase().includes(q)
      ).slice(0, 15);
      matches.forEach(s => {
        const a = document.createElement('a');
        if (s.local) {
          a.href = '#' + s.id;
        } else {
          a.href = s.file + '#section-' + parseInt(s.num);
        }
        a.innerHTML = '<span class="sr-num">' + s.num + '</span><span>' + s.title + '</span>' +
          (s.local ? '' : '<span class="sr-file">' + (FILE_TITLES[s.file] || s.file) + '</span>');
        a.addEventListener('click', closeSearch);
        results.appendChild(a);
      });
    }

    input.addEventListener('input', () => renderResults(input.value));

    // Keyboard navigation in results
    input.addEventListener('keydown', (e) => {
      const items = results.querySelectorAll('a');
      const active = results.querySelector('a.active');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!active && items.length) items[0].classList.add('active');
        else if (active && active.nextElementSibling) {
          active.classList.remove('active');
          active.nextElementSibling.classList.add('active');
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (active && active.previousElementSibling) {
          active.classList.remove('active');
          active.previousElementSibling.classList.add('active');
        }
      } else if (e.key === 'Enter') {
        if (active) { active.click(); closeSearch(); }
        else if (items.length) { items[0].click(); closeSearch(); }
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSearch();
    });

    // Cmd+K / Ctrl+K
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') closeSearch();
    });

    // Add search hint to top-bar
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
      const searchBtn = document.createElement('button');
      searchBtn.className = 'toc-trigger';
      searchBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> <kbd style="font-family:var(--font-mono);font-size:0.6rem;padding:1px 5px;background:var(--gray-100);border:1px solid var(--gray-200);border-radius:3px;color:var(--gray-400);">\u2318K</kbd>';
      searchBtn.addEventListener('click', openSearch);
      const rightGroup = topBar.querySelector('div[style*="display:flex"]') || topBar;
      if (rightGroup !== topBar) {
        rightGroup.insertBefore(searchBtn, rightGroup.firstChild);
      } else {
        topBar.appendChild(searchBtn);
      }
    }
  }

  // ─── 6. Lazy Loading Sections with Intersection Observer ───
  function initLazyReveal() {
    // Remove old .reveal logic — replace with .in-view on .section
    const sections = document.querySelectorAll('.section');
    if (!sections.length) return;

    // Make sections visible immediately if they're already in view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.03, rootMargin: '0px 0px 100px 0px' });

    sections.forEach(el => observer.observe(el));

    // Also handle .reveal elements (covers etc)
    document.querySelectorAll('.reveal:not(.section)').forEach(el => {
      const obs2 = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('visible'); obs2.unobserve(e.target); }
        });
      }, { threshold: 0.05 });
      obs2.observe(el);
    });
  }

  // ─── Init all ───
  document.addEventListener('DOMContentLoaded', () => {
    assignSectionIds();
    initProgressBar();
    initBackToTop();
    initTOC();
    initSearch();
    initLazyReveal();
  });
})();

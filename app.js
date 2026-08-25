// SPA Application Controller for Chi-Ok Hwang's Homepage

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const sections = document.querySelectorAll('.content-section');
  const navLinks = document.querySelectorAll('.nav-link');
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn, .theme-toggle-btn-mobile');
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');
  
  // --- SPA Hash-Based Routing ---
  const defaultSection = 'home';

  function handleRoute() {
    // Get hash, default to 'home' if empty
    let hash = window.location.hash.substring(1);
    
    // Split nested anchor details (e.g. #resume-education -> main tab is 'resume')
    const mainTab = hash.split('-')[0] || defaultSection;
    
    // Verify if section exists
    let targetSection = document.getElementById(mainTab);
    if (!targetSection) {
      // Fallback
      window.location.hash = '#' + defaultSection;
      return;
    }

    // Toggle active section
    sections.forEach(sec => {
      if (sec.id === mainTab) {
        sec.classList.add('active');
        // Set focus to the main heading of active section for accessibility
        const heading = sec.querySelector('h2');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
        }
      } else {
        sec.classList.remove('active');
      }
    });

    // Toggle active link in sidebar
    navLinks.forEach(link => {
      if (link.getAttribute('data-target') === mainTab) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    // Close mobile drawer on route change
    closeMobileDrawer();

    // Scroll sub-anchor into view if specified (e.g. #resume-publications)
    if (hash !== mainTab) {
      const subElement = document.getElementById(hash);
      if (subElement) {
        setTimeout(() => {
          subElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }

  // Listen to hash changes and initial load
  window.addEventListener('hashchange', handleRoute);
  
  // Initial routing
  if (!window.location.hash) {
    window.location.hash = '#' + defaultSection;
  } else {
    handleRoute();
  }

  // --- Dark/Light Theme Manager ---
  const themeKey = 'chwang-theme';
  
  // Initial Theme Setup
  const savedTheme = localStorage.getItem(themeKey);
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  setTheme(initialTheme);

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(themeKey, theme);
  }

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  });

  // --- Mobile Drawer Control ---
  function openMobileDrawer() {
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    // Lock background scroll on mobile drawer open
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburgerBtn.addEventListener('click', () => {
    const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMobileDrawer();
    } else {
      openMobileDrawer();
    }
  });

  sidebarOverlay.addEventListener('click', closeMobileDrawer);

  // --- Dynamic Publications Search & Filter ---
  const searchInput = document.getElementById('resume-search');
  const typeSelect = document.getElementById('resume-filter-type');
  const yearSelect = document.getElementById('resume-filter-year');
  const emptyState = document.getElementById('filter-empty-state');
  const pubGroups = document.querySelectorAll('.pub-group');
  const listItems = document.querySelectorAll('.filterable-list li');

  function filterPublications() {
    if (!searchInput || !typeSelect || !yearSelect) return;

    const query = searchInput.value.toLowerCase().trim();
    const selectedType = typeSelect.value;
    const selectedYear = yearSelect.value;

    let totalVisible = 0;

    // Filter each item
    listItems.forEach(item => {
      const itemText = item.textContent.toLowerCase();
      const itemYear = item.getAttribute('data-year');
      const itemType = item.getAttribute('data-type');

      const matchesSearch = query === '' || itemText.includes(query);
      const matchesType = selectedType === 'all' || itemType === selectedType;
      const matchesYear = selectedYear === 'all' || itemYear === selectedYear;

      if (matchesSearch && matchesType && matchesYear) {
        item.style.display = '';
        totalVisible++;
      } else {
        item.style.display = 'none';
      }
    });

    // Hide/show group headers based on item visibility in each group
    pubGroups.forEach(group => {
      const visibleInGroup = group.querySelectorAll('.filterable-list li:not([style*="display: none"])').length;
      if (visibleInGroup === 0) {
        group.style.display = 'none';
      } else {
        group.style.display = '';
      }
    });

    // Show/hide empty state
    if (totalVisible === 0) {
      emptyState.style.display = '';
    } else {
      emptyState.style.display = 'none';
    }
  }

  // Debouncing search input to improve performance
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  if (searchInput) {
    searchInput.addEventListener('input', debounce(filterPublications, 150));
    typeSelect.addEventListener('change', filterPublications);
    yearSelect.addEventListener('change', filterPublications);
  }

  // --- Accessibility: Focus Trap for Mobile Sidebar Drawer ---
  document.addEventListener('keydown', (e) => {
    // If sidebar drawer is not active, ignore focus trap
    if (!sidebar.classList.contains('active')) return;

    // Escape key closes mobile drawer
    if (e.key === 'Escape') {
      closeMobileDrawer();
      hamburgerBtn.focus();
      return;
    }

    // Trap focus inside sidebar
    if (e.key === 'Tab') {
      const focusable = sidebar.querySelectorAll('a, button, select, input');
      if (focusable.length === 0) return;

      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

      if (e.shiftKey) { // Shift + Tab (going backward)
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else { // Tab (going forward)
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  });
});


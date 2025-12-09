// JavaScript functions extracted from the original index.html

// Copy code function
export function copyCode(code) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(code);
  } else {
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {}
    document.body.removeChild(ta);
  }
}

// Set year in footer
export function setCurrentYear() {
  const yearElement = document.getElementById('y');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }
}

// Navigation height calculation
export function setNavHeightVar() {
  const nav = document.querySelector('.nav');
  const h = nav ? Math.round(nav.getBoundingClientRect().height) : 64;
  document.documentElement.style.setProperty('--nav-h', h + 'px');
}

// Results alignment function
export function alignResults() {
  const card = document.querySelector('.dashboard-screenshot.fancy-shadow');
  if (!card) return;
  
  function navHeight() {
    const n = document.querySelector('.nav');
    return n ? n.getBoundingClientRect().height : 64;
  }
  
  function baseOffset() {
    return window.innerWidth >= 1200 ? 120 : (window.innerWidth >= 950 ? 110 : 90);
  }
  
  const y = card.getBoundingClientRect().top + window.pageYOffset - (navHeight() + baseOffset());
  window.scrollTo({ top: y, behavior: 'smooth' });
  
  // After scroll, fine-tune so the title isn't cropped
  setTimeout(() => {
    const title = document.querySelector('.sales-dashboard-title');
    if (!title) return;
    const top = title.getBoundingClientRect().top;
    const minTop = (navHeight() + 20);
    if (top < minTop) {
      window.scrollBy({ top: (top - minTop), behavior: 'smooth' });
    }
  }, 250);
}

// Enterprise picker functionality
export function initEnterprisePicker() {
  const picker = document.getElementById('enterprisePicker');
  const select = document.getElementById('epSelect');
  const labelEl = document.getElementById('epPlanLabel');
  const priceEl = document.getElementById('epPrice');
  const annualEl = document.getElementById('epAnnual');
  const checkout = document.getElementById('epCheckout');

  const fmtUSD = (n) =>
    Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  function resetUI() {
    picker?.classList.remove('has-selection');
    if (labelEl) labelEl.textContent = 'Choose Package';
    if (priceEl) priceEl.textContent = '';
    if (annualEl) annualEl.textContent = '';
    if (checkout) checkout.onclick = null;
  }

  function onChange() {
    if (!select) return;
    const opt = select.selectedOptions[0];
    if (!opt || !opt.dataset.price) {
      resetUI();
      return;
    }

    const price = opt.dataset.price;
    const tier = select.value;

    picker?.classList.add('has-selection');
    if (labelEl) labelEl.textContent = opt.textContent.trim();
    if (priceEl) priceEl.textContent = fmtUSD(price);
    if (annualEl) annualEl.textContent = '';

    const planSlug = (tier === '25k')
      ? 'enterprise-25k'
      : (tier === '50k')
      ? 'enterprise-50k'
      : (tier === '100k')
      ? 'enterprise-100k'
      : '';

    if (checkout) {
      checkout.onclick = () => {
        if (!planSlug) return;
        window.location.href = '/account.html?plan=' + encodeURIComponent(planSlug);
      };
    }
  }

  resetUI();
  select?.addEventListener('change', onChange);
}

// Firebase authentication setup
export function initFirebaseAuth() {
  // Import Firebase dynamically to avoid SSR issues
  import('https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js')
    .then(({ initializeApp, getApps, getApp }) => {
      return import('https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js')
        .then(({ getAuth, onAuthStateChanged, signOut }) => {
          const firebaseConfig = {
            apiKey: "AIzaSyAKUr1JTa4017Cn3S9N_5VcVx9CY4NuBnY",
            authDomain: "dropiq-ebay-software.firebaseapp.com",
            projectId: "dropiq-ebay-software",
            appId: "1:895307134468:web:9833f7e5376fee1c552751",
          };

          const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
          const auth = getAuth(app);
          const navLink = document.getElementById("nav-auth-link");

          function setLoginState() {
            if (!navLink) return;
            navLink.textContent = "Login";
            navLink.href = "/account.html";
            navLink.onclick = null;
          }

          function setLogoutState() {
            if (!navLink) return;
            navLink.textContent = "Log out";
            navLink.href = "#";
            navLink.onclick = (e) => {
              e.preventDefault();
              signOut(auth);
            };
          }

          onAuthStateChanged(auth, (user) => {
            if (user) {
              setLogoutState();
            } else {
              setLoginState();
            }
          });
        });
    })
    .catch(error => {
      console.error('Firebase initialization failed:', error);
    });
}

// Initialize all functions when DOM is ready
export function initializePage() {
  // Set current year
  setCurrentYear();
  
  // Initialize enterprise picker
  initEnterprisePicker();
  
  // Setup results alignment
  const resultsLink = document.querySelector('a[href="#results"], a[href="#results-dashboard"]');
  if (resultsLink) {
    resultsLink.addEventListener('click', (e) => {
      const target = document.getElementById('results');
      const card = document.querySelector('.dashboard-screenshot.fancy-shadow');
      if (target && card) {
        e.preventDefault();
        alignResults();
      }
    });
  }
  
  // If page loads with #results hash, align automatically
  if (typeof window !== 'undefined' && window.location.hash === '#results') {
    alignResults();
  }
}

// Make functions available globally for onClick handlers
if (typeof window !== 'undefined') {
  window.copyCode = copyCode;
  window.alignResults = alignResults;
}
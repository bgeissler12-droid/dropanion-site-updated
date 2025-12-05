import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// 1) Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAKUr1JTa4017Cn3S9N_5VcVx9CY4NuBnY",
  authDomain: "dropiq-ebay-software.firebaseapp.com",
  projectId: "dropiq-ebay-software",
  appId: "1:895307134468:web:9833f7e5376fee1c552751",
};

// 2) Stripe Payment Links (LIVE)
const PAYMENT_LINKS = {
  starter: "https://buy.stripe.com/28E5kDgiQgRt2bge0m6kg0e",
  growth: "https://buy.stripe.com/28E4gz3w4at59DI7BY6kg0f",
  pro: "https://buy.stripe.com/14A6oH2s030D6rwcWi6kg0g",

  // Enterprise tiers (match the radio values + ?plan= values)
  "enterprise-25k": "https://buy.stripe.com/8x228r2s0at5bLQ4pM6kg0h",
  "enterprise-50k": "https://buy.stripe.com/cNidR99Us8kXcPUaOa6kg0i",
  "enterprise-100k": "https://buy.stripe.com/8x24gzc2AdFhdTYbSe6kg0j",
};

// Optional: TEST links (only used if you add them AND run on localhost)
const TEST_PAYMENT_LINKS = {
  starter: "",
  growth: "",
  pro: "",
  "enterprise-25k": "",
  "enterprise-50k": "",
  "enterprise-100k": "",
};

const isLocal =
  location.hostname === "localhost" ||
  location.hostname.includes("127.0.0.1");

const LINKS =
  isLocal && Object.values(TEST_PAYMENT_LINKS).some((v) => v)
    ? TEST_PAYMENT_LINKS
    : PAYMENT_LINKS;

// Firebase init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// UI helpers
const $ = (id) => document.getElementById(id);
const authCard = $("authCard");
const plansCard = $("plansCard");
const formTitle = $("formTitle");
const authError = $("authError");
const planError = $("planError");
const planSuccess = $("planSuccess");
const toggleBtn = $("toggleBtn");
const registerBtn = $("registerBtn");
const continueBtn = $("continueBtn");
const logoutBtn = $("logoutBtn");
const email = $("email");
const email2 = $("email2");
const password = $("password");
const welcomeTxt = $("welcomeTxt");

// New: top-right status elements
const userStatus = $("userStatus");
const userEmailLabel = $("userEmailLabel");
const logoutTopBtn = $("logoutTopBtn");

// Preselect plan if passed in ?plan=
const urlParams = new URLSearchParams(location.search);
const preselect = (urlParams.get("plan") || "").toLowerCase();
if (preselect) {
  const el = document.querySelector(
    'input[name="plan"][value="' + preselect + '"]'
  );
  if (el) el.checked = true;
}

// Toggle register/login mode
let mode = "register"; // or "login"
toggleBtn.addEventListener("click", () => {
  if (mode === "register") {
    mode = "login";
    formTitle.textContent = "Log in";
    toggleBtn.textContent = "Need an account? Register";
    registerBtn.textContent = "Log in";
    document.getElementById("confirmEmailRow").classList.add("hidden");
    password.setAttribute("autocomplete", "current-password");
  } else {
    mode = "register";
    formTitle.textContent = "Create an account";
    toggleBtn.textContent = "Have an account? Log in";
    registerBtn.textContent = "Register";
    document.getElementById("confirmEmailRow").classList.remove("hidden");
    password.setAttribute("autocomplete", "new-password");
  }
  authError.textContent = "";
});

// Basic validation for register
function validateRegister() {
  if (!email.value || !email2.value || !password.value)
    return "Please complete all fields.";
  if (email.value.trim().toLowerCase() !== email2.value.trim().toLowerCase())
    return "Emails do not match.";
  if (password.value.length < 6)
    return "Password must be at least 6 characters.";
  return null;
}

// Register / login handler
registerBtn.addEventListener("click", async () => {
  authError.textContent = "";
  try {
    if (mode === "register") {
      const err = validateRegister();
      if (err) throw new Error(err);
      await createUserWithEmailAndPassword(
        auth,
        email.value.trim(),
        password.value
      );
    } else {
      if (!email.value || !password.value)
        throw new Error("Enter email & password");
      await signInWithEmailAndPassword(
        auth,
        email.value.trim(),
        password.value
      );
    }
  } catch (e) {
    authError.textContent = e.message || "Could not authenticate";
  }
});

// Logout buttons (bottom + top-right)
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
  });
}
if (logoutTopBtn) {
  logoutTopBtn.addEventListener("click", async () => {
    await signOut(auth);
  });
}

// Auth state → UI + redirect logic
onAuthStateChanged(auth, (user) => {
  const urlParams = new URLSearchParams(location.search);
  const planKey = (urlParams.get("plan") || "").toLowerCase();

  const linkFor = (k) => (k && LINKS[k] ? LINKS[k] : null);

  if (user) {
    // Show top-right "logged in" UI
    if (userStatus) userStatus.classList.remove("hidden");
    if (userEmailLabel) userEmailLabel.textContent = user.email || "";

    // If a plan is in the URL, go straight to Stripe (checkout flow)
    const planLink = linkFor(planKey);
    if (planLink) {
      const params = new URLSearchParams();
      params.set("prefilled_email", user.email || "");
      params.set("client_reference_id", user.uid);
      const url =
        planLink + (planLink.includes("?") ? "&" : "?") + params.toString();
      location.href = url;
      return;
    }

    // No plan specified: show plan selection UI instead of bouncing back to pricing
    if (authCard) authCard.classList.add("hidden");
    if (plansCard) {
      plansCard.classList.remove("hidden");
    }
    if (welcomeTxt) {
      welcomeTxt.textContent = user.email
        ? `Logged in as ${user.email}. Choose a plan to continue.`
        : "Logged in. Choose a plan to continue.";
    }
  } else {
    // Not authenticated → show auth form, hide plans + top-right status
    if (userStatus) userStatus.classList.add("hidden");
    if (authCard) authCard.classList.remove("hidden");
    if (plansCard) plansCard.classList.add("hidden");
  }
});

// Manual "Continue to checkout" button (when plan radios are visible)
continueBtn.addEventListener("click", () => {
  planError.textContent = "";
  planSuccess.textContent = "";

  const selected = document.querySelector('input[name="plan"]:checked');
  if (!selected) {
    planError.textContent = "Please select a plan.";
    return;
  }

  const planKey = selected.value; // "starter", "growth", "pro", "enterprise-25k", etc.
  const link = LINKS[planKey];

  if (!link) {
    planError.textContent = "This plan is not available.";
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    planError.textContent = "Please sign in again.";
    return;
  }

  const params = new URLSearchParams();
  params.set("prefilled_email", user.email || "");
  params.set("client_reference_id", user.uid);

  const url = link + (link.includes("?") ? "&" : "?") + params.toString();
  planSuccess.textContent = "Redirecting to secure checkout...";
  location.href = url;
});

// ---- Helper: show configuration issues early ----
(function () {
  try {
    const cfg = firebaseConfig || {};
    const missing =
      !cfg.apiKey ||
      cfg.apiKey.includes("YOUR_API_KEY") ||
      !cfg.authDomain ||
      cfg.authDomain.includes("YOUR_PROJECT_ID");
    if (missing) {
      const el = document.getElementById("authError");
      if (el) {
        el.textContent =
          "Please paste your Firebase config (apiKey, authDomain, projectId, appId) in account.html.";
      }
      console.warn(
        "Firebase config looks incomplete. Buttons will not work until config is set."
      );
    }
  } catch (_) {}
})();

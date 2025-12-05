import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Firebase config (same as before)
const firebaseConfig = {
  apiKey: "AIzaSyAKUr1JTa4017Cn3S9N_5VcVx9CY4NuBnY",
  authDomain: "dropiq-ebay-software.firebaseapp.com",
  projectId: "dropiq-ebay-software",
  appId: "1:895307134468:web:9833f7e5376fee1c552751",
};

// Stripe Payment Links (LIVE)
const PAYMENT_LINKS = {
  starter: "https://buy.stripe.com/28E5kDgiQgRt2bge0m6kg0e",
  growth: "https://buy.stripe.com/28E4gz3w4at59DI7BY6kg0f",
  pro: "https://buy.stripe.com/14A6oH2s030D6rwcWi6kg0g",

  "enterprise-25k": "https://buy.stripe.com/8x228r2s0at5bLQ4pM6kg0h",
  "enterprise-50k": "https://buy.stripe.com/cNidR99Us8kXcPUaOa6kg0i",
  "enterprise-100k": "https://buy.stripe.com/8x24gzc2AdFhdTYbSe6kg0j",
};

// Optional: local test links
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM helpers
const $ = (id) => document.getElementById(id);

const authCard = $("authCard");
const formTitle = $("formTitle");
const subtitleText = $("subtitleText");
const authError = $("authError");
const toggleBtn = $("toggleBtn");
const registerBtn = $("registerBtn");
const email = $("email");
const email2 = $("email2");
const password = $("password");
const confirmEmailRow = $("confirmEmailRow");
const toggleCopy = $("toggleCopy");

// Plan key from ?plan= in URL (if any)
const urlParams = new URLSearchParams(location.search);
const planKeyFromUrl = (urlParams.get("plan") || "").toLowerCase();

let mode = "register"; // "register" or "login"

// ---- UI mode switch (register vs login) ----
function setMode(newMode) {
  mode = newMode;
  if (mode === "register") {
    formTitle.textContent = "Create an account";
    subtitleText.textContent =
      "Sign up to continue. You’ll be redirected automatically.";
    toggleCopy.textContent = "Already have an account?";
    toggleBtn.textContent = "Log in instead";
    confirmEmailRow.classList.remove("hidden");
    password.setAttribute("autocomplete", "new-password");
  } else {
    formTitle.textContent = "Log in";
    subtitleText.textContent =
      "Log in to continue. You’ll be redirected automatically.";
    toggleCopy.textContent = "Need an account?";
    toggleBtn.textContent = "Create an account instead";
    confirmEmailRow.classList.add("hidden");
    password.setAttribute("autocomplete", "current-password");
  }
  authError.textContent = "";
}

toggleBtn.addEventListener("click", () => {
  setMode(mode === "register" ? "login" : "register");
});

// Start in register mode by default
setMode("register");

// ---- Validation ----
function validateRegister() {
  if (!email.value || !email2.value || !password.value) {
    return "Please complete all fields.";
  }
  if (email.value.trim().toLowerCase() !== email2.value.trim().toLowerCase()) {
    return "Emails do not match.";
  }
  if (password.value.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return null;
}

// ---- Auth submit ----
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
      if (!email.value || !password.value) {
        throw new Error("Enter email & password.");
      }
      await signInWithEmailAndPassword(
        auth,
        email.value.trim(),
        password.value
      );
    }
  } catch (e) {
    authError.textContent = e.message || "Could not authenticate.";
  }
});

// ---- Auth state + redirect logic ----
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Show auth card when logged out
    if (authCard) authCard.classList.remove("hidden");
    return;
  }

  // Logged in: if there's a valid plan, go to that Stripe checkout
  const link = planKeyFromUrl ? LINKS[planKeyFromUrl] : null;
  if (link) {
    const params = new URLSearchParams();
    params.set("prefilled_email", user.email || "");
    params.set("client_reference_id", user.uid);
    const url = link + (link.includes("?") ? "&" : "?") + params.toString();
    location.href = url;
    return;
  }

  // Logged in with NO plan → just go back to the main site
  location.href = "/";
});

// ---- Config sanity check ----
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
          "Please paste your Firebase config (apiKey, authDomain, projectId, appId) in account.js.";
      }
      console.warn(
        "Firebase config looks incomplete. Buttons will not work until config is set."
      );
    }
  } catch (_) {}
})();

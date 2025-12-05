
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
    import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

    // 1) Paste your Firebase config here
    const firebaseConfig = {
      apiKey: "AIzaSyAKUr1JTa4017Cn3S9N_5VcVx9CY4NuBnY",
      authDomain: "dropiq-ebay-software.firebaseapp.com",
      projectId: "dropiq-ebay-software",
      appId: "1:895307134468:web:9833f7e5376fee1c552751",
    };

    // 2) Stripe Payment Links (LIVE)
    const PAYMENT_LINKS = {
      starter: "https://buy.stripe.com/28E5kDgiQgRt2bge0m6kg0e",
      growth:  "https://buy.stripe.com/28E4gz3w4at59DI7BY6kg0f",
      pro:     "https://buy.stripe.com/14A6oH2s030D6rwcWi6kg0g",
      "25k":   "https://buy.stripe.com/8x228r2s0at5bLQ4pM6kg0h",
      "50k":   "https://buy.stripe.com/cNidR99Us8kXcPUaOa6kg0i",
      "100k":   "https://buy.stripe.com/8x24gzc2AdFhdTYbSe6kg0j",
    };

    // Optional: TEST links
    const TEST_PAYMENT_LINKS = { starter:"", growth:"", pro:"", "25k":"", "50k":"", "100k":"" };

    const isLocal = location.hostname === "localhost" || location.hostname.includes("127.0.0.1");
    const LINKS = (isLocal && Object.values(TEST_PAYMENT_LINKS).some(v => v)) ? TEST_PAYMENT_LINKS : PAYMENT_LINKS;

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // UI
    const $ = id => document.getElementById(id);
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

    // Preselect plan if passed in ?plan=
    const urlParams = new URLSearchParams(location.search);
    const preselect = (urlParams.get("plan") || "").toLowerCase();
    if (preselect) {
      const el = document.querySelector('input[name="plan"][value="'+preselect+'"]');
      if (el) el.checked = true;
    }

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

    function validateRegister() {
      if (!email.value || !email2.value || !password.value) return "Please complete all fields.";
      if (email.value.trim().toLowerCase() !== email2.value.trim().toLowerCase()) return "Emails do not match.";
      if (password.value.length < 6) return "Password must be at least 6 characters.";
      return null;
    }

    registerBtn.addEventListener("click", async () => {
      authError.textContent = "";
      try {
        if (mode === "register") {
          const err = validateRegister();
          if (err) throw new Error(err);
          await createUserWithEmailAndPassword(auth, email.value.trim(), password.value);
        } else {
          if (!email.value || !password.value) throw new Error("Enter email & password");
          await signInWithEmailAndPassword(auth, email.value.trim(), password.value);
        }
      } catch (e) {
        authError.textContent = e.message || "Could not authenticate";
      }
    });

    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
    });

    
onAuthStateChanged(auth, (user) => {
  // Read the plan from URL (if user clicked a tier before auth)
  const urlParams = new URLSearchParams(location.search);
  const planKey = (urlParams.get("plan") || "").toLowerCase();
  const linkFor = (k) => (k && LINKS[k]) ? LINKS[k] : null;

  if (user) {
    // If a plan was specified, go straight to its Stripe Payment Link
    const planLink = linkFor(planKey);
    if (planLink) {
      const params = new URLSearchParams();
      params.set("prefilled_email", user.email || "");
      params.set("client_reference_id", user.uid);
      const url = planLink + (planLink.includes("?") ? "&" : "?") + params.toString();
      location.href = url;
      return;
    }
    // No plan specified: send the user back to the homepage pricing section
    location.href = "/#pricing";
  } else {
    // Not authenticated: show the email/password form
    const authCard = document.getElementById("authCard");
    const plansCard = document.getElementById("plansCard");
    if (plansCard) plansCard.classList.add("hidden"); // never show the selector UI in this flow
    if (authCard) authCard.classList.remove("hidden");
  }
});
continueBtn.addEventListener("click", () => {
      planError.textContent = "";
      planSuccess.textContent = "";
      const selected = document.querySelector('input[name="plan"]:checked');
      if (!selected) {
        planError.textContent = "Please select a plan.";
        return;
      }
      const planKey = selected.value;
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
(function(){
  try {
    const cfg = firebaseConfig || {};
    const missing = !cfg.apiKey || cfg.apiKey.includes("YOUR_API_KEY") || !cfg.authDomain || cfg.authDomain.includes("YOUR_PROJECT_ID");
    if (missing) {
      const el = document.getElementById("authError");
      if (el) el.textContent = "Please paste your Firebase config (apiKey, authDomain, projectId, appId) in account.html.";
      console.warn("Firebase config looks incomplete. Buttons will not work until config is set.");
    }
  } catch(_) {}
})();

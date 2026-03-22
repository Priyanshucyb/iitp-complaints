import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection, addDoc, getDocs, query,
  where, orderBy, serverTimestamp, doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─── State ────────────────────────────────────────
let currentUser = null;
let allComplaints = [];
let currentFilter = "all";

// ─── Auth State Listener ──────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("appPage").style.display  = "block";
    document.getElementById("navUser").textContent = user.email;
    await loadAllComplaints();
    renderDashboard();
  } else {
    currentUser = null;
    document.getElementById("loginPage").style.display = "block";
    document.getElementById("appPage").style.display  = "none";
  }
});

// ─── Toggle Login / Register ──────────────────────
window.toggleForm = (mode) => {
  document.getElementById("loginView").style.display    = mode === "login"    ? "block" : "none";
  document.getElementById("registerView").style.display = mode === "register" ? "block" : "none";
};

// ─── Register ─────────────────────────────────────
window.registerUser = async () => {
  const name  = document.getElementById("regName").value.trim();
  const roll  = document.getElementById("regRoll").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const pass  = document.getElementById("regPass").value;
  const err   = document.getElementById("regErr");

  err.textContent = "";

  if (!name || !roll || !email || !pass) { err.textContent = "Please fill all fields."; return; }
  if (!email.endsWith("@iitp.ac.in")) {
    err.textContent = "Only @iitp.ac.in email addresses are allowed."; return;
  }
  if (pass.length < 6) { err.textContent = "Password must be at least 6 characters."; return; }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    // Save extra info in Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      name, roll, email, createdAt: serverTimestamp()
    });
  } catch (e) {
    err.textContent = firebaseErrMsg(e.code);
  }
};

// ─── Login ────────────────────────────────────────
window.loginUser = async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const pass  = document.getElementById("loginPass").value;
  const err   = document.getElementById("loginErr");

  err.textContent = "";

  if (!email || !pass) { err.textContent = "Please fill all fields."; return; }
  if (!email.endsWith("@iitp.ac.in")) {
    err.textContent = "Only @iitp.ac.in email addresses are allowed."; return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    err.textContent = firebaseErrMsg(e.code);
  }
};

// ─── Logout ───────────────────────────────────────
window.logoutUser = async () => {
  await signOut(auth);
};

// ─── Firebase error messages (human readable) ────
function firebaseErrMsg(code) {
  const map = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "Invalid email address.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/weak-password": "Password is too weak.",
    "auth/invalid-credential": "Incorrect email or password.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

// ─── Load All Complaints ──────────────────────────
async function loadAllComplaints() {
  try {
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    allComplaints = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("Error loading complaints:", e);
  }
}

// ─── Submit Complaint ─────────────────────────────
window.submitComplaint = async () => {
  const cat   = document.getElementById("fCat").value;
  const pri   = document.getElementById("fPri").value;
  const title = document.getElementById("fTitle").value.trim();
  const desc  = document.getElementById("fDesc").value.trim();
  const loc   = document.getElementById("fLoc").value.trim();

  if (!cat || !title || !desc) { alert("Please fill all required fields."); return; }

  try {
    const docRef = await addDoc(collection(db, "complaints"), {
      category   : cat,
      priority   : pri,
      title      : title,
      description: desc,
      location   : loc,
      status     : "Pending",
      userId     : currentUser.uid,
      userEmail  : currentUser.email,
      userName   : currentUser.displayName || currentUser.email,
      createdAt  : serverTimestamp()
    });

    // Reset form
    document.getElementById("fCat").value   = "";
    document.getElementById("fTitle").value = "";
    document.getElementById("fDesc").value  = "";
    document.getElementById("fLoc").value   = "";
    document.getElementById("fPri").value   = "Medium";

    // Show toast
    const toast = document.getElementById("submitToast");
    toast.style.display = "block";
    setTimeout(() => toast.style.display = "none", 3500);

    // Reload data
    await loadAllComplaints();
    renderDashboard();
  } catch (e) {
    alert("Failed to submit. Please try again.\n" + e.message);
  }
};

// ─── View Switcher ────────────────────────────────
window.switchView = (name, el) => {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById("v" + name.charAt(0).toUpperCase() + name.slice(1)).classList.add("active");
  el.classList.add("active");

  if (name === "dashboard") renderDashboard();
  if (name === "my")        renderMy();
  if (name === "all")       renderAll();
};

// ─── RENDER: Dashboard ────────────────────────────
function renderDashboard() {
  const total    = allComplaints.length;
  const pending  = allComplaints.filter(c => c.status === "Pending").length;
  const resolved = allComplaints.filter(c => c.status === "Resolved").length;
  const inprog   = allComplaints.filter(c => c.status === "In Progress").length;

  document.getElementById("statsRow").innerHTML = `
    <div class="stat-card"><div class="s-label">Total</div><div class="s-val s-blue">${total}</div></div>
    <div class="stat-card"><div class="s-label">Pending</div><div class="s-val s-amber">${pending}</div></div>
    <div class="stat-card"><div class="s-label">In Progress</div><div class="s-val s-sky">${inprog}</div></div>
    <div class="stat-card"><div class="s-label">Resolved</div><div class="s-val s-green">${resolved}</div></div>
  `;

  const recent = allComplaints.slice(0, 5);
  document.getElementById("recentList").innerHTML =
    recent.length ? recent.map(cardHTML).join("") : emptyState("No complaints yet");
}

// ─── RENDER: My Complaints ────────────────────────
function renderMy() {
  const mine = allComplaints.filter(c => c.userId === currentUser.uid);
  document.getElementById("myList").innerHTML =
    mine.length ? mine.map(cardHTML).join("") : emptyState("You haven't submitted any complaints yet");
}

// ─── RENDER: All Complaints ───────────────────────
function renderAll() {
  let list = currentFilter === "all"
    ? allComplaints
    : allComplaints.filter(c => c.status === currentFilter);
  document.getElementById("allList").innerHTML =
    list.length ? list.map(cardHTML).join("") : emptyState("No complaints in this category");
}

window.setFilter = (f, btn) => {
  currentFilter = f;
  document.querySelectorAll(".fbtn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderAll();
};

// ─── Card HTML ────────────────────────────────────
function cardHTML(c) {
  const date = c.createdAt?.toDate
    ? c.createdAt.toDate().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
    : "—";

  const statusClass = {
    "Pending": "b-pending",
    "In Progress": "b-progress",
    "Resolved": "b-resolved",
    "Rejected": "b-rejected"
  }[c.status] || "b-pending";

  const priClass = {
    "Critical": "p-critical",
    "High": "p-high",
    "Medium": "p-medium",
    "Low": "p-low"
  }[c.priority] || "p-medium";

  return `
    <div class="c-card">
      <div class="c-top">
        <div>
          <div class="c-title">${escHtml(c.title)}</div>
          <div class="c-meta">
            <span class="cat-tag">${escHtml(c.category)}</span>
            ${c.location ? ` · ${escHtml(c.location)}` : ""}
            · ${date}
          </div>
        </div>
        <div class="c-badges">
          <span class="badge ${statusClass}">${c.status}</span>
          <span class="pri-dot ${priClass}" title="${c.priority}"></span>
        </div>
      </div>
      <div class="c-desc">${escHtml(c.description)}</div>
      <div class="c-by">Submitted by ${escHtml(c.userName || c.userEmail)}</div>
    </div>`;
}

function emptyState(msg) {
  return `<div class="empty"><div class="empty-icon">📭</div>${msg}</div>`;
}

function escHtml(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

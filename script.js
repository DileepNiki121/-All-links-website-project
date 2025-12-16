const LINKS_JSON = "./links.json";
const ADMIN_SECRET = "DileepNiki@2026";

let allLinks = [];
let isAdmin = localStorage.getItem("isAdmin") === "1";

/* ---------- ADMIN ---------- */
function adminLogin() {
  const pass = prompt("Enter admin password:");
  if (pass === ADMIN_SECRET) {
    localStorage.setItem("isAdmin", "1");
    isAdmin = true;
    updateAdminUI();
    alert("Admin logged in");
  } else {
    alert("Wrong password");
  }
}

function adminLogout() {
  localStorage.removeItem("isAdmin");
  isAdmin = false;
  updateAdminUI();
}

function updateAdminUI() {
  document.getElementById("adminPanel").style.display = isAdmin ? "block" : "none";
  document.getElementById("adminBtn").style.display = isAdmin ? "none" : "inline-block";
  document.getElementById("logoutBtn").style.display = isAdmin ? "inline-block" : "none";
  if (isAdmin) renderAdminTable();
}

/* ---------- STATS ---------- */
function getStats(id) {
  return JSON.parse(localStorage.getItem("stats_" + id)) || {
    clicks: 0,
    lastClicked: "-"
  };
}

function saveStats(id, stats) {
  localStorage.setItem("stats_" + id, JSON.stringify(stats));
}

/* ---------- LOAD LINKS ---------- */
async function loadLinks() {
  const loader = document.getElementById("loader");
  loader.style.display = "block";

  const res = await fetch(LINKS_JSON);
  allLinks = await res.json();

  renderLinks(allLinks);
  updateAdminUI();
  loader.style.display = "none";
}

/* ---------- RENDER PUBLIC ---------- */
function renderLinks(links) {
  const list = document.getElementById("linksList");
  list.innerHTML = "";

  links.forEach(link => {
    list.innerHTML += `
      <div class="card">
        <div>
          <a href="#" onclick="applyLink('${link.id}', '${link.url}')">${link.title}</a>
          <small>Created: ${link.created}</small>
        </div>
        <button class="btn btn-primary" onclick="applyLink('${link.id}', '${link.url}')">Apply</button>
      </div>
    `;
  });
}

/* ---------- APPLY LINK ---------- */
function applyLink(id, url) {
  const stats = getStats(id);
  stats.clicks += 1;
  stats.lastClicked = new Date().toLocaleString();
  saveStats(id, stats);

  window.open(url, "_blank");

  if (isAdmin) renderAdminTable();
}

/* ---------- ADMIN TABLE ---------- */
function renderAdminTable() {
  const tbody = document.getElementById("adminTable");
  tbody.innerHTML = "";

  allLinks.forEach(link => {
    const stats = getStats(link.id);
    tbody.innerHTML += `
      <tr>
        <td>${link.title}</td>
        <td>${stats.clicks}</td>
        <td>${stats.lastClicked}</td>
        <td>
          <button class="btn btn-danger" onclick="deleteLink('${link.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* ---------- DELETE ---------- */
function deleteLink(id) {
  if (!confirm("Delete link from UI only?")) return;
  allLinks = allLinks.filter(l => l.id !== id);
  renderLinks(allLinks);
  renderAdminTable();
}

/* ---------- SEARCH ---------- */
document.getElementById("searchInput").addEventListener("input", e => {
  const val = e.target.value.toLowerCase();
  renderLinks(allLinks.filter(l => l.title.toLowerCase().includes(val)));
});

function clearSearch() {
  document.getElementById("searchInput").value = "";
  renderLinks(allLinks);
}

loadLinks();

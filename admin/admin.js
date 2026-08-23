import { supabase } from "../supabase.js";

const loginPanel = document.getElementById("loginPanel");
const appPanel = document.getElementById("appPanel");
const loginMsg = document.getElementById("loginMsg");
const linkList = document.getElementById("linkList");
const editor = document.getElementById("editor");
const linkForm = document.getElementById("linkForm");

let editingId = null;

function showMsg(el, text, ok=false) {
  el.textContent = text;
  el.style.color = ok ? "#a7f3d0" : "#ffb4b4";
}

async function refreshSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    loginPanel.hidden = true;
    appPanel.hidden = false;
    await loadProfile();
    await loadLinks();
  } else {
    loginPanel.hidden = false;
    appPanel.hidden = true;
  }
}

document.getElementById("loginBtn").addEventListener("click", async () => {
  showMsg(loginMsg, "");
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return showMsg(loginMsg, error.message);
  await refreshSession();
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  await refreshSession();
});

async function loadProfile() {
  const { data, error } = await supabase.from("profile").select("*").eq("id",1).maybeSingle();
  if (error || !data) return;
  document.getElementById("profileName").value = data.display_name || "";
  document.getElementById("profileUsername").value = data.username || "";
  document.getElementById("profileAvatar").value = data.avatar_url || "";
  document.getElementById("profileBio").value = data.bio || "";
}

document.getElementById("saveProfileBtn").addEventListener("click", async () => {
  const payload = {
    id: 1,
    display_name: document.getElementById("profileName").value.trim(),
    username: document.getElementById("profileUsername").value.trim(),
    avatar_url: document.getElementById("profileAvatar").value.trim(),
    bio: document.getElementById("profileBio").value.trim()
  };
  const { error } = await supabase.from("profile").upsert(payload);
  showMsg(loginMsg, error ? error.message : "Profile saved.", !error);
});

async function loadLinks() {
  const { data, error } = await supabase.from("links")
    .select("*").order("sort_order", { ascending:true });
  if (error) return showMsg(loginMsg, error.message);
  linkList.replaceChildren(...data.map(makeRow));
}

function makeRow(item) {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `
    <div class="drag">☰</div>
    <div class="info">
      <strong></strong>
      <span></span>
    </div>
    <div class="actionsRow">
      <button class="secondary edit">Edit</button>
      <button class="secondary toggle"></button>
      <button class="secondary delete">Delete</button>
    </div>
  `;
  row.querySelector("strong").textContent = item.title + (item.enabled ? "" : " • Hidden");
  row.querySelector("span").textContent = item.url;
  row.querySelector(".toggle").textContent = item.enabled ? "Hide" : "Show";
  row.querySelector(".edit").onclick = () => openEditor(item);
  row.querySelector(".toggle").onclick = () => toggleLink(item);
  row.querySelector(".delete").onclick = () => deleteLink(item.id);
  return row;
}

async function toggleLink(item) {
  const { error } = await supabase.from("links").update({enabled:!item.enabled}).eq("id",item.id);
  if (error) alert(error.message); else loadLinks();
}

async function deleteLink(id) {
  if (!confirm("Delete this link?")) return;
  const { error } = await supabase.from("links").delete().eq("id",id);
  if (error) alert(error.message); else loadLinks();
}

function openEditor(item=null) {
  editingId = item?.id ?? null;
  document.getElementById("editorTitle").textContent = item ? "Edit Link" : "Add Link";
  document.getElementById("linkTitle").value = item?.title || "";
  document.getElementById("linkSubtitle").value = item?.subtitle || "";
  document.getElementById("linkUrl").value = item?.url || "";
  document.getElementById("linkIcon").value = item?.icon || "link";
  document.getElementById("linkEnabled").checked = item?.enabled ?? true;
  document.getElementById("editMsg").textContent = "";
  editor.showModal();
}

document.getElementById("addBtn").onclick = () => openEditor();
document.getElementById("cancelBtn").onclick = () => editor.close();

linkForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    title: document.getElementById("linkTitle").value.trim(),
    subtitle: document.getElementById("linkSubtitle").value.trim(),
    url: document.getElementById("linkUrl").value.trim(),
    icon: document.getElementById("linkIcon").value.trim(),
    enabled: document.getElementById("linkEnabled").checked
  };

  let result;
  if (editingId) {
    result = await supabase.from("links").update(payload).eq("id", editingId);
  } else {
    const { data: last } = await supabase.from("links").select("sort_order").order("sort_order",{ascending:false}).limit(1);
    payload.sort_order = (last?.[0]?.sort_order ?? 0) + 1;
    result = await supabase.from("links").insert(payload);
  }

  if (result.error) return showMsg(document.getElementById("editMsg"), result.error.message);
  editor.close();
  await loadLinks();
});

refreshSession();

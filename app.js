import { supabase } from "./supabase.js";

const fallbackProfile = {
  display_name: "Rituraj",
  username: "@yourusername",
  bio: "Connect with me 👋",
  avatar_url: "https://i.pravatar.cc/300?img=12"
};

const linksEl = document.getElementById("links");
const emptyState = document.getElementById("emptyState");

function iconUrl(icon) {
  return `https://cdn.simpleicons.org/${encodeURIComponent(icon)}`;
}

function makeLink(item) {
  const a = document.createElement("a");
  a.className = "link";
  a.href = item.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.innerHTML = `
    <span class="icon"><img src="${iconUrl(item.icon)}" alt=""></span>
    <span>
      <div class="title"></div>
      <div class="subtitle"></div>
    </span>
    <span class="arrow">›</span>
  `;
  a.querySelector(".title").textContent = item.title;
  a.querySelector(".subtitle").textContent = item.subtitle || "";
  return a;
}

async function loadPage() {
  let profile = fallbackProfile;
  let links = [];

  try {
    const { data: p, error: profileError } = await supabase
      .from("profile")
      .select("display_name,username,bio,avatar_url")
      .eq("id", 1)
      .maybeSingle();

    if (!profileError && p) profile = p;

    const { data, error } = await supabase
      .from("links")
      .select("id,title,subtitle,url,icon,sort_order")
      .eq("enabled", true)
      .order("sort_order", { ascending: true });

    if (!error && data) links = data;
  } catch (err) {
    console.warn("Supabase unavailable; showing fallback profile.", err);
  }

  document.getElementById("displayName").textContent = profile.display_name || "";
  document.getElementById("username").textContent = profile.username || "";
  document.getElementById("bio").textContent = profile.bio || "";
  document.getElementById("avatar").src = profile.avatar_url || fallbackProfile.avatar_url;

  linksEl.replaceChildren(...links.map(makeLink));
  emptyState.hidden = links.length !== 0;
  document.getElementById("year").textContent = new Date().getFullYear();
}

loadPage();

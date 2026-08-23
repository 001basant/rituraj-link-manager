import { supabase } from "./supabase.js";

const fallbackProfile = {
  display_name: "Rituraj",
  username: "@yourusername",
  bio: "Connect with me 👋",
  avatar_url: "https://i.pravatar.cc/300?img=12"
};

const linksEl = document.getElementById("links");
const emptyState = document.getElementById("emptyState");


/* =========================================
   SIMPLE ICON URL
========================================= */

function iconUrl(icon) {
  return `https://cdn.simpleicons.org/${encodeURIComponent(icon)}`;
}


/* =========================================
   CHECK CUSTOM IMAGE
========================================= */

function isCustomImage(icon) {

  if (!icon) return false;

  const value =
    String(icon).trim();

  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/")
  );
}


/* =========================================
   CREATE ICON
========================================= */

function createIcon(icon) {

  const img =
    document.createElement("img");

  img.alt = "";


  /*
    Agar icon custom image URL hai
    to directly wahi image use hogi.
  */

  if (isCustomImage(icon)) {

    img.src = icon;

  } else {

    /*
      Normal icons:
      whatsapp
      instagram
      telegram
      facebook
      youtube
      etc.
    */

    img.src = iconUrl(icon);

  }


  /*
    Agar image load nahi hoti,
    to fallback link icon show hoga.
  */

  img.onerror = () => {

    img.onerror = null;

    img.src =
      iconUrl("link");

  };


  return img;
}


/* =========================================
   MAKE LINK
========================================= */

function makeLink(item) {

  const a =
    document.createElement("a");

  a.className =
    "link";

  a.href =
    item.url;

  a.target =
    "_blank";

  a.rel =
    "noopener noreferrer";


  /* =====================================
     ICON
  ===================================== */

  const icon =
    document.createElement("span");

  icon.className =
    "icon";


  icon.appendChild(
    createIcon(item.icon)
  );


  /* =====================================
     TITLE / SUBTITLE
  ===================================== */

  const text =
    document.createElement("span");


  const title =
    document.createElement("div");

  title.className =
    "title";

  title.textContent =
    item.title || "";


  const subtitle =
    document.createElement("div");

  subtitle.className =
    "subtitle";

  subtitle.textContent =
    item.subtitle || "";


  text.appendChild(title);

  text.appendChild(subtitle);


  /* =====================================
     ARROW
  ===================================== */

  const arrow =
    document.createElement("span");

  arrow.className =
    "arrow";

  arrow.textContent =
    "›";


  /* =====================================
     FINAL LINK
  ===================================== */

  a.appendChild(icon);

  a.appendChild(text);

  a.appendChild(arrow);


  return a;
}


/* =========================================
   LOAD PAGE
========================================= */

async function loadPage() {

  let profile =
    fallbackProfile;

  let links = [];


  try {

    /* =====================================
       PROFILE
    ===================================== */

    const {
      data: p,
      error: profileError
    } = await supabase

      .from("profile")

      .select(
        "display_name,username,bio,avatar_url"
      )

      .eq("id", 1)

      .maybeSingle();


    if (!profileError && p) {

      profile = p;

    }


    /* =====================================
       LINKS
    ===================================== */

    const {
      data,
      error
    } = await supabase

      .from("links")

      .select(
        "id,title,subtitle,url,icon,sort_order"
      )

      .eq("enabled", true)

      .order(
        "sort_order",
        {
          ascending: true
        }
      );


    if (!error && data) {

      links = data;

    }

  } catch (err) {

    console.warn(
      "Supabase unavailable; showing fallback profile.",
      err
    );

  }


  /* =====================================
     PROFILE DISPLAY
  ===================================== */

  document.getElementById(
    "displayName"
  ).textContent =
    profile.display_name || "";


  document.getElementById(
    "username"
  ).textContent =
    profile.username || "";


  document.getElementById(
    "bio"
  ).textContent =
    profile.bio || "";


  document.getElementById(
    "avatar"
  ).src =
    profile.avatar_url ||
    fallbackProfile.avatar_url;


  /* =====================================
     LINKS DISPLAY
  ===================================== */

  linksEl.replaceChildren(
    ...links.map(makeLink)
  );


  emptyState.hidden =
    links.length !== 0;


  /* =====================================
     YEAR
  ===================================== */

  document.getElementById(
    "year"
  ).textContent =
    new Date().getFullYear();

}


/* =========================================
   START
========================================= */

loadPage();

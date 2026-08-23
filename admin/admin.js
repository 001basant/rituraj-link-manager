import { supabase } from "../supabase.js";

/* =========================================
   ELEMENTS
========================================= */

const loginPanel = document.getElementById("loginPanel");
const appPanel = document.getElementById("appPanel");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loginMsg = document.getElementById("loginMsg");
const profileMsg = document.getElementById("profileMsg");
const uploadMsg = document.getElementById("uploadMsg");
const editMsg = document.getElementById("editMsg");

const linkList = document.getElementById("linkList");
const emptyLinks = document.getElementById("emptyLinks");
const emptyAddBtn = document.getElementById("emptyAddBtn");

const editor = document.getElementById("editor");
const linkForm = document.getElementById("linkForm");

const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");
const closeEditorBtn = document.getElementById("closeEditorBtn");

const togglePassword =
  document.getElementById("togglePassword");

const saveProfileBtn =
  document.getElementById("saveProfileBtn");

const profilePhotoFile =
  document.getElementById("profilePhotoFile");

let editingId = null;
let currentLinks = [];


/* =========================================
   MESSAGE HELPER
========================================= */

function showMsg(element, text, success = false) {
  if (!element) return;

  element.textContent = text;

  element.style.color = success
    ? "#a7f3d0"
    : "#ffb4b4";
}


/* =========================================
   SESSION
========================================= */

async function refreshSession() {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error) {
    showMsg(loginMsg, error.message);
    return;
  }

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


/* =========================================
   LOGIN
========================================= */

async function login() {
  showMsg(loginMsg, "");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMsg(
      loginMsg,
      "Please enter email and password."
    );
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  loginBtn.disabled = false;
  loginBtn.textContent = "Login";

  if (error) {
    showMsg(loginMsg, error.message);
    return;
  }

  passwordInput.value = "";

  await refreshSession();
}

loginBtn.addEventListener("click", login);


/* =========================================
   ENTER KEY LOGIN
========================================= */

[emailInput, passwordInput].forEach((input) => {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      login();
    }
  });
});


/* =========================================
   PASSWORD SHOW / HIDE
========================================= */

if (togglePassword) {
  togglePassword.addEventListener("click", () => {
    const isPassword =
      passwordInput.type === "password";

    passwordInput.type =
      isPassword ? "text" : "password";

    togglePassword.textContent =
      isPassword ? "🙈" : "👁️";
  });
}


/* =========================================
   LOGOUT
========================================= */

logoutBtn.addEventListener("click", async () => {
  logoutBtn.disabled = true;
  logoutBtn.textContent = "Logging out...";

  const { error } =
    await supabase.auth.signOut();

  logoutBtn.disabled = false;
  logoutBtn.textContent = "Logout";

  if (error) {
    showMsg(loginMsg, error.message);
    return;
  }

  await refreshSession();
});


/* =========================================
   LOAD PROFILE
========================================= */

async function loadProfile() {
  const {
    data,
    error
  } = await supabase
    .from("profile")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    showMsg(profileMsg, error.message);
    return;
  }

  if (!data) {
    updateProfilePreview();
    return;
  }

  document.getElementById("profileName").value =
    data.display_name || "";

  document.getElementById("profileUsername").value =
    data.username || "";

  document.getElementById("profileAvatar").value =
    data.avatar_url || "";

  document.getElementById("profileBio").value =
    data.bio || "";

  updateProfilePreview();
}


/* =========================================
   PROFILE PREVIEW
========================================= */

function updateProfilePreview() {
  const name =
    document
      .getElementById("profileName")
      .value
      .trim();

  const username =
    document
      .getElementById("profileUsername")
      .value
      .trim();

  const avatar =
    document
      .getElementById("profileAvatar")
      .value
      .trim();

  const previewName =
    document.getElementById(
      "profilePreviewName"
    );

  const previewUsername =
    document.getElementById(
      "profilePreviewUsername"
    );

  const avatarImage =
    document.getElementById(
      "profileAvatarPreview"
    );

  const avatarPlaceholder =
    document.getElementById(
      "avatarPlaceholder"
    );

  previewName.textContent =
    name || "Your Name";

  previewUsername.textContent =
    username
      ? (
          username.startsWith("@")
            ? username
            : `@${username}`
        )
      : "@username";


  if (avatar) {
    avatarImage.src = avatar;
    avatarImage.hidden = false;
    avatarPlaceholder.hidden = true;

    avatarImage.onerror = () => {
      avatarImage.hidden = true;
      avatarPlaceholder.hidden = false;
    };
  } else {
    avatarImage.src = "";
    avatarImage.hidden = true;
    avatarPlaceholder.hidden = false;
  }
}


/* =========================================
   LIVE PROFILE PREVIEW
========================================= */

[
  "profileName",
  "profileUsername",
  "profileAvatar"
].forEach((id) => {
  document
    .getElementById(id)
    .addEventListener(
      "input",
      updateProfilePreview
    );
});


/* =========================================
   PHOTO UPLOAD
========================================= */

if (profilePhotoFile) {
  profilePhotoFile.addEventListener(
    "change",
    async () => {
      const file =
        profilePhotoFile.files?.[0];

      if (!file) return;

      await uploadProfilePhoto(file);
    }
  );
}


async function uploadProfilePhoto(file) {

  showMsg(uploadMsg, "");

  /* Allowed formats */

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {

    showMsg(
      uploadMsg,
      "Only JPG, PNG or WebP images are allowed."
    );

    profilePhotoFile.value = "";

    return;
  }


  /* Maximum 5 MB */

  const maxSize =
    5 * 1024 * 1024;

  if (file.size > maxSize) {

    showMsg(
      uploadMsg,
      "Image must be smaller than 5 MB."
    );

    profilePhotoFile.value = "";

    return;
  }


  /* Local preview */

  const localPreview =
    URL.createObjectURL(file);

  const uploadPreview =
    document.getElementById(
      "uploadPhotoPreview"
    );

  const uploadPlaceholder =
    document.getElementById(
      "uploadPhotoPlaceholder"
    );

  uploadPreview.src =
    localPreview;

  uploadPreview.hidden = false;

  uploadPlaceholder.hidden = true;


  showMsg(
    uploadMsg,
    "Uploading photo..."
  );


  /* File extension */

  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase();


  /* Unique filename */

  const fileName =
    `profile-${Date.now()}.${extension}`;


  const filePath =
    `avatars/${fileName}`;


  /* Upload */

  const {
    error: uploadError
  } = await supabase.storage
    .from("profile-images")
    .upload(
      filePath,
      file,
      {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type
      }
    );


  if (uploadError) {

    console.error(uploadError);

    showMsg(
      uploadMsg,
      uploadError.message
    );

    URL.revokeObjectURL(localPreview);

    return;
  }


  /* Get public URL */

  const {
    data: publicUrlData
  } = supabase.storage
    .from("profile-images")
    .getPublicUrl(filePath);


  const publicUrl =
    publicUrlData.publicUrl;


  /* Put URL in profile URL field */

  document.getElementById(
    "profileAvatar"
  ).value = publicUrl;


  /* Update main profile preview */

  updateProfilePreview();


  showMsg(
    uploadMsg,
    "Photo uploaded. Now click Save Profile.",
    true
  );


  URL.revokeObjectURL(localPreview);
}


/* =========================================
   SAVE PROFILE
========================================= */

saveProfileBtn.addEventListener(
  "click",
  async () => {

    showMsg(profileMsg, "");

    const payload = {
      id: 1,

      display_name:
        document
          .getElementById("profileName")
          .value
          .trim(),

      username:
        document
          .getElementById("profileUsername")
          .value
          .trim(),

      avatar_url:
        document
          .getElementById("profileAvatar")
          .value
          .trim(),

      bio:
        document
          .getElementById("profileBio")
          .value
          .trim()
    };


    saveProfileBtn.disabled = true;

    saveProfileBtn.textContent =
      "Saving...";


    const { error } =
      await supabase
        .from("profile")
        .upsert(payload);


    saveProfileBtn.disabled = false;

    saveProfileBtn.textContent =
      "💾 Save Profile";


    if (error) {

      showMsg(
        profileMsg,
        error.message
      );

      return;
    }


    updateProfilePreview();


    showMsg(
      profileMsg,
      "Profile saved successfully.",
      true
    );
  }
);


/* =========================================
   LOAD LINKS
========================================= */

async function loadLinks() {

  const {
    data,
    error
  } = await supabase
    .from("links")
    .select("*")
    .order("sort_order", {
      ascending: true
    });


  if (error) {
    showMsg(
      loginMsg,
      error.message
    );

    return;
  }


  currentLinks =
    data || [];


  renderLinks();
  updateStats();
}


/* =========================================
   RENDER LINKS
========================================= */

function renderLinks() {

  linkList.replaceChildren();


  if (currentLinks.length === 0) {

    emptyLinks.hidden = false;

    return;
  }


  emptyLinks.hidden = true;


  currentLinks.forEach(
    (item, index) => {

      linkList.appendChild(
        makeRow(item, index)
      );

    }
  );
}


/* =========================================
   LINK ROW
========================================= */

function makeRow(item, index) {

  const row =
    document.createElement("div");

  row.className =
    "linkItem";


  if (!item.enabled) {
    row.classList.add(
      "hiddenLink"
    );
  }


  const icon =
    document.createElement("div");

  icon.className =
    "linkIcon";

  icon.textContent =
    getIconEmoji(item.icon);


  const info =
    document.createElement("div");

  info.className =
    "linkInfo";


  const title =
    document.createElement("strong");

  title.textContent =
    item.title ||
    "Untitled Link";


  const subtitle =
    document.createElement("span");

  subtitle.textContent =
    item.subtitle ||
    item.url ||
    "No description";


  info.appendChild(title);
  info.appendChild(subtitle);


  const actions =
    document.createElement("div");

  actions.className =
    "linkActions";


  /* UP */

  const upBtn =
    document.createElement("button");

  upBtn.type = "button";
  upBtn.title = "Move up";
  upBtn.textContent = "↑";

  upBtn.disabled =
    index === 0;

  upBtn.onclick =
    () => moveLink(index, -1);


  /* DOWN */

  const downBtn =
    document.createElement("button");

  downBtn.type = "button";
  downBtn.title = "Move down";
  downBtn.textContent = "↓";

  downBtn.disabled =
    index === currentLinks.length - 1;

  downBtn.onclick =
    () => moveLink(index, 1);


  /* EDIT */

  const editBtn =
    document.createElement("button");

  editBtn.type = "button";
  editBtn.title = "Edit";
  editBtn.textContent = "✏️";

  editBtn.onclick =
    () => openEditor(item);


  /* TOGGLE */

  const toggleBtn =
    document.createElement("button");

  toggleBtn.type = "button";

  toggleBtn.title =
    item.enabled
      ? "Hide"
      : "Show";

  toggleBtn.textContent =
    item.enabled
      ? "👁️"
      : "🙈";

  toggleBtn.onclick =
    () => toggleLink(item);


  /* DELETE */

  const deleteBtn =
    document.createElement("button");

  deleteBtn.type = "button";
  deleteBtn.title = "Delete";
  deleteBtn.textContent = "🗑️";

  deleteBtn.onclick =
    () => deleteLink(item.id);


  actions.appendChild(upBtn);
  actions.appendChild(downBtn);
  actions.appendChild(editBtn);
  actions.appendChild(toggleBtn);
  actions.appendChild(deleteBtn);


  row.appendChild(icon);
  row.appendChild(info);
  row.appendChild(actions);


  return row;
}


/* =========================================
   ICONS
========================================= */

function getIconEmoji(icon) {

  const icons = {

    instagram: "📸",
    whatsapp: "💬",
    youtube: "▶️",
    facebook: "📘",
    twitter: "𝕏",
    x: "𝕏",
    telegram: "✈️",
    linkedin: "💼",
    github: "🐙",
    website: "🌐",
    email: "✉️",
    phone: "📞",
    link: "🔗",
    discord: "🎮",
    spotify: "🎵",
    twitch: "🎮"

  };


  return (
    icons[
      String(icon || "")
        .toLowerCase()
        .trim()
    ] || "🔗"
  );
}


/* =========================================
   STATS
========================================= */

function updateStats() {

  const total =
    currentLinks.length;


  const visible =
    currentLinks.filter(
      item => item.enabled
    ).length;


  const hidden =
    total - visible;


  document.getElementById(
    "totalLinks"
  ).textContent = total;


  document.getElementById(
    "visibleLinks"
  ).textContent = visible;


  document.getElementById(
    "hiddenLinks"
  ).textContent = hidden;
}


/* =========================================
   TOGGLE LINK
========================================= */

async function toggleLink(item) {

  const { error } =
    await supabase
      .from("links")
      .update({
        enabled: !item.enabled
      })
      .eq("id", item.id);


  if (error) {

    alert(error.message);

    return;
  }


  await loadLinks();
}


/* =========================================
   DELETE LINK
========================================= */

async function deleteLink(id) {

  if (
    !confirm(
      "Are you sure you want to delete this link?"
    )
  ) {
    return;
  }


  const { error } =
    await supabase
      .from("links")
      .delete()
      .eq("id", id);


  if (error) {

    alert(error.message);

    return;
  }


  await loadLinks();
}


/* =========================================
   MOVE LINK
========================================= */

async function moveLink(
  index,
  direction
) {

  const newIndex =
    index + direction;


  if (
    newIndex < 0 ||
    newIndex >= currentLinks.length
  ) {
    return;
  }


  const current =
    currentLinks[index];

  const target =
    currentLinks[newIndex];


  const currentOrder =
    current.sort_order;

  const targetOrder =
    target.sort_order;


  const firstUpdate =
    await supabase
      .from("links")
      .update({
        sort_order: targetOrder
      })
      .eq("id", current.id);


  if (firstUpdate.error) {

    alert(
      firstUpdate.error.message
    );

    return;
  }


  const secondUpdate =
    await supabase
      .from("links")
      .update({
        sort_order: currentOrder
      })
      .eq("id", target.id);


  if (secondUpdate.error) {

    alert(
      secondUpdate.error.message
    );

    return;
  }


  await loadLinks();
}


/* =========================================
   OPEN EDITOR
========================================= */

function openEditor(item = null) {

  editingId =
    item?.id ?? null;


  document.getElementById(
    "editorTitle"
  ).textContent =
    item
      ? "Edit Link"
      : "Add Link";


  document.getElementById(
    "linkTitle"
  ).value =
    item?.title || "";


  document.getElementById(
    "linkSubtitle"
  ).value =
    item?.subtitle || "";


  document.getElementById(
    "linkUrl"
  ).value =
    item?.url || "";


  document.getElementById(
    "linkIcon"
  ).value =
    item?.icon || "link";


  document.getElementById(
    "linkEnabled"
  ).checked =
    item?.enabled ?? true;


  showMsg(
    editMsg,
    ""
  );


  editor.showModal();
}


addBtn.addEventListener(
  "click",
  () => openEditor()
);


if (emptyAddBtn) {

  emptyAddBtn.addEventListener(
    "click",
    () => openEditor()
  );
}


/* =========================================
   CLOSE EDITOR
========================================= */

function closeEditor() {

  editingId = null;

  if (editor.open) {
    editor.close();
  }
}


cancelBtn.addEventListener(
  "click",
  closeEditor
);


if (closeEditorBtn) {

  closeEditorBtn.addEventListener(
    "click",
    closeEditor
  );
}


/* =========================================
   SAVE LINK
========================================= */

linkForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    showMsg(editMsg, "");


    const payload = {

      title:
        document
          .getElementById("linkTitle")
          .value
          .trim(),

      subtitle:
        document
          .getElementById("linkSubtitle")
          .value
          .trim(),

      url:
        document
          .getElementById("linkUrl")
          .value
          .trim(),

      icon:
        document
          .getElementById("linkIcon")
          .value
          .trim(),

      enabled:
        document
          .getElementById("linkEnabled")
          .checked

    };


    if (!payload.title) {

      showMsg(
        editMsg,
        "Please enter a link name."
      );

      return;
    }


    if (!payload.url) {

      showMsg(
        editMsg,
        "Please enter a URL."
      );

      return;
    }


    let result;


    if (editingId !== null) {

      result =
        await supabase
          .from("links")
          .update(payload)
          .eq("id", editingId);

    } else {

      const {
        data: last,
        error: lastError
      } = await supabase
        .from("links")
        .select("sort_order")
        .order("sort_order", {
          ascending: false
        })
        .limit(1);


      if (lastError) {

        showMsg(
          editMsg,
          lastError.message
        );

        return;
      }


      payload.sort_order =
        (last?.[0]?.sort_order ?? 0) + 1;


      result =
        await supabase
          .from("links")
          .insert(payload);
    }


    if (result.error) {

      showMsg(
        editMsg,
        result.error.message
      );

      return;
    }


    closeEditor();

    await loadLinks();
  }
);


/* =========================================
   INITIAL LOAD
========================================= */

refreshSession();

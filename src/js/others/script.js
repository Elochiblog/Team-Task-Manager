document.addEventListener("DOMContentLoaded", () => {
  /* ==========================
     Sidebar & Search (your original logic, kept & hardened)
     ========================== */
  const menuBtns = document.querySelectorAll(".menuBtn");
  const closeBtn = document.getElementById("closeBtn");
  const mobileSidebar = document.getElementById("mobileSidebar");
  const searchInput = document.getElementById("search-bar");
  const searchBtn = document.getElementById("search-img");
  // Sidebar Toggle (safe if menuBtns is empty)
  if (menuBtns) {
    menuBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (mobileSidebar) mobileSidebar.classList.remove("hidden");
      });
    });
  }

  if (closeBtn && mobileSidebar) {
    closeBtn.addEventListener("click", () => {
      mobileSidebar.classList.add("hidden");
    });
  }

  // Desktop active state (safe-guards added)
  const desktopItems = document.querySelectorAll("#sidebar .menu-item");
  desktopItems.forEach((item) => {
    item.addEventListener("click", () => {
      desktopItems.forEach((el) => {
        el.classList.remove("bg-[var(--color-base-blue)]");
        const white = el.querySelector(".icon-white");
        const black = el.querySelector(".icon-black");
        if (white) white.classList.add("hidden");
        if (black) black.classList.remove("hidden");
        const a = el.querySelector("a");
        if (a) {
          a.classList.remove("text-[var(--color-neutral-0)]");
          a.classList.add("text-[var(--color-neutral-900)]");
        }
      });

      item.classList.add("bg-[var(--color-base-blue)]");
      const iw = item.querySelector(".icon-white");
      const ib = item.querySelector(".icon-black");
      if (iw) iw.classList.remove("hidden");
      if (ib) ib.classList.add("hidden");
      const a = item.querySelector("a");
      if (a) {
        a.classList.remove("text-[var(--color-neutral-900)]");
        a.classList.add("text-[var(--color-neutral-0)]");
      }
    });
  });

  // Mobile active state
  const mobileLinks = document.querySelectorAll("#mobileSidebar a");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileLinks.forEach((el) => {
        el.classList.remove(
          "bg-[var(--color-base-blue)]",
          "text-[var(--color-neutral-0)]",
          "w-64",
          "p-2",
          "rounded-xl"
        );
        el.classList.add("text-[var(--color-neutral-900)]");
      });

      link.classList.add(
        "bg-[var(--color-base-blue)]",
        "text-[var(--color-neutral-0)]",
        "w-64",
        "p-2",
        "rounded-xl"
      );
      link.classList.remove("text-[var(--color-neutral-900)]");
    });
  });

  // Search Toggle
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      searchInput.classList.toggle("hidden");
      searchBtn.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !searchBtn.contains(e.target)) {
        searchInput.classList.add("hidden");
        searchBtn.classList.remove("hidden");
      }
    });
  }

  /* ==========================
     App State & DOM references
     ========================== */
//UserName
const UserProfileName = document.querySelectorAll("h2")
  // top counters

  const eventsCountEl = document.getElementById("meetings-count");
  const tasksCountEl = document.getElementById("tasks-count");
  const inboxCountEl = document.getElementById("inbox-count");

  // sections
  const tasksSection = document.getElementById("tasks-section");
  const conferenceContainer = document.getElementById("conference-container");
  const conferencesEmpty = document.getElementById("conferences-empty");
  const mailSection = document.getElementById("mail-section");
  const mailEmpty = document.getElementById("mail-empty");
  const scheduleContent = document.getElementById("schedule-content");
  const cardSchedule = document.getElementById("card-schedule");
  const miniDateStrip = document.getElementById("mini-date-strip");
  const calendarContainer = document.getElementById("calendar");

  // modal elements
  const createTaskBtn = document.getElementById("create-task-btn");
  const taskModal = document.getElementById("taskModal");
  const closeTaskModal = document.getElementById("closeTaskModal");
  const cancelTask = document.getElementById("cancelTask");
  const taskForm = document.getElementById("taskForm");
  const taskTitleInput = document.getElementById("taskTitle");
  const taskDescInput = document.getElementById("taskDesc");
  const taskDateInput = document.getElementById("taskDate");
  const assignInput = document.getElementById("taskAssign");
  const statusSelect = document.getElementById("taskStatus");
/*   const tabMeetings = document.getElementById("tab-meetings");
  const tabEvents = document.getElementById("tab-events"); */
/* ==========================
   Persistent state (localStorage)
   ========================== */
const STORAGE_KEY = "taskhiveState";

function getEmptyState() {
return { tasks: [], meetings: [], events: [], mails: [], conferences: [] };

}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored || getEmptyState();
  } catch {
    return getEmptyState();
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ tasks, meetings, events, mails, conferences })
  );
}

// initialize arrays
let { tasks, meetings, events, mails, conferences } = loadState();
let teamMembers = []; // fetched from backend


  /* ==========================
     Helpers: plural, updateCounts
     ========================== */
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

  function updateCounts() {
    const eventsCount = meetings.length + events.length + conferences.length;
    const tasksCount = tasks.length;
    const inboxCount = mails.length;

    if (eventsCountEl) eventsCountEl.textContent = plural(eventsCount, "meeting");
    if (tasksCountEl) tasksCountEl.textContent = plural(tasksCount, "task");
    if (inboxCountEl) inboxCountEl.textContent = plural(inboxCount, "inbox");
  }
  
// /*================fecth id===========*/
// async function fetchTeamMembers(teamId) {
//   const response = await fetch(`https://be.taskmanager.kode.camp/teams/${teamId}/members`);
//   if (!response.ok) {
//     throw new Error('Failed to fetch team members');
//   }
//   return response.json();
// }

  /* ==========================
     Rendering helpers
     ========================== */
  function renderTasks(limit = 2) {
  if (!tasksSection) return;

  if (tasks.length === 0) {
    tasksSection.innerHTML =
      '<div class="text-gray-500 text-sm py-4">No project tasks yet. Please check back later.</div>';
    return;
  }

  tasksSection.innerHTML = "";

  const limitedTasks = tasks.slice(0, limit);

  limitedTasks.forEach((t) => {
    const card = document.createElement("div");
    card.className =
      "border rounded-lg p-4 mb-3 border-s-2 border-s-orange-500 shadow-sm bg-white hover:shadow-md transition";

    // format due date
    let dueDateFormatted = "—";
    if (t.dueDate) {
      const d = new Date(t.dueDate);
      dueDateFormatted = d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
      });
      const time = d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      dueDateFormatted = `${dueDateFormatted}, ${time}`;
    }

    // calculate duration (end - start)
    let duration = "";
    if (t.dueDate && t.createdAt) {
      const start = new Date(t.createdAt);
      const end = new Date(t.dueDate);
      const diffMs = end - start;
      if (diffMs > 0) {
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        duration =
          (diffHrs > 0 ? `${diffHrs}h ` : "") +
          (diffMins > 0 ? `${diffMins}m` : "");
      }
    }

    card.innerHTML = `
      <div>
        <h4 class="font-semibold text-base text-gray-800 mb-2">${escapeHtml(
        t.title
    )}</h4>

        <div class="flex items-center gap-2 mb-1">
          <img src="../../../images/calendar-line.svg" alt="" class="w-4 h-4"/>
          <p class="text-sm text-gray-600">${dueDateFormatted}</p>
        </div>

        ${
        duration
            ? `
        <div class="flex items-center gap-2">
          <img src="../../../images/countdown.svg" alt="" class="w-4 h-4"/>
          <p class="text-sm text-gray-600">${duration}</p>
        </div>`
            : ""
    }
      </div>
    `;
    tasksSection.appendChild(card);
  });
}



  function renderConferences() {
    if (!conferenceContainer) return;
    if (conferences.length === 0) {
      if (conferencesEmpty) conferencesEmpty.style.display = "";
      conferenceContainer.innerHTML = "";
      return;
    }
    if (conferencesEmpty) conferencesEmpty.style.display = "none";
    conferenceContainer.innerHTML = "";
    conferences.forEach((c) => {
      const el = document.createElement("div");
      el.className = "border rounded-lg p-3 mb-3";
      el.innerHTML = `
        <h4 class="font-medium">${escapeHtml(c.title)}</h4>
        <p class="text-xs text-gray-500">${escapeHtml(c.date)}</p>
        <p class="text-xs text-gray-400">${escapeHtml(c.duration || "")}</p>
      `;
      conferenceContainer.appendChild(el);
    });
  }

  function renderMail() {
    if (!mailSection) return;
    if (mails.length === 0) {
      if (mailEmpty) mailEmpty.style.display = "";
      // ensure empty markup remains
      return;
    }
    if (mailEmpty) mailEmpty.style.display = "none";
    // replace with list of mail cards
    const container = document.createElement("div");
    mails.forEach((m) => {
      const el = document.createElement("div");
      el.className = "py-3 border-b last:border-b-0";
      el.innerHTML = `
        <h4 class="font-medium text-sm">${escapeHtml(m.subject)}</h4>
        <p class="text-xs text-gray-500">${escapeHtml(m.snippet || "")}</p>
      `;
      container.appendChild(el);
    });
    mailSection.innerHTML = ""; // clear
    mailSection.appendChild(container);
  }

  function renderScheduleContent(tab = "meetings") {
    
    if (!scheduleContent) return;
    if (tab === "meetings") {
      if (meetings.length === 0) {
        scheduleContent.innerHTML = `<div class="text-center py-8">
          <div class="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center">
            <img src="../../../images/calendar-01.svg" alt="" />
          </div>
          <p class="text-gray-500 text-sm">No meetings yet.</p>
        </div>`;
        return;
      }
      scheduleContent.innerHTML = "";
      meetings.forEach((m) => {
        const card = document.createElement("div");
        card.className =
          "p-3 overflow-y-auto rounded-lg mb-3 bg-gradient-to-r from-orange-100 to-orange-200 shadow";
        card.innerHTML = `
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-semibold">${escapeHtml(m.title)}</h4>
              <p class="text-sm">${escapeHtml(m.time)}</p>
              <p class="text-xs text-gray-600">${escapeHtml(m.location || "")}</p>
            </div>
          </div>
        `;
        scheduleContent.appendChild(card);
      });
    } else {
      // events tab
      /* if (events.length === 0) {
        scheduleContent.innerHTML = `<div class="text-center py-8">
          <div class="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center">
            <img src="./images/calendar-01.svg" alt="" />
          </div>
          <p class="text-gray-500 text-sm">No events yet.</p>
        </div>`;
        return;
      }
      scheduleContent.innerHTML = "";
      events.forEach((ev) => {
        const card = document.createElement("div");
        card.className =
          "p-3 rounded-lg mb-3 bg-gradient-to-r from-purple-100 to-purple-200 shadow";
        card.innerHTML = `
          <div>
            <h4 class="font-semibold">${escapeHtml(ev.title)}</h4>
            <p class="text-sm">${escapeHtml(ev.time)}</p>
          </div>
        `;
      
        scheduleContent.appendChild(card);
      }); */
    }
  }

  /* ==========================
     Calendar (simple month grid + mini strip)
     ========================== */
  const weekStrip = document.getElementById("weekStrip");
  const monthLabel = document.getElementById("monthLabel");
  const monthView = document.getElementById("monthView");
  const monthGrid = document.getElementById("monthGrid");
  const yearView = document.getElementById("yearView");
  const yearGrid = document.getElementById("yearGrid");
  let currentDate = new Date();
  let currentView = "week"; // week | month | year

  function renderWeek(date) {
    weekStrip.innerHTML = "";

    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Sunday

    monthLabel.textContent = startOfWeek.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);

      const dayBox = document.createElement("div");
      dayBox.className =
        "flex flex-col items-center p-2 rounded-lg cursor-pointer transition " +
        (d.toDateString() === currentDate.toDateString()
          ? "bg-blue-600 text-white"
          : "hover:bg-gray-100");

      dayBox.innerHTML = `
        <div class="text-xs">${d.toLocaleString("en-US", { weekday: "short" })}</div>
        <div class="text-sm font-medium">${d.getDate()}</div>
      `;

      dayBox.addEventListener("click", () => {
        currentDate = d;
        renderWeek(currentDate);
      });

      weekStrip.appendChild(dayBox);
    }
  }

  function renderMonth(date) {
    monthGrid.innerHTML = "";
    const year = date.getFullYear();
    const month = date.getMonth();

    monthLabel.textContent = date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = firstDay.getDay();

    for (let i = 0; i < startDay; i++) {
      monthGrid.appendChild(document.createElement("div"));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const fullDate = new Date(year, month, d);
      const dayEl = document.createElement("div");

      dayEl.className =
        "p-2 rounded-lg cursor-pointer transition " +
        (fullDate.toDateString() === currentDate.toDateString()
          ? "bg-blue-600 text-white"
          : "hover:bg-gray-100");

      dayEl.textContent = d;

      dayEl.addEventListener("click", () => {
        currentDate = fullDate;
        currentView = "week";
        toggleView();
        renderWeek(currentDate);
      });

      monthGrid.appendChild(dayEl);
    }
  }

  function renderYears(date) {
    yearGrid.innerHTML = "";
    const baseYear = Math.floor(date.getFullYear() / 12) * 12; // show 12 years per page

    monthLabel.textContent = `${baseYear} - ${baseYear + 11}`;

    for (let i = 0; i < 12; i++) {
      const year = baseYear + i;
      const yearEl = document.createElement("div");

      yearEl.className =
        "p-3 rounded-lg cursor-pointer transition " +
        (year === currentDate.getFullYear()
          ? "bg-blue-600 text-white"
          : "hover:bg-gray-100");

      yearEl.textContent = year;

      yearEl.addEventListener("click", () => {
        currentDate.setFullYear(year);
        currentView = "month";
        toggleView();
        renderMonth(currentDate);
      });

      yearGrid.appendChild(yearEl);
    }
  }

  function toggleView() {
    weekStrip.classList.add("hidden");
    monthView.classList.add("hidden");
    yearView.classList.add("hidden");

    if (currentView === "week") {
      weekStrip.classList.remove("hidden");
    } else if (currentView === "month") {
      monthView.classList.remove("hidden");
    } else if (currentView === "year") {
      yearView.classList.remove("hidden");
    }
  }

  // Navigation
  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentView === "week") {
      currentDate.setDate(currentDate.getDate() - 7);
      renderWeek(currentDate);
    } else if (currentView === "month") {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderMonth(currentDate);
    } else if (currentView === "year") {
      currentDate.setFullYear(currentDate.getFullYear() - 12);
      renderYears(currentDate);
    }
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentView === "week") {
      currentDate.setDate(currentDate.getDate() + 7);
      renderWeek(currentDate);
    } else if (currentView === "month") {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderMonth(currentDate);
    } else if (currentView === "year") {
      currentDate.setFullYear(currentDate.getFullYear() + 12);
      renderYears(currentDate);
    }
  });

  // Toggle view order: week → month → year
  monthLabel.addEventListener("click", () => {
    if (currentView === "week") {
      currentView = "month";
      renderMonth(currentDate);
    } else if (currentView === "month") {
      currentView = "year";
      renderYears(currentDate);
    } else {
      currentView = "week";
      renderWeek(currentDate);
    }
    toggleView();
  });

  // Init
  renderWeek(currentDate);
  toggleView();

  /* ==========================
     Assign-to & Status dropdowns (radio style fetched from API)
     ========================== */
  // Helper: create radio-dropdown UI (used for assign & status)
  function createRadioDropdown({ items, onSelect, anchorEl, rightSide = true }) {
    // remove any existing
    const existing = document.querySelector(".custom-radio-dropdown");
    if (existing) existing.remove();

    const dropdown = document.createElement("div");
    dropdown.className = "custom-radio-dropdown absolute z-50 bg-white border rounded shadow-md py-2";
    // minimal Tailwind width & overflow
    dropdown.style.minWidth = "200px";
    dropdown.style.maxHeight = "220px";
    dropdown.style.overflowY = "auto";

    items.forEach((it, idx) => {
      // item: { value, label }
      const id = `custom-radio-${Math.random().toString(36).slice(2, 9)}`;
      const label = document.createElement("label");
      label.className = "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50";
      label.style.userSelect = "none";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `custom-radio-${anchorEl.id || Math.random()}`;
      radio.id = id;
      radio.value = it.value;
      radio.className = "h-4 w-4";
      const span = document.createElement("span");
      span.textContent = it.label;
      span.className = "text-sm";

      label.appendChild(radio);
      label.appendChild(span);
      label.addEventListener("click", (e) => {
        e.preventDefault();
        radio.checked = true;
        onSelect(it.value, it);
        dropdown.remove();
      });

      dropdown.appendChild(label);
    });

    // attach dropdown next to anchorEl and position on right if requested
    // ensure anchor has position:relative
    const parent = anchorEl.parentNode;
    parent.style.position = "relative";
    dropdown.style.position = "absolute";
    dropdown.style.top = anchorEl.offsetTop + anchorEl.offsetHeight + 6 + "px";
    if (rightSide) {
      // align right edge of dropdown with right edge of input
      dropdown.style.right = "0px";
    } else {
      dropdown.style.left = "0px";
    }

    parent.appendChild(dropdown);

    // remove on outside click
    setTimeout(() => {
      const onDocClick = (e) => {
        if (!dropdown.contains(e.target) && e.target !== anchorEl) {
          dropdown.remove();
          document.removeEventListener("click", onDocClick);
        }
      };
      document.addEventListener("click", onDocClick);
    }, 0);

    return dropdown;
  }

  // fetch team members from backend (replace '/api/team-members' with real endpoint)
/*   async function fetchTeamMembers() {
  try {
    // Replace with the actual team ID or get dynamically from logged-in user
    const teamId = "YOUR_TEAM_ID"; 
    const resp = await fetch(`https://be.taskmanager.kode.camp/teams/${teamId}/members`);
    if (!resp.ok) throw new Error("Failed to fetch team members");
    const data = await resp.json();

    // normalize data to {id, name} format
    teamMembers = data.map((m) => ({ id: m.id || m.userId, name: m.name || m.username }));
  } catch (err) {
    console.error("Error fetching team members:", err);
    // fallback mock
    teamMembers = [
      { id: "esther", name: "Esther Akpan" },
      { id: "oluwaseun", name: "Oluwaseun Ife" },
      { id: "nelson", name: "Nelson Obinna" },
    ];
  }
} */

// Fetch team members using GET method
// async function fetchTeamMembers(teamId) {
//   try {
//     if (!teamId) throw new Error("Team ID is required");
//
//     const response = await fetch(`https://be.taskmanager.kode.camp/teams/${teamId}/members`, {
//       method: "GET", // explicitly using GET
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//
//     if (!response.ok) {
//       throw new Error(`Failed to fetch team members: ${response.status}`);
//     }
//
//     const data = await response.json();
//
//     // Normalize data to {id, name}
//     teamMembers = data.map((m) => ({
//       id: m.id || m.userId,
//       name: m.name || m.username,
//     }));
//
//   } catch (err) {
//     console.error("Error fetching team members:", err);
//     // fallback mock data
//     /* teamMembers = [
//       { id: "esther", name: "Esther Akpan" },
//       { id: "oluwaseun", name: "Oluwaseun Ife" },
//       { id: "nelson", name: "Nelson Obinna" },
//     ]; */
//   }
// }

// Usage: call with real team ID
// const myTeamId = "12345"; // replace with actual team ID
// fetchTeamMembers(myTeamId).then(() => {
//   wireAssignDropdown(); // populate assign dropdown after fetching members
// });

  function createMultiSelectDropdown({ items, selectedValues = [], onChange, anchorEl }) {
  // remove existing dropdown
  const existing = document.querySelector(".custom-radio-dropdown");
  if (existing) existing.remove();

  const dropdown = document.createElement("div");
  dropdown.className = "custom-radio-dropdown absolute z-50 bg-white border rounded shadow-md py-2";
  dropdown.style.minWidth = "200px";
  dropdown.style.maxHeight = "220px";
  dropdown.style.overflowY = "auto";

  items.forEach((it) => {
    const label = document.createElement("label");
    label.className = "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50";
    label.style.userSelect = "none";

    const icon = document.createElement("i");
    icon.className = selectedValues.includes(it.value)
      ? "fa-solid fa-circle-check text-blue-500"
      : "fa-regular fa-circle text-gray-400";

    const span = document.createElement("span");
    span.textContent = it.label;
    span.className = "text-sm";

    label.appendChild(icon);
    label.appendChild(span);

    label.addEventListener("click", (e) => {
      e.preventDefault();

      // TOGGLE multi-select
      if (selectedValues.includes(it.value)) {
        selectedValues = selectedValues.filter((v) => v !== it.value);
      } else {
        selectedValues.push(it.value);
      }

      // Update icons
      Array.from(dropdown.querySelectorAll("label")).forEach((lbl) => {
        const lblIcon = lbl.querySelector("i");
        const val = items.find((x) => x.label === lbl.querySelector("span").textContent).value;
        lblIcon.className = selectedValues.includes(val)
          ? "fa-solid fa-circle-check text-blue-500"
          : "fa-regular fa-circle text-gray-400";
      });

      onChange(selectedValues);
    });

    dropdown.appendChild(label);
  });

  // attach dropdown below input, aligned right
  const parent = anchorEl.parentNode;
  parent.style.position = "relative";
  dropdown.style.position = "absolute";
  dropdown.style.top = anchorEl.offsetHeight + 4 + "px";
  dropdown.style.right = "0px";

  parent.appendChild(dropdown);

  // remove on outside click
  setTimeout(() => {
    const onDocClick = (e) => {
      if (!dropdown.contains(e.target) && e.target !== anchorEl) {
        dropdown.remove();
        document.removeEventListener("click", onDocClick);
      }
    };
    document.addEventListener("click", onDocClick);
  }, 0);

  return dropdown;
}
/* function wireAssignDropdown() {
  if (!assignInput) return;
  // hide the native input if any
  assignInput.style.display = "none";

  // visual input
  const wrapper = assignInput.parentNode;
  wrapper.style.position = "relative";

  const fakeInput = document.createElement("input");
  fakeInput.type = "text";
  fakeInput.readOnly = true;
  fakeInput.placeholder = "";
  fakeInput.className = "w-full border outline-none rounded-lg px-3 py-2";
  wrapper.insertBefore(fakeInput, assignInput);

  const chevron = document.createElement("button");
  chevron.type = "button";
  chevron.className = "absolute right-3 top-2 text-gray-500";
  chevron.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
  wrapper.appendChild(chevron);

  let selectedAssignees = [];

  function openDropdown() {
    createMultiSelectDropdown({

      items: teamMembers.map((m) => ({ value: m.id, label: m.name })),
      selectedValues: selectedAssignees,
      anchorEl: fakeInput,
      onChange: (vals) => {
        selectedAssignees = vals;
        fakeInput.value = teamMembers
          .filter((m) => selectedAssignees.includes(m.id))
          .map((m) => m.name)
          .join(", ");
        assignInput.dataset.assigneeId = selectedAssignees.join(",");
        assignInput.value = fakeInput.value;
      },
    });
  }

  chevron.addEventListener("click", (e) => {
    e.stopPropagation();
    openDropdown();
  });
  fakeInput.addEventListener("click", (e) => {
    e.stopPropagation();
    openDropdown();
  });
}
 */

function wireAssignDropdown() {
  if (!assignInput) return;
  assignInput.style.display = "none"; // hide the original select/input

  const wrapper = assignInput.parentNode;
  wrapper.style.position = "relative";

  const fakeInput = document.createElement("input");
  fakeInput.type = "text";
  fakeInput.readOnly = true;
  fakeInput.placeholder = "Select assignees...";
  fakeInput.className = "w-full border rounded-lg px-3 py-2";
  wrapper.insertBefore(fakeInput, assignInput);

  const chevron = document.createElement("button");
  chevron.type = "button";
  chevron.className = "absolute right-3 top-2 text-gray-500";
  chevron.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
  wrapper.appendChild(chevron);

  let selectedAssignees = [];

  function openDropdown() {
    createMultiSelectDropdown({
      items: teamMembers.map(m => ({ value: m.id, label: m.name })),
      selectedValues: selectedAssignees,
      anchorEl: fakeInput,
      onChange: (vals) => {
        selectedAssignees = vals;
        fakeInput.value = teamMembers
          .filter(m => selectedAssignees.includes(m.id))
          .map(m => m.name)
          .join(", ");
        assignInput.dataset.assigneeId = selectedAssignees.join(",");
        assignInput.value = fakeInput.value;
      },
    });
  }

  chevron.addEventListener("click", e => { e.stopPropagation(); openDropdown(); });
  fakeInput.addEventListener("click", e => { e.stopPropagation(); openDropdown(); });
}

  // status: hide the select and replace with chevron + custom dropdown to the right
  function wireStatusDropdown() {
    if (!statusSelect) return;
    // hide the native select (keep it for form compatibility)
    statusSelect.style.display = "none";

    // create a visual input
    const statusWrapper = statusSelect.parentNode;
    statusWrapper.style.position = "relative";
    const fakeStatus = document.createElement("input");
    fakeStatus.type = "text";
    fakeStatus.readOnly = true;
    fakeStatus.className = "w-full border outline-none rounded-lg px-3 py-2";
    fakeStatus.placeholder = "";
    fakeStatus.id = "fakeStatusInput";
    statusWrapper.insertBefore(fakeStatus, statusSelect);

    const chevron = document.createElement("button");
    chevron.type = "button";
    chevron.className = "status-chevron absolute right-3 top-8 text-gray-500";
    chevron.innerHTML = '<i class="fa-solid fa-chevron-down "></i>';
    statusWrapper.appendChild(chevron);

    const opts = Array.from(statusSelect.options).map((o) => ({ value: o.value, label: o.value }));

    function openStatus() {
      createRadioDropdown({
        items: opts,
        anchorEl: fakeStatus,
        rightSide: true,
        onSelect: (value) => {
          fakeStatus.value = value;
          // keep the original select in sync
          statusSelect.value = value;
        },
      });
    }

    chevron.addEventListener("click", (e) => {
      e.stopPropagation();
      openStatus();
    });
    fakeStatus.addEventListener("click", (e) => {
      e.stopPropagation();
      openStatus();
    });
  }

  /* ==========================
     Popup (centered overlay)
     ========================== */
  function showPopup(message) {
    // create overlay
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50 flex";
    overlay.innerHTML = `<div class="bg-white w-[270px] max-w-md rounded-lg shadow-lg p-6 text-center">
      <div class="flex justify-center mb-4">
        <img src="../../../images/image%2024.svg" alt="" class="w-20 h-20" />
      </div>
      <p class="mb-4 text-gray-700">${escapeHtml(message)}</p>
      <button id="popupOkBtn" class="px-4 py-2 w-[200px] max-w-md bg-green-500 text-white rounded-full">Continue</button>
    </div>`;

    document.body.appendChild(overlay);

    // close behavior
    const ok = document.getElementById("popupOkBtn");
    ok.addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // auto remove after 4s if not closed
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.remove();
    }, 10000);
  }

function showErrorPopup(message) {
// create overlay
const overlay = document.createElement("div");
overlay.className = "fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50 flex";
overlay.innerHTML = `<div class="bg-white w-[270px] max-w-md rounded-lg shadow-lg p-6 text-center">
      <div class="flex justify-center mb-4">
        <img src="../../../images/red-x-line-icon.svg" alt="" class="w-20 h-20" />
      </div>
      <p class="mb-4 text-gray-700">${escapeHtml(message)}</p>
      <button id="popupOkBtn" class="px-4 py-2 w-[200px] max-w-md bg-green-500 text-white rounded-full">Continue</button>
    </div>`;

    document.body.appendChild(overlay);

    // close behavior
    const ok = document.getElementById("popupOkBtn");
    ok.addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });



}

  /* ==========================
     Create Task flow
     ========================== */
  if (createTaskBtn && taskModal) {
    createTaskBtn.addEventListener("click", () => {
      taskModal.classList.remove("hidden");
      taskModal.classList.add("flex");
    });
  }
  if (closeTaskModal) {
    closeTaskModal.addEventListener("click", () => taskModal.classList.add("hidden"));
  }
  if (cancelTask) {
    cancelTask.addEventListener("click", () => taskModal.classList.add("hidden"));
  }

  // handle submit
if (taskForm) {
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const newTitle = taskTitleInput.value.trim();

    // validation for title empty
    if (!newTitle) {
      taskTitleInput.classList.add("border-red-500");
      return;
    } else {
      taskTitleInput.classList.remove("border-red-500");
    }

    // ✅ check for duplicate title (case-insensitive)
    const duplicate = tasks.some(
      (t) => t.title.toLowerCase() === newTitle.toLowerCase()
    );
    if (duplicate) {
      showErrorPopup("A task with this title already exist. Please choose another title.");
      return;
    }

    // build task object
    const newTask = {
      id: `task_${Date.now()}`,
      title: newTitle,
      description: taskDescInput.value.trim(),
      dueDate: taskDateInput.value || "",
      assigneeId: assignInput.dataset.assigneeId || null,
      assignee: assignInput.value || "",
      status: statusSelect.value || "Pending",
      createdAt: new Date().toISOString(),
    };

    // push into data array & re-render
    tasks.unshift(newTask);
    saveState();
    renderTasks();
    updateCounts();
    saveState();
    updateCounts();
    
    // reset form
    taskForm.reset();
    if (assignInput) assignInput.dataset.assigneeId = "";

    // close modal
    if (taskModal) taskModal.classList.add("hidden");

    // show centered success popup
    showPopup("Your new task is ready to roll!");
  });
}
//=================meeting=================
 const meetingModal = document.getElementById("meetingModal");
  const createMeetingBtn = document.getElementById("createMeetingBtn");
  const closeMeetingModal = document.getElementById("closeMeetingModal");
  const meetingForm = document.getElementById("meetingForm");

  const meetingsCount = document.getElementById("meetings-count");

  

  // Open modal
  createMeetingBtn.addEventListener("click", () => {
    meetingModal.classList.remove("hidden");
  });

  // Close modal
  closeMeetingModal.addEventListener("click", () => {
    meetingModal.classList.add("hidden");
  });

  // Submit meeting
  meetingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("meetingTitle").value;
    const start = document.getElementById("meetingStart").value;
    const end = document.getElementById("meetingEnd").value;
    const tag = document.getElementById("meetingTag").value;
    const location = document.getElementById("meetingLocation").value;


    meetings.push({ title, start, end, tag, location});
    meetingForm.reset();
    meetingModal.classList.add("hidden");
    renderMeetings();
  });

  // Render meeting cards
  /* function renderMeetings() {
    scheduleContent.innerHTML = "";
    if (meetings.length === 0) {
      scheduleContent.innerHTML = `
          <div class="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center">
            <img src="./images/calendar-01.svg" alt="" />
          </div>
          <p class="text-gray-500 text-sm">No meetings yet.</p>
        </div>`;
    } else {
      meetings.forEach((meeting, index) => {
        const colors = {
          Marketing: "from-orange-200 to-orange-100",
          "Product Manager": "from-purple-200 to-purple-100",
          Partnership: "from-blue-200 to-blue-100",
        };

        const div = document.createElement("div");
        div.className =
          "bg-gradient-to-r " +
          (colors[meeting.tag] || "from-gray-200 to-gray-100") +
          " p-4 rounded-lg shadow mb-2 flex justify-between items-center";

        div.innerHTML = `
          <div>
            <h3 class="font-semibold text-gray-800">${meeting.title}</h3>
            <p class="text-sm text-gray-600">${meeting.start} - ${meeting.end}</p>
            <p class="text-sm text-gray-500">On ${meeting.location}</p>
            <span class="mt-2 inline-block text-xs px-2 py-1 bg-white rounded-full shadow">${meeting.tag}</span>
          </div>
          <button data-index="${index}" class="deleteBtn text-red-600">
            <i class="fa-solid fa-trash"></i>
          </button>
        `;
        scheduleContent.appendChild(div);
      });
    }
    updateMeetingsCount();
    attachDeleteHandlers();
  }
 */
function renderMeetings() {
  scheduleContent.innerHTML = "";

  if (meetings.length === 0) {
    scheduleContent.innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center">
          <img src="../../../images/calendar-01.svg" alt="" />
        </div>
        <p class="text-gray-500 text-sm">No meetings yet.</p>
      </div>`;
  } else {
    // ✅ Only show first 2 meetings
    meetings.slice(0, 2).forEach((meeting, index) => {
      const colors = {
        Marketing: "from-orange-200 to-orange-100",
        "Product Manager": "from-purple-200 to-purple-100",
        Partnership: "from-blue-200 to-blue-100",
      };

      const div = document.createElement("div");
      div.className =
        "bg-gradient-to-r " +
        (colors[meeting.tag] || "from-gray-200 to-gray-100") +
        " p-4 rounded-lg shadow mb-2 flex justify-between items-center";

      div.innerHTML = `
        <div>
          <h3 class="font-semibold text-gray-800">${meeting.title}</h3>
          <p class="text-sm text-gray-600">${meeting.start} - ${meeting.end}</p>
          <p class="text-sm text-gray-500">On ${meeting.location}</p>
          <span class="mt-2 inline-block text-xs px-2 py-1 bg-white rounded-full shadow">${meeting.tag}</span>
        </div>
        <button data-index="${index}" class="deleteBtn text-red-600">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
      scheduleContent.appendChild(div);
    });

    // ✅ Overflow indicator if > 2 meetings
    if (meetings.length > 2) {
      const overflowDiv = document.createElement("div");
      overflowDiv.className =
        "text-center text-sm text-gray-500 mt-2 cursor-pointer hover:underline";
      overflowDiv.textContent = `+${meetings.length - 2} more meeting(s)`;
      scheduleContent.appendChild(overflowDiv);
    }
  }

  updateMeetingsCount();
  attachDeleteHandlers();
}

  // Update counter
  function updateMeetingsCount() {
    meetingsCount.textContent = `${meetings.length} meetings`;
  }

  // Delete meeting
  function attachDeleteHandlers() {
    document.querySelectorAll(".deleteBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = btn.getAttribute("data-index");
        meetings.splice(index, 1);
        renderMeetings();
      });
    });
  }

  // Initial render
  renderMeetings();

  /* ==========================
     Utility: escapeHtml to avoid raw HTML injection if backend values included
     ========================== */
  function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return "";
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ==========================
     Initialize: fetch team members, wire dropdowns, render calendar
     (call any initial renders here)
     ========================== */(async function init() {
  await fetchTeamMembers(); 
  wireAssignDropdown();
  wireStatusDropdown();

  // if brand new user (no data in storage)
  const isNewUser =
    tasks.length === 0 &&
    meetings.length === 0 &&
    events.length === 0 &&
    mails.length === 0 &&
    conferences.length === 0;

  if (isNewUser) {
    // show empty states only
    renderTasks();
    renderConferences();
    renderMail();
    renderScheduleContent("meetings");
  } else {
    // returning user → hydrate UI with saved data
    renderTasks();
    renderConferences();
    renderMail();
    renderScheduleContent("meetings"); // default tab
    updateCounts();
    renderMonth(currentDate); // so calendar shows events
  }
})();

//=========== Task search ============ const searchInput = document.getElementById("search-input");
  const searchWrapper = document.getElementById("search-bar");
  const searchIconBtn = document.getElementById("search-img");
  const tasksContainer = document.getElementById("tasks-section");

  if (!searchInput || !tasksContainer) return;

  // Toggle search bar when icon clicked
 if (searchIconBtn) {
  searchIconBtn.addEventListener("click", () => {
    searchWrapper.classList.remove("hidden"); // always show
    searchInput.focus();
  });
}


  // Filter tasks live
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    if (!query) {
      renderTasks(); // back to default
      return;
    }

    const filtered = tasks.filter((t) =>
      (t.title || "").toLowerCase().includes(query) ||
      (t.description || "").toLowerCase().includes(query) ||
      (t.assignee || "").toLowerCase().includes(query)
      /* (t. || "").toLowerCase().includes(query) */
    );

    if (filtered.length === 0) {
      tasksContainer.innerHTML =
        '<div class="text-gray-500 text-sm py-4">No tasks match your search.</div>';
      return;
    }

    tasksContainer.innerHTML = "";
    filtered.forEach((task) => {
      const card = document.createElement("div");
      card.className =
        "border rounded-lg p-4 mb-3 border-s-2 border-s-orange-500 shadow-sm bg-white hover:shadow-md transition";
      card.innerHTML = `
        <h4 class="font-semibold text-sm text-gray-800 mb-1">${task.title}</h4>
        <p class="text-sm text-gray-500">${task.description || ""}</p>
        <div class="text-xs text-gray-400">${task.dueDate || "No due date"}</div>
        <p class="text-xs text-gray-400">Assigned: ${task.assignee || "—"}</p>
        <span class="inline-block mt-2 px-2 py-1 text-xs rounded bg-gray-100">${task.status}</span>
      `;
      tasksContainer.appendChild(card);
    });
  });
  /* ==========================
     Exposed helper functions (optional)
     Use these when you receive real API data from backend to populate lists:
     - addMeeting(obj)
     - addEvent(obj)
     - addMail(obj)
     - addConference(obj)
     Then call updateCounts() and re-render relevant sections
     ========================== */
     function showSignOutPopup() {
  // Remove any existing popup
  const existing = document.getElementById("popup-container");
  if (existing) existing.remove();

  // Create container
  const popup = document.createElement("div");
  popup.id = "popup-container";
  popup.className =
    "fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50";

  // Create popup box
  popup.innerHTML = `
    <div class="bg-white rounded-xl shadow-lg p-6 w-80 flex items-center justify-center flex-col">
    <img src = "../../../images/logout%20linear.svg" alt = "" />
      
      <p class="text-sm text-black mb-4">Are you sure you want to sign out?</p>
      <div class="flex justify-center gap-4">
        <button id="popup-cancel"
          class="text-black border border-gray-400 px-4 py-1 rounded-lg hover:bg-gray-200 transition">
          Cancel
        </button>
        <button id="popup-yes"
          class="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition">
          Sign Out
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  // Wire buttons
  document.getElementById("popup-yes").addEventListener("click", () => {
    window.location.href = "landingpage.html";
  });

  document.getElementById("popup-cancel").addEventListener("click", () => {
    popup.remove();
  });
}
// Assume your logout button has id="logoutBtn"
const signOutBtn = document.getElementById("signOutBtn");
if (signOutBtn) {
  signOutBtn.addEventListener("click", (e) => {
    e.preventDefault(); // stop default navigation
    showSignOutPopup();
  });
}


  window.appAddMeeting = function (m) {
    meetings.push(m);
    renderScheduleContent("meetings");
    updateCounts();
  };
/*   window.appAddEvent = function (ev) {
    events.push(ev);
    renderScheduleContent("events");
    updateCounts();
  }; */
  window.appAddMail = function (mail) {
    mails.unshift(mail);
    renderMail();
    updateCounts();
  };
  window.appAddConference = function (c) {
    conferences.unshift(c);
    renderConferences();
    updateCounts();
  };
});



// let loadingteamdata = false;
// let teamavailable;
//
// async function fetchTeam() {
//   loadingteamdata = true;
//
//
//   if (!tokenData || !tokenData.access_token) {
//     console.error("No token found, redirecting to login...");
//     window.location.href = "login.html";
//     return;
//   }
//
//   try {
//     const res = await fetch("https://be.taskmanager.kode.camp/teams/", {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `${tokenData.token_type} ${tokenData.access_token}`
//       }
//     });
//
//     const data = await res.json();
//     if (res.ok) {
//       if(data.length === 0){
//         teamavailable = false;
//       }else{
//         teamavailable = true;
//         teamData = data;
//         console.log("Fetched teams:", teamData);
//       }
//     } else {
//       console.error("Failed to fetch teams:", res.status, data);
//       teamavailable = false;
//       showModal('Error', data?.detail || 'Network error. Please check your connection and try again.', 'error', true);
//     }
//   } catch (err) {
//     console.error("Error fetching teams:", err);
//     teamavailable = false;
//     showModal('Error', err?.detail || 'Network error. Please check your connection and try again.', 'error', true);
//   } finally {
//     loadingteamdata = false;
//   }
// }



  document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('dropdownBtn');
  const menu = document.getElementById('dropdownMenu');
  btn.addEventListener('click', function (e) {
  e.stopPropagation();
  menu.classList.toggle('hidden');
});
  document.addEventListener('click', function () {
  menu.classList.add('hidden');
});
});



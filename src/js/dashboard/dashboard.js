document.addEventListener("DOMContentLoaded", () => {
        // ===== Sign Out Modal =====
        const signOutBtns = document.querySelectorAll(".signOutBtn"); 
        const modal = document.getElementById("signOutModal");
        const cancelSignout = document.getElementById("cancelSignout");
        const confirmSignOut = document.getElementById("confirmSignOut");

        signOutBtns.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            modal.classList.remove("hidden");
          });
        });

        if (cancelSignout) {
          cancelSignout.addEventListener("click", () => {
            modal.classList.add("hidden");
          });
        }

        // Confirm sign out
        if (confirmSignOut) {
          confirmSignOut.addEventListener("click", () => {
            
            // Clear user data from localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("selectedTeamId");
            localStorage.removeItem("selectedProjectId");
            localStorage.removeItem("user");

            
            // Redirect to login page
            window.location.href = "../auth/login.html";
          });
        }

        // Close modal when clicking outside
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            modal.classList.add("hidden");
          }
        });

        // ===== Mobile Sidebar Toggle =====
        const menuBtns = document.querySelectorAll(".menuBtn");
        const mobileSidebar = document.getElementById("mobileSidebar");
        const closeBtn = document.getElementById("closeBtn");

        if (menuBtns && mobileSidebar) {
          menuBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
              mobileSidebar.classList.remove("hidden");
              document.body.style.overflow = "hidden"; // Prevent background scroll
            });
          });
        }

        if (closeBtn && mobileSidebar) {
          closeBtn.addEventListener("click", () => {
            mobileSidebar.classList.add("hidden");
            document.body.style.overflow = "auto"; // Restore scroll
          });
        }

        // Close sidebar when clicking outside
        mobileSidebar.addEventListener("click", (e) => {
          if (e.target === mobileSidebar) {
            mobileSidebar.classList.add("hidden");
            document.body.style.overflow = "auto";
          }
        });
        window.addEventListener("resize", () => {
          if (window.innerWidth >= 1280) { // xl breakpoint
            mobileSidebar.classList.add("hidden");
            document.body.style.overflow = "auto";
          }
        });

        // Add keyboard navigation
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            if (!modal.classList.contains("hidden")) {
              modal.classList.add("hidden");
            }
            if (!mobileSidebar.classList.contains("hidden")) {
              mobileSidebar.classList.add("hidden");
              document.body.style.overflow = "auto";
            }
          }
        });
      });


      // Fixed dropdown functionality
async function fetchTeams() {
    const tokenData = JSON.parse(localStorage.getItem("token"));

    // Check if token exists
    if (!tokenData || !tokenData.access_token) {
        console.error("No valid token found");
        setDropdownError();
        return;
    }

    setDropdownLoading();

    localStorage.removeItem("selectedTeamId");
    localStorage.removeItem("selectedTeamName");

    try {
        console.log("Fetching teams..."); // Debug log
        const response = await fetch("https://be.taskmanager.kode.camp/teams/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${tokenData.token_type} ${tokenData.access_token}`
            }
        });

        console.log("Response status:", response.status); // Debug log

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error:", errorText);
            throw new Error(`Failed to fetch teams: ${response.status}`);
        }

        const teams = await response.json();
        console.log("Fetched teams:", teams); // Debug log

        if (!Array.isArray(teams) || teams.length === 0) {
            setDropdownEmpty();
        } else {
            populateDropdown(teams);
        }
    } catch (error) {
        setDropdownError();
        console.error('Error fetching teams:', error);
    }
}

function populateDropdown(teams) {
    console.log("Populating dropdown with teams:", teams);
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (!dropdownMenu) {
        console.error("Dropdown menu element not found");
        return;
    }

    dropdownMenu.innerHTML = '';

    teams.forEach(team => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'block px-4 py-2 hover:bg-gray-100 cursor-pointer';
        a.textContent = team.name;
        a.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Selected team:", team);

            // Save both ID and name
            localStorage.setItem('selectedTeamId', team.id);
            localStorage.setItem('selectedTeamName', team.name);

            const dropdownBtn = document.getElementById('dropdownBtn');
            const span = dropdownBtn.querySelector('span');
            if (span) {
                span.textContent = team.name;
            }

            dropdownMenu.classList.add('hidden');
        };
        dropdownMenu.appendChild(a);
    });

    if (teams.length === 0) {
        setDropdownEmpty();
    } else {
        // Auto-select first team if none already stored
        autoSelectFirstTeam(teams);
    }
}

function autoSelectFirstTeam(teams) {
    const selectedTeamId = localStorage.getItem('selectedTeamId');
    const selectedTeamName = localStorage.getItem('selectedTeamName');
    const dropdownBtn = document.getElementById('dropdownBtn');
    const span = dropdownBtn?.querySelector('span');

    if (selectedTeamId && selectedTeamName && span) {
        // Restore previously selected team
        span.textContent = selectedTeamName;
    } else if (!selectedTeamId && teams.length > 0 && span) {
        // No team selected yet, pick first one
        const firstTeam = teams[0];
        localStorage.setItem('selectedTeamId', firstTeam.id);
        localStorage.setItem('selectedTeamName', firstTeam.name);
        span.textContent = firstTeam.name;
    }
}


function setDropdownLoading() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.innerHTML = '<div class="px-4 py-2 text-gray-500">Loading teams...</div>';
        dropdownMenu.classList.remove('hidden');
    }
}

function setDropdownEmpty() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.innerHTML = '<div class="px-4 py-2 text-gray-500">No teams available</div>';
    }
}

function setDropdownError() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.innerHTML = '<div class="px-4 py-2 text-red-500">Error loading teams</div>';
    }
}

// Improved dropdown toggle with proper event handling
function initializeDropdown() {
    const dropdownBtn = document.getElementById('dropdownBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (!dropdownBtn || !dropdownMenu) {
        console.error("Dropdown elements not found");
        return;
    }

    console.log("Initializing dropdown..."); // Debug log

    // Force dropdown to start hidden using both class and style
    dropdownMenu.classList.add('hidden');
    dropdownMenu.style.display = 'none';
    console.log("Forced dropdown to hidden state");

    // Toggle dropdown on button click
    dropdownBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("Dropdown button clicked"); // Debug log

        // Check visibility using both methods
        const isHidden = dropdownMenu.classList.contains('hidden') || dropdownMenu.style.display === 'none';

        if (isHidden) {
            console.log("Showing dropdown");
            dropdownMenu.classList.remove('hidden');
            dropdownMenu.style.display = 'block';
        } else {
            console.log("Hiding dropdown");
            dropdownMenu.classList.add('hidden');
            dropdownMenu.style.display = 'none';
        }

        console.log("Dropdown display style:", dropdownMenu.style.display);
        console.log("Dropdown classes:", dropdownMenu.className);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
            dropdownMenu.style.display = 'none';
        }
    });

    // Close dropdown on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dropdownMenu.classList.add('hidden');
            dropdownMenu.style.display = 'none';
        }
    });

    console.log("Dropdown initialized successfully"); // Debug log
}
//================= Mail ==========================
document.addEventListener("DOMContentLoaded", () => {
  const tokenData = JSON.parse(localStorage.getItem("token"));
  const mailSection = document.getElementById("mail-section");
  const mailEmpty = document.getElementById("mail-empty");
  const inboxCountEl = document.getElementById("inbox-count");
  const tasksCountEl = document.getElementById("tasks-count");
  const teamId = localStorage.getItem("selectedTeamId");

  if (!tokenData || !tokenData.access_token) {
    console.error("No valid token found. User not authenticated.");
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `${tokenData.token_type} ${tokenData.access_token}`,
  };

/* ==============================
   NOTIFICATIONS (MAIL SECTION)
============================== */
async function fetchNotifications() {
  try {
    const response = await fetch("https://be.taskmanager.kode.camp/notifications/", {
      method: "GET",
      headers,
    });

    if (!response.ok) throw new Error("Failed to load notifications");
    const notifications = await response.json();

    // ✅ Sort by date and keep only 2 most recent
    const latestNotifications = notifications
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);

    renderNotifications(latestNotifications);
    updateInboxCounter(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    mailSection.innerHTML = `<p class="text-gray-500 text-sm text-center py-4">Error loading notifications</p>`;
  }
}

function renderNotifications(notifications) {
  if (!notifications || notifications.length === 0) {
    mailEmpty.classList.remove("hidden");
    inboxCountEl.textContent = "0 inbox";
    return;
  }

  mailEmpty.classList.add("hidden");
  mailSection.innerHTML = `
      ${notifications
        .map(
          (n) => `
    <p class="mb-3"></p>
    <div class="space-y-3">

        <div 
          class="notification-item border rounded-lg px-3 py-2  cursor-pointer transition-all ${
            n.is_read ? "bg-white" : "bg-blue-50 border-blue-300"
          }" 
          data-id="${n.id}" 
          data-read="${n.is_read}">
          <div class="flex items-start justify-between">
            <div>
            <a href="../../html/others/notification.html">
              <h4 class="font-semibold text-gray-800">${n.title}</h4>
              <span class="text-xs text-gray-400">${new Date(n.created_at).toLocaleString()}</span>
              
              </a>
            </div>
            ${
              !n.is_read
                ? `<span class="w-2 h-2 bg-blue-500 rounded-full mt-1 ms-2 flex-shrink-0"></span>`
                : ""
            }
          </div>
        </div>`
        )
        .join("")}
    </div>
    </div>
  `;

  // ✅ Add click listeners
  document.querySelectorAll(".notification-item").forEach((el) => {
    el.addEventListener("click", async () => {
      const id = el.dataset.id;
      const isRead = el.dataset.read === "true";
      if (!isRead) await markAsRead(id, el);
    });
  });
}

async function markAsRead(id, element) {
  try {
    const response = await fetch(`https://be.taskmanager.kode.camp/notifications/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ is_read: true }),
    });

    if (!response.ok) throw new Error("Failed to mark as read");

    element.dataset.read = "true";
    element.classList.remove("bg-blue-50", "border-blue-300");
    element.classList.add("bg-white");
    const dot = element.querySelector(".w-2.h-2");
    if (dot) dot.remove();

    // ✅ Refresh notifications to re-render 2 most recent
    fetchNotifications();
  } catch (error) {
    console.error("Error marking as read:", error);
  }
}

function updateInboxCounter(notifications) {
  const unreadCount = notifications.filter(n => !n.is_read).length;
  inboxCountEl.textContent = `${unreadCount} inbox`;
}


/* ==============================
   REAL-TIME STREAM HANDLER
============================== */
function connectToStream() {
  const eventSource = new EventSource("https://be.taskmanager.kode.camp/notifications/stream", {
    withCredentials: false,
  });

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    showRealTimeNotification(data);
    incrementInboxCounter();
  };

  eventSource.onerror = (error) => {
    console.error("Stream error:", error);
    eventSource.close();
    setTimeout(connectToStream, 5000);
  };
}

function showRealTimeNotification(notification) {
  // ✅ Add new real-time notification to top and remove excess
  const mailContainer = mailSection.querySelector("div.space-y-3");
  if (!mailContainer) return;

  const div = document.createElement("div");
  div.className =
    "notification-item border rounded-lg px-3 py-2 cursor-pointer bg-blue-50 border-blue-300 transition-all";
  div.dataset.id = notification.id;
  div.dataset.read = false;

  div.innerHTML = `
    <div class="flex items-start justify-between">
      <div>
        <h4 class="font-semibold text-gray-800">${notification.title}</h4>
        <p class="text-gray-600 text-sm">${notification.message}</p>
        <span class="text-xs text-gray-400">${new Date(notification.created_at).toLocaleString()}</span>
      </div>
      <span class="w-2 h-2 bg-blue-500 rounded-full mt-1 ms-2 flex-shrink-0"></span>
    </div>
  `;

  div.addEventListener("click", async () => {
    await markAsRead(notification.id, div);
  });

  mailContainer.prepend(div);

  // ✅ Keep only 2 visible
  const allNotifs = mailContainer.querySelectorAll(".notification-item");
  if (allNotifs.length > 2) {
    allNotifs[allNotifs.length - 1].remove();
  }
}

function incrementInboxCounter() {
  const current = parseInt(inboxCountEl.textContent) || 0;
  inboxCountEl.textContent = `${current + 1} inbox`;
}


  /* ==============================
     INIT
  ============================== */
  fetchNotifications();
  connectToStream();

  if (teamId) {
    fetchTaskSummary(teamId);
  }

  // When user switches team from dropdown, refresh task count
  const dropdownMenu = document.getElementById("dropdownMenu");
  if (dropdownMenu) {
    dropdownMenu.addEventListener("click", (e) => {
      const teamElement = e.target.closest("a");
      if (teamElement && localStorage.getItem("selectedTeamId")) {
        const newTeamId = localStorage.getItem("selectedTeamId");
        fetchTaskSummary(newTeamId);
      }
    });
  }
});


// =================== GRAPH =========================
document.addEventListener("DOMContentLoaded", async () => {
  const tokenData = JSON.parse(localStorage.getItem("token"));
  const teamId = localStorage.getItem("selectedTeamId"); // ✅ use selectedTeamId (not team_id)
  const emptyState = document.getElementById("activities-empty");
  const chartContainer = document.getElementById("chartContainer");
  const ctx = document.getElementById("activityChart");

  if (!tokenData || !tokenData.access_token) {
    console.error("No valid token found or user not authenticated.");
    return;
  }

  if (!teamId) {
    console.warn("No team selected yet. Waiting for team selection...");
    emptyState?.classList.remove("hidden");
    chartContainer?.classList.add("hidden");
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `${tokenData.token_type} ${tokenData.access_token}`,
  };

  // Helper function to format date to Mon-Sun
  const formatDateToWeekday = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Mon", "Tue"
  };

  try {
    // ⬇️ CHANGE: time_frame set to last_7_days
    const res = await fetch(
      `https://be.taskmanager.kode.camp/analytics/team/${teamId}/tasks?time_frame=last_7_days`,
      { headers }
    );

    if (!res.ok) throw new Error("Failed to load analytics data");
    const result = await res.json();

    // 🧩 Adjust for your API response structure
    const createdData = result?.analytics?.trends?.created_tasks || [];
    const completedData = result?.analytics?.trends?.completed_tasks || [];

    // Filter to last 7 days (assuming the API response is sorted by date)
    const last7DaysCompleted = completedData.slice(-7);
    const last7DaysCreated = createdData.slice(-7);

    // ⬇️ CHANGE: Labels are now the weekday names
    // And ensure we only have 7 days for Mon-Sun
    const  createdValues = last7DaysCreated.map(item => item.value);
    const completedValues = last7DaysCompleted.map(item => item.value);

    const hasActivity = completedValues.some(v => v > 0);
// Get today's day (0=Sunday, 6=Saturday)
const todayIndex = new Date().getDay();

// Start week from current day (Mon-Sun rotation)
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const rotatedWeekDays = weekDays.slice(todayIndex + 1).concat(weekDays.slice(0, todayIndex + 1));

// Example: If today is Tuesday -> ["Wed","Thu","Fri","Sat","Sun","Mon","Tue"]

// Now realign the data based on the rotated days
// completedValues should still correspond to the last 7 days of data from your API
const alignedLabels = rotatedWeekDays.slice(-7);

    // ✅ Toggle empty/chart visibility (already correct logic)
    if (!hasActivity) {
      emptyState?.classList.remove("hidden");
      chartContainer?.classList.add("hidden");
      return;
    }

    emptyState?.classList.add("hidden");
    chartContainer?.classList.remove("hidden");

    // ✅ Clear old chart before re-rendering
    if (window.activityChartInstance) {
      window.activityChartInstance.destroy();
    }

    // ✅ Create new chart instance
    window.activityChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: alignedLabels,
        datasets: [
          {
            label: "Created Tasks",
            data: createdValues,
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: "#3B82F6",
          },
          {
            label: "Completed Tasks",
            data: completedValues,
            // ⬇️ CHANGE: Blue color
            borderColor: "#52975eff",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            // ⬇️ CHANGE: Blue color
            pointBackgroundColor: "#52975eff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top", // ✅ places labels horizontally at the top
            align: "center",
            labels: { 
              color: "#374151", font: { size: 12 } ,
              font: { size: 12 },
              boxWidth: 12,
              padding: 10, 
            },
            layout: {
            padding: {
              bottom: 30, // ✅ adds 20px space below the legend (and above chart)
            },
  },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#6B7280" },
          },
          y: {
            beginAtZero: true,
            grid: { color: "#E5E7EB" },
            ticks: { color: "#6B7280" },
          },
        },
      },
    });
  } catch (err) {
    console.error("Analytics fetch error:", err);
    emptyState?.classList.remove("hidden");
    chartContainer?.classList.add("hidden");
  }
}); 




// ✅ Ensure chart loads after DOM and after team selection
document.addEventListener("DOMContentLoaded", () => {
  renderAnalyticsChart();

  // Re-render analytics when a team is selected from dropdown
  const dropdownMenu = document.getElementById("dropdownMenu");
  if (dropdownMenu) {
    dropdownMenu.addEventListener("click", (e) => {
      const teamElement = e.target.closest("a");
      if (teamElement && localStorage.getItem("selectedTeamId")) {
        setTimeout(() => renderAnalyticsChart(), 300);
      }
    });
  }
});




//================== Task =========================
document.addEventListener("DOMContentLoaded", () => {
  const tokenData = JSON.parse(localStorage.getItem("token"));
  const user = JSON.parse(localStorage.getItem("user"));
  const projectSection = document.getElementById("tasks-section");
  const searchInput = document.getElementById("search-input");
  const tasksCountEl = document.getElementById("tasks-count");

  if (!tokenData || !tokenData.access_token) {
    console.error("No valid token found. User not authenticated.");
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `${tokenData.token_type} ${tokenData.access_token}`,
  };

  let allProjects = [];

  /* ==============================
     FETCH PROJECTS
  ============================== */
  async function fetchProjects() {
    try {
      const response = await fetch("https://be.taskmanager.kode.camp/projects/", {
        method: "GET",
        headers,
      });

      if (!response.ok) throw new Error("Failed to fetch projects");

      const projects = await response.json();

      // ✅ Sort by newest and show only 2
      allProjects = projects
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 1);

      renderProjects(allProjects);
      updateTaskCounter(allProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      projectSection.innerHTML = `
        <p class="text-gray-500 text-sm text-center py-4">
          Error loading projects
        </p>`;
    }
  }

  /* ==============================
     RENDER PROJECTS
  ============================== */
  function renderProjects(projects) {
    if (!projects || projects.length === 0) {
      projectSection.innerHTML = `
        <div class="text-gray-400 text-sm py-4 flex items-center flex-col">
        <img src = "../../../images/Empty State Illustration.svg" class = "mb-6" />
        <p class = "text-center"> No records of projects yet. <br/> <span class="text-xs">Please check back later.</span>
</p>
        </div>`;
      return;
    }

    projectSection.innerHTML = `
      <div class="flex flex-col gap-3">
        ${projects
          .map(
            (p) => `
          <div 
            class="border rounded-lg p-4 bg-white hover:shadow transition-all cursor-pointer"
            onclick="window.location.href='../../html/project/project.html?id=${p.id}'"
          >
            <h4 class="font-semibold text-gray-800 truncate">${p.name}</h4>
            <p class="text-gray-500 text-sm mb-2">${p.description || "No description"}</p>
            <div class="flex justify-between items-center text-xs text-gray-400 mb-3">
              <span>Created: ${new Date(p.created_at).toLocaleDateString()}</span>
            </div>
            
            ${
              p.tasks && p.tasks.length > 0
                ? renderTasks(p.tasks)
                : `<p class="text-gray-400 text-xs">No tasks yet</p>`
            }
          </div>`
          )
          .join("")}
      </div>`;
  }

  /* ==============================
     RENDER TASKS (only 2 most recent)
  ============================== */
  function renderTasks(tasks) {
    const latestTasks = tasks
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2);

    return `
      <div class="space-y-2">
        ${latestTasks
          .map(
            (t) => `
          <div class="task-item border border-blue-200 rounded p-2 flex justify-between items-center bg-blue-50">
            <div>
              <p class="font-medium text-blue-800">${t.title}</p>
              <p class="text-xs text-gray-500">${t.status || "Pending"}</p>
            </div>
          </div>`
          )
          .join("")}
      </div>`;
  }
/* ==============================
   SEARCH PROJECTS + TASKS
============================== */
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
      // Show all if input empty
      renderProjects(allProjects);
      return;
    }

    const filtered = allProjects
      .map((project) => {
        // ✅ Match by project name or description
        const projectMatch =
          project.name.toLowerCase().includes(query) ||
          (project.description &&
            project.description.toLowerCase().includes(query));

        // ✅ Match any task titles inside
        const matchingTasks = (project.tasks || []).filter((task) =>
          task.title.toLowerCase().includes(query)
        );

        // ✅ Include project if it or its tasks match
        if (projectMatch || matchingTasks.length > 0) {
          // Only show matched tasks under that project
          return {
            ...project,
            tasks:
              matchingTasks.length > 0
                ? matchingTasks
                : project.tasks,
          };
        }

        return null;
      })
      .filter(Boolean);

    renderProjects(filtered);
  });
}

  /* ==============================
     UPDATE TASK COUNTER (just total)
  ============================== */
  function updateTaskCounter(projects) {
    let totalTasks = 0;

    projects.forEach((p) => {
      if (p.tasks && Array.isArray(p.tasks)) {
        totalTasks += p.tasks.length;
      }
    });

    if (tasksCountEl) tasksCountEl.textContent = `${totalTasks} tasks`;
  }
  


  /* ==============================
     INIT
  ============================== */
  fetchProjects();
});




// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired"); // Debug log

    // Debug: Check if elements exist
    const dropdownBtn = document.getElementById('dropdownBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    console.log("Dropdown button found:", !!dropdownBtn);
    console.log("Dropdown menu found:", !!dropdownMenu);

    if (dropdownBtn && dropdownMenu) {
        console.log("Dropdown menu classes:", dropdownMenu.className);
        initializeDropdown();
        fetchTeams();
    } else {
        console.error("Dropdown elements not found in DOM");
    }
});








      document.addEventListener("DOMContentLoaded", () => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user) {
          document.getElementById("username").textContent = user.name;
          if (user.avatar_url) {
            document.getElementById("avatar").src = user.avatar_url;
          }
        } 
        
        if (user) {
          document.getElementById("usernames").textContent = user.name;
          if (user.avatar_url) {
            document.getElementById("avatar").src = user.avatar_url;
          }
        }

        else {
          // If not signed in, redirect to homepage
          window.location.href = "../../../index.html";
        }
      });

// === Auto-refresh counts every 60 seconds & on focus ===
function refreshDynamicData() {
  const teamId = localStorage.getItem("selectedTeamId");
  if (teamId) {
    fetchTaskSummary(teamId);
    renderAnalyticsChart();
  }
  fetchNotifications();
}

// Refresh every 60 seconds
setInterval(refreshDynamicData, 300);

// Refresh when user comes back to tab
window.addEventListener("focus", refreshDynamicData);














// =================== FINAL FIX ===================

// Helper: ensure data loads only after teams and token exist
async function initializeDashboardData() {
  const tokenData = JSON.parse(localStorage.getItem("token"));
  if (!tokenData || !tokenData.access_token) {
    console.error("No valid token found, skipping dashboard init");
    return;
  }

  // Wait for teams to be fetched & selectedTeamId set
  await fetchTeams();

  const teamId = localStorage.getItem("selectedTeamId");
  if (!teamId) {
    console.warn("No team available after fetchTeams()");
    return;
  }

  console.log("Initializing dashboard with team:", teamId);

  // ✅ Now safely fetch everything after team is ready
  if (typeof fetchTaskSummary === "function") fetchTaskSummary(teamId);
  if (typeof renderAnalyticsChart === "function") renderAnalyticsChart();
  if (typeof fetchNotifications === "function") fetchNotifications();
}

// ✅ Call init after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeDropdown();
  initializeDashboardData();
});

// ✅ Auto-refresh every 60s and on tab focus
async function refreshDynamicData() {
  const teamId = localStorage.getItem("selectedTeamId");
  if (teamId) {
    if (typeof fetchTaskSummary === "function") await fetchTaskSummary(teamId);
    if (typeof renderAnalyticsChart === "function") await renderAnalyticsChart();
  }
  if (typeof fetchNotifications === "function") await fetchNotifications();
}

// Refresh every 60s
setInterval(refreshDynamicData, 60000);

// Refresh when tab is focused
window.addEventListener("focus", refreshDynamicData);






  /* ==============================
     TEAM TASK ANALYTICS COUNTER
  ============================== */

async function fetchTaskSummary(teamId) {
    if (!teamId) return;
    try {
      const response = await fetch(`https://be.taskmanager.kode.camp/analytics/team/${teamId}/tasks/summary`, {
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch task summary");
      const summary = await response.json();

      const totalTasks =
        (summary.completed || 0) + (summary.pending || 0) + (summary.in_progress || 0);
      tasksCountEl.textContent = `${totalTasks} tasks`;
    } catch (error) {
      console.error("Error fetching task summary:", error);
    }
  }



  

/* ================================================
   FIXED & STABLE ANALYTICS GRAPH (NO FLUCTUATION)
================================================== */
async function renderAnalyticsChart() {
  const tokenData = JSON.parse(localStorage.getItem("token"));
  const teamId = localStorage.getItem("selectedTeamId");
  const emptyState = document.getElementById("activities-empty");
  const chartContainer = document.getElementById("chartContainer");
  const ctx = document.getElementById("activityChart");

  if (!tokenData?.access_token) return;
  if (!teamId) {
    emptyState?.classList.remove("hidden");
    chartContainer?.classList.add("hidden");
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `${tokenData.token_type} ${tokenData.access_token}`,
  };

  try {
    const res = await fetch(
      `https://be.taskmanager.kode.camp/analytics/team/${teamId}/tasks?time_frame=last_7_days`,
      { headers }
    );

    if (!res.ok) throw new Error("Failed to load analytics data");
    const result = await res.json();

    const createdData = result?.analytics?.trends?.created_tasks || [];
    const completedData = result?.analytics?.trends?.completed_tasks || [];

    const createdValues = createdData.slice(-7).map((d) => d.value);
    const completedValues = completedData.slice(-7).map((d) => d.value);

    const labels = createdData
      .slice(-7)
      .map((d) => new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }));

    const hasActivity =
      createdValues.some((v) => v > 0) || completedValues.some((v) => v > 0);

    if (!hasActivity) {
      emptyState?.classList.remove("hidden");
      chartContainer?.classList.add("hidden");
      return;
    }

    emptyState?.classList.add("hidden");
    chartContainer?.classList.remove("hidden");

    // ✅ Clear previous chart safely
    if (window.activityChartInstance) {
      window.activityChartInstance.destroy();
    }

    // ✅ Enforce stable container sizing (important for mobile)
    if (chartContainer) {
      chartContainer.style.position = "relative";
      chartContainer.style.height = "260px";
      chartContainer.style.width = "100%";
    }

    // ✅ Create stable chart
    window.activityChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Created Tasks",
            data: createdValues,
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59,130,246,0.1)",
            // borderWidth: 2,
            pointRadius: 3,
            tension: 0.4, // smoother curve
            fill: true,
            pointBackgroundColor: "#3B82F6",
          },
          {
            label: "Completed Tasks",
            data: completedValues,
            // borderColor: "#10B981",
            // backgroundColor: "rgba(16,185,129,0.1)",
            borderColor: "#52975eff",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            // borderWidth: 2,
            pointRadius: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#52975eff"
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // ✅ allows responsive resizing
        animation: false, // ✅ no “on load” animation
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "#374151", font: { size: 12 },
              boxWidth: 12,
              font: { size: 12 },
              padding: 10,
            },
          },
          // tooltip: {
          //   mode: "index",
          //   intersect: false,
          // },

          layout: {
            padding: {
              bottom: 30, // ✅ adds 20px space below the legend (and above chart)
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#6B7280" },
          },
          y: {
            beginAtZero: true,
            grid: { color: "#E5E7EB" },
            ticks: {
              color: "#6B7280",
              precision: 0,
              stepSize: 0,
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("Analytics fetch error:", err);
    emptyState?.classList.remove("hidden");
    chartContainer?.classList.add("hidden");
  }
}




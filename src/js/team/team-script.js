// ===== team-members.js (fixed) =====

const menuBtns = document.querySelectorAll(".menuBtn")
const closeBtn = document.getElementById("closeBtn")
const mobileSidebar = document.getElementById("mobileSidebar")
const searchInput = document.getElementById("search-bar")
const searchBtn = document.getElementById("search-img")
let selectedMembers = [] // Declare the selectedMembers variable

// ---------------- Sidebar Toggle ----------------
if (menuBtns && menuBtns.length) {
  menuBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (mobileSidebar) {
        mobileSidebar.classList.remove("hidden")
        document.body.style.overflow = "hidden" // Prevent background scroll
      }
    })
  })
}

if (closeBtn && mobileSidebar) {
  closeBtn.addEventListener("click", () => {
    mobileSidebar.classList.add("hidden")
    document.body.style.overflow = "auto" // Restore scroll
  })
}

// ---------------- Active State (Desktop) ----------------
const desktopItems = document.querySelectorAll("#sidebar .menu-item")

if (desktopItems && desktopItems.length) {
  desktopItems.forEach((item) => {
    item.addEventListener("click", () => {
      desktopItems.forEach((el) => {
        el.classList.remove("bg-[var(--color-base-blue)]")
        const iconWhite = el.querySelector(".icon-white")
        const iconBlack = el.querySelector(".icon-black")
        const linkA = el.querySelector("a")
        if (iconWhite) iconWhite.classList.add("hidden")
        if (iconBlack) iconBlack.classList.remove("hidden")
        if (linkA) {
          linkA.classList.remove("text-[var(--color-neutral-0)]")
          linkA.classList.add("text-[var(--color-neutral-900)]")
        }
      })

      item.classList.add("bg-[var(--color-base-blue)]")
      const iw = item.querySelector(".icon-white")
      const ib = item.querySelector(".icon-black")
      const ia = item.querySelector("a")
      if (iw) iw.classList.remove("hidden")
      if (ib) ib.classList.add("hidden")
      if (ia) {
        ia.classList.remove("text-[var(--color-neutral-900)]")
        ia.classList.add("text-[var(--color-neutral-0)]")
      }
    })
  })
}

// ---------------- Active State (Mobile) ----------------
const mobileLinks = document.querySelectorAll("#mobileSidebar a")

if (mobileLinks && mobileLinks.length) {
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileLinks.forEach((el) => {
        el.classList.remove("bg-[var(--color-base-blue)]", "text-[var(--color-neutral-0)]", "w-64", "p-2", "rounded-xl")
        el.classList.add("text-[var(--color-neutral-900)]")
      })

      link.classList.add("bg-[var(--color-base-blue)]", "text-[var(--color-neutral-0)]", "w-64", "p-2", "rounded-xl")
      link.classList.remove("text-[var(--color-neutral-900)]")
    })
  })
}

// If you intended to remove these classes from body when clicking anywhere:
document.addEventListener("click", () => {
  // Safely remove classes from body (no error if classes not present)
  document.body.classList.remove("bg-[var(--color-base-blue)]", "text-[var(--color-neutral-0)]", "w-64", "p-2", "rounded-xl")
})

// ---------------- Search Toggle ----------------
if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    searchInput.classList.toggle("hidden")
    searchBtn.classList.toggle("hidden")
    if (!searchInput.classList.contains("hidden")) {
      searchInput.focus()
    }
  })
}

document.addEventListener("click", (e) => {
  if (searchInput && searchBtn) {
    if (!searchInput.contains(e.target) && !searchBtn.contains(e.target)) {
      searchInput.classList.add("hidden")
      searchBtn.classList.remove("hidden")
    }
  }
})

function openModal(modalId) {
  const m = document.getElementById(modalId)
  if (m) {
    m.classList.remove("hidden")
    document.body.style.overflow = "hidden"
  }
}

function closeModal(modalId) {
  const m = document.getElementById(modalId)
  if (m) {
    m.classList.add("hidden")
    document.body.style.overflow = "auto"
  }

  // Reset forms and states
  if (modalId === "addTeamModal") {
    const form = document.getElementById("addTeamForm")
    const err = document.getElementById("teamNameError")
    if (form) form.reset()
    if (err) err.classList.add("hidden")
  }
  if (modalId === "addMembersModal") {
    selectedMembers = []
    const ms = document.getElementById("memberSearch")
    if (ms) ms.value = ""
  }
}

// Show notification modal
function showNotification(type, title, message) {
  const modal = document.getElementById("notificationModal")
  const iconContainer = document.getElementById("notificationIcon")
  const titleElement = document.getElementById("notificationTitle")
  const messageElement = document.getElementById("notificationMessage")

  if (!modal || !iconContainer || !titleElement || !messageElement) return

  // Close other open modals before showing notification
  const modals = document.querySelectorAll(".fixed.inset-0")
  modals.forEach((m) => {
    if (m.id !== "notificationModal" && !m.classList.contains("hidden")) {
      m.classList.add("hidden")
    }
  })

  // Always bring notification modal to the top
  modal.style.zIndex = "9999"

  // Set icon based on type
  if (type === "success") {
    iconContainer.innerHTML = `
      <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
        <i class="fa-solid fa-check text-green-600 text-2xl"></i>
      </div>
    `
  } else {
    iconContainer.innerHTML = `
      <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
        <i class="fa-solid fa-exclamation text-red-600 text-2xl"></i>
      </div>
    `
  }

  titleElement.textContent = title
  messageElement.textContent = message

  // Show the notification modal
  modal.classList.remove("hidden")

  // Optional: reset z-index after modal closes
  setTimeout(() => {
    modal.style.zIndex = ""
  }, 3000)
}
// </CHANGE>

const teamname = document.getElementById("teamname1")
const teamNumber = document.getElementById("teamNumber")

const loadingSpinner = document.getElementById("loadingSpinner")

//get team mmembers api
const teamContainer = document.getElementById("team-container")
let LoadingTeamMembers
let members_available
let member_data
const tokenData = JSON.parse(localStorage.getItem("token") || "null")
const userData = JSON.parse(localStorage.getItem("user") || "null")

const urlParams = new URLSearchParams(window.location.search)
const team_id = urlParams.get("id")
const team_name = urlParams.get("name")

if (teamname) {
  teamname.innerText = team_name ? team_name : "Team Members"
}

// Fetch team members
async function fetchTeam() {
  // Start loading
  LoadingTeamMembers = true
  if (loadingSpinner) loadingSpinner.classList.remove("hidden")

  if (!tokenData || !tokenData.access_token) {
    console.error("No token found, redirecting to login...")
    window.location.href = "../auth/login.html"
    return
  }

  try {
    const res = await fetch(`https://be.taskmanager.kode.camp/teams/${team_id}/members`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
    })

    const data = await res.json()

    if (res.ok) {
      // `data` is expected to be an array of members
      teamNumber && (teamNumber.innerText = Array.isArray(data) ? data.length : 0)
      if (!Array.isArray(data) || data.length === 0) {
        members_available = false
        member_data = []
      } else {
        members_available = true
        member_data = data
        console.log("Fetched teams:", member_data)
      }
    } else {
      console.error("Failed to fetch teams:", res.status, data)
      members_available = false
      showNotification("error", "Error", data?.detail || "Network error. Please check your connection and try again.")
    }
  } catch (err) {
    console.error("Error fetching user profile:", err)
    members_available = false
    showNotification("error", "Error", err?.message || "Network error. Please check your connection and try again.")
  } finally {
    // End loading
    LoadingTeamMembers = false
    if (loadingSpinner) loadingSpinner.classList.add("hidden")
    console.log("Loading finished:", LoadingTeamMembers)
  }
}

// Run an initial fetch (non-blocking)
fetchTeam().then(() => {
  console.log("Initial fetchTeam finished:", LoadingTeamMembers)
})

// Show skeleton loading rows
function showSkeletonLoading() {
  const tbody = document.getElementById("team-table-body")
  if (!tbody) return
  tbody.innerHTML = `
    <tr class="skeleton-row">
      <td class="py-3 px-4"><div class="animate-pulse flex items-center gap-2"><div class="bg-gray-300 rounded-full w-8 h-8"></div><div class="bg-gray-300 h-4 w-24 rounded"></div></div></td>
      <td class="py-3 px-0"><div class="bg-gray-300 h-4 w-32 rounded animate-pulse"></div></td>
      <td class="py-3 px-0"><div class="bg-gray-300 h-4 w-12 rounded animate-pulse"></div></td>
      <td class="py-3 px-0"><div class="bg-gray-300 h-4 w-20 rounded animate-pulse"></div></td>
    </tr>
    <tr class="skeleton-row">
      <td class="py-3 px-4"><div class="animate-pulse flex items-center gap-2"><div class="bg-gray-300 rounded-full w-8 h-8"></div><div class="bg-gray-300 h-4 w-24 rounded"></div></div></td>
      <td class="py-3 px-0"><div class="bg-gray-300 h-4 w-32 rounded animate-pulse"></div></td>
      <td class="py-3 px-0"><div class="bg-gray-300 h-4 w-12 rounded animate-pulse"></div></td>
      <td class="py-3 px-0"><div class="bg-gray-300 h-4 w-20 rounded animate-pulse"></div></td>
    </tr>
    <tr class="skeleton-row">
      <td class="py-3 px-4"><div class="animate-pulse flex items-center gap-2"><div class="bg-gray-300 rounded-full w-8 h-8"></div><div class="bg-gray-300 h-4 w-24 rounded"></div></div></td>
      <td class="py-3 px-0"><div class="bg-gray-300 h-4 w-32 rounded animate-pulse"></div></td>
      <td class="py-3 px-0"><div class="bg-gray-300 h-4 w-12 rounded animate-pulse"></div></td>
      <td class="py-3 px-0"><div class="bg-gray-300 h-4 w-20 rounded animate-pulse"></div></td>
    </tr>
  `
}

// Pagination variables
let allMembers = []
let currentPage = 1
const pageSize = 10

// Render team table with member data
function renderTeamTable(members) {
  const tbody = document.getElementById("team-table-body")
  if (!tbody) return
  if (!members || members.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-gray-400">No team members found.</td></tr>'
    return
  }
  tbody.innerHTML = members
    .map(
      (m) => `
    <tr>
      <td class="py-3 px-4 flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
          ${
            m.team_name
              ? m.team_name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()
              : (m.username && m.username[0]) ? m.username[0].toUpperCase() : "U"
          }
        </div>
        ${m.username || ""}
      </td>
      <td class="py-3 px-0">${m.email || ""}</td>
      <td class="py-3 px-0">${m.joined_at ? new Date(m.joined_at).toLocaleDateString("en-GB") : ""}</td>
      <td class="py-3 px-0">${m.role || ""}</td>
    </tr>
  `,
    )
    .join("")
}

// Pagination functions
function renderPaginationControls(totalItems, currentPage, pageSize) {
  const totalPages = Math.ceil(totalItems / pageSize)
  const container = document.querySelector(".flex.justify-around.items-center.gap-2.mt-4")

  if (!container) return

  if (totalPages <= 1) {
    container.style.display = "none"
    return
  } else {
    container.style.display = "flex"
  }

  let buttonsHTML = ""

  // Previous button
  if (currentPage > 1) {
    buttonsHTML += `<button class="px-3 py-1 border rounded-md text-sm hover:bg-gray-100" data-page="${currentPage - 1}">&larr; Previous</button>`
  } else {
    buttonsHTML += `<button class="px-3 py-1 border rounded-md text-sm text-gray-400 cursor-not-allowed" disabled>&larr; Previous</button>`
  }

  // Page numbers container
  buttonsHTML += '<div class="page flex gap-1">'

  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      buttonsHTML += `<button class="px-3 py-1 border rounded-md text-sm bg-[var(--color-base-blue)] text-white" data-page="${i}">${i}</button>`
    } else {
      buttonsHTML += `<button class="px-3 py-1 border rounded-md text-sm hover:bg-gray-100" data-page="${i}">${i}</button>`
    }
  }

  buttonsHTML += "</div>"

  // Next button
  if (currentPage < totalPages) {
    buttonsHTML += `<button class="px-3 py-1 border rounded-md text-sm hover:bg-gray-100" data-page="${currentPage + 1}">Next &rarr;</button>`
  } else {
    buttonsHTML += `<button class="px-3 py-1 border rounded-md text-sm text-gray-400 cursor-not-allowed" disabled>Next &rarr;</button>`
  }

  container.innerHTML = buttonsHTML

  // Add click event listeners to pagination buttons
  container.querySelectorAll("button[data-page]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const page = Number.parseInt(e.target.getAttribute("data-page"))
      if (!isNaN(page)) {
        goToPage(page)
      }
    })
  })
}

function goToPage(page) {
  currentPage = page
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  const pageMembers = allMembers.slice(start, end)

  renderTeamTable(pageMembers)
  renderPaginationControls(allMembers.length, currentPage, pageSize)
}

// Fetch and render team members with pagination
async function fetchAndRenderTeamMembers() {
  showSkeletonLoading()

  // Wait for the fetchTeam function to complete
  await fetchTeam()

  // small delay to let the skeleton show
  setTimeout(() => {
    if (members_available && member_data && Array.isArray(member_data)) {
      allMembers = member_data
      goToPage(1) // Start with page 1
    } else {
      // No members found
      renderTeamTable([])
      const container = document.querySelector(".flex.justify-around.items-center.gap-2.mt-4")
      if (container) {
        container.style.display = "none"
      }
    }
  }, 600)
}

document.addEventListener("DOMContentLoaded", fetchAndRenderTeamMembers)

// Add Member functionality
const addMemberBtn = document.getElementById("addMemberBtn")
const addMembersModal = document.getElementById("addMembersModal")
const addMemberForm = document.getElementById("addMemberForm")
const cancelAddMembers = document.getElementById("cancelAddMembers")
const memberEmailInput = document.getElementById("memberEmail")
const emailError = document.getElementById("emailError")
const addMemberButtonText = document.getElementById("addMemberButtonText")
const addMemberSpinner = document.getElementById("addMemberSpinner")

// Open add member modal
if (addMemberBtn && addMembersModal) {
  addMemberBtn.addEventListener("click", () => {
    addMembersModal.classList.remove("hidden")
    memberEmailInput && memberEmailInput.focus()
  })
}

// Close add member modal
if (cancelAddMembers) {
  cancelAddMembers.addEventListener("click", () => {
    closeAddMemberModal()
  })
}

// Close modal when clicking outside
if (addMembersModal) {
  addMembersModal.addEventListener("click", (e) => {
    if (e.target === addMembersModal) {
      closeAddMemberModal()
    }
  })
}

function closeAddMemberModal() {
  if (addMembersModal) addMembersModal.classList.add("hidden")
  addMemberForm && addMemberForm.reset()
  hideEmailError()
}

function showEmailError(message) {
  if (emailError) {
    emailError.textContent = message
    emailError.classList.remove("hidden")
  }
  if (memberEmailInput) memberEmailInput.classList.add("border-red-500")
}

function hideEmailError() {
  if (emailError) emailError.classList.add("hidden")
  if (memberEmailInput) memberEmailInput.classList.remove("border-red-500")
}

// Add member form submission
if (addMemberForm) {
  addMemberForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    await handleAddMember()
  })
}

async function handleAddMember() {
  const email = memberEmailInput ? memberEmailInput.value.trim() : ""

  // Validate email
  if (!email) {
    showEmailError("Email is required")
    return
  }

  if (!isValidEmail(email)) {
    showEmailError("Please enter a valid email address")
    return
  }

  hideEmailError()

  // Show loading state
  if (addMemberButtonText) addMemberButtonText.textContent = "Sending..."
  if (addMemberSpinner) addMemberSpinner.classList.remove("hidden")
  const confirmBtn = document.getElementById("confirmAddMembers")
  if (confirmBtn) confirmBtn.disabled = true

  try {
    await inviteMemberToTeam(email)
  } catch (error) {
    console.error("Error adding member:", error)
    showEmailError("Something went wrong. Please try again.")
  } finally {
    // Reset button state
    if (addMemberButtonText) addMemberButtonText.textContent = "Send Invitation"
    if (addMemberSpinner) addMemberSpinner.classList.add("hidden")
    if (confirmBtn) confirmBtn.disabled = false
  }
}

async function inviteMemberToTeam(email) {
  if (!tokenData || !tokenData.access_token) {
    showNotification("error", "Error", "Authentication required. Please log in again.")
    return
  }

  if (!team_id) {
    showEmailError("Team ID not found")
    return
  }

  try {
    const response = await fetch(`https://be.taskmanager.kode.camp/teams/${team_id}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
      body: JSON.stringify({
        email: email,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      // Success
      showNotification("success", "Success!", `Invitation sent successfully to "${email}"`)
      closeAddMemberModal()

      // Refresh the team members list
      setTimeout(() => {
        fetchAndRenderTeamMembers()
      }, 1000)
    } else {
      // Handle different error cases
      showEmailError(data.detail || "Invalid request. Please check the email address.")
    }
  } catch (error) {
    console.error("Network error:", error)
    showEmailError("Network error. Please check your connection and try again.")
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

document.addEventListener("DOMContentLoaded", () => {
  const closeNotificationBtn = document.getElementById("closeNotificationModal")
  if (closeNotificationBtn) {
    closeNotificationBtn.addEventListener("click", () => {
      const nm = document.getElementById("notificationModal")
      if (nm) nm.classList.add("hidden")
    })
  }
})
// </CHANGE>

// Close sidebar when clicking outside
document.addEventListener("click", (e) => {
  if (mobileSidebar && e.target === mobileSidebar) {
    mobileSidebar.classList.add("hidden")
    document.body.style.overflow = "auto"
  }
})

// ===== Sign Out Modal =====
const signOutBtns = document.querySelectorAll(".signOutBtn")
const modal = document.getElementById("signOutModal")
const cancelSignout = document.getElementById("cancelSignout")
const confirmSignOut = document.getElementById("confirmSignOut")

if (signOutBtns && signOutBtns.length) {
  signOutBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault()
      if (modal) modal.classList.remove("hidden")
    })
  })
}

if (cancelSignout && modal) {
  cancelSignout.addEventListener("click", () => {
    modal.classList.add("hidden")
  })
}

// Confirm sign out
if (confirmSignOut) {
  confirmSignOut.addEventListener("click", () => {
    // Clear user data from localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("selectedTeamId")
    localStorage.removeItem("selectedProjectId")
    localStorage.removeItem("user")

    // Redirect to login page
    window.location.href = "../auth/login.html"
  })
}

// Close modal when clicking outside
if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden")
      modal.classList.remove("flex")
    }
  })
}

// ===== Responsive Enhancements =====
// Handle window resize
window.addEventListener("resize", () => {
  if (window.innerWidth >= 1280) {
    // xl breakpoint
    if (mobileSidebar) mobileSidebar.classList.add("hidden")
    document.body.style.overflow = "auto"
  }
})

// Add keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (modal && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden")
    }
    if (mobileSidebar && !mobileSidebar.classList.contains("hidden")) {
      mobileSidebar.classList.add("hidden")
      document.body.style.overflow = "auto"
    }
    const nm = document.getElementById("notificationModal")
    if (nm && !nm.classList.contains("hidden")) {
      nm.classList.add("hidden")
    }
  }
})


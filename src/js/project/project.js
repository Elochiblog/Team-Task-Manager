const API_BASE_URL = "https://be.taskmanager.kode.camp"
const tokenData = JSON.parse(localStorage.getItem("token"))

let projectToDelete = null
let projectToEdit = null

function openModal(modal) {
  modal.classList.remove("hidden")
}

function closeModal(modal) {
  modal.classList.add("hidden")
}

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get("openModal") === "true") {
    const addProjectModal = document.getElementById("addProjectModal")
    if (addProjectModal) {
      openModal(addProjectModal)
      // Clean up URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }



  async function checkTeamsBeforeCreatingProject() {
  const addProjectModal = document.getElementById("addProjectModal");
  const teamRequiredModal = document.getElementById("teamRequiredModal");
  const cancelTeamRequired = document.getElementById("cancelTeamRequired");
  const goToTeamPage = document.getElementById("goToTeamPage");

  try {
    const res = await fetch(`${API_BASE_URL}/teams`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
    });

    const teams = await res.json();

    if (!teams || teams.length === 0) {
      // No team exists — show modal
      teamRequiredModal.classList.remove("hidden");

      cancelTeamRequired.addEventListener("click", () => {
        teamRequiredModal.classList.add("hidden");
      });

      goToTeamPage.addEventListener("click", () => {
        window.location.href = "../team/team.html?openModal=true";
      });

      return false; // Prevent opening the project modal
    }

    // Team exists — proceed
    addProjectModal.classList.remove("hidden");
    return true;

  } catch (error) {
    console.error("Error checking teams:", error);
    alert("Unable to verify teams at the moment. Please try again later.");
  }
}


  fetchProjects()

  const addProjectModal = document.getElementById("addProjectModal")
  const addProjectBtn = document.getElementById("addMemberBtn")

  
  // if (addProjectBtn) addProjectBtn.addEventListener("click", () => openModal(addProjectModal))

    if (addProjectBtn) {
  addProjectBtn.addEventListener("click", (e) => {
    e.preventDefault();
    checkTeamsBeforeCreatingProject();
  });
}


  const cancelAddBtn = document.getElementById("cancelAddProject")
  if (cancelAddBtn) cancelAddBtn.addEventListener("click", () => closeModal(addProjectModal))

  document.getElementById("addProjectForm").addEventListener("submit", handleAddProject)

  const editProjectModal = document.getElementById("editProjectModal")
  const cancelEditBtn = document.getElementById("cancelEditProject")
  if (cancelEditBtn)
    cancelEditBtn.addEventListener("click", () => {
      closeModal(editProjectModal)
      projectToEdit = null
    })

  document.getElementById("editProjectForm").addEventListener("submit", handleEditProject)

  const closeNotificationBtn = document.getElementById("closeNotificationModal")
  if (closeNotificationBtn)
    closeNotificationBtn.addEventListener("click", () => closeModal(document.getElementById("notificationModal")))

  const cancelDeleteBtn = document.getElementById("cancelDeleteProject")
  if (cancelDeleteBtn)
    cancelDeleteBtn.addEventListener("click", () => {
      closeModal(document.getElementById("deleteProjectModal"))
      projectToDelete = null
    })

  const confirmDeleteBtn = document.getElementById("confirmDeleteProject")
  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener("click", handleDeleteProject)

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".project-menu")) {
      document.querySelectorAll(".project-menu-dropdown").forEach((dropdown) => {
        dropdown.classList.remove("show")
      })
    }
  })

  // ===== Sign Out Modal =====
  const signOutBtns = document.querySelectorAll(".signOutBtn")
  const modal = document.getElementById("signOutModal")
  const cancelSignout = document.getElementById("cancelSignout")
  const confirmSignOut = document.getElementById("confirmSignOut")

  signOutBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault()
      modal.classList.remove("hidden")
      modal.classList.add("flex")
    })
  })

  if (cancelSignout) {
    cancelSignout.addEventListener("click", () => {
      modal.classList.add("hidden")
      modal.classList.remove("flex")
    })
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
      window.location.href = "../auth/login.html"
    })
  }

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden")
      modal.classList.remove("flex")
    }
  })

  // ===== Mobile Sidebar Toggle =====
  const menuBtns = document.querySelectorAll(".menuBtn")
  const mobileSidebar = document.getElementById("mobileSidebar")
  const closeBtn = document.getElementById("closeBtn")

  if (menuBtns && mobileSidebar) {
    menuBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        mobileSidebar.classList.remove("hidden")
        document.body.style.overflow = "hidden" // Prevent background scroll
      })
    })
  }

  if (closeBtn && mobileSidebar) {
    closeBtn.addEventListener("click", () => {
      mobileSidebar.classList.add("hidden")
      document.body.style.overflow = "auto" // Restore scroll
    })
  }

  // Close sidebar when clicking outside
  mobileSidebar.addEventListener("click", (e) => {
    if (e.target === mobileSidebar) {
      mobileSidebar.classList.add("hidden")
      document.body.style.overflow = "auto"
    }
  })

  // ===== Responsive Enhancements =====
  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1280) {
      // xl breakpoint
      mobileSidebar.classList.add("hidden")
      document.body.style.overflow = "auto"
    }
  })

  // Add keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!document.getElementById("signOutModal").classList.contains("hidden")) {
        document.getElementById("signOutModal").classList.add("hidden")
        document.getElementById("signOutModal").classList.remove("flex")
      }
      if (!document.getElementById("deleteProjectModal").classList.contains("hidden")) {
        document.getElementById("deleteProjectModal").classList.add("hidden")
        document.body.style.overflow = "auto"
      }
      if (!document.getElementById("editProjectModal").classList.contains("hidden")) {
        document.getElementById("editProjectModal").classList.add("hidden")
        projectToEdit = null
      }
      if (!document.getElementById("mobileSidebar").classList.contains("hidden")) {
        document.getElementById("mobileSidebar").classList.add("hidden")
        document.body.style.overflow = "auto"
      }
      document.querySelectorAll(".project-menu-dropdown").forEach((dropdown) => {
        dropdown.classList.remove("show")
      })
    }
  })
})

// Fetch projects
async function fetchProjects() {
  const skeleton = document.getElementById("projects-skeleton")
  const container = document.getElementById("projects-container")
  const emptyState = document.getElementById("emptyState")
  const teamId = localStorage.getItem("selectedTeamId")

  skeleton.classList.remove("hidden")
  container.classList.add("hidden")
  emptyState.classList.add("hidden")

  try {
    // Step 1: Check if teams exist
    const teamRes = await fetch(`${API_BASE_URL}/teams`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
    })

    const teams = await teamRes.json()

    if (!teams || teams.length === 0) {
      skeleton.classList.add("hidden")
      emptyState.classList.remove("hidden")
      emptyState.innerHTML = `
        <div class="text-center py-16 flex flex-col items-center justify-center">
          <div class="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <i class="fa-solid fa-users text-blue-600 text-4xl"></i>
          </div>
          <h3 class="text-xl font-semibold text-dark mb-2">No Teams Available</h3>
          <p class="text-gray-600 mb-6 max-w-sm">You need to create a team before you can create projects.</p>
          <button id="createTeamRedirect" class="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
          Create Team
          </button>
        </div>
      `

      document.getElementById("createTeamRedirect").addEventListener("click", () => {
        window.location.href = "../team/team.html?openModal=true"
      })
      return
    }

    // If no selectedTeamId yet, pick the first available team
    let teamId = localStorage.getItem("selectedTeamId")
    if (!teamId && teams.length > 0) {
      teamId = teams[0].id
      localStorage.setItem("selectedTeamId", teamId)
    }

    // Step 2: Fetch Projects for selected team
    const res = await fetch(`${API_BASE_URL}/projects/team/${teamId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
    })

    if (!res.ok) throw new Error("Failed to fetch projects")

    const projects = await res.json()

    skeleton.classList.add("hidden")

    if (!projects || projects.length === 0) {
      emptyState.classList.remove("hidden")
      emptyState.innerHTML = `
        <div class="text-center py-16 flex flex-col items-center justify-center">
          <div class="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <i class="fa-solid fa-diagram-project text-blue-600 text-4xl"></i>
          </div>
          <h3 class="text-xl font-semibold text-dark mb-2">No Projects Yet</h3>
          <p class="text-gray-600 mb-6 max-w-sm">Start by creating the first project for your team.</p>
          <button id="createProjectBtn" class="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
          Create Project
          </button>
        </div>
      `

      document.getElementById("createProjectBtn").addEventListener("click", () => {
        const addProjectModal = document.getElementById("addProjectModal")
        if (addProjectModal) addProjectModal.classList.remove("hidden")
      })

      return
    }

    renderProjects(projects)
    container.classList.remove("hidden")
  } catch (error) {
    console.error(error)
    skeleton.classList.add("hidden")
    emptyState.classList.remove("hidden")
    emptyState.innerHTML = `
      <div class="text-center py-16 text-red-600">
        <p>Failed to load projects. Please try again later.</p>
      </div>
    `
  }
}

// Render projects
function renderProjects(projects) {
  const container = document.getElementById("projects-container")
  container.innerHTML = ""

  if (!projects || projects.length === 0) {
    container.innerHTML = `<p class="text-gray-500">No projects found.</p>`
    return
  }

  projects.forEach((project) => {
    const card = document.createElement("div")
    card.className = "bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition"

    card.innerHTML = `
    <div class="flex justify-between items-center">        
    <h3 class=" text-lg font-semibold text-[var(--color-dark-blue)] mb-2">${project.name}</h3>
            <div class="project-menu">
                    <button class="three-dots-btn">
                        <i class="fa-solid fa-ellipsis-vertical text-gray-600 text-xl"></i>
                    </button>
                    <div class="project-menu-dropdown">
                        <div class="project-menu-item edit-project-btn">
                            <i class="fa-solid fa-pen-to-square text-gray-600"></i>
                            <span>Edit Project</span>
                        </div>
                        <div class="project-menu-item delete-project-btn delete">
                            <i class="fa-solid fa-trash text-red-600"></i>
                            <span>Delete Project</span>
                        </div>
                    </div>
                </div>
                </div>

                
            <p class="text-gray-600 mb-10">${project.description || "No description"}</p>
            
            <div class="flex justify-between items-center">
            <p class="text-sm text-gray-400">Created: ${new Date(project.created_at).toLocaleDateString()}</p>
                <button class="view-tasks-btn text-sm px-3 py-2 bg-[var(--color-base-blue)] text-white rounded-lg hover:opacity-90 transition-opacity">
                    View Tasks
                </button>
                </div>
                </div>
            </div>
        `

    // View Tasks button
    const viewBtn = card.querySelector(".view-tasks-btn")
    viewBtn.addEventListener("click", () => {
      localStorage.setItem("selectedProjectId", project.id)
      window.location.href = "../../html/task/task.html"
    })

    // Three dots menu toggle
    const threeDotsBtn = card.querySelector(".three-dots-btn")
    const dropdown = card.querySelector(".project-menu-dropdown")
    threeDotsBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      // Close other dropdowns
      document.querySelectorAll(".project-menu-dropdown").forEach((d) => {
        if (d !== dropdown) d.classList.remove("show")
      })
      dropdown.classList.toggle("show")
    })

    // Edit button
    const editBtn = card.querySelector(".edit-project-btn")
    editBtn.addEventListener("click", () => {
      projectToEdit = project
      document.getElementById("editProjname").value = project.name
      document.getElementById("editProjdisc").value = project.description || ""
      dropdown.classList.remove("show")
      openModal(document.getElementById("editProjectModal"))
    })

    // Delete button
    const deleteBtn = card.querySelector(".delete-project-btn")
    deleteBtn.addEventListener("click", () => {
      projectToDelete = project
      document.getElementById("deleteProjectName").textContent = project.name
      dropdown.classList.remove("show")
      openModal(document.getElementById("deleteProjectModal"))
    })

    container.appendChild(card)
  })
}

// Add project
async function handleAddProject(e) {
  e.preventDefault()
  const projectname = document.getElementById("projname")
  const projectdescription = document.getElementById("projdisc")
  const teamId = localStorage.getItem("selectedTeamId")
  const spinner = document.getElementById("addProjectSpinner")
  const btnText = document.getElementById("addProjectButtonText")

  // Get current projects in memory from the DOM
  const container = document.getElementById("projects-container")
  const existingProjects = Array.from(container.querySelectorAll("h3")).map((el) => el.textContent.toLowerCase().trim())
  const existingDescriptions = Array.from(container.querySelectorAll("p")).map((el) =>
    el.textContent.toLowerCase().trim(),
  )

  const newName = projectname.value.trim().toLowerCase()
  const newDescription = projectdescription.value.trim().toLowerCase()

  // ====== Duplicate check ======
  if (existingProjects.includes(newName)) {
    showNotification("error", "Duplicate Project", `A project with the name "${projectname.value}" already exists.`)
    return
  }

  if (existingDescriptions.includes(newDescription) && newDescription !== "no description") {
    showNotification("error", "Duplicate Project", `A project with the same description already exists.`)
    return
  }
  // =============================

  spinner.classList.remove("hidden")
  btnText.textContent = "Adding..."

  try {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
      body: JSON.stringify({
        name: projectname.value,
        description: projectdescription.value,
        team_id: teamId,
      }),
    })

    if (!res.ok) throw new Error("Failed to create project")

    const newProject = await res.json()

    localStorage.setItem("selectedProjectId", newProject.id)

    fetchProjects()
    closeModal(document.getElementById("addProjectModal"))

    // Reset form
    projectname.value = ""
    projectdescription.value = ""

    // Show success notification
    showNotification("success", "Success!", `"${newProject.name}" created successfully!`)
  } catch (error) {
    console.error(error)
    showNotification("error", "Error", "Failed to create project. Please try again.")
  } finally {
    spinner.classList.add("hidden")
    btnText.textContent = "Add Project"
  }
}

// Edit project
async function handleEditProject(e) {
  e.preventDefault()
  if (!projectToEdit) return

  const projectname = document.getElementById("editProjname")
  const projectdescription = document.getElementById("editProjdisc")
  const teamId = localStorage.getItem("selectedTeamId")
  const spinner = document.getElementById("editProjectSpinner")
  const btnText = document.getElementById("editProjectButtonText")

  console.log("Editing project:", projectToEdit)
  console.log("New name:", projectname.value)
  console.log("New description:", projectdescription.value)

  // Get current projects in memory from the DOM (excluding the one being edited)
  const container = document.getElementById("projects-container")
  const existingProjects = Array.from(container.querySelectorAll("h3"))
    .map((el) => el.textContent.toLowerCase().trim())
    .filter((name) => name !== projectToEdit.name.toLowerCase().trim())

  const existingDescriptions = Array.from(container.querySelectorAll("p"))
    .map((el) => el.textContent.toLowerCase().trim())
    .filter((desc) => desc !== (projectToEdit.description || "no description").toLowerCase().trim())

  const newName = projectname.value.trim().toLowerCase()
  const newDescription = projectdescription.value.trim().toLowerCase()

  // ====== Duplicate check ======
  if (existingProjects.includes(newName)) {
    showNotification("error", "Duplicate Project", `A project with the name "${projectname.value}" already exists.`)
    return
  }

  if (existingDescriptions.includes(newDescription) && newDescription !== "no description") {
    showNotification("error", "Duplicate Project", `A project with the same description already exists.`)
    return
  }
  // =============================

  spinner.classList.remove("hidden")
  btnText.textContent = "Updating..."

  const requestBody = {
    name: projectname.value.trim(),
    description: projectdescription.value.trim(),
    team_id: teamId,
  }

  console.log("Request URL:", `${API_BASE_URL}/projects/${projectToEdit.id}`)
  console.log("Request body:", requestBody)

  try {
    const res = await fetch(`${API_BASE_URL}/projects/${projectToEdit.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
      body: JSON.stringify(requestBody),
    })

    console.log("Response status:", res.status)

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      console.log("Error response:", errorData)
      throw new Error("Failed to update project")
    }

    const updatedProject = await res.json()
    console.log("Updated project:", updatedProject)

    fetchProjects()
    closeModal(document.getElementById("editProjectModal"))

    // Reset form and variable
    projectname.value = ""
    projectdescription.value = ""
    projectToEdit = null

    // Show success notification
    showNotification("success", "Success!", `"${updatedProject.name}" updated successfully!`)
  } catch (error) {
    console.error("Edit project error:", error)
    showNotification("error", "Error", "Failed to update project. Please try again.")
  } finally {
    spinner.classList.add("hidden")
    btnText.textContent = "Update Project"
  }
}

// Delete project
async function handleDeleteProject() {
  if (!projectToDelete) return

  const spinner = document.getElementById("deleteProjectSpinner")
  const btnText = document.getElementById("deleteProjectButtonText")

  spinner.classList.remove("hidden")
  btnText.textContent = "Deleting..."

  try {
    const res = await fetch(`${API_BASE_URL}/projects/${projectToDelete.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
    })

    if (!res.ok) throw new Error("Failed to delete project")

    closeModal(document.getElementById("deleteProjectModal"))
    fetchProjects()
    showNotification("success", "Deleted!", `"${projectToDelete.name}" has been deleted successfully.`)
    projectToDelete = null
  } catch (error) {
    console.error(error)
    showNotification("error", "Error", "You cannot delete Project with existing Task.")
  } finally {
    spinner.classList.add("hidden")
    btnText.textContent = "Delete"
  }
}

// Show notification modal
function showNotification(type, title, message) {
  const modal = document.getElementById("notificationModal")
  const iconContainer = document.getElementById("notificationIcon")
  const titleElement = document.getElementById("notificationTitle")
  const messageElement = document.getElementById("notificationMessage")

  // ✅ Close other open modals before showing notification
  const modals = document.querySelectorAll(".fixed.inset-0")
  modals.forEach((m) => {
    if (m.id !== "notificationModal" && !m.classList.contains("hidden")) {
      m.classList.add("hidden")
    }
  })

  // ✅ Always bring notification modal to the top
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
  openModal(modal)

  // Optional: reset z-index after modal closes or on next show
  setTimeout(() => {
    modal.style.zIndex = ""
  }, 3000)
}

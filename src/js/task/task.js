// ================== GLOBALS ==================
let tasks = []
let teamMembers = [] // ✅ store loaded team members globally
let currentTaskId = null
let isEditMode = false

// API Base
const API_BASE = "https://be.taskmanager.kode.camp"

function getAuthHeaders() {
  const tokenData = JSON.parse(localStorage.getItem("token"))
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${tokenData?.access_token || ""}`,
  }
}

// DOM Elements
const taskModal = document.getElementById("taskModal")
const deleteModal = document.getElementById("deleteModal")
const successModal = document.getElementById("successModal")
const contextMenu = document.getElementById("contextMenu")
const taskForm = document.getElementById("taskForm")

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", async () => {
  initializeEventListeners()
  initializeNavigation()

  await handleReturnFromCreation()

  // ✅ Ensure team members are loaded BEFORE tasks
  await loadTeamMembers()
  await loadProjectTasks()
})

async function handleReturnFromCreation() {
  const urlParams = new URLSearchParams(window.location.search)
  const teamCreated = urlParams.get("teamCreated")
  const projectCreated = urlParams.get("projectCreated")

  // Clear URL parameters
  if (teamCreated || projectCreated) {
    window.history.replaceState({}, document.title, window.location.pathname)
  }

  // If returning from team creation, check for projects
  if (teamCreated === "true") {
    const hasProject = await checkProjectExists()
    if (!hasProject) {
      // Show project required modal after a short delay
      setTimeout(() => {
        showProjectRequiredModal()
      }, 500)
    }
  }

  // If returning from project creation, user can now create tasks
  if (projectCreated === "true") {
    // Optionally show a success message or automatically open task modal
    console.log("Project created successfully, ready to create tasks")
  }
}

// ================== NAVIGATION ==================
function initializeNavigation() {
  const menuBtns = document.querySelectorAll(".menuBtn")
  const closeBtn = document.getElementById("closeBtn")
  const mobileSidebar = document.getElementById("mobileSidebar")
  const searchInput = document.getElementById("search-bar")
  const searchBtn = document.getElementById("search-img")

  menuBtns.forEach((btn) => btn.addEventListener("click", () => mobileSidebar.classList.remove("hidden")))
  if (closeBtn) closeBtn.addEventListener("click", () => mobileSidebar.classList.add("hidden"))

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      searchInput.classList.toggle("hidden")
      searchBtn.classList.toggle("hidden")
    })
  }
}

// ================== EVENTS ==================
function initializeEventListeners() {
  document.getElementById("createTaskBtn")?.addEventListener("click", async () => {
    await validateAndOpenTaskModal()
  })

  document.getElementById("createTaskBtnMobile")?.addEventListener("click", async () => {
    await validateAndOpenTaskModal()
  })

  document.querySelectorAll(".addTaskBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const status = e.target.closest(".addTaskBtn").dataset.status
      await validateAndOpenTaskModal(status)
    })
  })


  const searchInput = document.getElementById("search-input");
if (searchInput) {
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTaskSearch(e);
    }
  });
}


  document.getElementById("closeModal").addEventListener("click", closeTaskModal)
  document.getElementById("cancelBtn").addEventListener("click", closeTaskModal)
  document.getElementById("cancelDelete").addEventListener("click", closeDeleteModal)
  document.getElementById("continueBtn").addEventListener("click", closeSuccessModal)

  document.getElementById("cancelTeamRequired")?.addEventListener("click", closeTeamRequiredModal)
  document.getElementById("goToCreateTeam")?.addEventListener("click", () => {
    window.location.href = "../team/team.html?openModal=true&fromTask=true"
  })

  document.getElementById("cancelProjectRequired")?.addEventListener("click", closeProjectRequiredModal)
  document.getElementById("goToCreateProject")?.addEventListener("click", () => {
    window.location.href = "../project/project.html?openModal=true&fromTask=true"
  })

  taskForm.addEventListener("submit", handleTaskSubmit)

  document.getElementById("confirmDelete").addEventListener("click", handleTaskDelete)
  document.getElementById("editTask").addEventListener("click", handleEditTask)
  document.getElementById("copyTask").addEventListener("click", handleCopyTask)
  document.getElementById("deleteTask").addEventListener("click", showDeleteModal)

  document.addEventListener("click", (e) => {
    if (!contextMenu.contains(e.target) && !e.target.closest(".task-menu-btn")) {
      contextMenu.classList.add("hidden")
    }
  })
  ;[taskModal, deleteModal, successModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden")
    })
  })

  const teamModal = document.getElementById("teamRequiredModal")
  const projectModal = document.getElementById("projectRequiredModal")

  if (teamModal) {
    teamModal.addEventListener("click", (e) => {
      if (e.target === teamModal) closeTeamRequiredModal()
    })
  }

  if (projectModal) {
    projectModal.addEventListener("click", (e) => {
      if (e.target === projectModal) closeProjectRequiredModal()
    })
  }
}

// ================== TEAM MEMBERS ==================
async function loadTeamMembers() {
  const teamId = localStorage.getItem("selectedTeamId")
  if (!teamId) return console.error("No team ID found in localStorage")

  try {
    const res = await fetch(`${API_BASE}/teams/${teamId}/members`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error("Failed to fetch team members")

    const members = await res.json()
    teamMembers = members // ✅ store globally for later lookups
    populateAssigneeDropdown(members)
  } catch (err) {
    console.error("Error loading team members:", err)
  }
}

function populateAssigneeDropdown(members) {
  const assigneeSelect = document.getElementById("taskAssignee")
  assigneeSelect.innerHTML = `<option value="">Select Assignee</option>`

  members.forEach((member) => {
    const option = document.createElement("option")
    option.value = member.id // adjust if API returns a different key
    option.textContent = member.name || member.username || `Member ${member.id}`
    assigneeSelect.appendChild(option)
  })
}

// ================== TASK MODAL ==================
async function validateAndOpenTaskModal(defaultStatus = "To-Do") {
  const hasTeam = await checkTeamExists()
  if (!hasTeam) {
    showTeamRequiredModal()
    return
  }

  const hasProject = await checkProjectExists()
  if (!hasProject) {
    showProjectRequiredModal()
    return
  }

  openTaskModal(false, defaultStatus)
}

async function openTaskModal(editMode = false, defaultStatus = "To-Do") {
  isEditMode = editMode
  document.getElementById("modalTitle").textContent = editMode ? "Edit Task" : "New Task"
  document.getElementById("submitBtn").textContent = editMode ? "Edit Task" : "Create Task"

  if (!editMode) {
    taskForm.reset()
    document.getElementById("taskStatus").value = defaultStatus
    clearValidationErrors()
  }
  taskModal.classList.remove("hidden")
  taskModal.classList.add("flex")
}

function closeTaskModal() {
  taskModal.classList.add("hidden")
  taskModal.classList.remove("flex")
  clearValidationErrors()
  currentTaskId = null
}

function closeDeleteModal() {
  deleteModal.classList.add("hidden")
  deleteModal.classList.remove("flex")
}

function closeSuccessModal() {
  successModal.classList.add("hidden")
  successModal.classList.remove("flex")
}

function showDeleteModal() {
  contextMenu.classList.add("hidden")
  deleteModal.classList.remove("hidden")
  deleteModal.classList.add("flex")
}

function hideAllModals() {
  ;[taskModal, deleteModal, successModal, document.getElementById("errorModal")].forEach((modal) => {
    if (modal) {
      modal.classList.add("hidden")
      modal.classList.remove("flex")
    }
  })
}

function showSuccessModal(message) {
  hideAllModals()
  document.getElementById("successMessage").textContent = message
  successModal.classList.remove("hidden")
  successModal.classList.add("flex")
}

function showErrorModal(message) {
  hideAllModals()
  const errorModal = document.getElementById("errorModal")
  if (errorModal) {
    errorModal.querySelector(".modal-message").textContent = message
    errorModal.classList.remove("hidden")
    errorModal.classList.add("flex")
  } else {
    alert(message) // fallback
  }
}

// ================== VALIDATION FOR TEAM/PROJECT ==================
async function checkTeamExists() {
  const teamId = localStorage.getItem("selectedTeamId")

  if (!teamId) {
    return false
  }

  try {
    const teamRes = await fetch(`${API_BASE}/teams/${teamId}`, {
      headers: getAuthHeaders(),
    })

    return teamRes.ok
  } catch (err) {
    console.error("Error checking team:", err)
    return false
  }
}

async function checkProjectExists() {
  const projectId = localStorage.getItem("selectedProjectId")

  if (!projectId) {
    return false
  }

  try {
    const projectRes = await fetch(`${API_BASE}/projects/${projectId}`, {
      headers: getAuthHeaders(),
    })

    return projectRes.ok
  } catch (err) {
    console.error("Error checking project:", err)
    return false
  }
}

function showTeamRequiredModal() {
  const modal = document.getElementById("teamRequiredModal")
  modal.classList.remove("hidden")
  modal.classList.add("flex")
}

function closeTeamRequiredModal() {
  const modal = document.getElementById("teamRequiredModal")
  modal.classList.add("hidden")
  modal.classList.remove("flex")
}

function showProjectRequiredModal() {
  const modal = document.getElementById("projectRequiredModal")
  modal.classList.remove("hidden")
  modal.classList.add("flex")
}

function closeProjectRequiredModal() {
  const modal = document.getElementById("projectRequiredModal")
  modal.classList.add("hidden")
  modal.classList.remove("flex")
}

// ================== VALIDATION ==================
function clearValidationErrors() {
  const fields = [
    { input: "taskTitle", error: "titleError" },
    { input: "taskDueDate", error: "dueDateError" },
    { input: "taskAssignee", error: "assigneeError" },
    { input: "taskStatus", error: "statusError" },
  ]

  fields.forEach(({ input, error }) => {
    document.getElementById(error).classList.add("hidden")
    document.getElementById(input).classList.remove("border-red-500")
  })
}

function validateForm() {
  let isValid = true

  const title = document.getElementById("taskTitle")
  const dueDate = document.getElementById("taskDueDate")
  const assignee = document.getElementById("taskAssignee")
  const status = document.getElementById("taskStatus")

  clearValidationErrors()

  if (!title.value.trim()) {
    document.getElementById("titleError").classList.remove("hidden")
    title.classList.add("border-red-500")
    isValid = false
  }
  if (!dueDate.value) {
    document.getElementById("dueDateError").classList.remove("hidden")
    dueDate.classList.add("border-red-500")
    isValid = false
  }
  if (!assignee.value) {
    document.getElementById("assigneeError").classList.remove("hidden")
    assignee.classList.add("border-red-500")
    isValid = false
  }
  if (!status.value) {
    document.getElementById("statusError").classList.remove("hidden")
    status.classList.add("border-red-500")
    isValid = false
  }

  return isValid
}

// ================== API TASK CRUD ==================
async function loadProjectTasks() {
  const projectId = localStorage.getItem("selectedProjectId")
  if (!projectId) return console.error("No project ID found")

  try {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, { headers: getAuthHeaders() })
    if (!res.ok) throw new Error("Failed to fetch project")
    const project = await res.json()

    tasks = project.tasks || []
    document.querySelectorAll("[data-task-id]").forEach((el) => el.remove())
    tasks.forEach(renderTask)
    updateTaskCounts()
    enableDragAndDrop() // Ensure DnD is enabled after tasks are loaded
  } catch (err) {
    console.error(err)
  }
}

function handleTaskSubmit(e) {
  e.preventDefault()
  if (!validateForm()) return

  const title = document.getElementById("taskTitle").value.trim()

  // ✅ Normalize: lowercase + trim spaces
  const normalizedTitle = title.toLowerCase().trim()

  // ✅ Check duplicate title only within current project tasks

  const duplicate = tasks.some(
    (t) => t.title?.toLowerCase().trim() === normalizedTitle && (!isEditMode || t.id !== currentTaskId), // allow same task when editing itself
  )

  if (duplicate) {
    const titleInput = document.getElementById("taskTitle")
    const titleError = document.getElementById("titleError")

    titleError.textContent = "A task with this title already exists in this project"
    titleError.classList.remove("hidden")
    titleInput.classList.add("border-red-500")
    return // 🚫 stop submit
  }

  const submitBtn = document.getElementById("submitBtn")
  submitBtn.disabled = true
  const originalText = submitBtn.textContent
  submitBtn.textContent = "Loading..."

  const taskData = {
    title,
    description: document.getElementById("taskDescription").value.trim(),
    due_date: document.getElementById("taskDueDate").value,
    assignee_id: document.getElementById("taskAssignee").value,
    status: document.getElementById("taskStatus").value,
  }

  if (isEditMode) {
    updateTaskAPI(currentTaskId, taskData, submitBtn, originalText)
  } else {
    createTask(taskData, submitBtn, originalText)
  }
}

async function createTask(taskData, submitBtn = null, originalText = "") {
  const projectId = localStorage.getItem("selectedProjectId")
  let isSuccess = false

  try {
    const cleanData = {
      title: taskData.title,
      description: taskData.description,
      due_date: taskData.due_date || null,
      assignee_id: taskData.assignee_id || null,
      status: normalizeStatus(taskData.status),
    }

    const res = await fetch(`${API_BASE}/tasks/create?project_id=${projectId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(cleanData),
    })

    if (!res.ok) {
      let errorMsg = "Failed to create task"

      try {
        const errJson = await res.json()
        if (errJson?.detail && Array.isArray(errJson.detail)) {
          // Map backend fields → friendly messages
          const messages = errJson.detail.map((err) => {
            const field = err.loc?.[1]
            switch (field) {
              case "due_date":
                return "Please select a due date"
              case "status":
                return "Please select a status"
              case "assignee_id":
                return "Please select an assignee"
              case "title":
                return "Task title is required"
              default:
                return "Invalid input in form"
            }
          })
          errorMsg = messages.join("\n")
        }
      } catch {
        // fallback if not JSON
      }

      throw new Error(errorMsg)
    }

    await res.json()

    // ✅ reload all tasks fresh from backend
    await loadProjectTasks()

    isSuccess = true
  } catch (err) {
    console.error("Create error:", err)
    showErrorModal(err.message || "Failed to create task")
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false
      submitBtn.textContent = originalText
      closeTaskModal()
    }
    if (isSuccess) {
      showSuccessModal("Task created successfully")
    }
  }
}

async function updateTaskAPI(taskId, partialData, submitBtn = null, originalText = "") {
  let isSuccess = false

  try {
    const existingTask = tasks.find((t) => t.id === taskId)
    if (!existingTask) throw new Error("Task not found in memory")

    // ✅ Merge current task with new updates
    const cleanData = {
      title: partialData.title ?? existingTask.title ?? "",
      description: partialData.description ?? existingTask.description ?? "",
      due_date: partialData.due_date ?? existingTask.due_date ?? null,
      assignee_id: partialData.assignee_id ?? existingTask.assignee_id ?? null,
      status: normalizeStatus(partialData.status ?? existingTask.status ?? "To-Do"),
    }

    // ✅ Send PATCH to API
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(cleanData),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Failed to update task: ${res.status} ${errText}`)
    }

    const updatedTask = await res.json()

    // ✅ Update local cache
    const index = tasks.findIndex((t) => t.id === taskId)
    if (index !== -1) tasks[index] = { ...tasks[index], ...updatedTask }

    // ✅ Re-render in correct column
    const oldEl = document.querySelector(`[data-task-id="${taskId}"]`)
    if (oldEl) oldEl.remove()

    const newEl = createTaskElement(tasks[index])
    const newContainer = getTaskContainer(normalizeStatus(tasks[index].status))
    newContainer.appendChild(newEl)

    // ✅ Recalculate counts
    updateTaskCounts()
    enableDragAndDrop()

    isSuccess = true
    return updatedTask // Return the updated task for potential further use
  } catch (err) {
    console.error("Update error:", err)
    showErrorModal(err.message || "Error updating task")
    throw err // Re-throw to allow caller to handle it
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false
      submitBtn.textContent = originalText
      closeTaskModal()
    }

    if (isSuccess) {
      showSuccessModal("Task updated successfully")
    }
  }
}

async function deleteTaskAPI(taskId) {
  try {
    await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    tasks = tasks.filter((t) => t.id !== taskId)
    document.querySelector(`[data-task-id="${taskId}"]`)?.remove()
    updateTaskCounts()
    showSuccessModal("Task deleted successfully")
  } catch (err) {
    console.error(err)
    showErrorModal("Failed to delete task")
  }
}

function handleTaskDelete() {
  if (currentTaskId) {
    deleteTaskAPI(currentTaskId)
    closeDeleteModal()
    currentTaskId = null
  }
}

// ================== RENDER ==================
function renderTask(task) {
  const taskEl = createTaskElement(task)
  const container = getTaskContainer(task.status)
  const placeholder = container.querySelector(".empty-task-placeholder")
  if (placeholder) placeholder.remove()
  container.appendChild(taskEl)
}

function getTaskContainer(status) {
  switch (normalizeStatus(status)) {
    case "To-Do":
      return document.getElementById("todoTasks")
    case "In-Progress":
      return document.getElementById("progressTasks")
    case "Completed":
      return document.getElementById("doneTasks")
    default:
      return document.getElementById("todoTasks")
  }
}

function renderAllTasks() {
  ;["To-Do", "In-Progress", "Completed"].forEach((status) => {
    const container = getTaskContainer(status)
    container.innerHTML = ""

    const filtered = tasks.filter((t) => normalizeStatus(t.status) === status)
    if (filtered.length === 0) {
      const placeholder = document.createElement("div")
      placeholder.className = "empty-task-placeholder border-2 border-dashed border-gray-200 rounded-lg p-4 text-center"
      placeholder.textContent = "No tasks"
      container.appendChild(placeholder)
    } else {
      filtered.forEach(renderTask)
    }
  })
}

// ================== PROGRESS ==================
function updateProgress(taskId, change) {
  const task = tasks.find((t) => t.id === taskId)
  if (!task) return

  task.progress = Math.min(task.maxProgress, Math.max(0, task.progress + change))

  if (task.progress === task.maxProgress) {
    task.status = "Completed" // ✅ API value
  } else if (task.progress > 0 && normalizeStatus(task.status) === "To-Do") {
    task.status = "In-Progress" // ✅ API value
  } else if (task.progress === 0) {
    task.status = "To-Do"
  }

  const oldEl = document.querySelector(`[data-task-id="${taskId}"]`)
  if (oldEl) oldEl.remove()
  renderTask(task)
  updateTaskCounts()
}

// ================== CONTEXT MENU ==================


// function showContextMenu(e, taskId) {
//   e.preventDefault()
//   e.stopPropagation()

//   currentTaskId = taskId

//   const menuWidth = 200
//   const menuHeight = 150

//   let x = e.pageX
//   let y = e.pageY

//   if (x + menuWidth > window.innerWidth + window.scrollX) {
//     x = window.innerWidth + window.scrollX - menuWidth - 10
//   }

//   if (y + menuHeight > window.innerHeight + window.scrollY) {
//     y = window.innerHeight + window.scrollY - menuHeight - 10
//   }

//   contextMenu.style.left = x + "px"
//   contextMenu.style.top = y + "px"
//   contextMenu.classList.remove("hidden")
// }

function showContextMenu(e, taskId) {
  e.preventDefault();
  e.stopPropagation();

  currentTaskId = taskId;

  const menuWidth = 200;
  const menuHeight = 150;

  // ✅ Ensure context menu is attached directly to body
  document.body.appendChild(contextMenu);
  contextMenu.style.position = "absolute";
  contextMenu.style.zIndex = "9999"; // always on top

  // ✅ Get bounding rect relative to viewport
  const rect = e.target.getBoundingClientRect();

  let x = rect.left + window.scrollX;
  let y = rect.bottom + window.scrollY;

  // ✅ Adjust if near right or bottom edge
  if (x + menuWidth > window.innerWidth + window.scrollX) {
    x = window.innerWidth + window.scrollX - menuWidth - 10;
  }

  if (y + menuHeight > window.innerHeight + window.scrollY) {
    y = window.innerHeight + window.scrollY - menuHeight - 10;
  }

  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;

  contextMenu.classList.remove("hidden");
}


function handleEditTask() {
  const task = tasks.find((t) => t.id === currentTaskId)
  if (task) {
    document.getElementById("taskTitle").value = task.title
    document.getElementById("taskDescription").value = task.description
    document.getElementById("taskDueDate").value = task.due_date
    document.getElementById("taskAssignee").value = task.assignee_id || ""
    document.getElementById("taskStatus").value = task.status
    openTaskModal(true)
  }
  contextMenu.classList.add("hidden")
}

function handleCopyTask() {
  const task = tasks.find((t) => t.id === currentTaskId)
  if (task) {
    const baseTitle = task.title.trim()
    let newTitle = `${baseTitle} (Copy)`
    let counter = 2

    while (tasks.some((t) => t.title?.toLowerCase().trim() === newTitle.toLowerCase().trim())) {
      newTitle = `${baseTitle} (Copy ${counter})`
      counter++
    }

    const clone = {
      ...task,
      id: Date.now(),
      title: newTitle,
    }

    createTask(clone)
    showSuccessModal("Task copied successfully")
  }
  contextMenu.classList.add("hidden")
}

// ================== COUNTS ==================
function updateTaskCounts() {
  document.getElementById("todoCount").textContent = tasks.filter((t) => normalizeStatus(t.status) === "To-Do").length

  document.getElementById("progressCount").textContent = tasks.filter(
    (t) => normalizeStatus(t.status) === "In-Progress",
  ).length

  document.getElementById("doneCount").textContent = tasks.filter(
    (t) => normalizeStatus(t.status) === "Completed",
  ).length
}

// ================== RENDER ==================
function createTaskElement(task) {
  const status = normalizeStatus(task.status)

  let barColor = "bg-gray-400",
    textColor = "text-gray-500"
  if (status === "In-Progress") {
    barColor = "bg-yellow-400"
    textColor = "text-yellow-600"
  } else if (status === "Completed") {
    barColor = "bg-green-500"
    textColor = "text-green-600"
  }

  let assigneeName = "Unassigned"
  if (Array.isArray(teamMembers) && teamMembers.length > 0 && task.assignee_id) {
    const member = teamMembers.find((m) => Number(m.id) === Number(task.assignee_id))
    assigneeName = member?.name || member?.username || "Unassigned"
  }

  const taskDiv = document.createElement("div")
  taskDiv.className = "bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-grab"
  taskDiv.setAttribute("data-task-id", task.id)
  taskDiv.draggable = true

  taskDiv.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", task.id)
  })

  const progressPercent = (task.progress / task.maxProgress) * 100

  const assigneeList = teamMembers
    .map((member) => {
      const isSelected = member.id === task.assignee_id
      return `
    <label class="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">
      <input
        type="radio"
        name="assignee-${task.id}"
        value="${member.id}"
        class="assignee-radio text-blue-600 focus:ring-blue-500"
        ${isSelected ? "checked" : ""}>
      <span>${member.name || member.username}</span>
    </label>
  `
    })
    .join("")

  taskDiv.innerHTML = `
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <h4 class="font-medium text-gray-900 mb-1">${task.title}</h4>
        <p class="text-sm text-gray-500">${task.description || "No description"}</p>
      </div>
      <button class="task-menu-btn text-gray-500 hover:text-gray-600 ml-2 p-1" data-task-id="${task.id}">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2
                   1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010
                   2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
        </svg>
      </button>
    </div>

    <div class="mb-4">
      <div class="flex items-center text-xs font-medium mb-2 ${textColor}">
        ${status}
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div class="${barColor} h-2 rounded-full transition-all duration-300"
             style="width: ${progressPercent}%"></div>
      </div>
    </div>

    <div class="flex items-center justify-between relative">
      <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
        ${task.due_date ? new Date(task.due_date).toLocaleDateString("en-GB") : "No date"}
      </span>

      <div class="relative">
        <button class="assignee-btn flex items-center gap-1 text-xs text-gray-700 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50">
          <span>${assigneeName}</span>
          <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div class="assignee-dropdown absolute right-0 mt-1 bg-white border border-gray-200 rounded shadow-md hidden z-50">
          ${assigneeList}
        </div>
      </div>
    </div>
  `

  const dropdown = taskDiv.querySelector(".assignee-dropdown")
  const assigneeBtn = taskDiv.querySelector(".assignee-btn")

  assigneeBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    dropdown.classList.toggle("show")
    dropdown.classList.toggle("hidden")
  })

  dropdown.querySelectorAll(".assignee-radio").forEach((radio) => {
    radio.addEventListener("change", async (e) => {
      const newId = e.target.value
      const selectedMember = teamMembers.find((m) => m.id == newId)
      const newName = selectedMember?.name || selectedMember?.username || "Unassigned"

      dropdown.classList.add("hidden")
      task.assignee_id = Number.parseInt(newId)
      task.assignee_name = newName
      assigneeBtn.querySelector("span").textContent = newName

      try {
        await updateTaskAPI(task.id, { assignee_id: newId })
        const taskIndex = tasks.findIndex((t) => t.id === task.id)
        if (taskIndex !== -1) {
          tasks[taskIndex].assignee_id = Number.parseInt(newId)
        }
      } catch (err) {
        console.error("Assignee update failed:", err)
        showErrorModal("Failed to assign team member. Please try again.")
        assigneeBtn.querySelector("span").textContent = task.assignee_name || "Unassigned"
      }
    })
  })

  const menuBtn = taskDiv.querySelector(".task-menu-btn")
  menuBtn.addEventListener("click", (e) => {
    showContextMenu(e, task.id)
  })

  document.addEventListener("click", (e) => {
    if (!assigneeBtn.contains(e.target) && !dropdown.contains(e.target)) {
      if (dropdown.classList.contains("show")) {
        dropdown.classList.remove("show")
        dropdown.classList.add("hidden")
      }
    }
  })

  return taskDiv
}

// ================== DRAG & DROP ==================

function normalizeStatus(status) {
  switch (status) {
    case "To-Do":
      return "To-Do"
    case "In Progress":
    case "In-Progress":
      return "In-Progress" // ✅ match API
    case "Done":
    case "Completed":
      return "Completed" // ✅ match API
    default:
      return "To-Do"
  }
}

function enableDragAndDrop() {
  const dropZones = {
    "To-Do": document.getElementById("todoTasks"),
    "In-Progress": document.getElementById("progressTasks"),
    Completed: document.getElementById("doneTasks"),
  }

  Object.entries(dropZones).forEach(([status, zone]) => {
    if (!zone) return

    zone.addEventListener("dragover", (e) => {
      e.preventDefault()
      zone.classList.add("ring-2", "ring-blue-400", "ring-offset-2")
    })

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("ring-2", "ring-blue-400", "ring-offset-2")
    })

    zone.addEventListener("drop", (e) => {
      e.preventDefault()
      zone.classList.remove("ring-2", "ring-blue-400", "ring-offset-2")

      const taskId = e.dataTransfer.getData("text/plain")
      const task = tasks.find((t) => t.id == taskId)
      if (!task) return

      task.status = normalizeStatus(status)

      const updatedTaskData = {
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        assignee_id: task.assignee_id || null,
        status: task.status,
      }

      const taskEl = document.querySelector(`[data-task-id="${taskId}"]`)
      if (taskEl) {
        zone.appendChild(taskEl)
        taskEl.classList.add("opacity-50", "scale-95", "transition-all", "duration-300")

        setTimeout(() => {
          taskEl.classList.remove("opacity-50", "scale-95")
        }, 300)
      }

      updateTaskAPI(task.id, updatedTaskData)

      updateTaskCounts()
    })
  })
}





// ================== TASK SEARCH ==================
function handleTaskSearch(event) {
  const query = event.target.value.toLowerCase().trim();
  const allTaskElements = document.querySelectorAll("[data-task-id]");
  let found = false;

  if (!query) {
    // Reset view
    allTaskElements.forEach(task => {
      task.classList.remove("hidden", "ring-2", "ring-blue-400");
    });
    return;
  }

  allTaskElements.forEach(task => {
    const title = task.querySelector("h4")?.textContent.toLowerCase() || "";
    if (title.includes(query)) {
      task.classList.remove("hidden");
      task.classList.add("ring-2", "ring-blue-400", "ring-offset-1");
      found = true;
    } else {
      task.classList.add("hidden");
      task.classList.remove("ring-2", "ring-blue-400", "ring-offset-1");
    }
  });

  // Notify user if nothing found
  if (!found) {
    showSearchNotification("No task found with that title.");
  }
}

function showSearchNotification(message) {
  // Remove any existing message
  document.querySelectorAll(".search-notice").forEach(el => el.remove());

  const notice = document.createElement("div");
  notice.textContent = message;
  notice.className = "search-notice fixed bottom-6 right-6 bg-red-500 text-white text-sm px-4 py-2 rounded shadow-lg animate-fadeIn z-50";
  document.body.appendChild(notice);

  setTimeout(() => {
    notice.classList.add("opacity-0");
    setTimeout(() => notice.remove(), 300);
  }, 2000);
}





// ================== RESPONSIVE ENHANCEMENTS ==================

document.addEventListener("DOMContentLoaded", () => {
  const dueDateInput = document.getElementById("taskDueDate")
  const today = new Date().toISOString().split("T")[0]
  dueDateInput.setAttribute("min", today)
})

document.addEventListener("DOMContentLoaded", () => {
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
    })
  }

  if (confirmSignOut) {
    confirmSignOut.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("selectedTeamId");
      localStorage.removeItem("selectedProjectId");
      localStorage.removeItem("user");

      window.location.href = "../auth/login.html"
    })
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden")
    }
  })

  const menuBtns = document.querySelectorAll(".menuBtn")
  const mobileSidebar = document.getElementById("mobileSidebar")
  const closeBtn = document.getElementById("closeBtn")

  if (menuBtns && mobileSidebar) {
    menuBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        mobileSidebar.classList.remove("hidden")
        document.body.style.overflow = "hidden"
      })
    })
  }

  if (closeBtn && mobileSidebar) {
    closeBtn.addEventListener("click", () => {
      mobileSidebar.classList.add("hidden")
      document.body.style.overflow = "auto"
    })
  }

  mobileSidebar.addEventListener("click", (e) => {
    if (e.target === mobileSidebar) {
      mobileSidebar.classList.add("hidden")
      document.body.style.overflow = "auto"
    }
  })

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1280) {
      mobileSidebar.classList.add("hidden")
      document.body.style.overflow = "auto"
    }
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!modal.classList.contains("hidden")) {
        modal.classList.add("hidden")
      }
      if (!mobileSidebar.classList.contains("hidden")) {
        mobileSidebar.classList.add("hidden")
        document.body.style.overflow = "auto"
      }
    }
  })
})

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

// ================== VISIBILITY CHANGE ==================

document.addEventListener("visibilitychange", async () => {
  if (!document.hidden) {
    // Page became visible again, re-validate team/project status
    console.log("Page became visible, re-validating...")

    const hasTeam = await checkTeamExists()
    const hasProject = await checkProjectExists()

    console.log("Validation results - Team:", hasTeam, "Project:", hasProject)
  }
})

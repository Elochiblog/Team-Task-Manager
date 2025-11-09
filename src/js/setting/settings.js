document.addEventListener("DOMContentLoaded", () => {
  // ================== Tabs ==================
  const tabs = {
    personal: document.getElementById("personal-info"),
    password: document.getElementById("password-form"),
    notification: document.getElementById("notifications"),
  }

  const links = [
    document.getElementById("tab-personal"),
    document.getElementById("tab-password"),
    document.getElementById("tab-notification"),
    document.getElementById("m-tab-personal"),
    document.getElementById("m-tab-password"),
    document.getElementById("m-tab-notification"),
  ]

  function showTab(tab) {
    Object.values(tabs).forEach((section) => section?.classList.add("hidden"))
    tabs[tab]?.classList.remove("hidden")

    links.forEach((link) => {
      if (!link) return
      if (link.id.includes(tab)) {
        link.classList.add("text-blue-600", "font-medium")
        link.classList.remove("text-gray-700")
      } else {
        link.classList.remove("text-blue-600", "font-medium")
        link.classList.add("text-gray-700")
      }
    })
  }

  links.forEach((link) => {
    link?.addEventListener("click", (e) => {
      e.preventDefault()
      if (link.id.includes("personal")) showTab("personal")
      if (link.id.includes("password")) showTab("password")
      if (link.id.includes("notification")) showTab("notification")
    })
  })

  showTab("personal") // Default tab

  // ================== Mobile Sidebar ==================
  const menuBtn = document.getElementById("menuBtn")
  const mobileSidebar = document.getElementById("mobileSidebar")
  const closeBtn = document.getElementById("closeBtn")

  menuBtn?.addEventListener("click", () => mobileSidebar?.classList.remove("hidden"))
  closeBtn?.addEventListener("click", () => mobileSidebar?.classList.add("hidden"))

  // ================== Edit Personal Info ==================
  const editBtn = document.getElementById("editBtn")
  const saveBtn = document.getElementById("saveBtn")
  const cancelBtn = document.getElementById("cancelBtn")

  const inputs = document.querySelectorAll("#personal-info input, #personal-info select")

  inputs.forEach((input) => (input.disabled = true))

  editBtn?.addEventListener("click", () => {
    inputs.forEach((input) => (input.disabled = false))
    editBtn.classList.add("hidden")
    saveBtn.classList.remove("hidden")
    cancelBtn.classList.remove("hidden")
  })

  saveBtn?.addEventListener("click", () => {
    const spinner = document.getElementById("saveSpinner")
    const btnText = document.getElementById("saveButtonText")

    spinner.classList.remove("hidden")
    btnText.textContent = "Saving..."

    // Disable inputs again
    inputs.forEach((input) => (input.disabled = true))
    editBtn.classList.remove("hidden")
    saveBtn.classList.add("hidden")
    cancelBtn.classList.add("hidden")

    // === Update Profile Card ===
    const firstName = document.getElementById("firstName")?.value.trim() || ""
    const lastName = document.getElementById("lastName")?.value.trim() || ""
    const email = document.getElementById("email")?.value.trim() || ""

    // Update Name in the header and profile info section ===
    const nameEl = document.getElementById("name")
    if (nameEl) {
      nameEl.textContent = `${firstName} ${lastName}`
    }

    const usernameEl = document.getElementById("username")
    if (usernameEl) {
      usernameEl.textContent = `${firstName} ${lastName}`
    }

    const usernamesEl = document.getElementById("usernames")
    if (usernamesEl) {
      usernamesEl.textContent = `${firstName} ${lastName}`
    }

    // Update email text (the <p> under the username in card)
    const emailEl = document.getElementById("email")
    if (emailEl) {
      emailEl.textContent = email
    }

    // Simulate save delay then show notification
    setTimeout(() => {
      spinner.classList.add("hidden")
      btnText.textContent = "Save Changes"
      window.showNotification("success", "Success!", "Profile info updated successfully!")
    }, 500)
  })

  cancelBtn?.addEventListener("click", () => {
    inputs.forEach((input) => (input.disabled = true))
    editBtn.classList.remove("hidden")
    saveBtn.classList.add("hidden")
    cancelBtn.classList.add("hidden")
  })

  // ================== Avatar Modal Upload ==================
  const avatarEditBtn = document.getElementById("avatarEditBtn")
  const avatarModal = document.getElementById("avatarModal")
  const closeAvatarModal = document.getElementById("closeAvatarModal")
  const avatarInput = document.getElementById("avatarInput")
  const avatarPreview = document.getElementById("avatarPreview")
  const avatarPreviewModal = document.getElementById("avatarPreviewModal")
  const uploadPlaceholder = document.getElementById("uploadPlaceholder")
  const updateAvatarBtn = document.getElementById("updateAvatarBtn")

  let selectedFile = null

  avatarEditBtn?.addEventListener("click", () => avatarModal.classList.remove("hidden"))

  closeAvatarModal?.addEventListener("click", () => {
    avatarModal.classList.add("hidden")
    avatarPreviewModal.classList.add("hidden")
    uploadPlaceholder.classList.remove("hidden")
    avatarInput.value = ""
    selectedFile = null
  })

  avatarInput?.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file) {
      selectedFile = file
      const reader = new FileReader()
      reader.onload = (ev) => {
        avatarPreviewModal.src = ev.target.result
        avatarPreviewModal.classList.remove("hidden")
        uploadPlaceholder.classList.add("hidden")
      }
      reader.readAsDataURL(file)
    }
  })

  updateAvatarBtn?.addEventListener("click", () => {
    if (selectedFile) {
      const spinner = document.getElementById("updateAvatarSpinner")
      const btnText = document.getElementById("updateAvatarButtonText")

      spinner.classList.remove("hidden")
      btnText.textContent = "Updating..."

      const reader = new FileReader()
      reader.onload = (ev) => {
        // Simulate upload delay
        setTimeout(() => {
          avatarPreview.src = ev.target.result
          avatarModal.classList.add("hidden")
          avatarPreviewModal.classList.add("hidden")
          uploadPlaceholder.classList.remove("hidden")
          avatarInput.value = ""
          selectedFile = null

          spinner.classList.add("hidden")
          btnText.textContent = "Update Image"

          window.showNotification("success", "Success!", "Profile image updated successfully!")
        }, 500)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      window.showNotification("error", "Error", "Please select an image first.")
    }
  })

  // ================== Password Form ==================
  const passwordForm = tabs.password
  if (passwordForm) {
    passwordForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const newPassword = document.getElementById("new-password")?.value.trim()
      const confirmPassword = document.getElementById("confirm-password")?.value.trim()

      document.querySelector("#password-error")?.remove()

      if (newPassword !== confirmPassword) {
        const errorMsg = document.createElement("p")
        errorMsg.id = "password-error"
        errorMsg.className = "text-red-600 text-sm mt-2"
        errorMsg.textContent = "❌ New password and confirm password do not match!"
        document.getElementById("confirm-password")?.insertAdjacentElement("afterend", errorMsg)
        return
      }

      const spinner = document.getElementById("passwordSpinner")
      const btnText = document.getElementById("passwordButtonText")

      spinner.classList.remove("hidden")
      btnText.textContent = "Saving..."

      // Simulate password change delay
      setTimeout(() => {
        spinner.classList.add("hidden")
        btnText.textContent = "Save Changes"

        window.showNotification("success", "Success!", "Password changed successfully!")

        // Clear fields after success
        document.getElementById("current-password").value = ""
        document.getElementById("new-password").value = ""
        document.getElementById("confirm-password").value = ""
      }, 500)
    })

    document.getElementById("confirm-password")?.addEventListener("input", () => {
      document.querySelector("#password-error")?.remove()
    })
  }

  // ================== Notification Modal ==================
  function showNotification(type, title, message) {
    const modal = document.getElementById("notificationModal")
    const iconContainer = document.getElementById("notificationIcon")
    const titleElement = document.getElementById("notificationTitle")
    const messageElement = document.getElementById("notificationMessage")

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
  }

  const closeNotificationBtn = document.getElementById("closeNotificationModal")
  if (closeNotificationBtn) {
    closeNotificationBtn.addEventListener("click", () => {
      document.getElementById("notificationModal").classList.add("hidden")
    })
  }

  // Make showNotification available globally for API calls
  window.showNotification = showNotification
})

document.addEventListener("DOMContentLoaded", () => {
  // ================== Fetch Logged-in User ==================
  const tokenData = JSON.parse(localStorage.getItem("token"))
  const userData = JSON.parse(localStorage.getItem("user"))

  async function fetchUserProfile() {
    if (!tokenData || !tokenData.access_token) {
      console.error("No token found, redirecting to login...")
      window.location.href = "../../html/auth/login.html"
      return
    }

    try {
      const res = await fetch("https://be.taskmanager.kode.camp/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
        },
      })

      const data = await res.json()

      if (res.ok && data) {
        // Update form fields with fetched user data
        document.getElementById("firstName").value = data.name?.split(" ")[0] || ""
        document.getElementById("lastName").value = data.name?.split(" ")[1] || ""
        document.getElementById("email").value = data.email || ""
        document.getElementById("username").textContent = data.name || "User"
        document.getElementById("usernames").textContent = data.name || "User"
        document.getElementById("name").textContent = data.name || "User"
        document.getElementById("profile-email").textContent = data.email || ""

        // Save fresh user data to localStorage
        localStorage.setItem("user", JSON.stringify(data))
      } else {
        console.error("Failed to fetch profile:", data.message)
      }
    } catch (err) {
      console.error("Error fetching user profile:", err)
    }
  }

  fetchUserProfile()

  // ================== Update Profile ==================
  const saveBtn = document.getElementById("saveBtn")
  saveBtn?.addEventListener("click", async () => {
    const updatedUser = {
      id: userData?.id || 0,
      name: `${document.getElementById("firstName").value} ${document.getElementById("lastName").value}`,
      email: document.getElementById("email").value,
      role: "User",
    }

    try {
      const res = await fetch("https://be.taskmanager.kode.camp/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
        },
        body: JSON.stringify(updatedUser),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data))
        fetchUserProfile()
        window.showNotification("success", "Success!", "Profile updated successfully!")
      } else {
        window.showNotification("error", "Error", data.message || "Update failed!")
      }
    } catch (err) {
      console.error("Update error:", err)
      window.showNotification("error", "Error", "An error occurred while updating profile.")
    }
  })
})

document.addEventListener("DOMContentLoaded", () => {
  // ===== Sign Out Modal =====
  const signOutBtns = document.querySelectorAll(".signOutBtn")
  const modal = document.getElementById("signOutModal")
  const cancelSignout = document.getElementById("cancelSignout")
  const confirmSignOut = document.getElementById("confirmSignOut")

  signOutBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault()
      modal.classList.remove("hidden")
    })
  })

  if (cancelSignout) {
    cancelSignout.addEventListener("click", () => {
      modal.classList.add("hidden")
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
            window.location.href = "../auth/login.html";
          });
        }

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden")
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

  // Close sidebar when clicking outside
  mobileSidebar.addEventListener("click", (e) => {
    if (e.target === mobileSidebar) {
      mobileSidebar.classList.add("hidden")
      document.body.style.overflow = "auto"
    }
  })

  // ===== Search Toggle =====
  const searchImg = document.getElementById("search-img")
  const searchBar = document.getElementById("search-bar")

  if (searchImg && searchBar) {
    searchImg.addEventListener("click", () => {
      searchBar.classList.toggle("hidden")
      if (!searchBar.classList.contains("hidden")) {
        searchBar.querySelector("input").focus()
      }
    })
  }

  // ===== Responsive Enhancements =====
  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1280) {
      mobileSidebar.classList.add("hidden")
      document.body.style.overflow = "auto"
    }
  })

  // Add keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!document.getElementById("signOutModal").classList.contains("hidden")) {
        document.getElementById("signOutModal").classList.add("hidden")
      }
      if (!document.getElementById("mobileSidebar").classList.contains("hidden")) {
        document.getElementById("mobileSidebar").classList.add("hidden")
        document.body.style.overflow = "auto"
      }
      if (!document.getElementById("notificationModal").classList.contains("hidden")) {
        document.getElementById("notificationModal").classList.add("hidden")
      }
    }
  })
})



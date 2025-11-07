// Data management
const appState = {
    currentUser: null,
    posts: [],
    users: [],
    messages: [],
    notifications: [],
    currentPage: "login",
    selectedConversation: null,
  }
  
  // Initialize app
  document.addEventListener("DOMContentLoaded", () => {
    loadDataFromStorage()
    setupEventListeners()
    checkAuthStatus()
  })
  
  // ===== AUTH FUNCTIONS =====
  function checkAuthStatus() {
    const user = localStorage.getItem("currentUser")
    if (user) {
      appState.currentUser = JSON.parse(user)
      showApp()
      loadHomePage()
    } else {
      showAuthPages()
    }
  }
  
  function setupEventListeners() {
    // Auth forms
    document.getElementById("loginForm").addEventListener("submit", handleLogin)
    document.getElementById("signupForm").addEventListener("submit", handleSignup)
  
    // Navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault()
        const page = item.dataset.page
        navigateToPage(page)
      })
    })
  
    // Create post
    document.getElementById("createPostForm").addEventListener("submit", handleCreatePost)
  
    // Logout
    document.getElementById("logoutBtn").addEventListener("click", handleLogout)
  
    // Mobile nav toggle
    document.getElementById("menuToggle").addEventListener("click", toggleMobileMenu)
  
    // Modal
    document.getElementById("modal").addEventListener("click", closeModal)
    document.querySelector(".modal-close").addEventListener("click", closeModal)
  }
  
  function handleLogin(e) {
    e.preventDefault()
    const email = document.getElementById("loginEmail").value
    const password = document.getElementById("loginPassword").value
  
    const user = appState.users.find((u) => u.email === email && u.password === password)
  
    if (user) {
      appState.currentUser = user
      localStorage.setItem("currentUser", JSON.stringify(user))
      document.getElementById("loginForm").reset()
      showApp()
      loadHomePage()
    } else {
      alert("Invalid email or password")
    }
  }
  
  function handleSignup(e) {
    e.preventDefault()
    const name = document.getElementById("signupName").value
    const email = document.getElementById("signupEmail").value
    const username = document.getElementById("signupUsername").value
    const password = document.getElementById("signupPassword").value
    const confirm = document.getElementById("signupConfirm").value
  
    if (password !== confirm) {
      alert("Passwords do not match")
      return
    }
  
    if (appState.users.find((u) => u.email === email)) {
      alert("Email already exists")
      return
    }
  
    const newUser = {
      id: Date.now(),
      name,
      email,
      username,
      password,
      bio: "Welcome to my profile!",
      followers: 0,
      following: 0,
      posts: [],
    }
  
    appState.users.push(newUser)
    appState.currentUser = newUser
    saveDataToStorage()
    localStorage.setItem("currentUser", JSON.stringify(newUser))
    document.getElementById("signupForm").reset()
    showApp()
    loadHomePage()
  }
  
  function handleLogout() {
    appState.currentUser = null
    localStorage.removeItem("currentUser")
    showAuthPages()
    switchPage("loginPage")
  }
  
  // ===== PAGE NAVIGATION =====
  function navigateToPage(page) {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"))
    document.querySelectorAll(".nav-item").forEach((i) => i.classList.remove("active"))
  
    const pageElement = document.getElementById(page + "Page")
    if (pageElement) {
      pageElement.classList.add("active")
    }
  
    document.querySelector(`[data-page="${page}"]`).classList.add("active")
  
    // Load page content
    switch (page) {
      case "home":
        loadHomePage()
        break
      case "explore":
        loadExplorePage()
        break
      case "search":
        loadSearchPage()
        break
      case "messages":
        loadMessagesPage()
        break
      case "notifications":
        loadNotificationsPage()
        break
      case "profile":
        loadProfilePage()
        break
      case "create":
        loadCreatePage()
        break
    }
  }
  
  function switchPage(page) {
    document.querySelectorAll(".auth-page").forEach((p) => p.classList.add("hidden"))
    document.getElementById(page).classList.remove("hidden")
  }
  
  function showAuthPages() {
    document.getElementById("mainApp").classList.add("hidden")
    document.getElementById("loginPage").classList.remove("hidden")
  }
  
  function showApp() {
    document.getElementById("loginPage").classList.add("hidden")
    document.getElementById("signupPage").classList.add("hidden")
    document.getElementById("mainApp").classList.remove("hidden")
  }
  
  // ===== HOME PAGE =====
  function loadHomePage() {
    loadStories()
    loadFeed()
  }
  
  function loadStories() {
    const storiesScroll = document.getElementById("storiesScroll")
    storiesScroll.innerHTML = ""
  
    appState.users.forEach((user) => {
      if (user.id !== appState.currentUser.id) {
        const story = document.createElement("div")
        story.className = "story"
        story.innerHTML = `
                  <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #0a66c2, #f5a623); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                      ${user.username[0].toUpperCase()}
                  </div>
              `
        storiesScroll.appendChild(story)
      }
    })
  }
  
  function loadFeed() {
    const feedPosts = document.getElementById("feedPosts")
    feedPosts.innerHTML = ""
  
    const allPosts = appState.posts.sort((a, b) => b.id - a.id)
  
    allPosts.forEach((post) => {
      const author = appState.users.find((u) => u.id === post.userId)
      if (!author) return
  
      const postElement = document.createElement("div")
      postElement.className = "post"
  
      const isLiked = post.likes.includes(appState.currentUser.id)
  
      postElement.innerHTML = `
              <div class="post-header">
                  <a href="#" class="post-author" onclick="viewUserProfile(${author.id})">
                      <div class="avatar"></div>
                      <div class="author-info">
                          <h4>${author.name}</h4>
                          <p>${author.username}</p>
                      </div>
                  </a>
                  <button class="post-options">⋯</button>
              </div>
              <img src="${post.image}" alt="Post" class="post-image">
              <div class="post-actions">
                  <button class="action-btn ${isLiked ? "liked" : ""}" onclick="toggleLike(${post.id})">
                      ${isLiked ? "❤️" : "🤍"}
                  </button>
                  <button class="action-btn" onclick="openPostComments(${post.id})">💬</button>
                  <button class="action-btn">📤</button>
              </div>
              <div class="post-stats">
                  <span>${post.likes.length} likes</span>
              </div>
              <div class="post-caption">
                  <strong>${author.username}</strong> ${post.caption}
              </div>
              <div class="post-comments" id="comments-${post.id}"></div>
              <div class="post-comment-input">
                  <input type="text" placeholder="Add a comment..." class="comment-input" data-post-id="${post.id}">
                  <button onclick="addComment(${post.id})">Post</button>
              </div>
          `
  
      feedPosts.appendChild(postElement)
  
      // Load comments
      const commentsDiv = document.getElementById(`comments-${post.id}`)
      post.comments.forEach((comment) => {
        const commentUser = appState.users.find((u) => u.id === comment.userId)
        if (commentUser) {
          const commentEl = document.createElement("div")
          commentEl.className = "comment"
          commentEl.innerHTML = `<strong>${commentUser.username}</strong> ${comment.text}`
          commentsDiv.appendChild(commentEl)
        }
      })
    })
  }
  
  function toggleLike(postId) {
    const post = appState.posts.find((p) => p.id === postId)
    if (!post) return
  
    const index = post.likes.indexOf(appState.currentUser.id)
    if (index === -1) {
      post.likes.push(appState.currentUser.id)
      addNotification(post.userId, `${appState.currentUser.name} liked your post`)
    } else {
      post.likes.splice(index, 1)
    }
  
    saveDataToStorage()
    loadFeed()
  }
  
  function addComment(postId) {
    const input = document.querySelector(`[data-post-id="${postId}"]`)
    const text = input.value.trim()
  
    if (!text) return
  
    const post = appState.posts.find((p) => p.id === postId)
    post.comments.push({
      userId: appState.currentUser.id,
      text,
      id: Date.now(),
    })
  
    addNotification(post.userId, `${appState.currentUser.name} commented on your post`)
    input.value = ""
    saveDataToStorage()
    loadFeed()
  }
  
  function openPostComments(postId) {
    const post = appState.posts.find((p) => p.id === postId)
    const author = appState.users.find((u) => u.id === post.userId)
  
    const modal = document.getElementById("modal")
    const modalBody = document.getElementById("modalBody")
  
    modalBody.innerHTML = `
          <h3>${author.name}'s Post</h3>
          <img src="${post.image}" alt="Post" style="width: 100%; border-radius: 8px; margin: 16px 0;">
          <p><strong>${author.username}</strong> ${post.caption}</p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border);">
              <h4>Comments</h4>
              <div style="max-height: 300px; overflow-y: auto;">
                  ${post.comments
                    .map((comment) => {
                      const commUser = appState.users.find((u) => u.id === comment.userId)
                      return `<div style="margin: 12px 0;"><strong>${commUser?.username}</strong> ${comment.text}</div>`
                    })
                    .join("")}
              </div>
          </div>
      `
  
    modal.classList.remove("hidden")
  }
  
  // ===== EXPLORE PAGE =====
  function loadExplorePage() {
    const exploreGrid = document.getElementById("exploreGrid")
    exploreGrid.innerHTML = ""
  
    appState.posts.forEach((post) => {
      const item = document.createElement("div")
      item.className = "explore-item"
      item.innerHTML = `<img src="${post.image}" alt="Post">`
      item.addEventListener("click", () => openPostComments(post.id))
      exploreGrid.appendChild(item)
    })
  }
  
  // ===== SEARCH PAGE =====
  function loadSearchPage() {
    const searchInput = document.getElementById("searchInput")
    searchInput.addEventListener("input", performSearch)
  }
  
  function performSearch() {
    const query = document.getElementById("searchInput").value.toLowerCase()
    const resultsDiv = document.getElementById("searchResults")
  
    if (!query) {
      resultsDiv.classList.add("hidden")
      return
    }
  
    resultsDiv.classList.remove("hidden")
    resultsDiv.innerHTML = ""
  
    // Search users
    const users = appState.users.filter(
      (u) => u.username.toLowerCase().includes(query) || u.name.toLowerCase().includes(query),
    )
    users.forEach((user) => {
      const result = document.createElement("div")
      result.className = "search-result"
      result.innerHTML = `
              <div class="avatar"></div>
              <div>
                  <div class="search-result-title">${user.name}</div>
                  <div class="search-result-subtitle">@${user.username}</div>
              </div>
          `
      result.addEventListener("click", () => viewUserProfile(user.id))
      resultsDiv.appendChild(result)
    })
  }
  
  // ===== MESSAGES PAGE =====
  function loadMessagesPage() {
    const conversationsList = document.getElementById("conversationsList")
    conversationsList.innerHTML = ""
  
    const uniqueUsers = [...new Set(appState.messages.map((m) => (m.from === appState.currentUser.id ? m.to : m.from)))]
  
    uniqueUsers.forEach((userId) => {
      const user = appState.users.find((u) => u.id === userId)
      if (!user) return
  
      const conversation = document.createElement("div")
      conversation.className = "conversation"
      conversation.innerHTML = `
              <div class="avatar"></div>
              <div>
                  <h4>${user.name}</h4>
                  <p>@${user.username}</p>
              </div>
          `
      conversation.addEventListener("click", () => selectConversation(userId))
      conversationsList.appendChild(conversation)
    })
  }
  
  function selectConversation(userId) {
    appState.selectedConversation = userId
    document.querySelectorAll(".conversation").forEach((c) => c.classList.remove("active"))
    event.target.closest(".conversation").classList.add("active")
  
    displayChat(userId)
  }
  
  function displayChat(userId) {
    const user = appState.users.find((u) => u.id === userId)
    const chatHeader = document.getElementById("chatHeader")
    const chatMessages = document.getElementById("chatMessages")
    const chatInput = document.getElementById("chatInput")
  
    chatHeader.classList.remove("hidden")
    chatInput.classList.remove("hidden")
  
    document.getElementById("chatUsername").textContent = user.name
  
    chatMessages.innerHTML = ""
    const conversationMessages = appState.messages.filter(
      (m) =>
        (m.from === appState.currentUser.id && m.to === userId) ||
        (m.from === userId && m.to === appState.currentUser.id),
    )
  
    conversationMessages.forEach((msg) => {
      const isSent = msg.from === appState.currentUser.id
      const messageEl = document.createElement("div")
      messageEl.className = `message ${isSent ? "sent" : "received"}`
      messageEl.innerHTML = `<div class="message-bubble">${msg.text}</div>`
      chatMessages.appendChild(messageEl)
    })
  
    chatMessages.scrollTop = chatMessages.scrollHeight
  
    const sendBtn = chatInput.querySelector("button")
    const input = chatInput.querySelector("input")
  
    sendBtn.onclick = () => {
      if (input.value.trim()) {
        appState.messages.push({
          from: appState.currentUser.id,
          to: userId,
          text: input.value,
          id: Date.now(),
        })
        saveDataToStorage()
        input.value = ""
        displayChat(userId)
      }
    }
  }
  
  // ===== NOTIFICATIONS PAGE =====
  function loadNotificationsPage() {
    const notificationsList = document.getElementById("notificationsList")
    notificationsList.innerHTML = ""
  
    const userNotifications = appState.notifications.filter((n) => n.userId === appState.currentUser.id)
  
    if (userNotifications.length === 0) {
      notificationsList.innerHTML =
        '<p style="text-align: center; color: var(--text-secondary); padding: 24px;">No notifications yet</p>'
      return
    }
  
    userNotifications.forEach((notif) => {
      const notifEl = document.createElement("div")
      notifEl.className = "notification"
      notifEl.innerHTML = `
              <div class="notification-icon">🔔</div>
              <div class="notification-content">
                  <p>${notif.text}</p>
                  <div class="notification-time">${new Date(notif.id).toLocaleDateString()}</div>
              </div>
          `
      notificationsList.appendChild(notifEl)
    })
  }
  
  function addNotification(userId, text) {
    if (userId !== appState.currentUser.id) {
      appState.notifications.push({
        userId,
        text,
        id: Date.now(),
      })
      saveDataToStorage()
    }
  }
  
  // ===== CREATE POST PAGE =====
  function loadCreatePage() {
    const imageInput = document.getElementById("postImage")
    imageInput.addEventListener("change", previewImage)
  }
  
  function previewImage(e) {
    const file = e.target.files[0]
    const reader = new FileReader()
  
    reader.onload = (event) => {
      const preview = document.getElementById("imagePreview")
      preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`
    }
  
    reader.readAsDataURL(file)
  }
  
  function handleCreatePost(e) {
    e.preventDefault()
  
    const imageInput = document.getElementById("postImage")
    const caption = document.getElementById("postCaption").value
    const location = document.getElementById("postLocation").value
  
    if (!imageInput.files[0]) {
      alert("Please select an image")
      return
    }
  
    const reader = new FileReader()
    reader.onload = (event) => {
      const newPost = {
        id: Date.now(),
        userId: appState.currentUser.id,
        image: event.target.result,
        caption,
        location,
        likes: [],
        comments: [],
        shares: 0,
      }
  
      appState.posts.push(newPost)
      appState.currentUser.posts.push(newPost.id)
      saveDataToStorage()
      localStorage.setItem("currentUser", JSON.stringify(appState.currentUser))
  
      document.getElementById("createPostForm").reset()
      document.getElementById("imagePreview").innerHTML = ""
  
      alert("Post created successfully!")
      navigateToPage("home")
    }
  
    reader.readAsDataURL(imageInput.files[0])
  }
  
  // ===== PROFILE PAGE =====
  function loadProfilePage() {
    const user = appState.currentUser
  
    document.getElementById("profileName").textContent = user.name
    document.getElementById("profileUsername").textContent = `@${user.username}`
    document.getElementById("profileBio").textContent = user.bio
  
    const userPosts = appState.posts.filter((p) => p.userId === user.id)
  
    document.getElementById("postsCount").textContent = userPosts.length
    document.getElementById("followersCount").textContent = user.followers
    document.getElementById("followingCount").textContent = user.following
  
    displayProfilePosts(userPosts)
  }
  
  function displayProfilePosts(posts) {
    const grid = document.getElementById("userPostsGrid")
    grid.innerHTML = ""
  
    posts.forEach((post) => {
      const item = document.createElement("div")
      item.className = "explore-item"
      item.innerHTML = `<img src="${post.image}" alt="Post">`
      item.addEventListener("click", () => openPostComments(post.id))
      grid.appendChild(item)
    })
  }
  
  function viewUserProfile(userId) {
    // Could implement viewing other users' profiles
    alert("Profile view for other users coming soon!")
  }
  
  // ===== MODAL =====
  function closeModal() {
    document.getElementById("modal").classList.add("hidden")
  }
  
  // ===== UTILITY FUNCTIONS =====
  function toggleMobileMenu() {
    const sidebar = document.querySelector(".sidebar")
    sidebar.style.display = sidebar.style.display === "none" ? "block" : "none"
  }
  
  function saveDataToStorage() {
    localStorage.setItem(
      "appState",
      JSON.stringify({
        posts: appState.posts,
        users: appState.users,
        messages: appState.messages,
        notifications: appState.notifications,
      }),
    )
  }
  
  function loadDataFromStorage() {
    const saved = localStorage.getItem("appState")
    if (saved) {
      const data = JSON.parse(saved)
      appState.posts = data.posts || []
      appState.users = data.users || []
      appState.messages = data.messages || []
      appState.notifications = data.notifications || []
    }
  
    // Initialize with sample data if empty
    if (appState.users.length === 0) {
      initializeSampleData()
    }
  }
  
  function initializeSampleData() {
    // Sample users
    appState.users = [
      {
        id: 1,
        name: "Sarah Anderson",
        email: "sarah@example.com",
        username: "sarah_anderson",
        password: "123456",
        bio: "Photography & Travel",
        followers: 1250,
        following: 450,
        posts: [],
      },
      {
        id: 2,
        name: "John Developer",
        email: "john@example.com",
        username: "john_dev",
        password: "123456",
        bio: "Web Developer | Tech Enthusiast",
        followers: 890,
        following: 320,
        posts: [],
      },
      {
        id: 3,
        name: "Emma Designer",
        email: "emma@example.com",
        username: "emma_design",
        password: "123456",
        bio: "UI/UX Designer | Creative Thinker",
        followers: 2100,
        following: 560,
        posts: [],
      },
    ]
  
    // Sample posts with gradient placeholders
    appState.posts = [
      {
        id: 1,
        userId: 1,
        image:
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="500"%3E%3Cdefs%3E%3ClinearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:rgb(10,102,194);stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:rgb(245,166,35);stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="500" height="500" fill="url(%23grad1)"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="48" font-weight="bold"%3ESample Post%3C/text%3E%3C/svg%3E',
        caption: "Beautiful sunset at the beach! 🌅",
        location: "Malibu Beach",
        likes: [2, 3],
        comments: [{ userId: 2, text: "Amazing shot!", id: 1 }],
        shares: 5,
      },
      {
        id: 2,
        userId: 2,
        image:
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="500"%3E%3Cdefs%3E%3ClinearGradient id="grad2" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:rgb(245,166,35);stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:rgb(10,102,194);stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="500" height="500" fill="url(%23grad2)"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="48" font-weight="bold"%3ECoding Session%3C/text%3E%3C/svg%3E',
        caption: "Working on a new project! 💻",
        location: "Home Office",
        likes: [1, 3],
        comments: [{ userId: 3, text: "Looking good!", id: 2 }],
        shares: 3,
      },
    ]
  
    saveDataToStorage()
  }
  
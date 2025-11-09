
const menuBtns = document.querySelectorAll(".menuBtn");
const closeBtn = document.getElementById("closeBtn");
const mobileSidebar = document.getElementById("mobileSidebar");
const searchInput = document.getElementById("search-bar");
const searchBtn = document.getElementById("search-img");


// ---------------- Sidebar Toggle ----------------
menuBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    mobileSidebar.classList.remove("hidden");
  });
});

closeBtn.addEventListener("click", () => {
  mobileSidebar.classList.add("hidden");
});

// ---------------- Active State (Desktop) ----------------
const desktopItems = document.querySelectorAll("#sidebar .menu-item");

desktopItems.forEach((item) => {
  item.addEventListener("click", () => {
    desktopItems.forEach((el) => {
      el.classList.remove("bg-[var(--color-base-blue)]");
      el.querySelector(".icon-white").classList.add("hidden");
      el.querySelector(".icon-black").classList.remove("hidden");
      el.querySelector("a").classList.remove("text-[var(--color-neutral-0)]");
      el.querySelector("a").classList.add("text-[var(--color-neutral-900)]");
    });

    item.classList.add("bg-[var(--color-base-blue)]");
    item.querySelector(".icon-white").classList.remove("hidden");
    item.querySelector(".icon-black").classList.add("hidden");
    item.querySelector("a").classList.remove("text-[var(--color-neutral-900)]");
    item.querySelector("a").classList.add("text-[var(--color-neutral-0)]");
  });
});



// ---------------- Active State (Mobile) ----------------
const mobileLinks = document.querySelectorAll("#mobileSidebar a");

mobileLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mobileLinks.forEach((el) => {
      el.classList.remove("bg-[var(--color-base-blue)]", "text-[var(--color-neutral-0)]", "w-64", "p-2", "rounded-xl");
      el.classList.add("text-[var(--color-neutral-900)]");
    });

    link.classList.add("bg-[var(--color-base-blue)]", "text-[var(--color-neutral-0)]", "w-64", "p-2", "rounded-xl");
    link.classList.remove("text-[var(--color-neutral-900)]");
  });
});
document.addEventListener("click", (body) => {
  body.classList.remove("bg-[var(--color-base-blue)]", "text-[var(--color-neutral-0)]", "w-64", "p-2", "rounded-xl");
})

// ---------------- Search Toggle ----------------
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


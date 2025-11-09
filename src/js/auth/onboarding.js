document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  let current = 0;
  const intervalTime = 1000; // 1 secs per slide

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("opacity-100", i === index);
      slide.classList.toggle("opacity-0", i !== index);
    });
  }

  function nextSlide() {
    current++;
    if (current < slides.length) {
      showSlide(current);
    } else {
      // Redirect after last slide
      window.location.href = "../../../src/html/dashboard/dashboard.html";
    }
  }

  // Start slideshow
  showSlide(current);
  setInterval(nextSlide, intervalTime);
});

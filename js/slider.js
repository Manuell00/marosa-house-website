document.addEventListener("DOMContentLoaded", function () {

    const slides = document.querySelectorAll(".slide");

    if (slides.length === 0) return;

    let index = 0;

    function changeSlide() {

        slides[index].classList.remove("active");

        index = (index + 1) % slides.length;

        slides[index].classList.add("active");

    }

    setInterval(changeSlide, 3500);

});
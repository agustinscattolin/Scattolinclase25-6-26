const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("reveal-ready");

const touchPointer = window.matchMedia("(pointer: coarse)").matches;
const woodDustConfig = {
  colors: ["#e2dcd3", "#d6b98c", "#b96842", "#c88b54", "#8f5a34"],
  maxParticlesPerMove: 2,
  minTimeBetweenBursts: 34,
  maxParticlesOnScreen: 80,
};

let lastDustTime = 0;
let activeDustParticles = 0;

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const createWoodParticle = (x, y) => {
  if (activeDustParticles >= woodDustConfig.maxParticlesOnScreen) return;

  const particle = document.createElement("span");
  const size = randomBetween(3, 8);
  const duration = randomBetween(620, 980);

  particle.className = "wood-particle";
  particle.style.setProperty("--particle-x", `${x + randomBetween(-8, 8)}px`);
  particle.style.setProperty("--particle-y", `${y + randomBetween(-8, 8)}px`);
  particle.style.setProperty("--particle-width", `${size * randomBetween(1.2, 2.2)}px`);
  particle.style.setProperty("--particle-height", `${Math.max(2, size * randomBetween(0.45, 0.8))}px`);
  particle.style.setProperty("--particle-drift-x", `${randomBetween(-22, 22)}px`);
  particle.style.setProperty("--particle-fall", `${randomBetween(26, 58)}px`);
  particle.style.setProperty("--particle-rotation", `${randomBetween(0, 180)}deg`);
  particle.style.setProperty("--particle-spin", `${randomBetween(-150, 150)}deg`);
  particle.style.setProperty("--particle-duration", `${duration}ms`);
  particle.style.setProperty("--particle-opacity", `${randomBetween(0.28, 0.58)}`);
  particle.style.setProperty(
    "--particle-color",
    woodDustConfig.colors[Math.floor(Math.random() * woodDustConfig.colors.length)]
  );

  activeDustParticles += 1;
  document.body.appendChild(particle);

  particle.addEventListener(
    "animationend",
    () => {
      particle.remove();
      activeDustParticles -= 1;
    },
    { once: true }
  );
};

const handleWoodDust = (event) => {
  const now = performance.now();

  if (now - lastDustTime < woodDustConfig.minTimeBetweenBursts) return;

  lastDustTime = now;

  for (let index = 0; index < woodDustConfig.maxParticlesPerMove; index += 1) {
    createWoodParticle(event.clientX, event.clientY);
  }
};

if (!reducedMotion && !touchPointer) {
  window.addEventListener("pointermove", handleWoodDust, { passive: true });
}

const processSteps = [
  {
    title: "Diagnóstico",
    image: "assets/images/seccionrestauracion/diagnostico.png",
    alt: "Evaluación inicial de una silla antigua en proceso de restauración",
  },
  {
    title: "Rediseño",
    image: "assets/images/seccionrestauracion/rediseño.png",
    alt: "Propuesta visual para rediseñar una pieza restaurada",
  },
  {
    title: "Reparación",
    image: "assets/images/seccionrestauracion/reparacion.png",
    alt: "Trabajo de reparación estructural sobre un mueble de madera",
  },
];

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 16);
};

const closeNav = () => {
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
};

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNav);
});

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

const revealImages = document.querySelectorAll(".reveal-image");

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
let ticking = false;

const updateRevealImages = () => {
  const viewportHeight = window.innerHeight;

  revealImages.forEach((image, index) => {
    const rect = image.getBoundingClientRect();
    const start = viewportHeight * 1.08;
    const end = -rect.height * 0.2;
    const progress = clamp((start - rect.top) / (start - end));
    const startY = 240 + index * 34;
    const endY = -130 - index * 24;
    const currentY = startY + (endY - startY) * progress;

    image.style.setProperty("--scroll-y", `${currentY}px`);

    if (progress > 0.08) {
      image.classList.add("is-visible");
    }
  });

  ticking = false;
};

const requestRevealUpdate = () => {
  if (ticking) return;

  ticking = true;
  window.requestAnimationFrame(updateRevealImages);
};

window.addEventListener("scroll", requestRevealUpdate, { passive: true });
window.addEventListener("resize", requestRevealUpdate);
requestRevealUpdate();

const tabs = document.querySelectorAll("[data-step]");
const processImage = document.querySelector("[data-process-image]");
const processMedia = processImage.closest(".process-media");

const renderStep = (index) => {
  const step = processSteps[index];

  processMedia.setAttribute("aria-label", `Imagen del proceso: ${step.title}`);
  processImage.classList.add("is-changing");

  window.setTimeout(() => {
    processImage.src = step.image;
    processImage.alt = step.alt;
    processImage.classList.remove("is-changing");
  }, 120);

  tabs.forEach((tab) => {
    const isActive = Number(tab.dataset.step) === index;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => renderStep(Number(tab.dataset.step)));
});

const beforeAfterBlocks = document.querySelectorAll("[data-before-after]");

beforeAfterBlocks.forEach((block) => {
  const range = block.querySelector("[data-before-after-range]");

  const updateSplit = () => {
    const value = Number(range.value);
    block.style.setProperty("--split", `${value}%`);
  };

  range.addEventListener("input", updateSplit);
  updateSplit();
});

const revealTextItems = document.querySelectorAll(".reveal-text");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealTextItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealTextObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.12,
    }
  );

  revealTextItems.forEach((item) => revealTextObserver.observe(item));
}

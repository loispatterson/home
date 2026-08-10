import { Runtime, Inspector } from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@5/dist/runtime.js";
import define from "https://api.observablehq.com/d/a0255c01f08851d6.js?v=3";

const MAP_CELL_NAME = "mapView";
const STEP_FN = "setStep";
const LANG_FN = "setLanguage";

const mount = document.querySelector("#mapMount");
const runtime = new Runtime();

const main = runtime.module(define, (name) => {
  if (name === MAP_CELL_NAME) return new Inspector(mount);
  return null;
});

let setStepFn = null;
let setLangFn = null;
main.value(STEP_FN).then(fn => {
  setStepFn = fn;
  console.log("setStep loaded", typeof fn);
  setStepFn?.("intro");
}).catch(err => console.error("setStep failed", err));
main.value(LANG_FN).then(fn => { setLangFn = fn; }).catch(() => {});

// page text translations, keyed by data-i18n attribute
const translations = {
  en: {
    title: "Avalanches with significant impact or reach",
    subtitle: "Scroll to explore the map.",
    langLabel: "Language:",
    introTitle: "Overview",
    introText: "Start wide: where are we in the Alps?",
    zoomTitle: "Zoom to Vallorcine",
    zoomText: "Let’s focus in on the valley and surrounding terrain.",
    couloirsTitle: "Couloirs",
    couloirsText: "Now we can highlight the couloir polygons and their notes.",
  },
  fr: {
    title: "Avalanches à impact significatif ou à longue portée",
    subtitle: "Faites défiler pour explorer la carte.",
    langLabel: "Langue :",
    introTitle: "Vue d’ensemble",
    introText: "Commençons en plan large : où sommes-nous dans les Alpes ?",
    zoomTitle: "Zoom sur Vallorcine",
    zoomText: "Concentrons-nous sur la vallée et le terrain environnant.",
    couloirsTitle: "Couloirs",
    couloirsText: "Nous pouvons maintenant mettre en évidence les couloirs et leurs notes.",
  },
};

function applyTranslations(lang) {
  const strings = translations[lang] ?? translations.en;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (strings[key]) el.textContent = strings[key];
  });
  document.documentElement.lang = lang;
}

// hook up language select on the page
const langSelect = document.querySelector("#lang");
langSelect.addEventListener("input", () => {
  setLangFn?.(langSelect.value);
  applyTranslations(langSelect.value);
});

// your existing scrollytelling observer (unchanged)
const steps = Array.from(document.querySelectorAll(".step"));
const io = new IntersectionObserver((entries) => {
  const visible = entries.filter(e => e.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;

  steps.forEach(s => s.classList.toggle("is-active", s === visible.target));
  const stepId = visible.target.getAttribute("data-step");
  if (setStepFn && stepId) setStepFn(stepId);
}, { threshold: [0.25, 0.5, 0.75] });

steps.forEach(s => io.observe(s));

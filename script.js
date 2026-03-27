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

main.value(STEP_FN).then(fn => { setStepFn = fn; setStepFn?.("intro"); }).catch(() => {});
main.value(LANG_FN).then(fn => { setLangFn = fn; }).catch(() => {});

// hook up language select on the page
const langSelect = document.querySelector("#lang");
langSelect.addEventListener("input", () => {
  setLangFn?.(langSelect.value);
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

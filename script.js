import { Runtime, Inspector } from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@5/dist/runtime.js";
import define from "https://api.observablehq.com/loispatterson/a0255c01f08851d6.js?v=3";
https://observablehq.com/d/

const MAP_CELL_NAME = "map";     // the named output cell
const CONTROL_CELL_NAME = "setStep"; // the named function cell

const mount = document.querySelector("#mapMount");
const runtime = new Runtime();

let setStepFn = null;

const main = runtime.module(define, (name) => {
  // Render only the map cell into the page
  if (name === MAP_CELL_NAME) return new Inspector(mount);
  return null;
});

// Get the controller function from the notebook
main.value(CONTROL_CELL_NAME).then((fn) => {
  setStepFn = fn;
  // start at intro
  setStepFn?.("intro");
}).catch(() => {
  // If you don’t have setStep in the notebook, the embed still works, just no scrolly control.
  setStepFn = null;
});

// Scrollytelling: activate steps when they enter view
const steps = Array.from(document.querySelectorAll(".step"));

const io = new IntersectionObserver((entries) => {
  // pick the most visible entry
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visible) return;

  steps.forEach(s => s.classList.toggle("is-active", s === visible.target));

  const stepId = visible.target.getAttribute("data-step");
  if (setStepFn && stepId) setStepFn(stepId);
}, { threshold: [0.25, 0.5, 0.75] });

steps.forEach(s => io.observe(s));

/*
 * Utils functions
 */

// Normalize fonts removing accents
export function toNormalForm(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Create new document elements
export function newElement(element, id, classList = [], label, nodeToAppend, disabled=false) {
  const el = document.createElement(element);

  el.id = id;
  el.classList.add(...classList);
  el.innerHTML = label;
  el.disabled = disabled;
  return nodeToAppend.appendChild(el);
}

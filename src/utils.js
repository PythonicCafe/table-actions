/*
 * Utils functions
 */

// Normalize fonts removing accents
export function toNormalForm(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Create new document elements
export function newElement(element, id, classList = [], label, nodeToAppend) {
  const el = document.createElement(element);

  el.id = id;
  el.classList.add(...classList);
  el.innerHTML = label;

  return nodeToAppend.appendChild(el);
}

/*
 * Utils functions
 */

// Normalize fonts removing accents
export function toNormalForm(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function createElementWithClassList(element, classList = []) {
  const el = document.createElement(element);
  if (classList.length) {
    el.classList.add(...classList);
  }
  return el;
}

// Create new document elements
export function newElement(
  element,
  classList = [],
  label,
  nodeToAppend,
  options = {
    disabled: false,
    prependEl: undefined,
    outsideElement: { element: undefined, classList: [] },
  }
) {
  let el = createElementWithClassList(element, classList);

  if (element === "input") {
    el.placeholder = label;
  } else {
    el.innerHTML = label;
  }

  el.disabled = options.disabled;

  if (options.outsideElement && options.outsideElement.element) {
    const outsideEl = createElementWithClassList(
      options.outsideElement.element,
      options.outsideElement.classList
    );
    outsideEl.appendChild(el);
    el = outsideEl;
  }

  if (options.prependEl) {
    console.log("nodeToAppend", nodeToAppend);
    console.log("el", el);
    console.log("options.prependEl", options.prependEl);
    return nodeToAppend.insertBefore(el, options.prependEl);
  }

  return nodeToAppend.appendChild(el);
}

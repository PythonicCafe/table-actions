/*
 * Utils functions
 */

// Normalize fonts removing accents
export function toNormalForm(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Create new document elements with class simplified
export function newElement(element, classList = []) {
  const el = document.createElement(element);
  if (classList.length) {
    el.classList.add(...classList);
  }
  return el;
}

// Create new document elements with node to append
export function newElementToNode(element, options = {}) {
  options = mergeObjects(
    {
      classList: {},
      label: "",
      nodeToAppend: undefined,
      disabled: false,
      prependEl: undefined,
      outsideElement: { element: undefined, classList: {} },
      datasets: {},
    },
    options
  );

  let el = newElement(element, Object.values(options.classList));

  if (element === "input") {
    el.placeholder = options.label;
  } else {
    el.innerHTML = options.label;
  }

  const datasets = Object.values(options.datasets);
  if (datasets.length) {
    for (const dataset of datasets) {
      el.dataset[dataset.name] = dataset.value;
    }
  }

  el.disabled = options.disabled;

  if (options.outsideElement && options.outsideElement.element) {
    const outsideEl = newElement(
      options.outsideElement.element,
      Object.values(options.outsideElement.classList)
    );
    outsideEl.appendChild(el);
    el = outsideEl;
  }

  if (options.prependEl) {
    return options.nodeToAppend.insertBefore(el, options.prependEl);
  }

  return options.nodeToAppend.appendChild(el);
}

export function deepCopy(obj) {
  let newObj = {};

  for (const key of Object.keys(obj)) {
    let value = obj[key];
    if (value !== null && typeof value == "object") {
      newObj[key] = deepCopy(value);
    } else {
      newObj[key] = value;
    }
  }

  return newObj;
}

export function mergeObjects(opts1, opts2) {
  // First, create completely new object, without any reference to `opts1`
  let merged = deepCopy(opts1);

  // Now, for each key on `opts2`, overwrite it recursively on `opts1`
  for (const key of Object.keys(opts2)) {
    let newValue = opts2[key],
      oldValue = merged[key];
    if (
      newValue !== null &&
      typeof newValue == "object" &&
      oldValue !== null &&
      typeof oldValue == "object"
    ) {
      merged[key] = mergeObjects(oldValue, newValue);
    } else {
      merged[key] = newValue;
    }
  }
  return merged;
}

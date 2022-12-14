/*
 * Utils functions
 */

// Normalize fonts removing accents
export function toNormalForm(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function newElement(element, classList = []) {
  // Create the element and set its class list
  const el = document.createElement(element);
  if (classList.length) {
    el.classList.add(...classList);
  }
  return el;
}

export function newElementToNode(element, options = {}) {
  // Use default options if options are not provided
  options = mergeObjects(
    {
      classList: [],
      label: "",
      nodeToAppend: undefined,
      disabled: false,
      prependEl: undefined,
      outsideElement: { element: undefined, classList: [] },
      datasets: {},
    },
    options
  );

  // Create the element and set its class list
  let el = newElement(element, options.classList);

  // Set the element's placeholder or inner HTML
  if (element === "input") {
    el.placeholder = options.label;
  } else {
    el.innerHTML = options.label;
  }

  // Set the element's dataset values
  const datasets = Object.values(options.datasets);
  if (datasets.length) {
    for (const dataset of datasets) {
      el.dataset[dataset.name] = dataset.value;
    }
  }

  // Set the element's disabled property
  el.disabled = options.disabled;

  // If an outside element is provided, create it and append the element to it
  if (options.outsideElement && options.outsideElement.element) {
    const outsideEl = newElement(
      options.outsideElement.element,
      options.outsideElement.classList
    );
    outsideEl.appendChild(el);
    el = outsideEl;
  }

  // If a prepend element is provided, insert the element before it
  if (options.prependEl) {
    return options.nodeToAppend.insertBefore(el, options.prependEl);
  }

  // Append the element to the node
  return options.nodeToAppend.appendChild(el);
}

export function deepCopy(obj) {
  const copy = {};

  // Iterate over the properties of the original object
  for (const key in obj) {
    // Only copy own properties, not inherited properties
    if (obj.hasOwnProperty(key)) {
      const val = obj[key];

      // If the property is an array, copy the array
      if (Array.isArray(val)) {
        copy[key] = val.concat();
      }
      // If the property is an object, create a deep copy of the object
      else if (typeof val === "object" && val !== null) {
        copy[key] = deepCopy(val);
      }
      // Else the property is not an array or object, copy the value
      else {
        copy[key] = val;
      }
    }
  }

  return copy;
}

export function mergeObjects(opts1, opts2) {
  // Create a new object by making a deep copy of opts1
  let merged = deepCopy(opts1);

  // Iterate over the properties of opts2
  for (const key of Object.keys(opts2)) {
    let newValue = opts2[key],
      oldValue = merged[key];

    // If the property is an array, concatenate the arrays
    if (Array.isArray(newValue) && Array.isArray(oldValue)) {
      merged[key] = newValue.concat( ...oldValue);
    }
    // If the property is an object, merge the objects
    else if (
      newValue !== null &&
      typeof newValue == "object" &&
      oldValue !== null &&
      typeof oldValue == "object"
    ) {
      merged[key] = mergeObjects(oldValue, newValue);
    }
    // Otherwise, use the value from opts2
    else {
      merged[key] = newValue;
    }
  }

  return merged;
}

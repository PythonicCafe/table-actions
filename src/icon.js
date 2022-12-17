const icons = {
  fontawesome: {
    'alert': 'fa-solid fa-circle-exclamation',
    'caret-down': 'fa-solid fa-caret-down',
    'caret-up': 'fa-solid fa-caret-up',
    'search': 'fa-solid fa-magnifying-glass',
  },
  bootstrap: {
    'alert': 'bi bi-exclamation-circle-fill',
    'caret-down': 'bi bi-caret-down-fill',
    'caret-up': 'bi bi-caret-up-fill',
    'search': 'bi bi-search'
  },
};

export default class Icon {

  /**
   * Returns the HTML for the icon.
   *
   * Example usage
   * const heartIcon = Icon.getIcon('fontawesome', 'alert');
   *
   * @param {string} type - The type of the icon.
   * @param {string} name - The name of the icon.
   * @returns {string} The HTML for the icon. <i class="fas fa-circle-exclamation"></i>
   */
  static getIcon(type, name) {
    if (!icons[type] || !icons[type][name]) {
      return 'Invalid icon type or name';
    }
    return `<i class="${icons[type][name]}"></i>`;
  }
}

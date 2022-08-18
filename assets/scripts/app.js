class DOMHelper {
  static clearEventListeners(elem) {
    const clonedElem = elem.cloneNode(true); // Deep clone
    elem.replaceWith(clonedElem); // Now old eventListeners can be garbage collected
    return clonedElem;
  }
  // Helper for appending element (for addElement)
  static moveElement(elemId, newDestinationSelector) {
    const elem = document.getElementById(elemId);
    const destinationElem = document.querySelector(newDestinationSelector);
    destinationElem.append(elem);
  }
}

class Component {
  constructor(hostElementId, insertBefore = false) {
    if (hostElementId) {
      this.hostElement = document.getElementById(hostElementId);
    } else {
      this.hostElement = document.body;
    }
    this.insertBefore = insertBefore;
  }

  // Removing from DOM (More info on click for example)
  detach() {
    if (this.element) {
      this.element.remove();
    }
  }

  // Showing in DOM
  attach() {
    this.hostElement.insertAdjacentElement(
      this.insertBefore ? 'afterbegin' : 'beforeend',
      this.element
    );
  }
}

// For 'More Info' button
class Tooltip extends Component {
  constructor(closeNotifierFn) {
    super();
    this.closeNotifier = closeNotifierFn;
    this.create();
  }

  // For opening More info only once
  closeTooltip() {
    this.detach();
    this.closeNotifier();
  }

  create() {
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'card';
    tooltipEl.textContent = 'MORE INFO HERE';
    tooltipEl.addEventListener('click', this.closeTooltip.bind(this));
    this.element = tooltipEl;
  }

  // Removing More info on click
  detach() {
    this.element.remove();
  }

  // Showing More Info on click
  attach() {
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'card';
    tooltipEl.textContent = 'MORE INFO HERE';
    tooltipEl.addEventListener('click', this.closeTooltip.bind(this));
    this.element = tooltipEl;
    document.body.append(tooltipEl);
  }
}

class ProjectItem {
  // For showing only one 'More info'
  hasActiveTooltip = false;

  constructor(id, updateProjListsFunc, type) {
    this.id = id;
    this.updateProjListsHandler = updateProjListsFunc; // To call switchFunc from projList. Like props in React
    this.connectMoreInfoButton();
    this.connectSwitchButton(type);
  }

  // For More Info btn
  showMoreInfoHandler() {
    if (this.hasActiveTooltip) {
      return;
    }
    const tooltip = new Tooltip(() => (this.hasActiveTooltip = false));
    tooltip.attach();
    this.hasActiveTooltip = true;
  }

  connectMoreInfoButton() {
    const projItem = document.getElementById(this.id);
    const moreInfoBtn = projItem.querySelector('button:first-of-type');
    moreInfoBtn.addEventListener('click', this.showMoreInfoHandler);
  }

  // For Finish/Activate btn
  connectSwitchButton(type) {
    // Get btn from the DOM
    const projItem = document.getElementById(this.id);
    let switchBtn = projItem.querySelector('button:last-of-type');
    switchBtn = DOMHelper.clearEventListeners(switchBtn);
    switchBtn.textContent = type === 'active' ? 'Finish' : 'Activate'; // Toggle btn text
    switchBtn.addEventListener(
      'click',
      this.updateProjListsHandler.bind(null, this.id)
    ); // Executes switchProj metod
  }

  // For changing button behavior from Finish to Activate in addProject
  update(updateProjListsFn, type) {
    this.updateProjListsHandler = updateProjListsFn;
    this.connectSwitchButton(type);
  }
}

class ProjectList {
  constructor(type) {
    this.type = type;
    this.projects = [];
    // Getting all curr items in the box
    const prjItems = document.querySelectorAll(`#${type}-projects li`);
    // Pushing items to the box by id
    for (const prj of prjItems) {
      this.projects.push(
        new ProjectItem(prj.id, this.switchProject.bind(this), this.type)
      ); // switchProject - passing a props down
    }
  }

  // Can be called on finished instances. Connector to addProject in other instance (box of items) in App class.
  setSwitchHandlerFunc(switchHandlerFunc) {
    this.switchHandler = switchHandlerFunc; // Arg is addFunc from other box
  }

  // Add to other list. Is called in App class by setSwitchHandlerFunc from other instace of this class
  addProject(proj) {
    this.projects.push(proj);
    DOMHelper.moveElement(proj.id, `#${this.type}-projects ul`);
    // Changing button behavior from Finish to Activate
    proj.update(this.switchProject.bind(this), this.type);
  }

  switchProject(projId) {
    // Passing certain proj by id to addProject in other instance (box) via setSwitchHandlerFunc
    this.switchHandler(this.projects.find((p) => p.id === projId));
    // Remove from the list
    this.projects = this.projects.filter((p) => p.id !== projId);
  }
}

class App {
  static init() {
    // Creating 2 boxes
    const activeProjectsList = new ProjectList('active');
    const finishedProjectsList = new ProjectList('finished');
    // Connecting 2 instances for switching items between them
    activeProjectsList.setSwitchHandlerFunc(
      finishedProjectsList.addProject.bind(finishedProjectsList)
    );
    finishedProjectsList.setSwitchHandlerFunc(
      activeProjectsList.addProject.bind(activeProjectsList)
    );
  }
}

App.init();

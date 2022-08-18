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

// For 'More Info' button
class Tooltip {}

class ProjectItem {
  constructor(id, updateProjListsFunc, type) {
    this.id = id;
    this.updateProjListsHandler = updateProjListsFunc; // To call switchFunc from projList. Like props in React
    this.connectMoreInfoButton();
    this.connectSwitchButton(type);
  }

  connectMoreInfoButton() {}

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

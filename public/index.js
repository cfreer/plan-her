"use strict";
(function() {
  const VIEWS = ["home-view", "class-view", "add-class-view", "add-task-view", "error-view"];

  window.addEventListener("load", onLoad);

  /**
   * Once the page loads, sets up original functionality.
   */
  function onLoad() {
    setUpBtns();
    id("submit-class-btn").addEventListener("click", submitClass);
  }

  /**
   * Requests the classes from the database.
   */
  function requestClasses() {
    let url = "/classes";
    fetch(url)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(addClasses)
      .catch(handleError);
  }

  /**
   * Adds the classes to the classes view.
   * @param {JSON} classesData - data about the classes.
   */
  function addClasses(classesData) {
    console.log(classesData);
    let classes = id("classes");
    classes.innerHTML = "";
    for (let i = 0; i < classesData.length; i++) {
      let classData = classesData[i];
      let classElement = gen("div");
      let name = gen("p");
      name.textContent = classData.class;
      name.style.color = classData.color;
      classElement.appendChild(name);
      classes.appendChild(classElement);
    }
  }

  /**
   * Submits the class to the database.
   */
  function submitClass() {
    let name = id("class-name").value;
    let color = id("color").value;
    if (name !== "") {
      let data = new FormData();
      data.append("name", name);
      data.append("color", color);
      let url = "/add/class";
      fetch(url, {method: "POST", body: data})
        .then(statusCheck)
        .then(resp => resp.text())
        .then(processSubmitClass)
        .catch(handleError);
    }
  }


  /**
   * Sets up the buttons to switch views when clicked.
   */
  function setUpBtns() {
    for (let i = 0; i < VIEWS.length - 1; i++) {
      let button = VIEWS[i].replace("view", "btn");
      id(button).addEventListener("click", switchViewsClicked);
    }
  }

  /**
   * Switches the user back to the class view.
   * @param {String} response - response from the server. Should always be "success".
   */
     function processSubmitClass(response) {
      if (response === "success") {
        switchViews("class-view");
      }
    }


  /**
   * Switches to the view corresponding to the button clicked.
   */
  function switchViewsClicked() {
    let view = this.id.replace("btn", "view");
    switchViews(view);
  }

  /**
   * Shows the given view and hides all other views.
   * @param {String} viewId - the id of the view to be switched to.
   */
  function switchViews(viewId) {
    for (let i = 0; i < VIEWS.length; i++) {
      let view = VIEWS[i];
      let viewElement = id(view);
      if (view === viewId) {
        show(viewElement);
        viewElement.classList.add("flex");
      } else {
        hide(viewElement);
        viewElement.classList.remove("flex");
      }
    }

    if (viewId === "class-view") {
      requestClasses();
    }

  }

  /**
   * Handles any errors that may occur by displaying a useful message to the user.
   * @param {Error} err - the error that occured while trying to fetch data.
   */
  function handleError(err) {
    console.log(err);
    switchViews("error-view");
    for (let i = 0; i < VIEWS.length - 1; i++) {
      let button = VIEWS[i].replace("view", "btn");
      id(button).disabled = true;
    }

    let message = qs("#error-view h3");
    let errorMessage = err.message;

    if (errorMessage === "Failed to fetch") {
      message.textContent += "Network disconnected. Please check your wifi network.";
    } else {
      message.textContent += errorMessage;
    }
  }

  /**
   * Hides the given element.
   * @param {HTMLElement} element - the element to be hidden.
   */
  function hide(element) {
    element.classList.add("hidden");
  }

  /**
   * Shows the given element.
   * @param {HTMLElement} element - the element to be shown.
   */
  function show(element) {
    element.classList.remove("hidden");
  }

  /**
   * Checks the status of the fetch to make sure everything went okay.
   * @param {Response} res - the response of fetching the url.
   * @return {Response} the response of fetching the url if nothing went wrong.
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /* ---- Helper Functions ---- */
  /**
   * Returns the DOM object with the given id attribute.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id (null if not found).
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the first DOM object that matches the given selector.
   * @param {string} selector - query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns an array of DOM objects that match the given selector.
   * @param {string} selector - query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();
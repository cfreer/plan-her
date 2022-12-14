"use strict";
(function() {
  const VIEWS = ["home-view", "class-view", "add-class-view", "add-task-view", "error-view"];

  window.addEventListener("load", onLoad);

  /**
   * Once the page loads, sets up original functionality.
   */
  function onLoad() {
    setUpBtns();
    setUpDays();
    requestClasses();
    requestTasks();
    requestLectures();
    id("submit-class-btn").addEventListener("click", submitClass);
    id("submit-task-btn").addEventListener("click", submitTask);
  }

  /**
   * Sets up the days to know when selected.
   */
  function setUpDays() {
    let days = qsa(".day");
    for (let i = 0; i < days.length; i++) {
      let day = days[i];
      day.addEventListener("click", function() {
        this.classList.toggle("selected");
      });
    }
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
   * Requests the tasks from the database.
   */
  function requestTasks() {
    let url = "/tasks";
    fetch(url)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(function(taskData) {
        addTasks(taskData, "tasks")
      })
      .catch(handleError);
  }

  /**
   * Requests the lectures from the database.
   */
  function requestLectures() {
    let url = "/lectures";
    fetch(url)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(function(lectureData) {
        addTasks(lectureData, "lectures")
      })
      .catch(handleError);
  }

  /**
   * Adds the classes to the classes view.
   * @param {JSON} classesData - data about the classes.
   */
  function addClasses(classesData) {
    let classes = id("classes");
    classes.innerHTML = "";
    let taskClasses = id("task-class");
    taskClasses.innerHTML = "";
    for (let i = 0; i < classesData.length; i++) {
      let classData = classesData[i];
      let classElement = gen("div");
      let className = classData.class;
      let name = gen("p");
      name.textContent = className;
      name.style.color = classData.color;
      classElement.appendChild(name);
      classElement.classList.add("class");
      classes.appendChild(classElement);

      // Adds all classes as options for the dropdown for tasks.
      let option = gen("option");
      option.setAttribute("value", className);
      option.textContent = className;
      taskClasses.appendChild(option);
    }
  }

  /**
   * Adds the tasks to the home view.
   * @param {JSON} tasksData - data about the tasks.
   * @param {String} containerId - the id of the container.
   */
  function addTasks(tasksData, containerId) {
    let tasks = id(containerId);
    tasks.innerHTML = "";
    for (let i = 0; i < tasksData.length; i++) {
      let taskData = tasksData[i];

      let checkbox = gen("input");
      checkbox.type = "checkbox";
      checkbox.addEventListener("click", checkBoxClicked);

      let taskElement = gen("div");
      taskElement.id = taskData.id;
      taskElement.classList.add(containerId.slice(0, -1));
      if (taskData.completed) {
        taskElement.classList.add("checked");
        checkbox.checked = true;
      }
      let data = gen("div");
      let dueDate = getDate(taskData.due_date);
      let taskClass = getPElement(taskData.class);
      taskClass.style.color = taskData.color;
      taskClass.classList.add("class");
      data.appendChild(getPElement(taskData.name));
      data.appendChild(getPElement(dueDate));
      taskElement.appendChild(checkbox);
      taskElement.appendChild(data);
      taskElement.appendChild(taskClass);
      tasks.appendChild(taskElement);
    }
  }

  /**
   * Marks the task checked as complete.
   */
  function checkBoxClicked() {
    let isChecked = this.checked;
    isChecked = isChecked ? 1 : 0;
    let task = this.parentNode;
    task.classList.toggle("checked");
    let table = "tasks";
    if (task.classList.contains("lecture")) {
      table = "lectures"
    }
    let id = task.id;

    let data = new FormData();
    data.append("id", id);
    data.append("checked", isChecked);
    data.append("table", table);

    let url = "/toggle/check";
    fetch(url, {method: "POST", body: data})
      .then(statusCheck)
      .then(function() {
        requestTasks();
        requestLectures();
      })
      .catch(handleError);
  }

  /**
   * Returns a p tag with the given text.
   * @param {String} textContent - the text of the p tag.
   * @returns {HTMLParagraphElement} p tag with the given text.
   */
  function getPElement(textContent) {
    let element = gen("p");
    element.textContent = textContent;
    return element;
  }

  /**
   * Returns a date in the format DAY MM/DD HH:MM TT.
   * @param {String} dueDate - the due date of the task.
   * @returns {String} a better formatted date.
   */
  function getDate(dueDate) {
    let date = new Date(dueDate.replace(" ", "T"));
    let day = date.getDay();
    let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    day = days[day];
    dueDate = dueDate.substring(dueDate.indexOf("-") + 1);
    let hours = Number.parseInt(dueDate.split(" ")[1].substring(0, 2));
    let newHours = ((hours + 11) % 12 + 1);
    dueDate = dueDate.replace(" " + hours.toString(), " " + newHours.toString());
    if ((newHours === hours && hours !== 12) || hours === 0) {
      dueDate += " AM";
    } else {
      dueDate += " PM";
    }
    dueDate = day + " " + dueDate;
    return dueDate;
  }

  /**
   * Submits the task to the database.
   */
  function submitTask() {
    let isLecture = id("submit-task-btn").textContent !== "Add Task";
    let name = id("task-name").value;
    let taskClass = id("task-class").value;
    let dueDate = id("due-date").value.replace("T", " ");
    let selected = qsa(".selected");
    let days = [];
    for (let i = 0; i < selected.length; i++) {
      days.push(selected[i].textContent);
    }
    if (name !== "" && dueDate !== "") {
      let data = new FormData();
      data.append("name", name);
      data.append("class", taskClass);
      data.append("dueDate", dueDate);
      data.append("days", days);
      if (isLecture) {
        data.append("table", "lectures");
      } else {
        data.append("table", "tasks");
      }
      let url = "/add/task";
      fetch(url, {method: "POST", body: data})
        .then(statusCheck)
        .then(function() {
          switchViews("home-view", this);
        })
        .catch(handleError);
    }
  }

  /**
   * Submits the class to the database.
   */
  function submitClass() {
    let name = id("class-name").value;
    let color = id("color").value;
    let endDate = id("end-date").value;
    if (name !== "") {
      let data = new FormData();
      data.append("name", name);
      data.append("color", color);
      data.append("endDate", endDate);
      let url = "/add/class";
      fetch(url, {method: "POST", body: data})
        .then(statusCheck)
        .then(function() {
          switchViews("class-view", this);
        })
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
    id("add-lecture-btn").addEventListener("click", function() {
      switchViews("add-task-view", this)
    });
  }

  /**
   * Switches to the view corresponding to the button clicked.
   */
  function switchViewsClicked() {
    let view = this.id.replace("btn", "view");
    switchViews(view, this);
  }

  /**
   * Shows the given view and hides all other views.
   * @param {String} viewId - the id of the view to be switched to.
   * @param {HTMLButtonElement} el - the button clicked to bring the user here.
   */
  function switchViews(viewId, el) {
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
    } else if (viewId === "home-view") {
      requestTasks();
      requestLectures();
    }

    if (el && el.id === "add-lecture-btn") {
      id("submit-task-btn").textContent = "Add Lecture";
    } else if (el && el.id === "add-task-btn") {
      id("submit-task-btn").textContent = "Add Task";
    }
  }

  /**
   * Handles any errors that may occur by displaying a useful message to the user.
   * @param {Error} err - the error that occured while trying to fetch data.
   */
  function handleError(err) {
    switchViews("error-view", this);
    for (let i = 0; i < VIEWS.length - 1; i++) {
      let button = VIEWS[i].replace("view", "btn");
      id(button).disabled = true;
    }

    let message = qs("#error-view h3");
    message.textContent = "Details: ";
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
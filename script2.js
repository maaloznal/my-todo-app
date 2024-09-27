document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.querySelector("#addbtn");
  const input = document.querySelector("#input");
  const newTask = document.querySelector("#newtask");
  let ol = document.querySelector("#newtask ol");
  const viewDeletedBtn = document.querySelector("#viewDeletedBtn");
  const restoreDeletedBtn = document.querySelector("#restoreDeletedBtn");
  const deletedTasksList = document.querySelector("#deletedTasksList");

  if (!ol) {
    ol = document.createElement("ol");
    ol.className = "list";
    newTask.appendChild(ol);
  }
  const taskData = {
    tasks: [],
    completedTasks: [],
    deletedTasks: [],
  };
  let isDeletedTasksVisible = false;
  addBtn.addEventListener("click", addTask);
  viewDeletedBtn.addEventListener("click", toggleDeletedTasksVisibility);
  restoreDeletedBtn.addEventListener("click", restoreDeletedTasks);
  input.focus();
  loadTasksFromLocalStorage();
  function addTask() {
    const todoName = input.value.trim();

    if (todoName) {
      const task = createTaskElement(todoName);
      const todo = createTodoObject(todoName);
      taskData.tasks.push(todo);
      console.log("Tasks:", taskData.tasks);
      input.value = "";
      ol.appendChild(task);
      saveTasksToLocalStorage();
    } else {
      alert("Название задачи не может быть пустым");
    }
  }
  function createTaskElement(todoName) {
    const task = document.createElement("li");
    task.className = "item";
    const box = document.createElement("input");
    box.type = "checkbox";
    box.className = "checkbox";
    const taskText = document.createElement("span");
    taskText.textContent = todoName;
    box.addEventListener("change", () =>
      handleCheckboxChange(todoName, box, taskText)
    );
    task.appendChild(box);
    task.appendChild(taskText);
    const deleteBtn = createDeleteButton(todoName, task);
    task.appendChild(deleteBtn);
    return task;
  }
  function createTodoObject(todoName) {
    return {
      name: todoName,
      completed: false,
    };
  }
  function createDeleteButton(todoName, task) {
    const deleteBtn = document.createElement("span");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Удалить";
    deleteBtn.addEventListener("click", () => handleDeleteTask(todoName, task));
    return deleteBtn;
  }
  function handleCheckboxChange(todoName, box, taskText) {
    const taskIndex = taskData.tasks.findIndex(
      (task) => task.name === todoName
    );
    const completedTaskIndex = taskData.completedTasks.findIndex(
      (task) => task.name === todoName
    );
    if (box.checked) {
      if (taskIndex !== -1) {
        const taskObj = taskData.tasks[taskIndex];
        taskObj.completed = true;
        taskData.completedTasks.push(taskObj);
        taskData.tasks.splice(taskIndex, 1);
        taskText.classList.add("completed");
      }
    } else {
      if (completedTaskIndex !== -1) {
        const taskObj = taskData.completedTasks[completedTaskIndex];
        taskObj.completed = false;
        taskData.tasks.push(taskObj);
        taskData.completedTasks.splice(completedTaskIndex, 1);
        taskText.classList.remove("completed");
      }
    }
    saveTasksToLocalStorage();
    console.log("Весь список:", taskData);
    console.log("Не выполненные задачи:", taskData.tasks);
    console.log("Выполненные задачи:", taskData.completedTasks);
    console.log("Удаленные задачи:", taskData.deletedTasks);
  }
  function handleDeleteTask(todoName, task) {
    const taskIndex = taskData.tasks.findIndex(
      (task) => task.name === todoName
    );
    const completedTaskIndex = taskData.completedTasks.findIndex(
      (task) => task.name === todoName
    );
    let taskObj;
    if (taskIndex !== -1) {
      taskObj = taskData.tasks[taskIndex];
      taskData.tasks.splice(taskIndex, 1);
    } else if (completedTaskIndex !== -1) {
      taskObj = taskData.completedTasks[completedTaskIndex];
      taskData.completedTasks.splice(completedTaskIndex, 1);
    }
    if (taskObj) {
      taskData.deletedTasks.push(taskObj);
    }
    task.remove();
    saveTasksToLocalStorage();
    console.log("Весь список:", taskData);
    console.log("Не выполненные задачи:", taskData.tasks);
    console.log("Выполненные задачи:", taskData.completedTasks);
    console.log("Удаленные задачи:", taskData.deletedTasks);
  }
  function toggleDeletedTasksVisibility() {
    if (taskData.deletedTasks.length === -1) {
      alert("Нет удаленных задач");
      return;
    }
    if (isDeletedTasksVisible) {
      ol.style.display = "block";
      deletedTasksList.style.display = "none";
      viewDeletedBtn.textContent = "Просмотреть удаленные задачи";
      restoreDeletedBtn.style.display = "none";
    } else {
      ol.style.display = "none";
      deletedTasksList.innerHTML = "";
      const ul = document.createElement("ul");
      taskData.deletedTasks.forEach((task) => {
        const li = document.createElement("li");
        li.className = "item";
        const box = document.createElement("input");
        box.type = "checkbox";
        box.className = "checkbox";
        box.disabled = true;
        box.checked = task.completed;
        const taskText = document.createElement("span");
        taskText.textContent = task.name;
        if (task.completed) {
          taskText.classList.add("completed");
        }
        li.appendChild(box);
        li.appendChild(taskText);
        ul.appendChild(li);
      });
      deletedTasksList.appendChild(ul);
      deletedTasksList.style.display = "block";
      viewDeletedBtn.textContent = "Скрыть удаленные задачи";
      restoreDeletedBtn.style.display = "inline-block";
    }
    isDeletedTasksVisible = !isDeletedTasksVisible;
  }
  function restoreDeletedTasks() {
    const uncompletedTasks = taskData.deletedTasks.filter(
      (task) => !task.completed
    );
    if (uncompletedTasks.length === -1) {
      alert("Нет невыполненных задач для восстановления");
      return;
    }
    uncompletedTasks.forEach((task) => {
      taskData.tasks.push(task);
      const taskElement = createTaskElement(task.name);
      ol.appendChild(taskElement);
    });
    taskData.deletedTasks = taskData.deletedTasks.filter(
      (task) => task.completed
    );
    toggleDeletedTasksVisibility();
    saveTasksToLocalStorage();
    console.log("Весь список:", taskData);
    console.log("Не выполненные задачи:", taskData.tasks);
    console.log("Выполненные задачи:", taskData.completedTasks);
    console.log("Удаленные задачи:", taskData.deletedTasks);
  }
  function saveTasksToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(taskData.tasks));
    localStorage.setItem(
      "completedTasks",
      JSON.stringify(taskData.completedTasks)
    );
    localStorage.setItem("deletedTasks", JSON.stringify(taskData.deletedTasks));
  }
  function loadTasksFromLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const completedTasks =
      JSON.parse(localStorage.getItem("completedTasks")) || [];
    const deletedTasks = JSON.parse(localStorage.getItem("deletedTasks")) || [];
    taskData.tasks = tasks;
    taskData.completedTasks = completedTasks;
    taskData.deletedTasks = deletedTasks;
    taskData.tasks.forEach((task) => {
      const taskElement = createTaskElement(task.name);
      ol.appendChild(taskElement);
    });
    taskData.completedTasks.forEach((task) => {
      const taskElement = createTaskElement(task.name);
      const box = taskElement.querySelector(".checkbox");
      const taskText = taskElement.querySelector("span");
      box.checked = true;
      taskText.classList.add("completed");
      ol.appendChild(taskElement);
    });
  }
});

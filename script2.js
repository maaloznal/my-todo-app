document.addEventListener("DOMContentLoaded", function() {
  let input = document.querySelector("#input");
  let addBtn = document.querySelector("#addbtn");
  let viewDeletedBtn = document.querySelector("#viewDeletedBtn");
  let restoreDeletedBtn = document.querySelector("#restoreDeletedBtn");
  let ol = document.querySelector("#newtask");
  let deletedTasksList = document.querySelector("#deletedTasksList");

  let allTasks = {
    activeTasks: [],
    completedTasks: [],
    deletedTasks: [],
  };

  let isDeletedTasksVisible = false;

  addBtn.addEventListener("click", addTask);
  input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      addTask();
    }
  });
  viewDeletedBtn.addEventListener("click", toggleDeletedTasksVisibility);
  restoreDeletedBtn.addEventListener("click", restoreDeletedTasks);

  input.focus();
  loadTasksFromLocalStorage();

  function addTask() {
    const todoName = input.value.trim();

    if (todoName !== "") {
      const task = createTaskElement(todoName);
      const todo = createTodoObject(todoName);
      allTasks.activeTasks.push(todo);
      input.value = "";
      ol.appendChild(task);
      saveTasksToLocalStorage();
      console.log("Задача добавлена в активные:", todo);
      console.log("Все задачи:", allTasks);
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

    box.addEventListener("change", () => handleCheckboxChange(todoName, box, taskText));

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
    const taskIndex = allTasks.activeTasks.findIndex(task => task.name === todoName);
    const completedTaskIndex = allTasks.completedTasks.findIndex(task => task.name === todoName);

    if (box.checked) {
      if (taskIndex !== -1) {
        const taskObj = allTasks.activeTasks[taskIndex];
        taskObj.completed = true;
        allTasks.completedTasks.push(taskObj);
        allTasks.activeTasks.splice(taskIndex, 1);
        taskText.classList.add("completed");
        console.log("Задача перемещена в завершенные:", taskObj);
        console.log("Все задачи:", allTasks);
      }
    } else {
      if (completedTaskIndex !== -1) {
        const taskObj = allTasks.completedTasks[completedTaskIndex];
        taskObj.completed = false;
        allTasks.activeTasks.push(taskObj);
        allTasks.completedTasks.splice(completedTaskIndex, 1);
        taskText.classList.remove("completed");
        console.log("Задача перемещена в активные:", taskObj);
        console.log("Все задачи:", allTasks);
      }
    }
    saveTasksToLocalStorage();
  }

  function handleDeleteTask(todoName, task) {
    const taskIndex = allTasks.activeTasks.findIndex(task => task.name === todoName);
    const completedTaskIndex = allTasks.completedTasks.findIndex(task => task.name === todoName);

    let taskObj;

    if (taskIndex !== -1) {
      taskObj = allTasks.activeTasks[taskIndex];
      allTasks.activeTasks.splice(taskIndex, 1);
    } else if (completedTaskIndex !== -1) {
      taskObj = allTasks.completedTasks[completedTaskIndex];
      allTasks.completedTasks.splice(completedTaskIndex, 1);
    }

    if (taskObj) {
      allTasks.deletedTasks.push(taskObj);
      console.log("Задача удалена и перемещена в удаленные:", taskObj);
      console.log("Все задачи:", allTasks);
    }

    task.remove();
    saveTasksToLocalStorage();
  }

  function toggleDeletedTasksVisibility() {
    if (allTasks.deletedTasks.length === -1) {
      alert("Нет удаленых задач");
      return;
    }

    if (isDeletedTasksVisible) {
      ol.style.display = "block";
      deletedTasksList.style.display = "none";
      viewDeletedBtn.textContent = "Просмотреть удаленые задачи";
      restoreDeletedBtn.style.display = "none";
    } else {
      ol.style.display = "none";
      deletedTasksList.innerHTML = "";
      const deletedTasksOl = document.createElement("ol");

      allTasks.deletedTasks.forEach(task => {
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
        deletedTasksOl.appendChild(li);
      });

      deletedTasksList.appendChild(deletedTasksOl);
      deletedTasksList.style.display = "block";
      viewDeletedBtn.textContent = "Скрыть удаленые задачи";
      restoreDeletedBtn.style.display = "inline-block";
    }

    isDeletedTasksVisible = !isDeletedTasksVisible;
  }

  function restoreDeletedTasks() {
    const uncompletedTasks = allTasks.deletedTasks.filter(task => !task.completed);

    if (uncompletedTasks.length === 0) {
      alert("Нет невыполненных задач для восстановления");
      return;
    }

    uncompletedTasks.forEach(task => {
      allTasks.activeTasks.push(task);
      const taskElement = createTaskElement(task.name);
      ol.appendChild(taskElement);
      console.log("Задача восстановлена и перемещена в активные:", task);
    });

    allTasks.deletedTasks = allTasks.deletedTasks.filter(task => task.completed);
    console.log("Все задачи после восстановления:", allTasks);
    toggleDeletedTasksVisibility();
    saveTasksToLocalStorage();
  }

  function saveTasksToLocalStorage() {
    localStorage.setItem("activeTasks", JSON.stringify(allTasks.activeTasks));
    localStorage.setItem("completedTasks", JSON.stringify(allTasks.completedTasks));
    localStorage.setItem("deletedTasks", JSON.stringify(allTasks.deletedTasks));
  }

  function loadTasksFromLocalStorage() {
    const activeTasks = JSON.parse(localStorage.getItem("activeTasks")) || [];
    const completedTasks = JSON.parse(localStorage.getItem("completedTasks")) || [];
    const deletedTasks = JSON.parse(localStorage.getItem("deletedTasks")) || [];
    allTasks.activeTasks = activeTasks;
    allTasks.completedTasks = completedTasks;
    allTasks.deletedTasks = deletedTasks;

    allTasks.completedTasks.forEach(task => {
      const taskElement = createTaskElement(task.name);
      const box = taskElement.querySelector("input");
      box.checked = true;
      const taskText = taskElement.querySelector("span");
      taskText.classList.add("completed");
      ol.appendChild(taskElement);
    });

    console.log("Задачи загружены из localStorage:", allTasks);
  }
});
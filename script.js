document.addEventListener("DOMContentLoaded", () => {
    loadTasks(); // Cargar tareas desde localStorage
    setupAddTaskButtons(); // Configurar botones dinámicos
    setupDragAndDrop(); // Configurar funcionalidad de arrastrar y soltar
  });
  
  // Límite de tareas en progreso
  const WIP_LIMIT = 3;
  
  // Función para configurar los botones "Añadir Tarea"
  function setupAddTaskButtons() {
    document.querySelectorAll(".column").forEach((column) => {
      const columnFooter = column.querySelector(".column-footer");
      if (!columnFooter) {
        const footer = document.createElement("div");
        footer.className = "column-footer";
  
        // Botón "Añadir Tarea"
        const addButton = document.createElement("button");
        addButton.textContent = "+ Añadir Tarea";
        addButton.className = "add-task-button";
        addButton.onclick = () => addTaskField(addButton);
  
        footer.appendChild(addButton); // Añadir el botón al pie de la columna
        column.appendChild(footer); // Añadir el pie de columna al DOM
      }
    });
  }
  
  // Función para añadir un campo de entrada debajo del botón
  function addTaskField(addButton) {
    const columnFooter = addButton.parentElement;
  
    // Evitar que se generen múltiples campos de entrada
    if (columnFooter.querySelector(".task-input-wrapper")) return;
  
    const inputWrapper = document.createElement("div");
    inputWrapper.className = "task-input-wrapper";
  
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.placeholder = "Escribe la tarea...";
    inputField.className = "task-input";
  
    const saveButton = document.createElement("button");
    saveButton.textContent = "Guardar";
    saveButton.className = "save-task-button";
  
    // Al hacer clic en "Guardar", se añade la tarea
    saveButton.addEventListener("click", () => {
      const column = columnFooter.parentElement.querySelector(".tasks");
      if (inputField.value.trim() !== "") {
        const task = createTaskElement(inputField.value.trim());
        column.appendChild(task);
        saveTasks();
      }
      inputWrapper.remove(); // Eliminar el campo de entrada
    });
  
    // Presionar Enter para guardar
    inputField.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && inputField.value.trim() !== "") {
        const column = columnFooter.parentElement.querySelector(".tasks");
        const task = createTaskElement(inputField.value.trim());
        column.appendChild(task);
        saveTasks();
        inputWrapper.remove(); // Eliminar el campo de entrada
      }
    });
  
    inputWrapper.appendChild(inputField);
    inputWrapper.appendChild(saveButton);

    columnFooter.appendChild(inputWrapper); // Añadir el campo debajo del botón
    inputField.focus(); // Colocar el cursor automáticamente en el campo
  }
  
  // Función para crear un elemento de tarea
  function createTaskElement(taskText) {
    const task = document.createElement("div");
    task.className = "task";
    task.draggable = true;
    task.innerHTML = `
      <span>${taskText}</span>
      <button class="remove-task" title="Quitar Tarea">-</button>
    `;
    task.querySelector(".remove-task").addEventListener("click", () => {
      task.remove();
      saveTasks();
    });
    return task;
  }
  
  // Función para guardar tareas en localStorage
  function saveTasks() {
    const tasks = {};
    document.querySelectorAll(".column").forEach((column) => {
      const columnId = column.id;
      const columnTasks = Array.from(column.querySelectorAll(".task span")).map((task) => task.textContent.trim());
      tasks[columnId] = columnTasks;
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  
  // Función para cargar tareas desde localStorage
  function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (savedTasks) {
      Object.entries(savedTasks).forEach(([columnId, tasks]) => {
        const column = document.querySelector(`#${columnId} .tasks`);
        tasks.forEach((taskText) => {
          column.appendChild(createTaskElement(taskText));
        });
      });
    }
  }
  
  // Configurar funcionalidad de arrastrar y soltar
  function setupDragAndDrop() {
    let draggedTask = null;
    document.querySelectorAll(".tasks").forEach((column) => {
      column.addEventListener("dragover", (e) => e.preventDefault());
      column.addEventListener("drop", (e) => {
        if (draggedTask) {
          if (e.target.closest("#in-progress") && !canAddToInProgress()) {
            alert("No puedes añadir más tareas en progreso. Completa alguna primero.");
          } else {
            column.appendChild(draggedTask);
            saveTasks();
          }
          draggedTask = null;
        }
      });
    });
  
    document.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("task")) {
        draggedTask = e.target;
      }
    });
  
    document.addEventListener("dragend", () => {
      draggedTask = null;
    });
  }
  
  // Validar límite de tareas en progreso
  function canAddToInProgress() {
    const inProgressColumn = document.querySelector("#in-progress .tasks");
    return inProgressColumn.children.length < WIP_LIMIT;
  }
  
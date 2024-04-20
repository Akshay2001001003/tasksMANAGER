document.addEventListener("DOMContentLoaded", async function () {
    // Get the current date
    let currentDate = new Date();
  
    // Function to set the dates for the current week
    async function setCurrentWeekDates() {
      try {
        const firstDayOfWeek = new Date(currentDate);
        firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Adjust to Sunday
  
        const dates = document.querySelectorAll(".main .d");
        for (let index = 0; index < dates.length; index++) {
          const dateDiv = dates[index];
          const date = new Date(firstDayOfWeek);
          date.setDate(firstDayOfWeek.getDate() + index);
          dateDiv.textContent = date.getDate();
        }
        setMonthAndYear();
        await displayTasksForCurrentWeek();
      } catch (error) {
        console.error("Error setting current week dates:", error);
      }
    }
  
    // Function to display tasks for the current week
    async function displayTasksForCurrentWeek() {
      const dates = document.querySelectorAll(".main .d");
      for (let index = 0; index < dates.length; index++) {
        const dateDiv = dates[index];
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - currentDate.getDay() + index);
        await displayTasks(formatDate(date), dateDiv);
      }
    }
  
    // Call the function to set current week dates and display tasks
    setCurrentWeekDates();

  // Function to delete a task
  async function displayTasks(date, dateDiv) {
    try {
        // Fetch tasks once
        const response = await fetch(`http://localhost:3000/tasks`);
        const allTasks = await response.json();

        console.log("All tasks:", allTasks); // Debugging statement

        const taskContainer = document.createElement("div");
        // Filter tasks based on the date
        const tasksForDate = allTasks.filter(task => formatDate(new Date(task.date)) === date);

        console.log("Tasks for date", date, ":", tasksForDate); // Debugging statement

        tasksForDate.forEach(task => {
            const taskList = document.createElement("div");
            taskList.classList.add("task-list");
            taskList.classList.add("dragable");
            taskList.classList.add("dropable");
            
            const taskElement = document.createElement("div");
            taskElement.textContent = task.title;
            taskElement.draggable = true; // Make the task element draggable

            // Apply strike-through style if task is completed
            if (task.status) {
                taskElement.style.textDecoration = "line-through";
            }

            const statusElement = document.createElement("span");
            statusElement.textContent = "ongoing";

            const deleteButton = document.createElement("button");
            deleteButton.innerHTML = '<img class="img" src="./bin.jpg"></img>';

            deleteButton.addEventListener("click", async () => {
                try {
                    await deleteTask(task.id);
                    taskList.remove(); // Remove the task container from the DOM
                } catch (error) {
                    console.error("Error deleting task:", error);
                }
            });
            if (!task.status) {
                taskElement.appendChild(statusElement);
            }

            // Only create and append checkbox if status is not true
            if (!task.status) {
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = task.status;
                checkbox.addEventListener("change", async () => {
                    try {
                        await updateTaskCompletion(task.id, checkbox.checked);
                    } catch (error) {
                        console.error("Error updating task completion:", error);
                    }
                });
                taskElement.appendChild(checkbox);
            }
                taskElement.appendChild(deleteButton);

            taskList.appendChild(taskElement);
            taskContainer.appendChild(taskList);
        });

        // Add event listeners for drag-and-drop functionality
        taskContainer.addEventListener("dragstart", dragStart);
        taskContainer.addEventListener("dragover", dragOver);
        taskContainer.addEventListener("drop", drop);

        dateDiv.appendChild(taskContainer);
    } catch (error) {
        console.error("Error displaying tasks:", error);
    }
}

const draggableElements = document.querySelectorAll(".draggable");

draggableElements.forEach(element => {
    element.addEventListener("dragstart", dragStart);
});

const droppableElements = document.querySelectorAll(".droppable");

droppableElements.forEach(element => {
    element.addEventListener("dragover", dragOver);
    element.addEventListener("drop", drop);
});

// Drag and drop event handlers
function dragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
    event.dataTransfer.setData("date", event.target.dataset.date);
}

function dragOver(event) {
    event.preventDefault();
}

async function drop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain");
    const taskDate = event.dataTransfer.getData("date");
    const targetDate = event.target.closest(".d").textContent;

    // Update task date in the database
    try {
        const response = await fetch(`http://localhost:3000/tasks/${taskId}/${taskDate}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ date: targetDate }),
        });

        if (!response.ok) {
            throw new Error("Failed to update task date");
        }

        // If the update is successful, move the task to the new date in the UI
        const taskElement = document.getElementById(taskId);
        const targetContainer = event.target.closest(".main").querySelector(`.d[data-date="${targetDate}"] .task-container`);
        targetContainer.appendChild(taskElement);
    } catch (error) {
        console.error("Error updating task date:", error);
    }
}




  async function updateTaskCompletion(taskId, completed) {
    try {
      const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
        
      });
      location.reload();
      if (!response.ok) {
        throw new Error("Failed to update task completion");
      }
    } catch (error) {
      throw error;
    }
  }

  async function deleteTask(taskId) {
    try {
      const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "DELETE",
      });
      location.reload();
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
    } catch (error) {
      throw error;
    }
  }

  // Function to format date as "YYYY-MM-DD" (to match task dates)
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Function to set the month and year
  function setMonthAndYear() {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const yearDiv = document.querySelector(".year");
    const monthDiv = document.querySelector(".month");

    const year = currentDate.getFullYear();
    const monthIndex = currentDate.getMonth();
    const monthName = monthNames[monthIndex];

    if (yearDiv && monthDiv) {
      yearDiv.textContent = year;
      monthDiv.textContent = monthName;
    } else {
      console.error("Year and/or month element not found.");
    }
  }

  // Function to navigate to the previous week
  function navigatePreviousWeek() {
    currentDate.setDate(currentDate.getDate() - 7);
    setCurrentWeekDates();
  }

  // Function to navigate to the next week
  function navigateNextWeek() {
    currentDate.setDate(currentDate.getDate() + 7);
    setCurrentWeekDates();
  }

  // Add event listeners to the previous and next buttons
  document
    .querySelector(".prev button")
    .addEventListener("click", navigatePreviousWeek);
  document
    .querySelector(".next button")
    .addEventListener("click", navigateNextWeek);
});

document.addEventListener("DOMContentLoaded", function () {
  // Get the popup
  const popup = document.getElementById("addTaskPopup");

  // Get the button that opens the popup
  const addTaskBtn = document.querySelector(".addTask");

  // Get the <span> element that closes the popup
  const closePopupBtn = document.querySelector(".close-popup");

  // When the user clicks the button, open the popup
  addTaskBtn.addEventListener("click", function () {
    popup.style.display = "block";
  });

  // When the user clicks on <span> (x), close the popup
  closePopupBtn.addEventListener("click", function () {
    popup.style.display = "none";
  });

  // When the user clicks anywhere outside of the popup, close it
  window.addEventListener("click", function (event) {
    if (event.target === popup) {
      popup.style.display = "none";
    }
  });

  // Function to handle adding task
  document
    .getElementById("submitTask")
    .addEventListener("click", async function () {
      const taskTitle = document.getElementById("taskTitle").value.trim();
      const taskDescription = document
        .getElementById("taskDescription")
        .value.trim();
      const taskDate = document.getElementById("taskDate").value;

      if (taskTitle !== "" && taskDate !== "") {
        // Create a task object
        const taskData = {
          title: taskTitle,
          description: taskDescription,
          date: taskDate,
        };

        // Send task data to the server to insert into the database
        const data = await fetch("http://localhost:3000/insertTask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*",
            mode: "cors",
          },
          body: JSON.stringify(taskData),
        })
          .then((response) => {
            if (response.ok) {
              // Close the popup
              popup.style.display = "none";
              // Refresh the page to reflect the changes (you can update the UI without refreshing)
              location.reload();
            } else {
              throw new Error("Failed to insert task into the database.");
            }
          })
          .catch((error) => {
            console.error(error.message);
            alert("Failed to add task. Please try again later.");
          });
      } else {
        alert("Task title and date cannot be empty.");
      }
    });
});

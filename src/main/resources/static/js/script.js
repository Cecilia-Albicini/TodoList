const taskAdd = document.getElementById("button-add");
const taskContent = document.getElementById("task-content");
const tasksList = document.getElementById("tasks-list");
const buttonRemove = document.getElementById("button-remove");
const taskCategory = document.getElementById("categories-list");
const spanDoneCounter = document.getElementById("done-counter");
let counter = 0;
let doneCounter = 0;

const HTTP_RESPONSE_SUCCESS = 200;
const REST_API_ENDPOINT = 'http://localhost:8080';

function updateCategoriesList() {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = function () {
        let categoriesDB = JSON.parse(ajaxRequest.response);

        categoriesDB.forEach(elem => {
            let option = document.createElement("option");
            option.innerText = elem.name;
            option.value = elem.id;
            option.setAttribute("data-color", elem.color);
            taskCategory.appendChild(option);
        });
    }
    ajaxRequest.open("GET", REST_API_ENDPOINT + "/categories/");
    ajaxRequest.send();
}

updateCategoriesList();

function createTask(task) {
    let newTaskLine = document.createElement("span");
    newTaskLine.setAttribute("class", "task");
    if (task.category) {
        newTaskLine.classList.add(task.category.color);
    }

    let doneCheck = document.createElement("input");
    doneCheck.setAttribute("type", "checkbox");
    doneCheck.classList.add("checkbox");

    doneCheck.addEventListener("click", function () {
        task.done = !task.done;
        let taskContent = {
            done: task.done
        };
        setDone(task.id, taskContent, () => {
            newTaskLine.classList.toggle("task-done");
            spanDoneCounter.innerHTML = task.done ? ++doneCounter : --doneCounter;
            penIcon.style.visibility = task.done ? "hidden" : "visible";
        });
    });

    taskContent.value = "";

    if (task.done) {
        doneCounter++;
        newTaskLine.classList.add("task-done");
        doneCheck.checked = true;
    }
    counter++;
    spanDoneCounter.innerHTML = doneCounter;

    newTaskLine.appendChild(doneCheck);
    let nameSpan = document.createElement("span");
    nameSpan.innerText = task.name;
    newTaskLine.appendChild(nameSpan);
    let dateSpan = document.createElement("div");
    dateSpan.setAttribute("class", "date");
    let today = new Date();
    let month = today.getMonth() + 1;
    let year = today.getFullYear();
    let date = today.getDate();
    let currentDate = `${month}/${date}/${year}`;

    dateSpan.innerText = currentDate;
    newTaskLine.appendChild(dateSpan);


    let penIcon = document.createElement("button");
    penIcon.style.visibility = task.done ? "hidden" : "visible";
    penIcon.setAttribute("class", "pen");
    penIcon.innerHTML = '<i class="fas fa-edit"></i>';
    newTaskLine.appendChild(penIcon);


    penIcon.addEventListener("click", function () {
        let newInput = document.createElement("input");
        newInput.setAttribute("id", "edit-input-" + task.id);
        if (newTaskLine.classList.contains("editing")) {
            let editInput = document.getElementById("edit-input-" + task.id);
            console.log(editInput);
            let taskContent = {
                name: editInput.value
            };
            updateTask(task.id, taskContent, () => {
                task.name = editInput.value;
                nameSpan.innerText = task.name;
                editInput.replaceWith(nameSpan);
                penIcon.innerHTML = '<i class="fas fa-edit"></i>';
                newTaskLine.classList.remove("editing");

                doneCheck.style.visibility = "visible";
            });

        } else {
            newInput.value = task.name;
            nameSpan.replaceWith(newInput);
            penIcon.innerHTML = '<i class="fas fa-save"></i>';
            newTaskLine.classList.add("editing");
            doneCheck.style.visibility = "hidden";
        }
    });

    let trashSpan = document.createElement("span");
    trashSpan.innerHTML = '<i class="fas fa-trash"></i>';
    trashSpan.setAttribute("class", "trash");
    trashSpan.addEventListener("click", function () {

        deleteTask(task.id, () => {
            newTaskLine.remove();
            if (task.done) {
                spanDoneCounter.innerHTML = --doneCounter;
            }
        });
    });

    tasksList.appendChild(newTaskLine);
    newTaskLine.appendChild(trashSpan);
}

function updateTasksList() {

    tasksList.innerHTML = "";

    let ajaxRequest = new XMLHttpRequest();

    ajaxRequest.onload = function () {
        let tasks = JSON.parse(ajaxRequest.response);
        for (let task of tasks) {
            createTask(task);
        }
    }

    ajaxRequest.open("GET", REST_API_ENDPOINT + "/tasks/");
    ajaxRequest.send();
}

function saveTask(taskToSave) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        let savedTask = JSON.parse(ajaxRequest.response);
        createTask(savedTask);
    }

    ajaxRequest.open("POST", REST_API_ENDPOINT + "/tasks/add");
    ajaxRequest.setRequestHeader("content-type", "application/json");
    let body = {
        name: taskToSave.name,
        category: {
            id: taskToSave.categoryId,
            created: new Date()
        }
    };
    ajaxRequest.send(JSON.stringify(body));
}

function updateTask(taskId, taskContent, successfulCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.status == HTTP_RESPONSE_SUCCESS) {
            successfulCallback();
        }
    }

    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId);
    ajaxRequest.setRequestHeader("content-type", "application/json");
    ajaxRequest.send(JSON.stringify(taskContent));
}

function setDone(taskId, taskContent, successfulCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.status == HTTP_RESPONSE_SUCCESS) {
            successfulCallback();
        }
    }

    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId + "/set-done");
    ajaxRequest.setRequestHeader("content-type", "application/json");
    ajaxRequest.send(JSON.stringify(taskContent));
}

updateTasksList();

function deleteTask(taskId, successfulCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.response == "ok") {
            successfulCallback();
            counter--;
            spanDoneCounter.innerHTML = doneCounter;
        }
    }

    ajaxRequest.open("DELETE", REST_API_ENDPOINT + "/tasks/" + taskId);
    ajaxRequest.send();
}

function deleteAllTasks(successfulCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.response == "ok!") {
            successfulCallback();
            spanDoneCounter.innerHTML = 0;
            doneCounter = 0;
        }
    }

    ajaxRequest.open("DELETE", REST_API_ENDPOINT + "/tasks/delete-all");
    ajaxRequest.send();
}

taskAdd.addEventListener("click", function () {

    let taskContentValue = taskContent.value;
    if (taskContentValue == "") {
        alert("write something!");
        return;
    }

    console.log(taskCategory.options[taskCategory.selectedIndex].dataset.color);
    console.log(taskCategory.selectedIndex);
    let task = {
        name: taskContentValue,
        categoryId: taskCategory.value
    };

    saveTask(task);
});

/* add a task on Enter keypress */
taskContent.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        
        if (taskContent.value == "") {
        alert("write something!");
        return;
    }

    let task = {
        name: taskContent.value,
        categoryId: taskCategory.value
    };

    saveTask(task);
    }
});


buttonRemove.addEventListener("click", function () {

    deleteAllTasks(() => {
        tasksList.innerHTML = "";
    });
});

function sendTaskToServer(taskContentValue, taskHtmlElement, done, remove, edit) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        console.log(ajaxRequest.response);
        if (ajaxRequest.response == "ok") {
            taskHtmlElement.classList.remove("unconfirmed");
            done.removeAttribute("disabled", "disabled");
            remove.removeAttribute("disabled", "disabled");
            edit.removeAttribute("disabled", "disabled");
        }
    };

    ajaxRequest.open("POST", "https://webhook.site/b2216fb0-2af7-4693-930e-f539626cf0cc");
    let body = {
        text: taskContentValue
    };
    ajaxRequest.send(JSON.stringify(body));
}
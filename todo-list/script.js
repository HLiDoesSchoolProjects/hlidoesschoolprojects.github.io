/* peak sht code demonstration presented to you by hlidoesschoolprojects™ */

const categorySwitcher = document.getElementsByClassName("category-switcher")[0];
const itemsCounter = document.getElementsByClassName("items-counter")[0];
const todosContainer = document.getElementsByClassName("todos-container")[0];
let todoItems;
let addCategoryButtons;
let deleteButtons;
const newTodoItem = document.getElementById("new-todo-item");
const todoItemTemplate = document.getElementById("todo-item-template");

// Get data or store empty template
let data = JSON.parse(localStorage.getItem("data"));
if (data === null) {
    data = {
        done: 0,
        todos: []
    };
    localStorage.setItem("data", JSON.stringify(data));
}

/** Helper to find a todo index from a parent element */
function getTodoIndex(parentElement) {
    const categories = [];
    for (const child of parentElement.children[1].children) {
        categories.push(child.innerHTML);
    }
    return data.todos.findIndex(todo => {
        return JSON.stringify(todo) == JSON.stringify({ description: parentElement.children[0].children[1].value, categories: categories });
    });
}

/** Helper to get first unmatch in todo data and DOM to use in input update */
function getFirstDescriptionUnmatch() {
    const todoItemParentElements = todosContainer.children;
    for (let i = 0; i < todoItemParentElements.length; i++) {
        if (data.todos[i].description != todoItemParentElements[i].children[0].children[1].value) {
            return i;
        }
    }
    return -1;
}

let selectedCategory = "All";
/** Select a category */
function selectCategory(switcherItem) {
    for (const categoryDiv of categorySwitcher.children) {
        if (categoryDiv.innerHTML === `<span>✓ </span>${selectedCategory}`) {
            categoryDiv.classList.remove("category-checked");
        }
    }
    selectedCategory = switcherItem.innerHTML.substring(15);
    switcherItem.classList.add("category-checked");

    todosContainer.innerHTML = "";
    for (let i = 0; i < data.todos.length; i++) {
        if (selectedCategory === "All") {
            addTodo(data.todos[i].description, data.todos[i].categories, false);
        } else if (selectedCategory === "Uncategorized") {
            if (data.todos[i].categories.length === 0) {
                addTodo(data.todos[i].description, data.todos[i].categories, false);
            }
        } else {
            for (const category of data.todos[i].categories) {
                if (category === selectedCategory) {
                    addTodo(data.todos[i].description, data.todos[i].categories, false);
                    break;
                }
            }           
        }
    }
}

/** Reconstruct the category switcher */
function reconstructCategorySwitcher() {
    categorySwitcher.innerHTML = "";
    const flattenedCategories = data.todos.map(todo => todo.categories).flat();
    const allCategories = flattenedCategories.filter((value, index, array) => array.indexOf(value) === index);
    allCategories.unshift("All", "Uncategorized");
    for (const category of allCategories) {
        const categoryDiv = document.createElement("div");
        categoryDiv.innerHTML = `<span>✓ </span>${category}`;
        categoryDiv.classList.add("category");
        categoryDiv.title = "Select Category";
        categoryDiv.addEventListener("click", event => {
            selectCategory(event.currentTarget, category);
        });
        categorySwitcher.appendChild(categoryDiv);
    }
    for (let i = 0; i < categorySwitcher.children.length; i++) {
        if (categorySwitcher.children[i].innerHTML === `<span>✓ </span>${selectedCategory}`) {
            categorySwitcher.children[i].classList.add("category-checked");
        }
    }
}

/** Remove a category */
function removeCategory(parentElement, category) {
    for (let i = 0; i < data.todos[getTodoIndex(parentElement)].categories.length; i++) {
        if (data.todos[getTodoIndex(parentElement)].categories[i] === category) {
            data.todos[getTodoIndex(parentElement)].categories.splice(i, 1);
            localStorage.setItem("data", JSON.stringify(data));
            break;
        }
    }
    for (const categoryDiv of parentElement.children[1].children) {
        if (categoryDiv.innerHTML === category) {
            categoryDiv.remove();
            break;
        }
    }
    reconstructCategorySwitcher();
}

/** Add to category */
function addToCategory(parentElement, category, save = true) {
    const categoryDiv = document.createElement("div");
    categoryDiv.innerHTML = category;
    categoryDiv.classList.add("category");
    categoryDiv.classList.add("category-small");
    categoryDiv.title = "Remove Category";
    categoryDiv.addEventListener("click", event => {
        removeCategory(parentElement, event.target.innerHTML);
    });
    if (save === true) {
        data.todos[getTodoIndex(parentElement)].categories.push(category);
        localStorage.setItem("data", JSON.stringify(data));
    }
    parentElement.children[1].appendChild(categoryDiv);
    reconstructCategorySwitcher();
}

/** Remove a todo */
function removeTodo(parentElement) {
    const index = getTodoIndex(parentElement);
    if (index !== -1) {
        data.todos.splice(index, 1);
        localStorage.setItem("data", JSON.stringify(data));
        parentElement.remove();
        reconstructCategorySwitcher();
    } else {
        console.warn("Item not found in data array!");
    }
}

/** Check off a todo */
function checkTodo(checkboxElement) {
    setTimeout(() => {
        if (checkboxElement.checked === true) {
            removeTodo(checkboxElement.parentElement.parentElement);
            data.done += 1;
            localStorage.setItem("data", JSON.stringify(data));
            itemsCounter.innerHTML = `Done: ${data.done}`;
            // TODO: move to done list instead
        }
    }, 20);
}

/** Add a todo */
function addTodo(description, categories = [], save = true) {
    const clone = todoItemTemplate.content.cloneNode(true);
    clone.children[0].children[0].children[0].addEventListener("click", event => {
        checkTodo(event.target);
    });
    clone.children[0].children[0].children[1].value = description;
    clone.children[0].children[0].children[1].addEventListener("input", event => {
        data.todos[getFirstDescriptionUnmatch()].description = event.target.value;
        localStorage.setItem("data", JSON.stringify(data));
    });
    clone.children[0].children[0].children[2].addEventListener("click", event => {
        const category = prompt("Category:");
        if (category !== null) {
            addToCategory(event.currentTarget.parentElement.parentElement, category);
        }
    });
    clone.children[0].children[0].children[3].addEventListener("click", event => {
        removeTodo(event.currentTarget.parentElement.parentElement);
    });
    for (const category of categories) {
        addToCategory(clone.children[0], category, false);
    }
    todosContainer.appendChild(clone);
    if (save === true) {
        data.todos.push({ description: description, categories: categories });
        localStorage.setItem("data", JSON.stringify(data));
    }
}

// Events to add a new todo
newTodoItem.addEventListener("focusout", () => {
    if (newTodoItem.children[0].children[1].value) {
        addTodo(newTodoItem.children[0].children[1].value);
        newTodoItem.children[0].children[1].value = "";
    }
});
newTodoItem.addEventListener("keypress", event => {
    if (event.key === "Enter" && newTodoItem.children[0].children[1].value) {
        addTodo(newTodoItem.children[0].children[1].value);
        newTodoItem.children[0].children[1].value = "";
        newTodoItem.children[0].children[1].focus();
    }
});

// Reconstruct todo list
itemsCounter.innerHTML = `Done: ${data.done}`;
reconstructCategorySwitcher();
for (let i = 0; i < data.todos.length; i++) {
    addTodo(data.todos[i].description, data.todos[i].categories, false);
}
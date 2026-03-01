addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "todo-app.tasks.v1";

    const form = document.querySelector('[data-js="todo-form"]');
    const newTaskInput = document.querySelector('[data-js="new-task"]');
    const pendingList = document.querySelector('[data-js="pending-list"]');
    const completedList = document.querySelector('[data-js="completed-list"]');
    const pendingCount = document.querySelector('[data-js="pending-count"]');
    const completedCount = document.querySelector('[data-js="completed-count"]');
    const pendingEmpty = document.querySelector('[data-js="pending-empty"]');
    const completedEmpty = document.querySelector('[data-js="completed-empty"]');

    const ICON_CHECK = `
        <svg xmlns="http://www.w3.org/2000/svg" width="31" height="30" fill="none" aria-hidden="true">
            <path fill="#9E78CF" d="m23.784 10.674-11 11a.688.688 0 0 1-.973 0L6.998 16.86a.688.688 0 1 1 .973-.972l4.326 4.327L22.811 9.7a.688.688 0 1 1 .973.973Z"/>
        </svg>
    `;
    const ICON_UNDO = `
        <svg xmlns="http://www.w3.org/2000/svg" width="31" height="30" fill="none" aria-hidden="true">
            <path fill="#78CFB0" d="M20.718 10.26a6.877 6.877 0 0 0-9.61-.397l-.412.369v-2.17a.688.688 0 0 0-1.375 0v3.437c0 .38.308.688.688.688h3.437a.688.688 0 1 0 0-1.375h-2.18l.446-.399a5.5 5.5 0 1 1-.243 8.004.688.688 0 1 0-1.004.94 6.875 6.875 0 1 0 10.254-9.097Z"/>
        </svg>
    `;
    const ICON_DELETE = `
        <svg xmlns="http://www.w3.org/2000/svg" width="31" height="30" fill="none" aria-hidden="true">
            <path fill="#9E78CF" d="M22.61 8.125H7.483a.688.688 0 1 0 0 1.375h.688v12.375a1.375 1.375 0 0 0 1.375 1.375h11a1.375 1.375 0 0 0 1.375-1.375V9.5h.687a.687.687 0 0 0 0-1.375Zm-2.063 13.75h-11V9.5h11v12.375ZM10.922 6.062a.687.687 0 0 1 .687-.687h6.875a.687.687 0 0 1 0 1.375H11.61a.687.687 0 0 1-.687-.688Z"/>
        </svg>
    `;
    const ICON_EDIT = `
        <svg xmlns="http://www.w3.org/2000/svg" width="31" height="30" fill="none" aria-hidden="true">
            <path fill="#9E78CF" d="M9.857 19.169a.69.69 0 0 0-.179.323l-.663 2.654a.688.688 0 0 0 .833.833l2.655-.663a.688.688 0 0 0 .322-.179l9.992-9.992a2.75 2.75 0 1 0-3.889-3.889l-9.07 9.07Zm9.863-9.94a1.375 1.375 0 1 1 1.944 1.944l-.487.487-1.944-1.944.487-.487Zm-1.46 1.46 1.944 1.944-8.551 8.55-1.409.352.352-1.408 7.664-7.665Z"/>
        </svg>
    `;

    let todos = loadTodos();
    let editingId = null;

    function loadTodos() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(parsed)) return [];

            return parsed
                .filter((todo) => todo && typeof todo.title === "string")
                .map((todo) => ({
                    id: String(todo.id || crypto.randomUUID()),
                    title: todo.title.trim(),
                    completed: Boolean(todo.completed),
                }))
                .filter((todo) => todo.title.length > 0);
        } catch {
            return [];
        }
    }

    function saveTodos() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }

    function render() {
        pendingList.innerHTML = "";
        completedList.innerHTML = "";

        const pending = todos.filter((todo) => !todo.completed);
        const completed = todos.filter((todo) => todo.completed);

        pending.forEach((todo) => pendingList.append(createTodoElement(todo)));
        completed.forEach((todo) => completedList.append(createTodoElement(todo)));

        pendingCount.textContent = String(pending.length);
        completedCount.textContent = String(completed.length);
        pendingEmpty.hidden = pending.length > 0;
        completedEmpty.hidden = completed.length > 0;

        if (editingId) {
            const editInput = document.querySelector('[data-js="edit-input"]');
            if (editInput) {
                requestAnimationFrame(() => {
                    editInput.focus();
                    editInput.select();
                });
            }
        }
    }

    function createTodoElement(todo) {
        const item = document.createElement("div");
        item.className = `todoItem ${todo.completed ? "completed" : "pending"}`;
        item.dataset.id = todo.id;

        const actions = document.createElement("div");
        actions.className = "todoActions";

        if (editingId === todo.id) {
            const editInput = document.createElement("input");
            editInput.className = "todoEditInput";
            editInput.type = "text";
            editInput.value = todo.title;
            editInput.dataset.js = "edit-input";
            editInput.setAttribute("aria-label", "Edit task title");
            item.append(editInput);

            const saveBtn = document.createElement("button");
            saveBtn.type = "button";
            saveBtn.dataset.action = "save-edit";
            saveBtn.setAttribute("aria-label", "Save edit");
            saveBtn.textContent = "Save";

            const cancelBtn = document.createElement("button");
            cancelBtn.type = "button";
            cancelBtn.dataset.action = "cancel-edit";
            cancelBtn.setAttribute("aria-label", "Cancel edit");
            cancelBtn.textContent = "Cancel";

            actions.append(saveBtn, cancelBtn);
            item.append(actions);
            return item;
        }

        const title = document.createElement("h3");
        title.textContent = todo.title;
        item.append(title);

        const toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.dataset.action = "toggle";
        toggleBtn.setAttribute(
            "aria-label",
            todo.completed ? "Mark task as pending" : "Mark task as completed"
        );
        toggleBtn.innerHTML = todo.completed ? ICON_UNDO : ICON_CHECK;

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.dataset.action = "edit";
        editBtn.setAttribute("aria-label", "Edit task");
        editBtn.innerHTML = ICON_EDIT;

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.dataset.action = "delete";
        deleteBtn.setAttribute("aria-label", "Delete task");
        deleteBtn.innerHTML = ICON_DELETE;

        actions.append(toggleBtn, editBtn, deleteBtn);
        item.append(actions);
        return item;
    }

    function addTask() {
        const title = newTaskInput.value.trim();
        if (!title) return;

        todos.unshift({
            id: crypto.randomUUID(),
            title,
            completed: false,
        });
        newTaskInput.value = "";
        newTaskInput.focus();
        saveTodos();
        render();
    }

    function handleListClick(event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const item = button.closest(".todoItem");
        if (!item) return;

        const todoId = item.dataset.id;
        const action = button.dataset.action;

        if (action === "edit") {
            editingId = todoId;
            render();
            return;
        }

        if (action === "cancel-edit") {
            editingId = null;
            render();
            return;
        }

        if (action === "save-edit") {
            saveEdit(item, todoId);
            return;
        }

        if (action === "toggle") {
            todos = todos.map((todo) =>
                todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
            );
        }

        if (action === "delete") {
            todos = todos.filter((todo) => todo.id !== todoId);
        }

        saveTodos();
        render();
    }

    function saveEdit(item, todoId) {
        const input = item.querySelector('[data-js="edit-input"]');
        if (!input) return;

        const updatedTitle = input.value.trim();
        if (!updatedTitle) {
            input.focus();
            return;
        }

        todos = todos.map((todo) =>
            todo.id === todoId ? { ...todo, title: updatedTitle } : todo
        );
        editingId = null;
        saveTodos();
        render();
    }

    function handleListKeydown(event) {
        const item = event.target.closest(".todoItem");
        if (!item) return;

        if (event.key === "Enter" && event.target.matches('[data-js="edit-input"]')) {
            event.preventDefault();
            saveEdit(item, item.dataset.id);
        }

        if (event.key === "Escape" && event.target.matches('[data-js="edit-input"]')) {
            editingId = null;
            render();
        }
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        addTask();
    });
    pendingList.addEventListener("click", handleListClick);
    completedList.addEventListener("click", handleListClick);
    pendingList.addEventListener("keydown", handleListKeydown);
    completedList.addEventListener("keydown", handleListKeydown);

    render();
});

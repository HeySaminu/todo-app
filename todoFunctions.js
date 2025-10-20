addEventListener("DOMContentLoaded", (event) => { 
    function init(){
        console.log("init is running");
        const newTaskInput = document.querySelector('[data-js="new-task"]'); 
        const addBtn = document.querySelector('[data-js="add-btn"]'); 
        const pendingSection = document.querySelector('.mainTodo');
        const pendingHeader = document.querySelector('.mainTodo h1');
        const completedSection = document.querySelector('.completeTodo');
        const completedHeader = document.querySelector('.completeTodo h1');

        function handleAdd() {
            // 1. Get and sanitize the input
            const raw = newTaskInput.value;
            const title = raw.trim();
            if (!title.length) return;   // stop if empty/whitespace only

            // 2. Create the wrapper div
            const newItem = document.createElement('div');
            newItem.classList.add('todoItem', 'pending');

            // 3. Create the <h2> for the task text
            const h2 = document.createElement('h2');
            h2.textContent = title;

            const completeBtn = document.createElement('button');
            completeBtn.type = 'button';
            completeBtn.dataset.action = 'complete';
            completeBtn.setAttribute('aria-label', 'Complete task');
            completeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="31" height="30" fill="none"><path fill="#9E78CF" d="m23.784 10.674-11 11a.688.688 0 0 1-.973 0L6.998 16.86a.688.688 0 1 1 .973-.972l4.326 4.327L22.811 9.7a.688.688 0 1 1 .973.973Z"/></svg>`;
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.dataset.action = 'delete';
            deleteBtn.setAttribute('aria-label', 'Delete task');
            // Optional: trashcan SVG, or for now:
            deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="31" height="30" fill="none"><path fill="#9E78CF" d="M22.61 8.125H7.483a.688.688 0 1 0 0 1.375h.688v12.375a1.375 1.375 0 0 0 1.375 1.375h11a1.375 1.375 0 0 0 1.375-1.375V9.5h.687a.687.687 0 0 0 0-1.375Zm-2.063 13.75h-11V9.5h11v12.375ZM10.922 6.062a.687.687 0 0 1 .687-.687h6.875a.687.687 0 0 1 0 1.375H11.61a.687.687 0 0 1-.687-.688Z"/></svg>`;

            newItem.append(h2, completeBtn, deleteBtn);
            // 5. Append the wrapper into the pending section
            pendingSection.append(newItem);

            // 6. Reset the input and refocus
            newTaskInput.value = '';
            newTaskInput.focus();

            // 7. Update counts
            function updateCounts() {
  const pendingCount   = pendingSection.querySelectorAll('.todoItem.pending').length;
  const completedCount = completedSection.querySelectorAll('.todoItem.completed').length;
  pendingHeader.textContent   = `Tasks to do – ${pendingCount}`;
  completedHeader.textContent = `Done – ${completedCount}`;
}

updateCounts();
        }

        addBtn.addEventListener('click', handleAdd);
         newTaskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAdd();
    });

       pendingSection.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action="complete"]');
  if (!btn) return;

  const item = btn.closest('.todoItem');
  if (!item) return;

  item.classList.remove('pending');
  item.classList.add('completed');
  completedSection.append(item);

  updateCounts();
}); updateCounts();
};
init();
});


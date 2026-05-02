/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */

//Tab Switching Logic
function showTab(tabId, clicked) {
    //Hiding tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.leftbar p').forEach(p => p.classList.remove('active'));

    //Show tab selected
    document.getElementById(tabId).classList.add('active');
    clicked.classList.add('active');
}

// Fetches data from the Habit table and displays it.
async function fetchAndDisplayHabits() {
    const tableElement = document.getElementById('habit-table');
    const tableBody = tableElement.querySelector('tbody');

    const habits = await getHabitFetch();

    // Clear old rows
    tableBody.innerHTML = '';

    // Each row is an array of fields
    habits.forEach(habit => {
        const row = tableBody.insertRow();
        // habit_id
        row.insertCell(0).textContent = habit[0]; 
    
        // category_id
        row.insertCell(1).textContent = habit[1]; 
    
        // category_name
        row.insertCell(2).textContent = habit[2]; 
    
        // schedule_id
        row.insertCell(3).textContent = habit[3]; 

        row.insertCell(4).textContent = habit[4]; 

        row.insertCell(5).textContent = habit[5];

        //start_date
        row.insertCell(6).textContent = formatDate(habit[6]); 

        //end_date
        row.insertCell(7).textContent = formatDate(habit[7]); 

        //status
        row.insertCell(8).textContent = habit[8]; 

        //create Delete Button
        const deleteCell = row.insertCell(-1);
        const habitDelete = createDeleteButton(() => {
            const habitId = habit[0];
            deleteHabitFetch(habitId);
        }) 

        deleteCell.appendChild(habitDelete);

        //habitid/title part
        row.addEventListener('click', () => {
            document.getElementById('habitIdInput').value = habit.habit_id;
            document.getElementById('oldTitleInput').value = habit.title;
        });
    });
}

async function displayCategories() {
    const table = document.getElementById('category-table');
    const tbody = table.querySelector('tbody');

    const categories = await getCategoryFetch();

    tbody.innerHTML = '';

    categories.forEach(cat => {
        const row = tbody.insertRow();

        cat.forEach(field => {
            const cell = row.insertCell();
            cell.textContent = field ?? '';
        });

        const deleteCell = row.insertCell(-1);

        const categoryDelete = createDeleteButton(() => {
            const categoryId = cat[0]; // assuming first field is ID
            deleteCategoryFetch(categoryId);
        });

        deleteCell.appendChild(categoryDelete);
    });
}

async function displayHabitLog() {
    const table = document.getElementById('habit-log');
    const tbody = table.querySelector('tbody');

    const habitLog = await getHabitLogFetch();

    tbody.innerHTML = '';

    habitLog.forEach(log => {
        const row = tbody.insertRow();

        // log array: [habit_id, habit_title, entry_timestamp, completed, points_earned, notes]
        const [habitId, habitTitle, entryTimestamp, completed, pointsEarned, notes] = log;

        row.insertCell().textContent = habitTitle;
        row.insertCell().textContent = completed ? "yes" : "no";
        //row.insertCell().textContent = formatDateTime(entryTimestamp);
        row.insertCell().textContent = pointsEarned ?? 0;
        row.insertCell().textContent = notes ?? "";

        row.addEventListener('click', () => {
            row.classList.toggle('selected');
        });
    });
}

async function displayProgressReport() {
    const table = document.getElementById('progress');
    const tbody = table.querySelector('tbody');

    const reports = await getProgressReportFetch();

    tbody.innerHTML = '';

    reports.forEach(report => {
        const row = tbody.insertRow();

        // [REPORT_ID, TITLE, START_DATE, END_DATE, REPORT_PERIOD, COMPLETION_RATE]
        const [reportId, habitId, habitTitle, startDate, endDate, reportPeriod, completionRate, avg_per_period] = report;

        row.insertCell().textContent = reportId;
        row.insertCell().textContent = habitId;
        row.insertCell().textContent = habitTitle;
        row.insertCell().textContent = startDate;
        row.insertCell().textContent = endDate;
        row.insertCell().textContent = reportPeriod ?? "";
        row.insertCell().textContent = completionRate ?? 0;
        row.insertCell().textContent = avg_per_period;

        //create Edit Button
        const editCell = row.insertCell(-1);
        const progressReportEdit = createEditButton(() => {
            reportFormVisible(report); 
        }) 

        editCell.appendChild(progressReportEdit);

        row.addEventListener('click', () => {
            row.classList.toggle('selected');
        });
    });
}

async function reportFormVisible(report) {
    const form = document.getElementById('updateReportForm');
    const [
        reportId,
        habitTitle,
        startDate,
        endDate,
        reportPeriod,
        completionRate
    ] = report;

    document.getElementById('editReportId').value = reportId;
    const habits = await getHabitFetch();

    const habitSelect = document.getElementById('editHabitId');
    
    const currentHabit = habits.find(h => h[3] === habitTitle);
    if (currentHabit) {
        habitSelect.value = currentHabit[0];
    }

    document.getElementById('editStartDate').value = formatDate(startDate);
    document.getElementById('editEndDate').value = formatDate(endDate);
    document.getElementById('editReportPeriod').value = reportPeriod ?? "";
    document.getElementById('editCompletionRate').value = completionRate ?? "";

    form.style.display = 'block';
}

//Update
async function updateHabit() {
    const habitId = document.getElementById('habitIdInput').value;
    const newName = document.getElementById('newTitleInput').value;

    const response = await fetch('/update-title-habit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({habitId, newName})
    })

    const msgElem = document.getElementById('habitUpdateMsg');

    if (response.ok) {
        msgElem.textContent = 'Habit updated successfully!';
        msgElem.style.color = 'green';
        fetchAndDisplayHabits();
    } else {
        msgElem.textContent = 'Failed to update habit.';
        msgElem.style.color = 'red';
    }
}

async function updateProgressReport() {
    const reportId = Number(document.getElementById('editReportId').value);
    const habitIdVal = document.getElementById('editHabitId').value;
    const startDate = document.getElementById('editStartDate').value;
    const endDate = document.getElementById('editEndDate').value;
    const reportPeriodVal = document.getElementById('editReportPeriod').value;
    const completionRateVal = document.getElementById('editCompletionRate').value;
    const msgElem = document.getElementById('updateMsg');

    if (!reportId) {
        msgElem.textContent = 'Please open a report to edit first.';
        msgElem.style.color = 'red';
        return;
    }

    const habitId = habitIdVal !== '' ? Number(habitIdVal) : undefined;
    const reportPeriod = reportPeriodVal !== '' ? Number(reportPeriodVal) : undefined;
    const completionRate = completionRateVal !== '' ? Number(completionRateVal) : undefined;

    const response = await fetch('/update-progress-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, habitId, startDate, endDate, reportPeriod, completionRate })
    });

    const data = await response.json();
    msgElem.textContent = JSON.stringify(data);

    if (response.ok) {
        msgElem.style.color = 'green';
        displayProgressReport();
    } else {
        msgElem.style.color = 'red';
    }
}

//insert
async function insertHabit() {
    const categoryId = document.getElementById('insertCategoryId').value;
    const scheduleId = document.getElementById('insertScheduleId').value;
    const title = document.getElementById('insertTitle').value;
    const description = document.getElementById('insertDescription').value;
    const startDate = document.getElementById('insertStartDate').value;
    const endDate = document.getElementById('insertEndDate').value;
    const status = document.getElementById('insertStatus').value;
    const msgElem = document.getElementById('insertHabitMsg');

    const response = await insertHabitFetch(categoryId, scheduleId, title, description, startDate, endDate, status, msgElem);
}

// Initialize tab switching
document.querySelectorAll('.leftbar p').forEach(p => {
    p.addEventListener('click', () => {
        const tabId = p.dataset.tab;
        showTab(tabId, p);

        if (tabId === 'tab-habits') {
            fetchAndDisplayHabits();
        }

        if (tabId === 'tab-category') {
            displayCategories();
        }

        if (tabId === 'tab-habitlog') {
            displayHabitLog();
        }

        if (tabId === 'tab-progress') {
            displayProgressReport();
        }

        if (tabId === 'tab-goals') {
            loadDivisionCategoryDropdown();
        
            // Pre-select all columns by default
            document.querySelectorAll('#goal-column-selector .col-option').forEach(el => {
                el.classList.add('selected');
            });
        }
    });
});

// Call this when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab && activeTab.id === 'tab-habits') {
        fetchAndDisplayHabits();
    }

    if (activeTab && activeTab.id === 'tab-category') {
        displayCategories();
    }


    initGoalProjectionDragDrop();

    if (activeTab && activeTab.id === 'tab-progress') {
        displayProgressReport();
    }

    const insertBtn = document.getElementById('submitNewHabit');
    if (insertBtn) {
        insertBtn.addEventListener('click', insertHabit);
    }


    const goalProjectionBtn = document.getElementById('loadGoalProjectionBtn');
    if (goalProjectionBtn) {
        goalProjectionBtn.addEventListener('click', displayGoalProjection);
    }

    const joinBtn = document.getElementById('loadHabitProgressJoinBtn');
    if (joinBtn) {
        joinBtn.addEventListener('click', displayHabitProgressJoin);
    }

    const groupByBtn = document.getElementById('loadGroupByBtn');
    if (groupByBtn) {
        groupByBtn.addEventListener('click', displayProgressGroupBy);
    }

    const havingBtn = document.getElementById('loadHavingBtn');
    if (havingBtn) {
        havingBtn.addEventListener('click', displayProgressHaving);
    }

    const nestedBtn = document.getElementById('loadNestedAggregationBtn');
    if (nestedBtn) {
        nestedBtn.addEventListener('click', displayNestedAggregation);
    }

    const divisionBtn = document.getElementById('loadDivisionBtn');
    if (divisionBtn) {
        divisionBtn.addEventListener('click', displayDivisionQuery);
    }
  
    if (activeTab && activeTab.id === 'tab-habitlog') {
        displayHabitLog();
    }

    if (activeTab && activeTab.id === 'tab-progressreport') {
        displayProgressReport();
    }
    document.querySelectorAll('.select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
        });
    });
});

//FORMAT HELPERS
function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-CA', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

function formatTime(time) {
    if (!time) return "";
    return new Date(time).toLocaleTimeString([], {
        hour: 'numeric', minute: '2-digit'
    });
}

//FETCHING HELPERS
async function getHabitFetch(){
    const response = await fetch('/habit', { method: 'GET' });
    const responseData = await response.json();
    return responseData.data;
}

async function getCategoryFetch() {
    const response = await fetch('/category');
    const data = await response.json();
    return data.data;
}

async function getHabitLogFetch() {
    const response = await fetch('/habit-log');
    const data = await response.json();
    return data.data;
}

async function getProgressReportFetch() {
    const response = await fetch('/progress-report');
    const data = await response.json();
    return data.data;
}

//INSERT HELPER
async function insertHabitFetch(categoryId, scheduleId, title, description, startDate, endDate, status, msgElem) {
    const response = await fetch('/insert-habit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, scheduleId, title, description, startDate, endDate: endDate || null, status })
    });
    const data = await response.json();
    msgElem.textContent = JSON.stringify(data);

    if (response.ok) {
            msgElem.textContent = "Insert successful";
            msgElem.style.color = 'green'; 
            fetchAndDisplayHabits();
    }
    else {
        msgElem.textContent = "Invalid or missing fields";
        msgElem.style.color = 'red';
        }
}

//DELETING HELPERS
async function deleteHabitFetch(habitId){
    const msgElem = document.getElementById('deleteHabitMsg');
    const response = await fetch('/delete-habit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId })
    });

    if (response.ok) {
        msgElem.textContent = 'Habit deleted successfully!';
        msgElem.style.color = 'green';
        fetchAndDisplayHabits();
    } else {
        msgElem.textContent = 'Failed to delete habit.';
        msgElem.style.color = 'red';
    }
}

async function deleteCategoryFetch(categoryId){
    const msgElem = document.getElementById('deleteCategoryMsg');
    const response = await fetch('/delete-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId })
    });

    if (response.ok) {
        msgElem.textContent = 'Category deleted successfully!';
        msgElem.style.color = 'green';
        displayCategories();
    } else {
        msgElem.textContent = 'Failed to delete category.';
        msgElem.style.color = 'red';
    }
}

async function getGoalProjectionFetch(columns) {
    const colParam = columns.join(',');
    const response = await fetch(`/goal-projection?columns=${encodeURIComponent(colParam)}`);
    const data = await response.json();
    return data; 
}

async function getHabitProgressJoinFetch() {
    const response = await fetch('/habit-progress-join');
    const data = await response.json();
    return data.data;
}

async function getProgressGroupByFetch(reportPeriod = '') {
    let url = '/progress-group-by'

    if (reportPeriod) {
        url += `?reportPeriod=${encodeURIComponent(reportPeriod)}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    return data.data;
}

async function getProgressHavingFetch(minAvg) {
    const response = await fetch(`/progress-having?minAvg=${encodeURIComponent(minAvg)}`);
    const data = await response.json();
    return data.data;
}

async function getNestedAggregationFetch() {
    const response = await fetch('/nested-aggregation');
    const data = await response.json();
    return data.data;
}

async function getDivisionFetch(categoryId) {
    const response = await fetch(`/division-goals-by-category?categoryId=${encodeURIComponent(categoryId)}`);
    const data = await response.json();
    return data.data;
}

function renderGenericTable(tableId, data, dateIndexes = []) {
    const table = document.getElementById(tableId);
    const body = table.querySelector('tbody');

    body.innerHTML = '';

    data.forEach(rowData => {
        const row = body.insertRow();

        rowData.forEach((field, index) => {
            const cell = row.insertCell();

            if (dateIndexes.includes(index)) {
                cell.textContent = formatDate(field);
            } else {
                cell.textContent = field ?? '';
            }
        });
    });
}


// --- PROJECTION: drag-to-reorder column selector ---

function initGoalProjectionDragDrop() {
    const selector = document.getElementById('goal-column-selector');
    if (!selector) return;

    let draggedEl = null;

    selector.querySelectorAll('.col-option').forEach(item => {
        // Toggle selected on click
        item.addEventListener('click', () => {
            item.classList.toggle('selected');
        });

        item.addEventListener('dragstart', () => {
            draggedEl = item;
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedEl = null;
        });
    });

    selector.addEventListener('dragover', e => {
        e.preventDefault();
        const target = e.target.closest('.col-option');
        if (target && target !== draggedEl) {
            const rect = target.getBoundingClientRect();
            const after = e.clientY > rect.top + rect.height / 2;
            selector.insertBefore(draggedEl, after ? target.nextSibling : target);
        }
    });
}

// --- Adding a function to populate the dropdown when the Goals tab loads
async function loadDivisionCategoryDropdown() {
    const categories = await getCategoryFetch();
    const select = document.getElementById('divisionCategoryIdInput');
    if (!select) return;

    // Clear existing options except the placeholder
    select.innerHTML = '<option value="">-- Select a Category --</option>';

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat[0];           // category_id
        option.textContent = cat[1];     // category name
        select.appendChild(option);
    });
}


// Display functions
//// Projection Display
async function displayGoalProjection() {
    const selector = document.getElementById('goal-column-selector');
    const msgElem = document.getElementById('projectionMsg');

    // Get selected columns in their current drag order
    const selectedCols = [...selector.querySelectorAll('.col-option.selected')]
        .map(el => el.dataset.col);

    if (selectedCols.length === 0) {
        msgElem.textContent = 'Please select at least one column.';
        return;
    }
    msgElem.textContent = '';

    const result = await getGoalProjectionFetch(selectedCols);
    const rows = result.data ?? [];
    const cols = result.columns ?? [];

    // Build dynamic headers
    const headerRow = document.getElementById('goal-projection-headers');
    headerRow.innerHTML = '';
    cols.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        headerRow.appendChild(th);
    });

    // Render rows
    renderGenericTable('goal-projection-table', rows);
}

//// Join Display
async function displayHabitProgressJoin() {
    const data = await getHabitProgressJoinFetch();
    renderGenericTable('habit-progress-join-table', data, [4, 5])
}

//// Group By Display
async function displayProgressGroupBy() {
    const reportPeriod = document.getElementById('groupByReportPeriodInput').value;
    const data = await getProgressGroupByFetch(reportPeriod);
    renderGenericTable('progress-groupby-table', data);
}

//// Having Display
async function displayProgressHaving() {
    const minAvg = document.getElementById('havingMinAvgInput').value;
    const data = await getProgressHavingFetch(minAvg);
    renderGenericTable('progress-having-table', data);
}

//// Nested Aggregation Display
async function displayNestedAggregation() {
    const data = await getNestedAggregationFetch();
    renderGenericTable('nested-aggregation-table', data);
}

//// Division Display
async function displayDivisionQuery() {
    const select = document.getElementById('divisionCategoryIdInput');
    const msgElem = document.getElementById('divisionMsg');
    const categoryId = select.value;

    if (!categoryId) {
        msgElem.style.color = 'red';
        msgElem.textContent = 'Please select a category first.';
        return;
    }

    msgElem.style.color = 'gray';
    msgElem.textContent = 'Loading...';

    const data = await getDivisionFetch(categoryId);

    if (!data || data.length === 0) {
        msgElem.textContent = 'No goals found that cover all habits in this category.';
    } else {
        msgElem.textContent = `Found ${data.length} matching goal(s).`;
    }

    renderGenericTable('division-table', data);
}

//BUTTON CREATION HELPERS
function createDeleteButton(buttonFunction) {
    const deleteIcon = document.createElement('button');
    deleteIcon.classList.add("trash-icon");

    deleteIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        buttonFunction();
    });
    return deleteIcon;
}

function createEditButton(buttonFunction) {
    const editIcon = document.createElement('button');
    editIcon.classList.add("edit-icon");

    editIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        buttonFunction();
    });
    return editIcon;
}

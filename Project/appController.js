const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.

// ----------------------------------------------------------
//SELECT routes
router.get('/habit', async (req, res) => {
    handle(res, () => appService.fetchHabittableFromDb());
});

router.get('/category', async (req, res) => {
    handle(res, () => appService.fetchCategories());
});

router.get('/schedule', async (req, res) => {
    handle(res, () => appService.fetchSchedules());
});

router.get('/habit-log', async (req, res) => {
    handle(res, () => appService.fetchHabitLog());
});

router.get('/progress-report', async (req, res) => {
    handle(res, () => appService.fetchProgressReport());
});

router.get('/select-habit', async (req, res) => {
    ///
});

// ----------------------------------------------------------
//INSERT routes
router.post("/insert-habit", async (req, res) => {
    const {
        categoryId,
        scheduleId,
        title,
        description,
        startDate,
        endDate,
        status
    } = req.body;

    // REQUIRED FIELDS VALIDATION
    if (
        !categoryId || isNaN(categoryId) ||
        !scheduleId || isNaN(scheduleId) ||
        !title || typeof title !== "string" ||
        !startDate
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing required fields"
        });
    }

    // OPTIONAL FIELDS VALIDATION
    if (description && typeof description !== "string") {
        return res.status(400).json({ success: false });
    }

    if (endDate && typeof endDate !== "string") {
        return res.status(400).json({ success: false });
    }

    const habitStatus = status || "active";

    handle(res, () => appService.insertHabit(
        Number(categoryId),
        Number(scheduleId),
        title,
        description ? description.trim() : null,
        startDate,
        endDate,
        habitStatus
    ));
});


// ----------------------------------------------------------
//UPDATE routes
router.post("/update-title-habit", async (req, res) => {
    const { habitId, newName } = req.body;
    //Validation
    if (!habitId || isNaN(habitId) || !newName || typeof newName !== "string" || newName.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Invalid habitId or newName"
        });
    }

    handle(res, () => appService.updateTitleHabit(habitId, newName));
});

router.post("/update-progress-report", async (req, res) => {
    const {
        reportId,
        habitId,
        startDate,
        endDate,
        reportPeriod,
        completionRate
    } = req.body;

    if (reportId === undefined || isNaN(reportId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing reportId"
        });
    }

    if (habitId !== undefined && isNaN(habitId)) {
        return res.status(400).json({ success: false, message: "habitId must be a number" });
    }

    if (startDate !== undefined) {
        if (typeof startDate !== "string" || isNaN(Date.parse(startDate))) {
            return res.status(400).json({ success: false, message: "startDate must be a valid date string" });
        }
    }

    if (endDate !== undefined) {
        if (typeof endDate !== "string" || isNaN(Date.parse(endDate))) {
            return res.status(400).json({ success: false, message: "endDate must be a valid date string" });
        }
    }

    if (reportPeriod !== undefined && isNaN(reportPeriod)) {
        return res.status(400).json({ success: false, message: "reportPeriod must be a number" });
    }

    if (completionRate !== undefined && isNaN(completionRate)) {
        return res.status(400).json({ success: false, message: "completionRate must be a number" });
    }

    handle(res, () => appService.updateProgressReport(
        Number(reportId),
        habitId !== undefined ? Number(habitId) : undefined,
        startDate,
        endDate,
        reportPeriod !== undefined ? Number(reportPeriod) : undefined,
        completionRate !== undefined ? Number(completionRate) : undefined
    ));
});

// ----------------------------------------------------------
//DELETE routes
router.post("/delete-habit", async (req, res) => {
    const { habitId } = req.body;

    if (habitId === undefined || isNaN(habitId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing habitId"
        });
    }

    handle(res, () => appService.deleteHabit(habitId));
});

router.post("/delete-category", async (req, res) => {
    const { categoryId } = req.body;

    if (categoryId === undefined || isNaN(categoryId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing categoryId"
        });
    }

    handle(res, () => appService.deleteCategory(categoryId));
});

// ----------------------------------------------------------
//Function to handle errors and reduce redundancy
async function handle(res, serviceFunction) {
    try {
        const result = await serviceFunction();
        if (result) {
            res.json({ success: true, data: result});
        } else {
            res.status(500).json({ success: false });
        }
    } catch(err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
}

// PROJECTION route
router.get('/goal-projection', async (req, res) => {
    // columns comes in as a comma-separated string
    const columns = req.query.columns ? req.query.columns.split(',') : [];
    if (columns.length === 0) {
        return res.status(400).json({ success: false, message: 'No columns selected' });
    }
    const result = await appService.fetchGoalProjection(columns);
    res.json({ data: result.rows, columns: result.columns });
});

// JOIN route
router.get('/habit-progress-join', async (req, res) => {
    const tableContent = await appService.fetchHabitProgressJoin();
    res.json({ data: tableContent });
});

// AGGREGATION with GROUP BY route
router.get('/progress-group-by', async (req, res) => {
    const { reportPeriod } = req.query;
    const tableContent = await appService.fetchProgressGrouped(reportPeriod);
    res.json({ data: tableContent });
});

// AGGREGATION with HAVING route
router.get('/progress-having', async (req, res) => {
    const minAvg = Number(req.query.minAvg);
    const tableContent = await appService.fetchProgressHaving(minAvg);
    res.json({ data: tableContent });
});

// NESTED AGGREGATION with GROUP BY route
router.get('/nested-aggregation', async (req, res) => {
    const tableContent = await appService.fetchNestedAggregation();
    res.json({ data: tableContent });
});

// DIVISION route
router.get('/division-goals-by-category', async (req, res) => {
    const categoryId = req.query.categoryId;

    if (categoryId === undefined || isNaN(categoryId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing categoryId"
        });
    }

    const tableContent = await appService.fetchDivisionQuery(Number(categoryId));
    res.json({ data: tableContent });

});

module.exports = router;
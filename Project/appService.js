const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

//Habit Table
//SELECT query
async function fetchHabittableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
        SELECT 
            h.habit_id,
            h.category_id,
            c.name AS category_name,
            h.schedule_id,
            h.title,
            h.description,
            h.start_date,
            h.end_date,
            h.status
        FROM Habit h
        LEFT JOIN Category c 
        ON h.category_id = c.category_id
        ORDER BY h.habit_id
        `);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchHabitLog() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
        SELECT 
            hl.HABIT_ID,
            h.TITLE AS habit_title,
            hl.ENTRY_TIMESTAMP,
            hl.COMPLETED,
            hl.POINTS_EARNED,
            hl.NOTES
        FROM Habit_log hl
        JOIN Habit h 
        ON hl.HABIT_ID = h.HABIT_ID
        ORDER BY hl.ENTRY_TIMESTAMP
        DESC
        `);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchCategories() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT * FROM Category`);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchSchedules() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT
                s.schedule_id,
                s.start_time,
                s.end_time,
                s.active_from_date,
                s.active_to_date,
                'onetime' AS type,
                o.schedule_date AS one_time_date,
                NULL AS pattern_type
            FROM Schedule s 
            JOIN OneTime_Schedule o 
            ON s.schedule_id = o.schedule_id 
            UNION ALL 
            SELECT 
                s.schedule_id, 
                s.start_time, 
                s.end_time, 
                s.active_from_date, 
                s.active_to_date, 
                'recurring' AS type, 
                NULL AS one_time_date,
                r.pattern_type 
            FROM Schedule s 
            JOIN Recurring_Schedule r 
            ON s.schedule_id = r.schedule_id
            `);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchProgressReport() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT 
                r.REPORT_ID,
                h.HABIT_ID,
                h.TITLE,
                r.START_DATE,
                r.END_DATE,
                r.REPORT_PERIOD,
                r.COMPLETION_RATE,
                r.AVG_PER_PERIOD
            FROM PROGRESS_REPORT r
            JOIN HABIT h 
            ON r.HABIT_ID = h.HABIT_ID
            `);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function selectHabit(chosenCombinations, boolean) {
    return await withOracleDB(async (connection) => {     
        let sql = `SELECT * FROM Habit`;

        const binds = {};
        const conditions = [];


        
        return result.rows;
    }).catch(() => {
        return [];
    });
}

//INSERT query
async function insertHabit(categoryId, scheduleId, title, description, startDate, endDate, status) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Habit (habit_id, category_id, schedule_id, title, description, start_date, status)
             VALUES (habit_seq.NEXTVAL, :categoryId, :scheduleId, :title, :description, TO_DATE(:startDate, 'YYYY-MM-DD'), :status)`,
            { categoryId, scheduleId, title, description, startDate, status },
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        console.error('insertHabit error:', err);
        return false;
    });
}

//UPDATE queries
async function updateTitleHabit(habitId, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE Habit SET title=:newName where habit_id= :habit_Id`,
            { newName, habitId },
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateProgressReport( reportId,habitId,startDate,endDate,reportPeriod,completionRate) {
    const updatelist = [];
    const binds = {reportId}; //BIND AGAINST SQL INJECTION

    if (habitId !== undefined) {
        updatelist.push("habit_id = :habitId");
        binds.habitId = habitId;
    }
    if (startDate) {
        updatelist.push("start_date = TO_DATE(:startDate, 'YYYY-MM-DD')");
        binds.startDate = startDate;
    }
    if (endDate) {
        updatelist.push("end_date = TO_DATE(:endDate, 'YYYY-MM-DD')");
        binds.endDate = endDate;
    }
    if (reportPeriod !== undefined) {
        updatelist.push("report_period = :reportPeriod");
        binds.reportPeriod = reportPeriod;
    }
    if (completionRate !== undefined) {
        updatelist.push("completion_rate = :completionRate");
        binds.completionRate = completionRate;
    }
    if (updatelist.length === 0) return { message: "Nothing to update" };

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE Progress_Report SET ${updatelist.join(",")} WHERE report_id = :reportId`,
            binds,
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

//DELETE query
async function deleteHabit(habitId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM Habit WHERE habit_id = :habitId`,
            { habitId },
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

//PROJECTION query
const GOAL_COLUMNS_WHITELIST = ['goal_id', 'name', 'description', 'start_date', 'end_date'];

async function fetchGoalProjection(columns) {
    // Validate every requested column against the whitelist
    const validColumns = columns.filter(col => GOAL_COLUMNS_WHITELIST.includes(col));
    if (validColumns.length === 0) return [];

    const columnList = validColumns.join(', ');

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT ${columnList} FROM Goal`
        );
        return { rows: result.rows, columns: validColumns };
    }).catch(() => {
        return { rows: [], columns: [] };
    });
}

// JOIN query
async function fetchHabitProgressJoin() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT h.habit_id, 
                    h.title,
                    h.status,
                    p.report_id,
                    p.start_date,
                    p.end_date,
                    p.report_period,
                    p.completion_rate,
                    p.avg_per_period
             FROM Habit h
             JOIN Progress_Report p
               ON h.habit_id = p.habit_id`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// AGGREGATION with GROUP BY query
async function fetchProgressGrouped(reportPeriod) {
    return await withOracleDB(async (connection) => {
        let sql = `
            SELECT report_period,
                   COUNT(*) AS num_reports,
                   ROUND(AVG(completion_rate), 2) AS avg_completion
            FROM Progress_Report
        `;

        const binds = {};

        if (reportPeriod) {
            sql += ` WHERE report_period = :report_period`;
            binds.report_period = reportPeriod;
        }

        sql += `
            GROUP BY report_period
            ORDER BY report_period
        `;

        const result = await connection.execute(sql, binds);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// AGGREGATION with HAVING query
async function fetchProgressHaving(minAvg) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT report_period,
                    COUNT(*) AS num_reports,
                    ROUND(AVG(completion_rate), 2) AS avg_completion
             FROM Progress_Report
             GROUP BY report_period
             HAVING AVG(completion_rate) >= :minAvg
             ORDER BY report_period`,
            { minAvg }
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// NESTED AGGREGATION with GROUP BY query
async function fetchNestedAggregation() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT h.habit_id, 
                    h.title,
                    ROUND(AVG(p.completion_rate), 2) AS avg_completion
             FROM Habit h
             JOIN Progress_Report p
               ON h.habit_id = p.habit_id
             GROUP BY h.habit_id, h.title
             HAVING AVG(p.completion_rate) > (
                 SELECT AVG(habit_avg)
                 FROM (
                     SELECT AVG(p2.completion_rate) AS habit_avg
                     FROM Progress_Report p2
                     GROUP BY p2.habit_id
                 ) 
             )
             ORDER BY avg_completion DESC`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// DIVISION query
async function fetchDivisionQuery(categoryId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT g.goal_id,
                    g.name,
                    g.description
             FROM Goal g
             WHERE NOT EXISTS (
                 SELECT h.habit_id
                 FROM Habit h
                 WHERE h.category_id = :categoryId
                   AND NOT EXISTS (
                       SELECT 1 
                       FROM Goal_habit gh
                       WHERE gh.goal_id = g.goal_id
                         AND gh.habit_id = h.habit_id
                   )
             )
             ORDER BY g.goal_id`,
            { categoryId }
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
} 

async function deleteCategory(categoryId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM Category WHERE category_id = :categoryId`,
            {categoryId},
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// Add functions here as we go
module.exports = {
    fetchHabittableFromDb,
    updateTitleHabit,
    deleteHabit,
    deleteCategory,
    insertHabit,
    selectHabit,
    fetchCategories,
    fetchSchedules,
    fetchGoalProjection,
    fetchHabitProgressJoin,
    fetchProgressGrouped,
    fetchProgressHaving,
    fetchNestedAggregation,
    fetchDivisionQuery,
    fetchHabitLog,
    fetchProgressReport,
    updateProgressReport,
};
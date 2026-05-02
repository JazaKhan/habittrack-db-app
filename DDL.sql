-- Dropping tables
DROP TABLE Habit_log;
DROP TABLE Progress_Report;
DROP TABLE Reminder;
DROP TABLE Reward;
DROP TABLE Reward_Type;
DROP TABLE Goal_Habit;
DROP TABLE Habit;
DROP TABLE Goal;
DROP TABLE OneTime_Schedule;
DROP TABLE Recurring_Schedule;
DROP TABLE Schedule;
DROP TABLE Category;
DROP SEQUENCE habit_seq;

CREATE SEQUENCE habit_seq
START WITH 50
INCREMENT BY 1
NOCACHE
NOCYCLE;

-- Create tables 
CREATE TABLE Category (
  category_id NUMBER PRIMARY KEY,
  name VARCHAR2(100) NOT NULL,
  theme VARCHAR2(100),
  description VARCHAR2(500)
);

CREATE TABLE Schedule (
  schedule_id NUMBER PRIMARY KEY,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  active_from_date DATE NOT NULL,
  active_to_date DATE
);

CREATE TABLE Recurring_Schedule (
  schedule_id NUMBER PRIMARY KEY,
  pattern_type VARCHAR2(50) NOT NULL,
  interval_n NUMBER NOT NULL,
  days_of_week VARCHAR2(50),
  end_condition_type VARCHAR2(50),
  end_date DATE,
  max_occurrences NUMBER,
  CONSTRAINT fk_recurring_schedule FOREIGN KEY (schedule_id) REFERENCES Schedule(schedule_id) ON DELETE CASCADE
);

CREATE TABLE OneTime_Schedule (
  schedule_id NUMBER PRIMARY KEY,
  schedule_date DATE NOT NULL,
  window_start_time TIMESTAMP NOT NULL,
  window_end_time TIMESTAMP NOT NULL,
  CONSTRAINT fk_onetime_schedule FOREIGN KEY (schedule_id) REFERENCES Schedule(schedule_id) ON DELETE CASCADE
);

CREATE TABLE Habit (
  habit_id NUMBER PRIMARY KEY,
  category_id NUMBER,
  schedule_id NUMBER,
  title VARCHAR2(200) NOT NULL,
  description VARCHAR2(500),
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR2(50),
  CONSTRAINT fk_habit_category FOREIGN KEY (category_id) REFERENCES Category(category_id) ON DELETE SET NULL,
  CONSTRAINT fk_habit_schedule FOREIGN KEY (schedule_id) REFERENCES Schedule(schedule_id) 
  ON DELETE SET NULL
);

CREATE TABLE Goal (
  goal_id NUMBER PRIMARY KEY,
  name VARCHAR2(200) NOT NULL UNIQUE,
  description VARCHAR2(500),
  start_date DATE NOT NULL,
  end_date DATE
);

CREATE TABLE Goal_Habit (
  goal_id NUMBER NOT NULL,
  habit_id NUMBER NOT NULL,
  PRIMARY KEY (goal_id, habit_id),
  CONSTRAINT fk_goalhabit_goal FOREIGN KEY (goal_id) REFERENCES Goal(goal_id) ON DELETE CASCADE,
  CONSTRAINT fk_goalhabit_habit FOREIGN KEY (habit_id) REFERENCES Habit(habit_id) ON DELETE CASCADE
);

CREATE TABLE Reward_Type (
  reward_type VARCHAR2(50) PRIMARY KEY,
  points_required NUMBER NOT NULL,
  CONSTRAINT chk_points CHECK (points_required >= 0)
);

CREATE TABLE Reward (
  reward_id NUMBER PRIMARY KEY,
  goal_id NUMBER NOT NULL,
  reward_name VARCHAR2(200) NOT NULL,
  reward_description VARCHAR2(500),
  reward_type VARCHAR2(50),
  CONSTRAINT fk_reward_goal FOREIGN KEY (goal_id) REFERENCES Goal(goal_id) ON DELETE CASCADE,
  CONSTRAINT fk_reward_type FOREIGN KEY (reward_type) REFERENCES Reward_type(reward_type)
);

CREATE TABLE Reminder (
  reminder_id NUMBER PRIMARY KEY,
  schedule_id NUMBER,
  goal_id NUMBER,
  remind_time TIMESTAMP,
  is_enabled NUMBER(1),
  channel VARCHAR2(50),
  message VARCHAR2(500),
  CONSTRAINT fk_reminder_schedule FOREIGN KEY (schedule_id) REFERENCES Schedule(schedule_id) ON DELETE CASCADE,
  CONSTRAINT fk_reminder_goal FOREIGN KEY (goal_id) REFERENCES Goal(goal_id) ON DELETE CASCADE
);

CREATE TABLE Progress_Report (
  report_id NUMBER PRIMARY KEY,
  habit_id NUMBER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  report_period VARCHAR2(50),
  completion_rate NUMBER,
  avg_per_period NUMBER,
  CONSTRAINT fk_progress_habit FOREIGN KEY (habit_id) REFERENCES Habit(habit_id) ON DELETE CASCADE
);

CREATE TABLE Habit_log (
  habit_id NUMBER NOT NULL,
  entry_timestamp TIMESTAMP NOT NULL,
  completed NUMBER(1) NOT NULL,
  points_earned NUMBER,
  notes VARCHAR2(500),
  PRIMARY KEY (habit_id, entry_timestamp),
  CONSTRAINT fk_habitlog_habit FOREIGN KEY (habit_id) REFERENCES Habit(habit_id) ON DELETE CASCADE
);

-- Insert statements 

-- Category 
INSERT ALL
  INTO Category (category_id, name, theme, description) 
    VALUES (1, 'Health', 'Wellness', 'Habits related to physical and mental health')
  INTO Category (category_id, name, theme, description)
    VALUES (2, 'Work', 'Productivity', 'Habits related to work tasks')
  INTO Category (category_id, name, theme, description) 
    VALUES (3, 'Study', 'Learning', 'Habits related to studying and academics')
  INTO Category (category_id, name, theme, description) 
    VALUES (4, 'Personal', 'Lifestyle', 'Habits related to personal growth and routine')
  INTO Category (category_id, name, theme, description) 
    VALUES (5, 'Finance', 'Management', 'Habits related to budgeting and saving')
  INTO Category (category_id, name, theme, description) 
    VALUES (6, 'Social', 'Relationships', 'Habits related to social connection')
SELECT * FROM dual;

-- Schedule 
INSERT ALL 
  INTO Schedule (schedule_id, start_time, end_time, active_from_date,active_to_date) 
    VALUES (1, TIMESTAMP '1970-01-01 08:00:00', TIMESTAMP '1970-01-01 08:30:00', TO_DATE('2026-02-01','YYYY-MM-DD'), TO_DATE('2026-02-28','YYYY-MM-DD'))
  INTO Schedule (schedule_id, start_time, end_time, active_from_date,active_to_date)
    VALUES (2, TIMESTAMP '1970-01-01 19:00:00', TIMESTAMP '1970-01-01 19:30:00', TO_DATE('2026-02-01','YYYY-MM-DD'), NULL)
  INTO Schedule (schedule_id, start_time, end_time, active_from_date,active_to_date) 
    VALUES (3, TIMESTAMP '1970-01-01 06:30:00', TIMESTAMP '1970-01-01 07:00:00', TO_DATE('2026-02-01','YYYY-MM-DD'), NULL)
  INTO Schedule (schedule_id, start_time, end_time, active_from_date,active_to_date) 
    VALUES (4, TIMESTAMP '1970-01-01 21:00:00', TIMESTAMP '1970-01-01 21:30:00', TO_DATE('2026-02-01','YYYY-MM-DD'), NULL)
  INTO Schedule (schedule_id, start_time, end_time, active_from_date,active_to_date) 
    VALUES (5, TIMESTAMP '1970-01-01 12:00:00', TIMESTAMP '1970-01-01 12:20:00', TO_DATE('2026-02-05','YYYY-MM-DD'), TO_DATE('2026-03-15','YYYY-MM-DD'))
  INTO Schedule (schedule_id, start_time, end_time, active_from_date,active_to_date) 
    VALUES (6, TIMESTAMP '1970-01-01 17:30:00', TIMESTAMP '1970-01-01 18:00:00', TO_DATE('2026-02-10','YYYY-MM-DD'), NULL)
  INTO Schedule (schedule_id, start_time, end_time, active_from_date,active_to_date) 
    VALUES (7, TIMESTAMP '1970-01-01 09:00:00', TIMESTAMP '1970-01-01 10:00:00', TO_DATE('2026-02-15','YYYY-MM-DD'), TO_DATE('2026-02-15','YYYY-MM-DD'))
  INTO Schedule (schedule_id, start_time, end_time, active_from_date,active_to_date) 
    VALUES (8, TIMESTAMP '1970-01-01 14:00:00', TIMESTAMP '1970-01-01 15:00:00', TO_DATE('2026-02-18','YYYY-MM-DD'), TO_DATE('2026-02-28','YYYY-MM-DD'))
  INTO Schedule (schedule_id, start_time, end_time, active_from_date,active_to_date) 
    VALUES (9, TIMESTAMP '1970-01-01 16:00:00', TIMESTAMP '1970-01-01 16:45:00', TO_DATE('2026-02-20','YYYY-MM-DD'), TO_DATE('2026-02-20','YYYY-MM-DD'))
  INTO Schedule (schedule_id, start_time, end_time, active_from_date,active_to_date) 
    VALUES (10, TIMESTAMP '1970-01-01 11:00:00', TIMESTAMP '1970-01-01 11:30:00', TO_DATE('2026-02-25','YYYY-MM-DD'), TO_DATE('2026-02-25','YYYY-MM-DD'))
SELECT * FROM dual;

-- Recurring_Schedule 
INSERT ALL
  INTO Recurring_Schedule (schedule_id, pattern_type, interval_n, days_of_week, end_condition_type, end_date, max_occurrences) 
    VALUES (1, 'daily', 1, 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', 'until_date', TO_DATE('2026-02-28','YYYY-MM-DD'), NULL)
  INTO Recurring_Schedule (schedule_id, pattern_type, interval_n, days_of_week, end_condition_type, end_date, max_occurrences) 
    VALUES (3, 'daily', 1, 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', 'none', NULL, NULL) 
  INTO Recurring_Schedule (schedule_id, pattern_type, interval_n, days_of_week, end_condition_type, end_date, max_occurrences) 
    VALUES (4, 'weekly', 1, 'Mon,Wed,Fri', 'none', NULL, NULL)
  INTO Recurring_Schedule (schedule_id, pattern_type, interval_n, days_of_week, end_condition_type, end_date, max_occurrences) 
    VALUES (5, 'weekly', 1, 'Tue,Thu', 'until_date', TO_DATE('2026-03-15','YYYY-MM-DD'), NULL)
  INTO Recurring_Schedule (schedule_id, pattern_type, interval_n, days_of_week, end_condition_type, end_date, max_occurrences) 
    VALUES (6, 'daily', 2, 'Mon,Wed,Fri,Sun', 'max_occurrences', NULL, 20)
SELECT * FROM dual;

-- OneTime_Schedule 
INSERT ALL
  INTO OneTime_Schedule (schedule_id, schedule_date, window_start_time, window_end_time) 
    VALUES (2, TO_DATE('2026-02-15','YYYY-MM-DD'), TIMESTAMP '1970-01-01 19:00:00', TIMESTAMP '1970-01-01 19:30:00')
  INTO OneTime_Schedule (schedule_id, schedule_date, window_start_time, window_end_time) 
    VALUES (7, TO_DATE('2026-02-15','YYYY-MM-DD'), TIMESTAMP '1970-01-01 09:00:00', TIMESTAMP '1970-01-01 10:00:00')
  INTO OneTime_Schedule (schedule_id, schedule_date, window_start_time, window_end_time) 
    VALUES (8, TO_DATE('2026-02-18','YYYY-MM-DD'), TIMESTAMP '1970-01-01 14:00:00', TIMESTAMP '1970-01-01 15:00:00')
  INTO OneTime_Schedule (schedule_id, schedule_date, window_start_time, window_end_time) 
    VALUES (9, TO_DATE('2026-02-20','YYYY-MM-DD'), TIMESTAMP '1970-01-01 16:00:00', TIMESTAMP '1970-01-01 16:45:00')
  INTO OneTime_Schedule (schedule_id, schedule_date, window_start_time, window_end_time) 
    VALUES (10, TO_DATE('2026-02-25','YYYY-MM-DD'), TIMESTAMP '1970-01-01 11:00:00', TIMESTAMP '1970-01-01 11:30:00')
SELECT * FROM dual;

-- Habit 
INSERT ALL
  INTO Habit (habit_id, category_id, schedule_id, title, description, start_date, end_date, status) 
    VALUES (1, 1, 1, 'Morning Exercise', '30 min jogging', TO_DATE('2026-02-01','YYYY-MM-DD'), TO_DATE('2026-02-28','YYYY-MM-DD'), 'active')
  INTO Habit (habit_id, category_id, schedule_id, title, description, start_date, end_date, status)
    VALUES (2, 2, 2, 'Evening Work Session', 'Focus on project tasks', TO_DATE('2026-02-01','YYYY-MM-DD'), NULL, 'active')
  INTO Habit (habit_id, category_id, schedule_id, title, description, start_date, end_date, status)
    VALUES (3, 3, 3, 'Morning Reading', 'Read 20 pages every morning', TO_DATE('2026-02-01','YYYY-MM-DD'), NULL, 'active')
  INTO Habit (habit_id, category_id, schedule_id, title, description, start_date, end_date, status)
    VALUES (4, 4, 4, 'Night Journaling', 'Write reflections before bed', TO_DATE('2026-02-01','YYYY-MM-DD'), NULL, 'active')
  INTO Habit (habit_id, category_id, schedule_id, title, description, start_date, end_date, status)
    VALUES (5, 5, 5, 'Track Expenses', 'Log daily spending habits', TO_DATE('2026-02-05','YYYY-MM-DD'), TO_DATE('2026-03-15','YYYY-MM-DD'), 'active') 
  INTO Habit (habit_id, category_id, schedule_id, title, description, start_date, end_date, status)
    VALUES (6, 1, 6, 'Evening Walk', '20 min walk after dinner', TO_DATE('2026-02-10','YYYY-MM-DD'), NULL, 'active')
  INTO Habit (habit_id, category_id, schedule_id, title, description, start_date, end_date, status)
    VALUES (7, 3, NULL, 'Flashcard Review', 'Review 30 flashcards daily', TO_DATE('2026-02-01','YYYY-MM-DD'), NULL, 'active')
  INTO Habit (habit_id, category_id, schedule_id, title, description, start_date, end_date, status)
    VALUES (8, 4, 7, 'Meditation', '10 minute morning meditation', TO_DATE('2026-02-15','YYYY-MM-DD'), NULL, 'active')
  INTO Habit (habit_id, category_id, schedule_id, title, description, start_date, end_date, status)
    VALUES (9, 5, 8, 'Weekly Budget Review', 'Review weekly spending', TO_DATE('2026-02-18','YYYY-MM-DD'), NULL, 'active')
  INTO Habit (habit_id, category_id, schedule_id, title, description, start_date, end_date, status)
    VALUES (10, 2, 9, 'Code Review', 'Review pull requests daily', TO_DATE('2026-02-20','YYYY-MM-DD'), TO_DATE('2026-03-20','YYYY-MM-DD'), 'active')
SELECT * FROM dual;

-- Goal 
INSERT ALL
  INTO Goal (goal_id, name, description, start_date, end_date) 
    VALUES (1, 'Fitness Goal', 'Complete 20 workouts this month', TO_DATE('2026-02-01','YYYY-MM-DD'), TO_DATE('2026-02-28','YYYY-MM-DD')) 
  INTO Goal (goal_id, name, description, start_date, end_date)
    VALUES (2, 'Project Completion', 'Finish milestone 1', TO_DATE('2026-02-01','YYYY-MM-DD'), TO_DATE('2026-02-20','YYYY-MM-DD'))
  INTO Goal (goal_id, name, description, start_date, end_date)
    VALUES (3, 'Reading Goal', 'Finish 3 books this month', TO_DATE('2026-02-01','YYYY-MM-DD'), TO_DATE('2026-02-28','YYYY-MM-DD'))
  INTO Goal (goal_id, name, description, start_date, end_date)
    VALUES (4, 'Mindfulness Goal', 'Journal 5 times each week', TO_DATE('2026-02-01','YYYY-MM-DD'), TO_DATE('2026-03-01','YYYY-MM-DD'))
  INTO Goal (goal_id, name, description, start_date, end_date)
    VALUES (5, 'Budget Goal', 'Stay within weekly expense target', TO_DATE('2026-02-05','YYYY-MM-DD'), TO_DATE('2026-03-15','YYYY-MM-DD'))
  INTO Goal (goal_id, name, description, start_date, end_date)
    VALUES (6, 'Wellness Goal', 'Build a full wellness routine', TO_DATE('2026-02-10','YYYY-MM-DD'), TO_DATE('2026-03-10','YYYY-MM-DD'))
  INTO Goal (goal_id, name, description, start_date, end_date)
    VALUES (7, 'Academic Goal', 'Improve study consistency', TO_DATE('2026-02-01','YYYY-MM-DD'), TO_DATE('2026-03-31','YYYY-MM-DD'))
  INTO Goal (goal_id, name, description, start_date, end_date)
    VALUES (8, 'Work Performance Goal', 'Improve daily output at work', TO_DATE('2026-02-01','YYYY-MM-DD'), TO_DATE('2026-02-28','YYYY-MM-DD')) 
SELECT * FROM dual;

-- Goal_Habit 
INSERT ALL
  INTO Goal_Habit (goal_id, habit_id) 
    VALUES (1, 1)
  INTO Goal_Habit (goal_id, habit_id) 
    VALUES (2, 2)
  INTO Goal_Habit (goal_id, habit_id) 
    VALUES (3, 3)
  INTO Goal_Habit (goal_id, habit_id) 
    VALUES (4, 4)
  INTO Goal_Habit (goal_id, habit_id) 
    VALUES (5, 5)
  INTO Goal_Habit (goal_id, habit_id) 
    VALUES (6, 1)
  INTO Goal_Habit (goal_id, habit_id) 
    VALUES (6, 6)
  INTO Goal_Habit (goal_id, habit_id) 
    VALUES (6, 8)
  INTO Goal_Habit (goal_id, habit_id) 
    VALUES (7, 3)
  INTO Goal_Habit (goal_id, habit_id) 
    VALUES (7, 7)
  INTO Goal_Habit (goal_id, habit_id) 
    VALUES (8, 2)
  INTO Goal_Habit (goal_id, habit_id) 
    VALUES (8, 10)
  INTO Goal_Habit (goal_id, habit_id) 
    VALUES (1, 6)
  INTO Goal_Habit (goal_id, habit_id) 
    VALUES (3, 7)
SELECT * FROM dual;

-- Reward_Type
INSERT ALL
  INTO Reward_type (reward_type, points_required)
    VALUES ('monetary', 100)
  INTO Reward_type (reward_type, points_required)
    VALUES ('digital', 50)
  INTO Reward_type (reward_type, points_required)
    VALUES ('physical', 80)
  INTO Reward_type (reward_type, points_required)
    VALUES ('experience', 60)
  INTO Reward_type (reward_type, points_required)
    VALUES ('badge', 70)
SELECT * FROM dual;

-- Reward 
INSERT ALL
  INTO Reward (reward_id, goal_id, reward_name, reward_description, reward_type) 
    VALUES (1, 1, 'Gift Card', 'Earn a $10 gift card', 'monetary')
  INTO Reward (reward_id, goal_id, reward_name, reward_description, reward_type)
    VALUES (2, 2, 'Badge', 'Unlock a project completion badge', 'digital')
  INTO Reward (reward_id, goal_id, reward_name, reward_description, reward_type)
    VALUES (3, 3, 'New Book', 'Buy a new book after completing reading goal', 'physical')
  INTO Reward (reward_id, goal_id, reward_name, reward_description, reward_type)
    VALUES (4, 4, 'Relax Day', 'Take an evening off for self-care', 'experience')
  INTO Reward (reward_id, goal_id, reward_name, reward_description, reward_type)
    VALUES (5, 5, 'Savings Badge', 'Unlock a smart saver badge', 'digital')
  INTO Reward (reward_id, goal_id, reward_name, reward_description, reward_type)
    VALUES (6, 6, 'Wellness Badge', 'Unlock a wellness achievement badge', 'digital')
  INTO Reward (reward_id, goal_id, reward_name, reward_description, reward_type)
    VALUES (7, 7, 'Study Streak Trophy', 'Trophy for a 30-day study streak', 'digital')
  INTO Reward (reward_id, goal_id, reward_name, reward_description, reward_type)
    VALUES (8, 8, 'Bonus Day Off', 'Take a bonus rest day', 'physical')
SELECT * FROM dual;

-- Reminder 
INSERT ALL
  INTO Reminder (reminder_id, schedule_id, goal_id, remind_time, is_enabled, channel, message) 
    VALUES (1, 1, NULL, TIMESTAMP '1970-01-01 07:50:00', 1, 'push', 'Time for your morning exercise!')
  INTO Reminder (reminder_id, schedule_id, goal_id, remind_time, is_enabled, channel, message)
    VALUES (2, NULL, 2, TIMESTAMP '1970-01-01 18:50:00', 1, 'email', 'Prepare for evening work session!')
  INTO Reminder (reminder_id, schedule_id, goal_id, remind_time, is_enabled, channel, message)
    VALUES (3, 3, NULL, TIMESTAMP '1970-01-01 06:20:00', 1, 'push', 'Time for your morning reading!')
  INTO Reminder (reminder_id, schedule_id, goal_id, remind_time, is_enabled, channel, message)
    VALUES (4, NULL, 4, TIMESTAMP '1970-01-01 20:50:00', 1, 'push', 'Don''t forget to journal tonight!')
  INTO Reminder (reminder_id, schedule_id, goal_id, remind_time, is_enabled, channel, message)
    VALUES (5, 5, NULL, TIMESTAMP '1970-01-01 11:50:00', 1, 'email', 'Log your spending for the day.')
  INTO Reminder (reminder_id, schedule_id, goal_id, remind_time, is_enabled, channel, message)
    VALUES (6, 6, NULL, TIMESTAMP '1970-01-01 17:20:00', 1, 'push', 'Time for your evening walk!')
  INTO Reminder (reminder_id, schedule_id, goal_id, remind_time, is_enabled, channel, message)
    VALUES (7, NULL, 6, TIMESTAMP '1970-01-01 20:00:00', 1, 'email', 'Check your wellness goal progress!')
  INTO Reminder (reminder_id, schedule_id, goal_id, remind_time, is_enabled, channel, message)
    VALUES (8, NULL, 7, TIMESTAMP '1970-01-01 21:00:00', 1, 'in-app', 'How is your academic goal going?') 
SELECT * FROM dual;

-- Progress_Report 
INSERT ALL 
  INTO Progress_Report (report_id, habit_id, start_date, end_date, report_period, completion_rate, avg_per_period) 
    VALUES (1, 1, TO_DATE('2026-02-01','YYYY-MM-DD'), TO_DATE('2026-02-07','YYYY-MM-DD'), 'weekly', 75.00, 5.0)
  INTO Progress_Report (report_id, habit_id, start_date, end_date, report_period, completion_rate, avg_per_period)
    VALUES (2, 2, TO_DATE('2026-02-01','YYYY-MM-DD'), TO_DATE('2026-02-07','YYYY-MM-DD'), 'weekly', 50.00, 3.0)
  INTO Progress_Report (report_id, habit_id, start_date, end_date, report_period, completion_rate, avg_per_period)
    VALUES (3, 3, TO_DATE('2026-02-01','YYYY-MM-DD'), TO_DATE('2026-02-07','YYYY-MM-DD'), 'weekly', 85.00, 6.0)
  INTO Progress_Report (report_id, habit_id, start_date, end_date, report_period, completion_rate, avg_per_period)
    VALUES (4, 4, TO_DATE('2026-02-01','YYYY-MM-DD'), TO_DATE('2026-02-07','YYYY-MM-DD'), 'weekly', 60.00, 4.0)
  INTO Progress_Report (report_id, habit_id, start_date, end_date, report_period, completion_rate, avg_per_period)
    VALUES (5, 5, TO_DATE('2026-02-05','YYYY-MM-DD'), TO_DATE('2026-02-11','YYYY-MM-DD'), 'weekly', 90.00, 6.5)
  INTO Progress_Report (report_id, habit_id, start_date, end_date, report_period, completion_rate, avg_per_period)
    VALUES (6, 6, TO_DATE('2026-02-10','YYYY-MM-DD'), TO_DATE('2026-02-16','YYYY-MM-DD'), 'weekly', 80.00, 3.0)
  INTO Progress_Report (report_id, habit_id, start_date, end_date, report_period, completion_rate, avg_per_period)
    VALUES (7, 3, TO_DATE('2026-02-08','YYYY-MM-DD'), TO_DATE('2026-02-28','YYYY-MM-DD'), 'monthly', 78.00, 5.5)
  INTO Progress_Report (report_id, habit_id, start_date, end_date, report_period, completion_rate, avg_per_period)
    VALUES (8, 1, TO_DATE('2026-02-01','YYYY-MM-DD'), TO_DATE('2026-02-28','YYYY-MM-DD'), 'monthly', 72.00, 4.8)
  INTO Progress_Report (report_id, habit_id, start_date, end_date, report_period, completion_rate, avg_per_period)
    VALUES (9, 2, TO_DATE('2026-02-15','YYYY-MM-DD'), TO_DATE('2026-02-21','YYYY-MM-DD'), 'custom', 65.00, 3.5)
  INTO Progress_Report (report_id, habit_id, start_date, end_date, report_period, completion_rate, avg_per_period)
    VALUES (10, 5, TO_DATE('2026-02-05','YYYY-MM-DD'), TO_DATE('2026-02-28','YYYY-MM-DD'), 'monthly', 88.00, 6.0)
SELECT * FROM dual;

-- Habit_log 
---- Habit 1 (Morning Exercise)
INSERT ALL
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes) 
    VALUES (1, TIMESTAMP '2026-02-01 08:30:00', 1, 5, 'Felt great after jogging')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (1, TIMESTAMP '2026-02-02 08:30:00', 1, 5, 'Completed full routine')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes) 
    VALUES (1, TIMESTAMP '2026-02-03 08:30:00', 1, 5, 'Good run today')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes) 
    VALUES (1, TIMESTAMP '2026-02-04 08:30:00', 0, 0, 'Skipped due to rain')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes) 
    VALUES (1, TIMESTAMP '2026-02-05 08:30:00', 1, 5, 'Back on track')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes) 
    VALUES (1, TIMESTAMP '2026-02-06 08:30:00', 1, 5, 'Increased pace')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes) 
    VALUES (1, TIMESTAMP '2026-02-07 08:30:00', 1, 5, 'Personal best time')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes) 
    VALUES (1, TIMESTAMP '2026-02-08 08:30:00', 0, 0, 'Rest day')
 SELECT * FROM dual;   


---- Habit 2 (Evening work session)
INSERT ALL
 INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (2, TIMESTAMP '2026-02-01 19:30:00', 0, 0, 'Had to attend a meeting')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (2, TIMESTAMP '2026-02-02 19:30:00', 1, 3, 'Finished task backlog')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (2, TIMESTAMP '2026-02-03 19:30:00', 1, 4, 'Deep focus session')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (2, TIMESTAMP '2026-02-04 19:30:00', 0, 0, 'Too tired')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (2, TIMESTAMP '2026-02-05 19:30:00', 1, 4, 'Completed 3 tasks')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (2, TIMESTAMP '2026-02-06 19:30:00', 1, 3, 'Quick session')
SELECT * FROM dual;


---- Habit 3 (Morning Reading)
INSERT ALL
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (3, TIMESTAMP '2026-02-01 07:00:00', 1, 4, 'Completed reading session')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (3, TIMESTAMP '2026-02-02 07:00:00', 1, 4, 'Finished a chapter')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (3, TIMESTAMP '2026-02-03 07:00:00', 1, 4, 'Great reading session')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (3, TIMESTAMP '2026-02-04 07:00:00', 0, 0, 'Overslept')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (3, TIMESTAMP '2026-02-05 07:00:00', 1, 4, 'Back on schedule')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (3, TIMESTAMP '2026-02-06 07:00:00', 1, 4, 'Engaging book')
SELECT * FROM dual;


---- Habit 4 (Night Journaling)
INSERT ALL
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (4, TIMESTAMP '2026-02-01 21:30:00', 1, 3, 'Wrote journal entry before sleeping')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (4, TIMESTAMP '2026-02-02 21:30:00', 1, 3, 'Reflected on the day')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (4, TIMESTAMP '2026-02-03 21:30:00', 1, 3, 'Wrote about goals')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (4, TIMESTAMP '2026-02-04 21:30:00', 0, 0, 'Forgot')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (4, TIMESTAMP '2026-02-05 21:30:00', 1, 3, 'Short entry')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (4, TIMESTAMP '2026-02-06 21:30:00', 1, 3, 'Long reflection')
SELECT * FROM dual;


---- Habit 5 (Track Expenses)
INSERT ALL
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (5, TIMESTAMP '2026-02-05 12:20:00', 1, 5, 'Tracked all expenses for the day')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (5, TIMESTAMP '2026-02-06 12:20:00', 1, 5, 'Under budget today')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (5, TIMESTAMP '2026-02-07 12:20:00', 0, 0, 'Forgot to log')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (5, TIMESTAMP '2026-02-08 12:20:00', 1, 5, 'Tracked all spending')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (5, TIMESTAMP '2026-02-09 12:20:00', 1, 5, 'Saved $15 today')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (5, TIMESTAMP '2026-02-10 12:20:00', 1, 5, 'Hit weekly target')
SELECT * FROM dual;  


---- Habit 6 (Evening Walk)
INSERT ALL
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (6, TIMESTAMP '2026-02-10 18:30:00', 1, 3, 'Nice evening stroll')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (6, TIMESTAMP '2026-02-11 18:30:00', 1, 3, 'Walked 2km')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (6, TIMESTAMP '2026-02-12 18:30:00', 0, 0, 'Rainy day')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (6, TIMESTAMP '2026-02-13 18:30:00', 1, 3, 'Listened to a podcast')
  INTO Habit_log (habit_id, entry_timestamp, completed, points_earned, notes)
    VALUES (6, TIMESTAMP '2026-02-14 18:30:00', 1, 3, 'Valentine walk')
SELECT * FROM dual;
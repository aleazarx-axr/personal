// backend/controllers/assessmentController.js
const db = require('../config/db');

exports.getInitData = async (req, res) => {
    try {
        const [programs] = await db.execute('SELECT * FROM university_fees.programs');
        const [statuses] = await db.execute('SELECT * FROM university_fees.student_status');
        const [fees] = await db.execute('SELECT * FROM university_fees.fee_structure ORDER BY description ASC');
        const [students] = await db.execute('SELECT * FROM university_fees.students_master_list');
        const [settings] = await db.execute('SELECT * FROM university_fees.campus_settings LIMIT 1');

        res.status(200).json({ programs, statuses, fees, students, settings: settings[0] });
    } catch (error) {
        console.error("🔥 Error fetching assessment data:", error);
        res.status(500).json({ message: 'Error fetching assessment data' });
    }
};

// --- NEW ENGINE: BACKEND FEE EVALUATOR ---
exports.evaluateFees = async (req, res) => {
    const { program_name, year_level, student_id } = req.body;
    
    try {
        const [fees] = await db.execute('SELECT * FROM university_fees.fee_structure ORDER BY description ASC');
        
        // Fetch the student's exact units from the database if an ID is provided
        let total_units = 0;
        if (student_id) {
            const [students] = await db.execute('SELECT total_units FROM university_fees.students_master_list WHERE student_id = ?', [student_id]);
            if (students.length > 0) total_units = parseFloat(students[0].total_units) || 0;
        }
        
        const isEducation = program_name.toUpperCase().includes('BSED') || program_name.toUpperCase().includes('BEED') || program_name.toUpperCase().includes('EDUCATION');
        const isComputer = program_name.toUpperCase().includes('BSCS') || program_name.toUpperCase().includes('ACT') || program_name.toUpperCase().includes('COMPUTER') || program_name.toUpperCase().includes('APP DEV');
        const levelNum = parseInt(year_level) || 1;

        let evaluatedFees = {};
        
        fees.forEach(f => {
            const desc = f.description.toUpperCase();
            let shouldCheck = true; // All fees checked by default
            let units = 1;

            // 1. NSTP Logic
            if (desc.includes('NSTP') || desc.includes('NATIONAL SERVICE')) {
                if (levelNum !== 1) shouldCheck = false;
            }
            // 2. PE Logic
            if (desc === 'PE' || desc === 'P.E' || desc === 'P.E.' || desc.includes('PHYSICAL EDUCATION')) {
                if (levelNum > 2) shouldCheck = false;
            }
            // 3. ComLab Logic
            if (desc.includes('COMLAB') || desc.includes('COMPUTER LAB') || desc.includes('COMPUTER LABORATORY')) {
                if (isEducation) shouldCheck = false;
            }
            // 4. Cultural Logic
            if (desc.includes('CULTURAL')) {
                if (isComputer) shouldCheck = false;
            }

            // 5. Tuition Fee Override
            if (desc === 'TUITION FEE' || desc.includes('TUITION')) {
                if (total_units > 0) {
                    units = total_units;
                    shouldCheck = true;
                }
            }

            // Pack it up for the frontend
            evaluatedFees[f.id] = {
                desc: f.description,
                amount: parseFloat(f.amount_per_unit),
                units: units,
                checked: shouldCheck
            };
        });

        res.status(200).json(evaluatedFees);
    } catch (error) {
        console.error("Error evaluating fees:", error);
        res.status(500).json({ message: 'Error evaluating fees' });
    }
};

// --- THE AUTO-LOGGER ---
exports.saveRecord = async (req, res) => {
    // Note: We use 'issuer_id' or 'issuer_name' to track who generated it
    const { student_id, student_name, course_major, year_level, semester, school_year, total_amount, issuer_name } = req.body;
    
    try {
        // 1. Save to Assessment DB to track duplicates and keep the legacy system intact
        const [check] = await db.execute(
            'SELECT id FROM university_fees.aof_records WHERE student_id=? AND total_amount=? AND date_printed >= NOW() - INTERVAL 1 MINUTE',
            [student_id, total_amount]
        );
        
        if (check.length === 0) {
            // Save to Legacy DB
            await db.execute(
                'INSERT INTO university_fees.aof_records (student_id, student_name, course_major, year_level, semester, school_year, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [student_id, student_name, course_major, year_level, semester, school_year, total_amount]
            );

            // 2. Auto-Log into Document Logs (DocumentTracking Table)
            // Generating standard Document Tracking fields
            const trackingNumber = `AOF-${student_id}-${new Date().getTime().toString().slice(-4)}`;
            const subjectLine = `Assessment of Fees: ${course_major}`;
            const remarks = `SY: ${school_year}, ${semester} | Level ${year_level} | Total Assessed: ₱${total_amount.toFixed(2)}`;
            const senderName = issuer_name || 'Assessment System';
            
            // NOTE: Ensure 'DocumentLogs' is the exact name of your database table for Document Tracking. 
            // If it is named differently (e.g., 'document_tracking'), change it below:
            await db.execute(
                `INSERT INTO DocumentLogs 
                 (tracking_number, category, document_type, subject, sender, receiver, status, remarks, is_archived) 
                 VALUES (?, 'Outgoing', 'Other', ?, ?, ?, 'Completed', ?, 0)`,
                [trackingNumber, subjectLine, senderName, student_name, remarks]
            );
        }
        res.status(200).json({ message: 'Record saved and logged to Document Tracking' });
    } catch (error) { 
        console.error("Error saving record:", error);
        res.status(500).json({ message: 'Error saving record' }); 
    }
};

// --- NEW: MASTER LIST EXCEL IMPORTER ---
exports.importStudents = async (req, res) => {
    const { studentsData } = req.body; // This will be the parsed JSON from React
    try {
        if (!studentsData || !Array.isArray(studentsData)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        // Optional: Clear the old master list before importing the new one
        // await db.execute('TRUNCATE TABLE university_fees.students_master_list');

        let importedCount = 0;

        for (const row of studentsData) {
            const id = row[1]?.toString().trim();
            if (!id || id.toLowerCase() === 'student id') continue;

            const rawName = row[2]?.toString().trim() || '';
            const course = row[3]?.toString().trim() || '';
            const major = row[4]?.toString().trim() || '';
            const units = parseFloat(row[5]) || 0;
            const level = row[6]?.toString().trim() || '';

            // Clean Name: Remove the email address part if it exists (e.g., "Villanueva.aleazar@wmsu.edu.ph")
            const name = rawName.split('.')[0].trim();

            await db.execute(
                `INSERT INTO university_fees.students_master_list 
                (student_id, student_name, course, major, total_units, year_level) 
                VALUES (?, ?, ?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                student_name=?, course=?, major=?, total_units=?, year_level=?`,
                [id, name, course, major, units, level, name, course, major, units, level]
            );
            importedCount++;
        }

        res.status(200).json({ message: `Successfully imported/updated ${importedCount} students.` });
    } catch (error) {
        console.error("🔥 Error importing students:", error);
        res.status(500).json({ message: 'Error processing Excel data' });
    }
};

// --- ADD THESE TO THE BOTTOM OF assessmentController.js ---

exports.getRecords = async (req, res) => {
    try {
        const [records] = await db.execute('SELECT * FROM university_fees.aof_records ORDER BY date_printed DESC');
        res.status(200).json(records);
    } catch (error) {
        console.error("Error fetching records:", error);
        res.status(500).json({ message: 'Error fetching records' });
    }
};

exports.getStudentsList = async (req, res) => {
    try {
        const [students] = await db.execute('SELECT * FROM university_fees.students_master_list ORDER BY student_name ASC');
        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: 'Error fetching students' });
    }
};

// --- ADD THESE TO THE BOTTOM OF assessmentController.js ---

// 1. Campus & Signatory Settings
exports.updateCampusSettings = async (req, res) => {
    const { campus_name, campus_address, coordinator_name, coordinator_title } = req.body;
    try {
        await db.execute(
            `UPDATE university_fees.campus_settings SET campus_name=?, campus_address=?, coordinator_name=?, coordinator_title=? WHERE id=1`,
            [campus_name, campus_address, coordinator_name, coordinator_title]
        );
        res.status(200).json({ message: 'Campus settings updated' });
    } catch (error) { res.status(500).json({ message: 'Error updating campus settings' }); }
};

// 2. Academic Programs CRUD
exports.addProgram = async (req, res) => {
    const { program_name, major, college } = req.body;
    try {
        await db.execute('INSERT INTO university_fees.programs (program_name, major, college) VALUES (?, ?, ?)', [program_name, major, college]);
        res.status(200).json({ message: 'Program added' });
    } catch (error) { res.status(500).json({ message: 'Error adding program' }); }
};

exports.deleteProgram = async (req, res) => {
    try {
        await db.execute('DELETE FROM university_fees.programs WHERE id=?', [req.params.id]);
        res.status(200).json({ message: 'Program deleted' });
    } catch (error) { res.status(500).json({ message: 'Error deleting program' }); }
};

// 3. Financial Charges (Fees) CRUD
exports.addFee = async (req, res) => {
    const { description, amount } = req.body;
    try {
        await db.execute('INSERT INTO university_fees.fee_structure (description, amount_per_unit) VALUES (?, ?)', [description, amount]);
        res.status(200).json({ message: 'Fee added' });
    } catch (error) { res.status(500).json({ message: 'Error adding fee' }); }
};

exports.deleteFee = async (req, res) => {
    try {
        await db.execute('DELETE FROM university_fees.fee_structure WHERE id=?', [req.params.id]);
        res.status(200).json({ message: 'Fee deleted' });
    } catch (error) { res.status(500).json({ message: 'Error deleting fee' }); }
};

// 4. Student Status Options CRUD
exports.addStatus = async (req, res) => {
    const { status_name } = req.body;
    try {
        await db.execute('INSERT INTO university_fees.student_status (status_name) VALUES (?)', [status_name.toUpperCase()]);
        res.status(200).json({ message: 'Status added' });
    } catch (error) { res.status(500).json({ message: 'Error adding status' }); }
};

exports.deleteStatus = async (req, res) => {
    try {
        await db.execute('DELETE FROM university_fees.student_status WHERE id=?', [req.params.id]);
        res.status(200).json({ message: 'Status deleted' });
    } catch (error) { res.status(500).json({ message: 'Error deleting status' }); }
};
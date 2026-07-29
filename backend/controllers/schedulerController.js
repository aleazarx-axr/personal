exports.generateSchedule = (req, res) => {
    const { subjects, faculty, sections, rooms, settings } = req.body;
    let schedule = [];
    let teacher_schedule = {}; let section_schedule = {}; let room_schedule = {};
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    faculty.forEach(f => { teacher_schedule[f.name] = days.reduce((acc, d) => ({...acc, [d]: []}), {}); });
    sections.forEach(s => { section_schedule[s.code] = days.reduce((acc, d) => ({...acc, [d]: []}), {}); });
    rooms.forEach(r => { room_schedule[r.name] = days.reduce((acc, d) => ({...acc, [d]: []}), {}); });

    const timeToFloat = (timeStr) => { const [h, m] = timeStr.split(':').map(Number); return h + (m / 60.0); };
    const floatToTime = (val) => { const h = Math.floor(val); return `${String(h).padStart(2, '0')}:${String(Math.round((val - h) * 60)).padStart(2, '0')}`; };
    
    const isTimeBusy = (busyTimes, startStr, endStr) => {
        if (!busyTimes) return false;
        const start = timeToFloat(startStr); const end = timeToFloat(endStr);
        return busyTimes.some(([bStart, bEnd]) => !(end <= timeToFloat(bStart) || start >= timeToFloat(bEnd)));
    };

    try {
        let assignments = [];
        sections.forEach(sec => {
            subjects.forEach(sub => {
                const qualified = faculty.filter(f => f.subjects.includes(sub.code));
                if (qualified.length === 0) return;
                const teacher = qualified.sort((a, b) => schedule.filter(s => s.faculty === a.name).length - schedule.filter(s => s.faculty === b.name).length)[0];
                
                if (sub.lec > 0) assignments.push({ section: sec, subject: sub, teacher, hours: sub.lec * (settings.lec_hours_per_unit || 1), type: "Lecture" });
                if (sub.lab > 0) for (let i = 0; i < sub.lab; i++) assignments.push({ section: sec, subject: sub, teacher, hours: settings.lab_hours_per_unit || 3, type: "Laboratory" });
            });
        });

        assignments.sort((a, b) => a.type !== b.type ? (a.type === "Laboratory" ? -1 : 1) : b.hours - a.hours);

        assignments.forEach(assignment => {
            const { section, subject, teacher, hours, type } = assignment;
            let assigned = false;
            
            for (const day of [...days].sort(() => Math.random() - 0.5)) {
                if (assigned) break;
                let startTimes = [];
                for (let h = 14; h <= (19.0 - hours) * 2; h++) startTimes.push(h * 0.5); 
                startTimes.sort((a, b) => type === "Laboratory" ? (a >= 13.0 && a <= 16.0 ? 0 : 1) - (b >= 13.0 && b <= 16.0 ? 0 : 1) : (a >= 7.0 && a <= 11.0 ? 0 : 1) - (b >= 7.0 && b <= 11.0 ? 0 : 1));

                for (const startFloat of startTimes) {
                    const endFloat = startFloat + hours;
                    if (startFloat < 13.0 && endFloat > 12.0) continue; // Noon break

                    const startTime = floatToTime(startFloat); const endTime = floatToTime(endFloat);
                    if (isTimeBusy(section_schedule[section.code][day], startTime, endTime)) continue;
                    if (isTimeBusy(teacher_schedule[teacher.name][day], startTime, endTime)) continue;

                    const room = rooms.find(r => r.capacity >= section.students && (type === "Laboratory" ? r.type.toLowerCase().includes("lab") : ["classroom", "lec"].includes(r.type.toLowerCase())) && !isTimeBusy(room_schedule[r.name][day], startTime, endTime));
                    if (!room) continue;

                    schedule.push({ day, time: `${startTime} - ${endTime}`, section: section.code, code: subject.code, title: subject.title, type, faculty: teacher.name, room: room.name });
                    section_schedule[section.code][day].push([startTime, endTime]);
                    teacher_schedule[teacher.name][day].push([startTime, endTime]);
                    room_schedule[room.name][day].push([startTime, endTime]);
                    assigned = true; break; 
                }
            }
        });
        res.status(200).json({ schedule });
    } catch (error) { res.status(500).json({ message: "Engine calculation failure" }); }
};
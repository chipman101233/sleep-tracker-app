// Handle loading screen
window.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen after 2 seconds
    setTimeout(function() {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainApp = document.getElementById('mainApp');
        
        loadingScreen.style.display = 'none';
        mainApp.classList.remove('hidden');
        
        // Initialize app
        initializeData();
        setDefaultDate();
        displaySchedule();
        displaySleepHistory();
        updateStatistics();
    }, 2000);
});

// Initialize localStorage with empty data if it doesn't exist
function initializeData() {
    if (!localStorage.getItem('sleepSchedule')) {
        localStorage.setItem('sleepSchedule', JSON.stringify({}));
    }
    if (!localStorage.getItem('sleepEntries')) {
        localStorage.setItem('sleepEntries', JSON.stringify([]));
    }
}

// Set today's date as default in the date input
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sleepDate').value = today;
}

// Create a sleep schedule
function createSchedule() {
    const bedtime = document.getElementById('bedtime').value;
    const wakeup = document.getElementById('wakeup').value;

    if (!bedtime || !wakeup) {
        alert('Please enter both bedtime and wake-up time!');
        return;
    }

    const schedule = {
        bedtime: bedtime,
        wakeup: wakeup,
        createdAt: new Date().toLocaleString()
    };

    localStorage.setItem('sleepSchedule', JSON.stringify(schedule));
    displaySchedule();
    document.getElementById('bedtime').value = '';
    document.getElementById('wakeup').value = '';
    alert('Sleep schedule created successfully!');
}

// Display the current sleep schedule
function displaySchedule() {
    const schedule = JSON.parse(localStorage.getItem('sleepSchedule'));
    const scheduleDisplay = document.getElementById('scheduleDisplay');

    if (schedule && schedule.bedtime && schedule.wakeup) {
        const duration = calculateDuration(schedule.bedtime, schedule.wakeup);
        scheduleDisplay.innerHTML = `
            <p><strong>Bedtime:</strong> ${schedule.bedtime}</p>
            <p><strong>Wake-up Time:</strong> ${schedule.wakeup}</p>
            <p><strong>Recommended Sleep Duration:</strong> ${duration}</p>
            <p><small>Created: ${schedule.createdAt}</small></p>
        `;
    } else {
        scheduleDisplay.innerHTML = '<p>No schedule created yet. Create one above!</p>';
    }
}

// Log a sleep entry
function logSleep() {
    const date = document.getElementById('sleepDate').value;
    const bedtimeLog = document.getElementById('bedtimeLog').value;
    const waketimeLog = document.getElementById('waketimeLog').value;
    const quality = document.getElementById('quality').value;

    if (!date || !bedtimeLog || !waketimeLog || !quality) {
        alert('Please fill in all fields!');
        return;
    }

    if (quality < 1 || quality > 10) {
        alert('Sleep quality must be between 1 and 10!');
        return;
    }

    const sleepEntry = {
        id: Date.now(),
        date: date,
        bedtime: bedtimeLog,
        waketime: waketimeLog,
        quality: quality,
        duration: calculateDuration(bedtimeLog, waketimeLog)
    };

    const entries = JSON.parse(localStorage.getItem('sleepEntries')) || [];
    entries.push(sleepEntry);
    localStorage.setItem('sleepEntries', JSON.stringify(entries));

    // Clear form
    document.getElementById('bedtimeLog').value = '';
    document.getElementById('waketimeLog').value = '';
    document.getElementById('quality').value = '';

    displaySleepHistory();
    updateStatistics();
    alert('Sleep entry logged successfully!');
}

// Calculate sleep duration between bedtime and waketime
function calculateDuration(bedtime, waketime) {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = waketime.split(':').map(Number);

    let bedtimeMinutes = bedHour * 60 + bedMin;
    let waketimeMinutes = wakeHour * 60 + wakeMin;

    // If wake time is earlier than bedtime, assume it's the next day
    if (waketimeMinutes <= bedtimeMinutes) {
        waketimeMinutes += 24 * 60;
    }

    const durationMinutes = waketimeMinutes - bedtimeMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return `${hours}h ${minutes}m`;
}

// Display sleep history in table
function displaySleepHistory() {
    const entries = JSON.parse(localStorage.getItem('sleepEntries')) || [];
    const historyBody = document.getElementById('historyBody');
    const noHistory = document.getElementById('noHistory');

    if (entries.length === 0) {
        historyBody.innerHTML = '';
        noHistory.style.display = 'block';
        return;
    }

    noHistory.style.display = 'none';
    historyBody.innerHTML = '';

    // Display in reverse order (newest first)
    entries.reverse().forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.bedtime}</td>
            <td>${entry.waketime}</td>
            <td>${entry.duration}</td>
            <td>${entry.quality}/10 ⭐</td>
        `;
        historyBody.appendChild(row);
    });
}

// Update and display sleep statistics
function updateStatistics() {
    const entries = JSON.parse(localStorage.getItem('sleepEntries')) || [];

    if (entries.length === 0) {
        document.getElementById('avgDuration').textContent = '0h 0m';
        document.getElementById('avgQuality').textContent = '0/10';
        document.getElementById('totalEntries').textContent = '0';
        return;
    }

    // Calculate average sleep duration
    let totalMinutes = 0;
    entries.forEach(entry => {
        const [hours, minutes] = entry.duration.split('h').map(str => parseInt(str.trim()));
        totalMinutes += hours * 60 + minutes;
    });
    const avgMinutes = totalMinutes / entries.length;
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = Math.round(avgMinutes % 60);

    // Calculate average sleep quality
    const totalQuality = entries.reduce((sum, entry) => sum + parseInt(entry.quality), 0);
    const avgQuality = (totalQuality / entries.length).toFixed(1);

    document.getElementById('avgDuration').textContent = `${avgHours}h ${avgMins}m`;
    document.getElementById('avgQuality').textContent = `${avgQuality}/10`;
    document.getElementById('totalEntries').textContent = entries.length;
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
        localStorage.removeItem('sleepSchedule');
        localStorage.removeItem('sleepEntries');
        initializeData();
        displaySchedule();
        displaySleepHistory();
        updateStatistics();
        alert('All data cleared!');
    }
}

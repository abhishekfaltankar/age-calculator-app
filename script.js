document.addEventListener('DOMContentLoaded', () => {
    const dobInput = document.getElementById('dob-input');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultDiv = document.getElementById('result');
    const yearsDisplay = document.getElementById('years');
    const monthsDisplay = document.getElementById('months');
    const daysDisplay = document.getElementById('days');
    const hoursDisplay = document.getElementById('hours');
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const themeBtn = document.getElementById('theme-btn');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const extraStats = document.getElementById('extra-stats');
    const nextBirthdayElement = document.getElementById('next-birthday');
    const totalDaysElement = document.getElementById('total-days');
    const funFactElement = document.getElementById('fun-fact');
    const historyContainer = document.getElementById('history-container');

    let liveTimer = null;

    // Theme logic
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLightMode = document.body.classList.contains('light-mode');
        
        if (isLightMode) {
            localStorage.setItem('theme', 'light');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            localStorage.setItem('theme', 'dark');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    });

    // History logic
    let ageHistory = JSON.parse(localStorage.getItem('ageHistory')) || [];
    renderHistory();

    function renderHistory() {
        if (ageHistory.length === 0) {
            historyContainer.classList.add('history-hidden');
            return;
        }
        historyContainer.classList.remove('history-hidden');
        historyContainer.innerHTML = '';
        ageHistory.forEach(dateStr => {
            const tag = document.createElement('span');
            tag.className = 'history-tag';
            tag.textContent = dateStr;
            tag.addEventListener('click', () => {
                dobInput.value = dateStr;
                startCalculation();
            });
            historyContainer.appendChild(tag);
        });
    }

    // Set max date to today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    dobInput.setAttribute('max', formattedDate);

    calculateBtn.addEventListener('click', startCalculation);
    
    dobInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            startCalculation();
        }
    });

    function startCalculation() {
        if (dobInput.validity && dobInput.validity.badInput) {
            showAlert('Please enter a valid date!');
            return;
        }

        if (!dobInput.value) {
            showAlert('Please select your date of birth!');
            return;
        }

        const dobParts = dobInput.value.split('-');
        const year = parseInt(dobParts[0], 10);
        const month = parseInt(dobParts[1], 10) - 1;
        const day = parseInt(dobParts[2], 10);

        // Use local timezone midnight
        const dobDate = new Date();
        dobDate.setFullYear(year, month, day);
        dobDate.setHours(0, 0, 0, 0);

        // Check for invalid dates (e.g., 31 Feb)
        if (
            dobDate.getFullYear() !== year ||
            dobDate.getMonth() !== month ||
            dobDate.getDate() !== day
        ) {
            showAlert('Please enter a valid date!');
            return;
        }

        const currentDate = new Date();

        if (dobDate > currentDate) {
            showAlert('Date of birth cannot be in the future!');
            return;
        }

        // Save to history
        const dateString = dobInput.value;
        if (!ageHistory.includes(dateString)) {
            ageHistory.unshift(dateString);
            if (ageHistory.length > 5) {
                ageHistory.pop();
            }
            localStorage.setItem('ageHistory', JSON.stringify(ageHistory));
            renderHistory();
        }

        // Clear existing timer if any
        if (liveTimer) {
            clearInterval(liveTimer);
        }

        // Show results box directly
        resultDiv.classList.remove('empty');
        
        extraStats.classList.remove('hidden');
        // Force reflow
        void extraStats.offsetWidth;
        extraStats.classList.add('visible');
        
        // Add animation class to pulsate 
        const resultBoxes = document.querySelectorAll('.result-box');
        resultBoxes.forEach(box => {
            box.classList.remove('animate-result');
            void box.offsetWidth;
            box.classList.add('animate-result');
        });

        // Run immediately with animations
        updateAge(dobDate, true);

        // Start ticking
        liveTimer = setInterval(() => {
            updateAge(dobDate, false);
        }, 1000);

        calculateExtraStats(dobDate, currentDate);
    }

    function calculateExtraStats(dobDate, currentDate) {
        // Total days
        const diffTime = currentDate.getTime() - dobDate.getTime();
        const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        totalDaysElement.textContent = totalDays.toLocaleString();

        // Next Birthday
        let nextBday = new Date(currentDate.getFullYear(), dobDate.getMonth(), dobDate.getDate());
        // Standardize the current time for the comparison
        let currentDayZeroTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        
        if (nextBday < currentDayZeroTime) {
            nextBday.setFullYear(currentDate.getFullYear() + 1);
        }
        
        const daysToBday = Math.floor((nextBday - currentDayZeroTime) / (1000 * 60 * 60 * 24));
        
        if (daysToBday === 0) {
            nextBirthdayElement.textContent = "Today! 🎉";
        } else if (daysToBday === 1) {
            nextBirthdayElement.textContent = "Tomorrow! 🎈";
        } else {
            nextBirthdayElement.textContent = `In ${daysToBday} days`;
        }

        // Fun Fact
        const facts = [
            `Your heart has beaten approximately ${(totalDays * 115200).toLocaleString()} times.`,
            `You've taken about ${(totalDays * 23040).toLocaleString()} breaths.`,
            `You've slept for roughly ${(totalDays / 3).toFixed(0)} days of your life.`,
            `You've blinked around ${(totalDays * 28800).toLocaleString()} times.`,
            `The earth has traveled ${(totalDays * 2.59).toLocaleString(undefined, {maximumFractionDigits: 1})} million km around the sun since your birth.`
        ];
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        funFactElement.textContent = randomFact;
    }

    function updateAge(dobDate, useAnimation) {
        const currentDate = new Date();

        let years = currentDate.getFullYear() - dobDate.getFullYear();
        let months = currentDate.getMonth() - dobDate.getMonth();
        let days = currentDate.getDate() - dobDate.getDate();
        let hours = currentDate.getHours();
        let minutes = currentDate.getMinutes();
        let seconds = currentDate.getSeconds();

        if (days < 0) {
            months--;
            const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
            days += previousMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        if (useAnimation) {
            animateValue(yearsDisplay, parseInt(yearsDisplay.textContent) || 0, years, 1000);
            animateValue(monthsDisplay, parseInt(monthsDisplay.textContent) || 0, months, 1000);
            animateValue(daysDisplay, parseInt(daysDisplay.textContent) || 0, days, 1000);
            animateValue(hoursDisplay, parseInt(hoursDisplay.textContent) || 0, hours, 1000);
            animateValue(minutesDisplay, parseInt(minutesDisplay.textContent) || 0, minutes, 1000);
            animateValue(secondsDisplay, parseInt(secondsDisplay.textContent) || 0, seconds, 1000);
        } else {
            yearsDisplay.textContent = years;
            monthsDisplay.textContent = months;
            daysDisplay.textContent = days;
            hoursDisplay.textContent = hours;
            minutesDisplay.textContent = minutes;
            secondsDisplay.textContent = seconds;
        }
    }

    function animateValue(obj, start, end, duration) {
        if (start === end) {
            obj.innerHTML = end;
            return;
        }
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentVal = Math.floor(easeOutQuart * (end - start) + start);
            obj.innerHTML = currentVal;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end;
            }
        };
        window.requestAnimationFrame(step);
    }

    function showAlert(message) {
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = 'custom-alert';
        alertDiv.textContent = message;
        
        Object.assign(alertDiv.style, {
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%) translateY(-20px)',
            background: '#ff4b4b',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(255, 75, 75, 0.4)',
            opacity: '0',
            transition: 'all 0.3s ease',
            zIndex: '1000',
            fontWeight: '600'
        });

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.style.transform = 'translateX(-50%) translateY(0)';
            alertDiv.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            alertDiv.style.transform = 'translateX(-50%) translateY(-20px)';
            alertDiv.style.opacity = '0';
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    }
});

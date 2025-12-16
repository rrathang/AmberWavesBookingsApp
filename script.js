document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       STATE & ELEMENTS
       ========================================= */
    const elements = {
        villaSelect: document.getElementById('villaSelect'),
        numRooms: document.getElementById('numRooms'),
        turfAccess: document.getElementById('turfAccess'),
        turfTimeFields: document.querySelectorAll('.turf-time'),
        generateBtn: document.getElementById('generateBtn'),
        copyBtn: document.getElementById('copyBtn'),
        confirmationSection: document.getElementById('confirmationSection'),
        generatedOutput: document.getElementById('generatedOutput'),
        copyToast: document.getElementById('copyToast'),
        
        // Calendar Elements
        calendarGrid: document.getElementById('calendarGrid'),
        monthDisplay: document.getElementById('monthDisplay'),
        prevMonthBtn: document.getElementById('prevMonth'),
        nextMonthBtn: document.getElementById('nextMonth')
    };

    let calendarDate = new Date();
    let bookingsData = [];

    /* =========================================
       INITIALIZATION
       ========================================= */
    
    // Set default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    document.getElementById('checkInDate').valueAsDate = today;
    document.getElementById('checkOutDate').valueAsDate = tomorrow;

    // Load initial calendar data
    fetchBookings();

    /* =========================================
       EVENT LISTENERS
       ========================================= */

    // 1. Villa Selection Logic
    elements.villaSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'Azure Star') {
            elements.numRooms.value = 3;
        } else if (val === 'Emerald Green') {
            elements.numRooms.value = 5;
        }
    });

    // 2. Turf Toggle Logic
    elements.turfAccess.addEventListener('change', (e) => {
        if (e.target.checked) {
            elements.turfTimeFields.forEach(el => el.classList.remove('d-none'));
        } else {
            elements.turfTimeFields.forEach(el => el.classList.add('d-none'));
        }
    });

    // 3. Generate Confirmation
    elements.generateBtn.addEventListener('click', generateConfirmation);

    // 4. Copy to Clipboard
    elements.copyBtn.addEventListener('click', copyToClipboard);

    // 5. Calendar Navigation
    elements.prevMonthBtn.addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        renderCalendar();
    });

    elements.nextMonthBtn.addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        renderCalendar();
    });


    /* =========================================
       FUNCTIONS
       ========================================= */

    function generateConfirmation() {
        // Validate Form (Basic)
        const form = document.getElementById('bookingForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Gather Data
        const data = {
            guestName: document.getElementById('guestName').value,
            checkInDate: formatDate(document.getElementById('checkInDate').value),
            checkOutDate: formatDate(document.getElementById('checkOutDate').value),
            numPeople: document.getElementById('numPeople').value,
            villa: elements.villaSelect.value,
            rooms: elements.numRooms.value,
            checkInTime: formatTime12h(document.getElementById('checkInTime').value),
            checkOutTime: formatTime12h(document.getElementById('checkOutTime').value),
            turfAccess: elements.turfAccess.checked,
            turfStart: elements.turfAccess.checked ? formatTime12h(document.getElementById('turfStartTime').value) : '',
            turfEnd: elements.turfAccess.checked ? formatTime12h(document.getElementById('turfEndTime').value) : ''
        };

        // Construct Message
        let message = `Booking Confirmation: VillaHopper#70\nStay Period: ${data.checkInDate} to ${data.checkOutDate}\n\n`;
        message += `Dear ${data.guestName},\n\n`;
        message += `Thank you for choosing VillaHopper#70 for your stay! We are pleased to confirm your booking.\n\n`;
        
        message += `*Booking Summary:*\n`;
        message += `- *Advance Paid:* ₹6000/- (Six Thousand Only)\n`;
        message += `- *Balance Amount (Payable at Check-in):* ₹14000/- (Fourteen Thousand Only)\n\n`;

        message += `*Additional Charges:*\n`;
        message += `- ₹500/- Cleaning Fee (to be paid to the caretaker)\n`;
        message += `- ₹6,000/- Refundable Security Deposit (preferably in cash or via UPI, payable at check-in)\n\n`;

        message += `*Property Details:*\n`;
        message += `- *Property Name:* VillaHopper#70\n`;
        message += `- *Location:* VillaHopper#70, Adithyaram Signature City, Pattipulam, 100ft Road, ECR\n\n`;

        message += `*Stay Details:*\n`;
        message += `- *Check-in Date:* ${data.checkInDate}\n`;
        message += `- *Check-out Date:* ${data.checkOutDate}\n`;
        message += `- *Number of Guests:* ${data.numPeople}\n`;
        message += `- *Check-in Time:* ${data.checkInTime}\n`;
        message += `- *Check-out Time:* ${data.checkOutTime}\n`;
        
        // Turf Info if applicable (Not in template but requested logic implies we might want to use it? 
        // The prompt says "Generate a formatted confirmation message exactly in the style below".
        // The style below DOES NOT have Turf info. I will stick to the template strictly as requested.
        // If I were to add it, it would be under Amenities or Extra, but I'll stick to strict template.)
        
        message += `\n*Amenities:*\n`;
        message += `- ${data.rooms} AC Bedrooms including a large Suite Room with attached Bathrooms\n`;
        // Note: Logic for beds could be dynamic based on villa, but prompt didn't specify mapping. Keeping static as per template default.
        message += `- 3 King Size Beds and 4 Single Beds\n`; 
        message += `- A Private Swimming Pool with an attached shower and restroom\n`;
        message += `- Play Area with TT Table, Carrom board and other board games\n`;
        message += `- Rooftop Gazebo for candlelight dinners or casual gatherings\n`;
        message += `- Fully functional bar (we do not serve alcohol)\n`;
        message += `- Free Wi-Fi\n`;
        message += `- Inverter backup of up to 8 hours for fans and lights, but not for AC\n`;
        message += `- Ample parking space\n\n`;

        message += `*Contact Information:*\n`;
        message += `If you have any questions or need further assistance, please contact us:\n`;
        message += `- *Phone:* +91-8838581697\n`;
        message += `- *Email:* villahopper70@gmail.com\n\n`;

        message += `We look forward to hosting you and hope you have a memorable stay at VillaHopper#70.\n\n`;
        message += `Warm regards,\nAmberWaves`;

        // Output
        elements.generatedOutput.value = message;
        elements.confirmationSection.classList.remove('d-none');
        elements.confirmationSection.scrollIntoView({ behavior: 'smooth' });
    }

    function copyToClipboard() {
        const text = elements.generatedOutput.value;
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            elements.copyToast.classList.add('toast-visible');
            setTimeout(() => {
                elements.copyToast.classList.remove('toast-visible');
            }, 2000);
        });
    }

    /* =========================================
       CALENDAR LOGIC
       ========================================= */

    async function fetchBookings() {
        try {
            const response = await fetch('bookings.json');
            bookingsData = await response.json();
            renderCalendar();
        } catch (error) {
            console.error('Error loading bookings:', error);
            // Fallback empty if file missing or error
            bookingsData = [];
            renderCalendar();
        }
    }

    function renderCalendar() {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth(); // 0-indexed

        // Update Header
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        elements.monthDisplay.textContent = `${monthNames[month]} ${year}`;

        // Calculations
        const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Clear Grid
        elements.calendarGrid.innerHTML = '';

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            const div = document.createElement('div');
            div.className = 'calendar-day empty';
            elements.calendarGrid.appendChild(div);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const div = document.createElement('div');
            div.className = 'calendar-day';
            div.innerHTML = `<span class="day-number">${day}</span>`;

            // Check for bookings
            const booking = getBookingForDate(dateStr);
            if (booking) {
                div.classList.add('booked');
                const indicator = document.createElement('div');
                indicator.className = 'booking-indicator';
                div.appendChild(indicator);
                
                // Tooltip / Click interaction
                div.title = `${booking.guestName} (${booking.villa})`;
                div.addEventListener('click', () => {
                    alert(`Booking Details:\nGuest: ${booking.guestName}\nVilla: ${booking.villa}\nDates: ${booking.checkIn} to ${booking.checkOut}`);
                });
            }

            // Highlight Today
            const todayStr = new Date().toISOString().split('T')[0];
            if (dateStr === todayStr) {
                div.classList.add('today');
            }

            elements.calendarGrid.appendChild(div);
        }
    }

    function getBookingForDate(dateStr) {
        // Simple check: is dateStr >= checkIn AND dateStr < checkOut (usually checkout day is free for next guest, but let's assume inclusive for display or exclusive logic)
        // Standard hotel logic: Check-in day IS booked. Check-out day IS booked (morning) but usually available for next Check-in.
        // For simplicity: if date is within range [checkIn, checkOut).
        
        return bookingsData.find(b => {
             return dateStr >= b.checkIn && dateStr < b.checkOut;
        });
    }

    /* =========================================
       HELPERS
       ========================================= */
       
    function formatDate(isoDate) {
        if (!isoDate) return '';
        const d = new Date(isoDate);
        // Format: DD-MM-YYYY
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function formatTime12h(timeStr) {
        if (!timeStr) return '';
        const [hours24, minutes] = timeStr.split(':');
        const hours = parseInt(hours24, 10);
        const suffix = hours >= 12 ? 'PM' : 'AM';
        const hours12 = ((hours + 11) % 12 + 1);
        return `${hours12}:${minutes} ${suffix}`;
    }
});

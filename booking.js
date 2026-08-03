/* ============================================================
   BOOKING MODAL — shared logic, include on every page
   Requires: booking-modal.css loaded, and the booking modal HTML
   snippet pasted into the page before this script tag.
   Automatically hijacks every <a href="booking.html"> on the page
   so it opens the modal instead of navigating.
   ============================================================ */
(function () {
  const overlay = document.getElementById('bookingModalOverlay');
  if (!overlay) return; // modal markup isn't on this page — nothing to wire up

  const box = overlay.querySelector('.booking-modal-box');
  const closeBtn = document.getElementById('bookingModalClose');
  const subtitle = document.getElementById('bookingModalSubtitle');

  const stepPanels = {
    1: overlay.querySelector('[data-step-panel="1"]'),
    2: overlay.querySelector('[data-step-panel="2"]'),
  };
  const stepIndicator = overlay.querySelector('.booking-step-indicator');
  const stepDot1 = document.getElementById('stepDot1');
  const stepDot2 = document.getElementById('stepDot2');
  const stepLabel1 = document.getElementById('stepLabel1');
  const stepLabel2 = document.getElementById('stepLabel2');
  const stepLine = document.getElementById('stepLine');

  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const calendarMonthLabel = document.getElementById('calendarMonthLabel');
  const calendarGrid = document.getElementById('calendarGrid');

  const selectedDateLabel = document.getElementById('selectedDateLabel');
  const timeSlotGrid = document.getElementById('timeSlotGrid');

  const detailsToggleBtn = document.getElementById('detailsToggleBtn');
  const detailsToggleText = document.getElementById('detailsToggleText');
  const detailsExpand = document.getElementById('detailsExpand');

  const toStep2Btn = document.getElementById('toStep2Btn');
  const backToStep1Btn = document.getElementById('backToStep1Btn');
  const submitBookingBtn = document.getElementById('submitBookingBtn');
  const bookingForm = document.getElementById('bookingForm');

  const bookingSuccess = document.getElementById('bookingSuccess');
  const bookingSuccessDetail = document.getElementById('bookingSuccessDetail');

  /* ---------------- Config ---------------- */
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MAX_DAYS_AHEAD = 60;   // how far into the future someone can book
  const SLOT_START_HOUR = 9;   // first slot: 9:00 AM
  const SLOT_END_HOUR = 18;    // last slot starts before 6:00 PM
  const SLOT_INTERVAL_MIN = 60;
  const MIN_LEAD_MIN = 60;     // same-day slots need at least this much notice

  /* ---------------- State ---------------- */
  let viewDate = startOfMonth(new Date());
  let selectedDate = null; // Date at midnight
  let selectedTime = null; // "H:MM" 24-hour key

  /* ---------------- Date helpers ---------------- */
  function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
  function isSameDay(a, b) {
    return !!a && !!b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }
  function maxBookableDate() { return startOfDay(addDays(new Date(), MAX_DAYS_AHEAD)); }

  function formatTime(date) {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  function formatDateLong(date) {
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  function timeKeyToDate(dateAtMidnight, key) {
    const [h, m] = key.split(':').map(Number);
    const d = new Date(dateAtMidnight);
    d.setHours(h, m, 0, 0);
    return d;
  }

  /* ---------------- Calendar rendering ---------------- */
  function renderCalendar() {
    calendarMonthLabel.textContent = `${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

    const today = startOfDay(new Date());
    prevMonthBtn.disabled = viewDate.getTime() <= startOfMonth(today).getTime();

    const firstOfMonth = startOfMonth(viewDate);
    const firstWeekday = firstOfMonth.getDay(); // 0 = Sunday
    const gridStart = addDays(firstOfMonth, -firstWeekday);
    const maxDate = maxBookableDate();

    calendarGrid.innerHTML = '';

    for (let i = 0; i < 42; i++) {
      const cellDate = addDays(gridStart, i);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = cellDate.getDate();

      const inCurrentMonth = cellDate.getMonth() === viewDate.getMonth();
      const isPast = cellDate.getTime() < today.getTime();
      const isTooFar = cellDate.getTime() > maxDate.getTime();
      const isToday = isSameDay(cellDate, today);
      const isSelected = selectedDate && isSameDay(cellDate, selectedDate);

      if (!inCurrentMonth) btn.classList.add('other-month');
      if (isToday) btn.classList.add('today');
      if (isSelected) btn.classList.add('selected');

      if (isPast || isTooFar || !inCurrentMonth) {
        btn.disabled = true;
        if (isPast) btn.classList.add('past');
      } else {
        btn.addEventListener('click', () => selectDate(cellDate));
      }

      calendarGrid.appendChild(btn);
    }

    // Trim a trailing 6th row if it's entirely next-month (keeps months
    // that only need 5 rows from showing an obviously empty row).
    const row6 = Array.from(calendarGrid.children).slice(35);
    if (row6.every(btn => btn.classList.contains('other-month'))) {
      row6.forEach(btn => btn.remove());
    }
  }

  function selectDate(date) {
    selectedDate = startOfDay(date);
    selectedTime = null;
    renderCalendar();
    renderTimeSlots();
    updateSelectedSummary();
    updateContinueState();
  }

  /* ---------------- Time slots ---------------- */
  function renderTimeSlots() {
    timeSlotGrid.innerHTML = '';
    if (!selectedDate) return;

    const now = new Date();
    const isToday = isSameDay(selectedDate, now);
    const slots = [];

    for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR; hour += SLOT_INTERVAL_MIN / 60) {
      const slotDate = new Date(selectedDate);
      slotDate.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0);

      if (isToday && (slotDate - now) / 60000 < MIN_LEAD_MIN) continue;
      slots.push(slotDate);
    }

    if (slots.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'time-slot-empty';
      empty.textContent = 'No slots left for this day — try another date.';
      timeSlotGrid.appendChild(empty);
      return;
    }

    slots.forEach(slotDate => {
      const key = `${slotDate.getHours()}:${String(slotDate.getMinutes()).padStart(2, '0')}`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = formatTime(slotDate);
      if (selectedTime === key) btn.classList.add('selected');
      btn.addEventListener('click', () => {
        selectedTime = key;
        renderTimeSlots();
        updateSelectedSummary();
        updateContinueState();
      });
      timeSlotGrid.appendChild(btn);
    });
  }

  function updateSelectedSummary() {
    if (!selectedDate) {
      selectedDateLabel.textContent = 'Choose a date to see open times';
      selectedDateLabel.classList.add('placeholder');
      return;
    }
    selectedDateLabel.classList.remove('placeholder');
    selectedDateLabel.textContent = selectedTime
      ? `${formatDateLong(selectedDate)} at ${formatTime(timeKeyToDate(selectedDate, selectedTime))}`
      : `${formatDateLong(selectedDate)} — pick a time`;
  }

  function updateContinueState() {
    toStep2Btn.disabled = !(selectedDate && selectedTime);
  }

  /* ---------------- Step navigation ---------------- */
  function goToStep(step) {
    stepPanels[1].hidden = step !== 1;
    stepPanels[2].hidden = step !== 2;

    stepDot1.classList.toggle('active', step === 1);
    stepDot1.classList.toggle('done', step === 2);
    stepDot1.textContent = step === 2 ? '\u2713' : '1';
    stepDot2.classList.toggle('active', step === 2);
    stepLabel1.classList.toggle('active', step === 1);
    stepLabel2.classList.toggle('active', step === 2);
    stepLine.classList.toggle('filled', step === 2);

   subtitle.textContent = step === 1
      ? 'Pick a date and time that works for you.'
      : `${formatDateLong(selectedDate)} at ${formatTime(timeKeyToDate(selectedDate, selectedTime))} — just need a few details.`;

   if (step === 2 && selectedDate && selectedTime) {
      const summaryEl = document.getElementById('bookingSummaryDateTime');
      if (summaryEl) {
        summaryEl.textContent =
          `${formatDateLong(selectedDate)} at ${formatTime(timeKeyToDate(selectedDate, selectedTime))}`;
      }
    }
    box.scrollTop = 0;
  } 

  /* ---------------- Details toggle ---------------- */
  function toggleDetails() {
    const expanded = detailsToggleBtn.classList.toggle('expanded');
    detailsExpand.classList.toggle('expanded', expanded);
    detailsToggleText.textContent = expanded ? 'Less details' : 'More details';
  }

  /* ---------------- Submit ---------------- */
  /* ---------------- Submit ---------------- */
  async function submitBooking() {
    if (!bookingForm.checkValidity()) {
      bookingForm.reportValidity();
      return;
    }

    const name = document.getElementById('bookingName').value.trim();
    const email = document.getElementById('bookingEmail').value.trim();
    const phone = document.getElementById('bookingPhone').value.trim();
    const gymName = document.getElementById('bookingGymName').value.trim();
    const when = `${formatDateLong(selectedDate)} at ${formatTime(timeKeyToDate(selectedDate, selectedTime))}`;

    submitBookingBtn.disabled = true;

    const data = {
      name,
      email,
      phone,
      gymName,
      date: formatDateLong(selectedDate),
      time: formatTime(timeKeyToDate(selectedDate, selectedTime))
    };

    console.log(data);
    

    try {
      const response=await fetch(BOOKING_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      });
      console.log(response);
      
    } catch (err) {
      console.error("Booking sheet submission failed:", err);
    }

    stepPanels[2].hidden = true;
    stepIndicator.style.display = 'none';
    bookingSuccessDetail.textContent =
      `Thanks${name ? ', ' + name : ''} — see you ${when}. A confirmation has been sent to your email.`;
    bookingSuccess.classList.add('visible');
    submitBookingBtn.disabled = false;
  }

  /* ---------------- Open / close / reset ---------------- */
  function openModal() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('booking-modal-locked');
    document.addEventListener('keydown', onKeydown);
  }

  function closeModal() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('booking-modal-locked');
    document.removeEventListener('keydown', onKeydown);
    // Reset after the closing transition finishes so nothing visibly jumps
    setTimeout(resetModal, 300);
  }

  function resetModal() {
    viewDate = startOfMonth(new Date());
    selectedDate = null;
    selectedTime = null;

    bookingForm.reset();
    bookingSuccess.classList.remove('visible');
    stepIndicator.style.display = '';
    detailsToggleBtn.classList.remove('expanded');
    detailsExpand.classList.remove('expanded');
    detailsToggleText.textContent = 'More details';

    goToStep(1);
    renderCalendar();
    renderTimeSlots();
    updateSelectedSummary();
    updateContinueState();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeModal();
  }

  /* ---------------- Wire up every "Book a Demo" link ---------------- */
  document.querySelectorAll('a[href="booking.html"], a[href$="/booking.html"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  prevMonthBtn.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    renderCalendar();
  });
  nextMonthBtn.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderCalendar();
  });

  detailsToggleBtn.addEventListener('click', toggleDetails);
  toStep2Btn.addEventListener('click', () => goToStep(2));
  backToStep1Btn.addEventListener('click', () => goToStep(1));
  submitBookingBtn.addEventListener('click', submitBooking);

  /* ---------------- Init ---------------- */
  renderCalendar();
  renderTimeSlots();
  updateSelectedSummary();
  updateContinueState();
})();








  const BOOKING_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby-BnUgmJn-FvX8FLunnPnQF1bQq8nixXRBn6ofihUPYvZa-M-hghmvb2EbGksW-xtJ/exec";
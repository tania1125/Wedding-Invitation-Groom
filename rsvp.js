"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycby64uUvj6-FhoZUwrjDBbywxxJNox84n0I4RGZ1zxXUDIYRK4uMZ_EAJwR7N82_oJFDgQ/exec";
    const form = document.getElementById("rsvpForm");
    const submitButton = document.getElementById("rsvpSubmit");
    const status = document.getElementById("rsvpStatus");
    const successPanel = document.getElementById("rsvpSuccess");
    const successTitle = document.getElementById("successTitle");
    const successMessage = document.getElementById("successMessage");
    const anotherResponseButton = document.getElementById("editRsvp");
    const guestCountGroup = document.getElementById("guestCountGroup");
    const guestCount = document.getElementById("guestCount");
    const message = document.getElementById("wishesMessage");
    const messageCount = document.getElementById("messageCount");
    const attendanceOptions = Array.from(document.querySelectorAll('input[name="attendance"]'));

    if (!form || !submitButton || !status || !successPanel || !successTitle || !successMessage || !guestCountGroup || !guestCount) {
        console.error("RSVP setup error: required HTML elements are missing.");
        return;
    }

    function updateGuestCountVisibility() {
        const attendance = form.elements.attendance?.value || "";
        const unable = attendance === "Unable to Attend";
        guestCountGroup.hidden = unable;
        guestCount.disabled = unable;
        guestCount.required = !unable;
        if (unable) guestCount.value = "";
    }

    attendanceOptions.forEach((option) => option.addEventListener("change", updateGuestCountVisibility));
    message?.addEventListener("input", () => {
        if (messageCount) messageCount.textContent = String(message.value.length);
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        updateGuestCountVisibility();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const guestName = String(formData.get("name") || "Guest").trim();
        const attendance = String(formData.get("attendance") || "");
        if (attendance === "Unable to Attend") formData.set("guestCount", "0");

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        status.textContent = "";
        status.className = "rsvp-status";

        try {
            await fetch(RSVP_ENDPOINT, { method: "POST", mode: "no-cors", body: formData });
            form.hidden = true;
            successPanel.hidden = false;
            successTitle.textContent = `Thank you, ${guestName}`;
            successMessage.textContent = attendance === "Unable to Attend"
                ? "We will miss you. Your response has been recorded."
                : "Your RSVP has been recorded. We look forward to celebrating with you.";
            form.reset();
            if (messageCount) messageCount.textContent = "0";
            updateGuestCountVisibility();
        } catch (error) {
            console.error("RSVP submission failed:", error);
            status.textContent = "We could not send your RSVP. Please check your connection and try again.";
            status.classList.add("error");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Send RSVP";
        }
    });

    anotherResponseButton?.addEventListener("click", () => {
        successPanel.hidden = true;
        form.hidden = false;
        document.getElementById("guestName")?.focus();
    });
});

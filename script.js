"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const EVENT_ORDER = ["betrothal", "madhuramveppu", "wedding"];
    const EVENT_LABELS = {
        betrothal: "Betrothal",
        madhuramveppu: "Madhuramveppu",
        wedding: "Wedding and Reception"
    };

    function getInvitationConfiguration() {
        const params = new URLSearchParams(window.location.search);
        const value = (params.get("events") || "all").toLowerCase().trim();

        if (value === "all") {
            return EVENT_ORDER;
        }

        const requested = value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => EVENT_ORDER.includes(item));

        const unique = EVENT_ORDER.filter((event) => requested.includes(event));
        return unique.length > 0 ? unique : EVENT_ORDER;
    }

    function applyInvitationVariant() {
        const invitedEvents = getInvitationConfiguration();
        const eventCards = Array.from(document.querySelectorAll("[data-event]"));
        const scheduleTitle = document.getElementById("scheduleTitle");
        const rsvpIntro = document.getElementById("rsvpIntro");
        const invitationType = document.getElementById("invitationType");
        const invitedEventsInput = document.getElementById("invitedEvents");

        eventCards.forEach((card) => {
            card.hidden = !invitedEvents.includes(card.dataset.event);
        });

        const labels = invitedEvents.map((event) => EVENT_LABELS[event]);
        const typeLabel =
            invitedEvents.length === 3
                ? "All Events"
                : invitedEvents.length === 2
                    ? "Two Events"
                    : `${labels[0]} Only`;

        if (scheduleTitle) {
            scheduleTitle.textContent =
                invitedEvents.length === 3
                    ? "Celebration Schedule"
                    : invitedEvents.length === 2
                        ? "Your Celebration Schedule"
                        : labels[0];
        }

        if (rsvpIntro) {
            rsvpIntro.textContent =
                invitedEvents.length === 3
                    ? "We would be delighted to celebrate with you."
                    : invitedEvents.length === 2
                        ? "We would be delighted to have you join us for these celebrations."
                        : `We would be delighted to have you join us for the ${labels[0]}.`;
        }

        if (invitationType) invitationType.value = typeLabel;
        if (invitedEventsInput) invitedEventsInput.value = labels.join(", ");
    }

    applyInvitationVariant();

    const music = document.getElementById("bgMusic");
    const startBtn = document.getElementById("startBtn");
    const musicToggle = document.getElementById("musicToggle");
    const eventsSection = document.getElementById("events");
    const siteNav = document.getElementById("siteNav");
    const gallerySlider = document.querySelector(".gallery-slider");
    const galleryImages = gallerySlider
        ? Array.from(gallerySlider.querySelectorAll("img"))
        : [];
    const galleryDots = Array.from(document.querySelectorAll(".gallery-dots button"));
    const galleryHint = document.querySelector(".gallery-hint");

    function updateMusicButton(isPlaying) {
        if (!musicToggle) return;
        musicToggle.textContent = isPlaying ? "🔊" : "🔇";
        musicToggle.setAttribute("aria-label", isPlaying ? "Pause background music" : "Play background music");
        musicToggle.setAttribute("aria-pressed", String(isPlaying));
    }

    async function playMusic() {
        if (!music) return false;
        try {
            await music.play();
            updateMusicButton(true);
            return true;
        } catch (error) {
            updateMusicButton(false);
            console.error("Music could not be played:", error);
            return false;
        }
    }

    startBtn?.addEventListener("click", async () => {
        await playMusic();
        startBtn.textContent = "Welcome ❤️";
        startBtn.disabled = true;
        siteNav?.classList.add("visible");
        window.setTimeout(() => eventsSection?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    });

    musicToggle?.addEventListener("click", async () => {
        if (!music) return;
        if (music.paused) await playMusic();
        else music.pause();
    });

    music?.addEventListener("play", () => updateMusicButton(true));
    music?.addEventListener("pause", () => updateMusicButton(false));
    music?.addEventListener("ended", () => updateMusicButton(false));
    updateMusicButton(Boolean(music && !music.paused));

    function setActiveGalleryDot(activeIndex) {
        galleryDots.forEach((dot, index) => {
            const active = index === activeIndex;
            dot.classList.toggle("active", active);
            if (active) dot.setAttribute("aria-current", "true");
            else dot.removeAttribute("aria-current");
        });
    }

    let hintHidden = false;
    function hideGalleryHint() {
        if (hintHidden || !galleryHint) return;
        hintHidden = true;
        galleryHint.classList.add("hidden");
    }

    if (gallerySlider && galleryImages.length > 0) {
        setActiveGalleryDot(0);
        gallerySlider.addEventListener("pointerdown", hideGalleryHint, { once: true });
        gallerySlider.addEventListener("scroll", hideGalleryHint, { once: true, passive: true });

        if ("IntersectionObserver" in window) {
            const galleryObserver = new IntersectionObserver((entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (!visible) return;
                const index = galleryImages.indexOf(visible.target);
                if (index >= 0) setActiveGalleryDot(index);
            }, { root: gallerySlider, threshold: [0.55, 0.75] });
            galleryImages.forEach((image) => galleryObserver.observe(image));
        }

        galleryDots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                hideGalleryHint();
                setActiveGalleryDot(index);
                galleryImages[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            });
        });
    }

    const revealElements = Array.from(document.querySelectorAll(".reveal"));
    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("revealed");
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.12 });
        revealElements.forEach((element) => revealObserver.observe(element));
    } else {
        revealElements.forEach((element) => element.classList.add("revealed"));
    }
});

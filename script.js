document.addEventListener('DOMContentLoaded', () => {
    // --- Modal Logic ---
    const modal = document.getElementById('t-test-modal');
    const modalCloseBtn = document.querySelector('.modal-close');
    const form = document.getElementById('t-test-form');
    const formStatus = document.getElementById('form-status');

    // Select all CTA buttons that should trigger the modal
    // Note: We need to prevent the default link behavior for these buttons
    const ctaButtons = document.querySelectorAll('a[href*="contact"]');

    let lastFocusedElement;

    // Open Modal Function
    function openModal(e) {
        if (e) e.preventDefault();

        lastFocusedElement = document.activeElement;
        modal.style.display = 'flex';
        // Force reflow for transition
        setTimeout(() => {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');

            // Trap focus in modal (simplified)
            modalCloseBtn.focus();
        }, 10);

        document.body.style.overflow = 'hidden'; // Prevent scroll

        // Track Event
        if (window.dataLayer) {
            window.dataLayer.push({ event: 't_test_modal_open' });
        }
    }

    // Close Modal Function
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');

        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Wait for transition

        document.body.style.overflow = ''; // Restore scroll

        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }

    // Bind Click Events to CTAs
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    // Close Events
    modalCloseBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Escape Key Close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // --- Form Submission Logic ---
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;

        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending...';
        formStatus.innerHTML = '';
        formStatus.className = 'form-status';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('https://formspree.io/f/xqeeapql', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                formStatus.innerText = "Success! We'll be in touch shortly.";
                formStatus.classList.add('success');
                form.reset();
                submitBtn.style.display = 'none'; // Hide button on success

                // Track Success
                if (window.dataLayer) {
                    window.dataLayer.push({ event: 't_test_modal_submit_success' });
                }

                // Meta Pixel Lead Tracking with Advanced Matching
                if (typeof fbq === 'function') {
                    // Re-initialize to send user data, greatly improving conversion match rate
                    fbq('init', '2482097602059049', {
                        em: data.email,
                        ph: data.phone,
                        fn: data.firstName,
                        ln: data.lastName
                    });
                    fbq('track', 'Lead');
                }

                // Google Ads Conversion
                if (typeof gtag === 'function') {
                    gtag('event', 'conversion', {
                        'send_to': 'AW-1017165264/tA-jCPuY6eYbENDrguUD',
                        'value': 1.0,
                        'currency': 'USD'
                    });
                }

                // Optional: Close modal after a few seconds
                setTimeout(() => {
                    closeModal();
                    // Reset UI for next time if needed, but usually one submission is enough
                    setTimeout(() => {
                        submitBtn.style.display = 'block';
                        submitBtn.innerText = originalBtnText;
                        submitBtn.disabled = false;
                        formStatus.innerText = '';
                    }, 500);
                }, 3000);

            } else {
                const result = await response.json();
                if (Object.hasOwn(result, 'errors')) {
                    formStatus.innerText = result.errors.map(error => error.message).join(", ");
                } else {
                    formStatus.innerText = "Oops! There was a problem submitting your form.";
                }
                formStatus.classList.add('error');
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        } catch (error) {
            formStatus.innerText = "Oops! There was a problem submitting your form.";
            formStatus.classList.add('error');
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    });
});

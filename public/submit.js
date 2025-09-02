document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("resourceForm");
  const messages = document.getElementById("messages");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Clear previous messages
    messages.innerHTML = "";

    const data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      location: form.location.value.trim(),
      food_type: form.food_type.value.trim(),
      quantity: form.quantity.value.trim(),
      notes: form.notes.value.trim(),
    };

    if (!data.name || !data.location || !data.food_type) {
      messages.innerHTML =
        '<div class="flash danger">Please provide name, location and type of food.</div>';
      return;
    }

    // Show loading state
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    form.classList.add("loading");

    fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          messages.innerHTML =
            '<div class="flash success">Submitted successfully. Thank you for helping fight hunger!</div>';
          form.reset();
        } else {
          messages.innerHTML =
            '<div class="flash danger">' +
            (res.error || "Submission failed") +
            "</div>";
        }
      })
      .catch((err) => {
        console.error("Submission error:", err);
        messages.innerHTML =
          '<div class="flash danger">Network error. Please check your connection and try again.</div>';
      })
      .finally(() => {
        // Remove loading state
        submitButton.disabled = false;
        submitButton.textContent = "Submit Resource";
        form.classList.remove("loading");
      });
  });
});

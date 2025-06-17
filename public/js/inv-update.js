document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#updateForm");
  if (!form) return;

  const submitBtn = form.querySelector("button[type='submit']");
  if (!submitBtn) return;

  // Store initial values of all form fields
  const initialValues = {};
  for (const element of form.elements) {
    if (element.name) {
      initialValues[element.name] = element.value;
    }
  }

  // Disable submit button initially
  submitBtn.disabled = true;

  // Enable submit button only when form data changes
  form.addEventListener("input", () => {
    let changed = false;
    for (const element of form.elements) {
      if (element.name && initialValues[element.name] !== element.value) {
        changed = true;
        break;
      }
    }
    submitBtn.disabled = !changed;
  });

  // Prevent submission if no changes detected (extra check)
  form.addEventListener("submit", (e) => {
    let changed = false;
    for (const element of form.elements) {
      if (element.name && initialValues[element.name] !== element.value) {
        changed = true;
        break;
      }
    }
    if (!changed) {
      e.preventDefault();
      alert("No changes detected. Please make a change before submitting.");
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const list = document.getElementById("list");

  // Check authentication and admin status
  setTimeout(() => {
    if (!window.auth || !window.auth.getCurrentUser()) {
      list.innerHTML = '<div class="flash danger"><strong>Access Denied</strong><br>Please <a href="login.html">login</a> to access the admin panel.</div>';
      return;
    }

    const user = window.auth.getCurrentUser();
    if (user.role !== 'admin') {
      list.innerHTML = '<div class="flash danger"><strong>Access Denied</strong><br>Admin privileges required to access this page.</div>';
      return;
    }

    loadAdminData();
  }, 100);
});

function loadAdminData() {
  const list = document.getElementById("list");

  // Show loading state
  list.innerHTML =
    '<div style="text-align: center; padding: 2rem;"><div class="loading" style="position: relative; display: inline-block; width: 40px; height: 40px;"></div><p>Loading submissions...</p></div>';

  fetch("/api/resources")
    .then((r) => r.json())
    .then((rows) => {
      if (!Array.isArray(rows) || rows.length === 0) {
        list.innerHTML =
          '<div class="flash" style="background: #e2e3e5; color: #6c757d; border-left-color: #6c757d;"><strong>No submissions yet.</strong><br>When people submit food resources, they will appear here.</div>';
        return;
      }

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      thead.innerHTML =
        "<tr><th>ID</th><th>Name</th><th>Contact</th><th>Location</th><th>Food Type</th><th>Quantity</th><th>Notes</th><th>Submitted</th></tr>";
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      rows.forEach((r) => {
        const tr = document.createElement("tr");
        const submittedDate = new Date(r.submitted_at).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        );

        tr.innerHTML = `
        <td><strong>#${r.id}</strong></td>
        <td>${escapeHtml(r.name)}</td>
        <td>
          ${
            r.phone
              ? "<strong>Phone:</strong> " + escapeHtml(r.phone) + "<br>"
              : ""
          }
          ${r.email ? "<strong>Email:</strong> " + escapeHtml(r.email) : ""}
        </td>
        <td>${escapeHtml(r.location)}</td>
        <td><strong>${escapeHtml(r.food_type)}</strong></td>
        <td>${escapeHtml(r.quantity || "Not specified")}</td>
        <td>${escapeHtml(r.notes || "No additional notes")}</td>
        <td><small>${submittedDate}</small></td>
      `;
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      list.innerHTML = "";
      list.appendChild(table);

      // Add summary
      const summary = document.createElement("div");
      summary.innerHTML = `<div class="flash success"><strong>${
        rows.length
      } resource(s) found</strong><br>Last updated: ${new Date().toLocaleString()}</div>`;
      list.insertBefore(summary, table);
    })
    .catch((err) => {
      console.error("Failed to load submissions:", err);
      list.innerHTML =
        '<div class="flash danger"><strong>Failed to load submissions.</strong><br>Please check your connection and try refreshing the page.</div>';
    });

  function escapeHtml(s) {
    if (!s) return "";
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
});

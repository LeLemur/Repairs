/******************************************************************
 * script.js – Ultimate Repair Order Front-End
 *
 * This version ensures that each tab shows a Create button:
 *   - Orders: "Create Order" (Admins see an extra Build/Parts section)
 *   - Customers: "Create Customer"
 *   - Parts: "Create Part"
 *   - Admin (if applicable): "Create User"
 *   - Reports: now shows a working date-range form.
 *
 * Quality-of-life improvements:
 *   - Navbar links use data-tab attributes for navigation.
 *   - Default tab is Orders.
 *   - Console logging is added for debugging.
 ******************************************************************/

console.log("Revamped script.js loaded.");

// ------------------ TAX RATE LOGIC ------------------
// Dummy API call for 50-state tax rates (replace with a real API if needed)
function getTaxRatesFromAPI() {
  return new Promise((resolve) => {
    const rates = [
      { state: "AL", taxRate: 0.04 }, { state: "AK", taxRate: 0.00 },
      { state: "AZ", taxRate: 0.056 }, { state: "AR", taxRate: 0.065 },
      { state: "CA", taxRate: 0.075 }, { state: "CO", taxRate: 0.029 },
      { state: "CT", taxRate: 0.0635 }, { state: "DE", taxRate: 0.00 },
      { state: "FL", taxRate: 0.06 }, { state: "GA", taxRate: 0.04 },
      { state: "HI", taxRate: 0.04 }, { state: "ID", taxRate: 0.06 },
      { state: "IL", taxRate: 0.0625 }, { state: "IN", taxRate: 0.07 },
      { state: "IA", taxRate: 0.06 }, { state: "KS", taxRate: 0.065 },
      { state: "KY", taxRate: 0.06 }, { state: "LA", taxRate: 0.0445 },
      { state: "ME", taxRate: 0.055 }, { state: "MD", taxRate: 0.06 },
      { state: "MA", taxRate: 0.0625 }, { state: "MI", taxRate: 0.06 },
      { state: "MN", taxRate: 0.06875 }, { state: "MS", taxRate: 0.07 },
      { state: "MO", taxRate: 0.04225 }, { state: "MT", taxRate: 0.00 },
      { state: "NE", taxRate: 0.055 }, { state: "NV", taxRate: 0.0685 },
      { state: "NH", taxRate: 0.00 }, { state: "NJ", taxRate: 0.06625 },
      { state: "NM", taxRate: 0.05125 }, { state: "NY", taxRate: 0.04 },
      { state: "NC", taxRate: 0.0475 }, { state: "ND", taxRate: 0.05 },
      { state: "OH", taxRate: 0.0575 }, { state: "OK", taxRate: 0.045 },
      { state: "OR", taxRate: 0.00 }, { state: "PA", taxRate: 0.06 },
      { state: "RI", taxRate: 0.07 }, { state: "SC", taxRate: 0.06 },
      { state: "SD", taxRate: 0.045 }, { state: "TN", taxRate: 0.07 },
      { state: "TX", taxRate: 0.0625 }, { state: "UT", taxRate: 0.0485 },
      { state: "VT", taxRate: 0.06 }, { state: "VA", taxRate: 0.053 },
      { state: "WA", taxRate: 0.065 }, { state: "WV", taxRate: 0.06 },
      { state: "WI", taxRate: 0.05 }, { state: "WY", taxRate: 0.04 }
    ];
    setTimeout(() => resolve(rates), 500);
  });
}

let STATE_TAX_RATES = [];
function loadTaxRates() {
  getTaxRatesFromAPI().then((rates) => {
    STATE_TAX_RATES = rates;
    console.log("Tax rates loaded:", STATE_TAX_RATES);
  }).catch(err => console.error("Error loading tax rates:", err));
}

function populateTaxDropdown() {
  if (STATE_TAX_RATES.length === 0) {
    return `<option value="0.06">Other - 6%</option>`;
  }
  return STATE_TAX_RATES.map(rate => {
    return `<option value="${rate.taxRate}">${rate.state} - ${(rate.taxRate * 100).toFixed(2)}%</option>`;
  }).join("");
}

function updateTaxDropdown() {
  const select = document.getElementById("orderCustomerId");
  const selectedOption = select.options[select.selectedIndex];
  const address = selectedOption.getAttribute("data-address") || "";
  let defaultRate = "0.06";
  for (let rateObj of STATE_TAX_RATES) {
    if (address.toUpperCase().includes(rateObj.state.toUpperCase())) {
      defaultRate = rateObj.taxRate.toString();
      break;
    }
  }
  const taxSelect = document.getElementById("orderTax");
  if (taxSelect) taxSelect.value = defaultRate;
}

// ------------------ NAVIGATION ------------------

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("#navLinks a");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.parentElement.classList.remove("active"));
      link.parentElement.classList.add("active");
      const tab = link.getAttribute("data-tab");
      showTab(tab);
    });
  });
  loadTaxRates();
  showTab("orders");
});

function showTab(tab) {
  console.log("Showing tab:", tab);
  if (tab === "orders") loadOrders();
  else if (tab === "customers") loadCustomers();
  else if (tab === "parts") loadParts();
  else if (tab === "reports") loadReports();
  else if (tab === "admin") {
    if (window.userRole === "admin") loadAdminPortal();
    else alert("Access Denied");
  } else {
    document.getElementById("mainContent").innerHTML = "<p>Unknown tab.</p>";
  }
}

// ------------------ ORDERS TAB ------------------

function loadOrders() {
  console.log("Loading orders...");
  fetch("/api/orders")
    .then(res => res.json())
    .then(orders => {
      let html = `<h2>Orders</h2>
        <button class="btn btn-success mb-3" onclick="showCreateOrderForm()">Create Order</button>`;
      if (orders.length === 0) {
        html += "<p>No orders found.</p>";
      } else {
        html += `<table class="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>RO #</th>
              <th>Customer</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>`;
        orders.forEach(order => {
          html += `<tr>
            <td>${order.id}</td>
            <td>${order.repairOrderNumber}</td>
            <td>${order.Customer ? order.Customer.name : "N/A"}</td>
            <td>${new Date(order.createdAt).toLocaleString()}</td>
            <td>
              <button class="btn btn-sm btn-info" onclick="editOrder(${order.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.id})">Delete</button>
            </td>
          </tr>`;
        });
        html += `</tbody></table>`;
      }
      document.getElementById("mainContent").innerHTML = html;
      console.log("Orders loaded.");
    })
    .catch(err => console.error("Error loading orders:", err));
}

function showCreateOrderForm() {
  console.log("Showing Create Order form.");
  fetch("/api/customers")
    .then(res => res.json())
    .then(customers => {
      let customerOptions = customers.map(c => {
        return `<option value="${c.id}" data-address="${c.address || ""}">${c.name}</option>`;
      }).join("");
      if (window.userRole === "admin") {
        let html = `
          <h2>Create Order (Admin)</h2>
          <form onsubmit="createOrder(event)">
            <div class="form-group">
              <label>Customer:</label>
              <select class="form-control" id="orderCustomerId" required onchange="updateTaxDropdown()">
                <option value="">-- Select Customer --</option>
                ${customerOptions}
              </select>
            </div>
            <div class="form-group">
              <label>Tax Rate:</label>
              <select class="form-control" id="orderTax">
                ${populateTaxDropdown()}
              </select>
            </div>
            <div class="form-group">
              <label>Tech Notes:</label>
              <textarea class="form-control" id="techNotes" rows="3"></textarea>
            </div>
            <div id="buildSection">
              <button type="button" class="btn btn-warning mb-3" onclick="toggleBuildMode()">Parts</button>
              <div id="buildArea" style="display:none;">
                <h4>Line Items</h4>
                <table class="table table-sm" id="lineItemsTable">
                  <thead>
                    <tr><th>Description</th><th>Qty</th><th>Price</th><th></th></tr>
                  </thead>
                  <tbody></tbody>
                </table>
                <button type="button" class="btn btn-info" onclick="showAddLineItemForm()">Add Line Item</button>
              </div>
            </div>
            <button type="submit" class="btn btn-primary mt-3">Create Order</button>
            <button type="button" class="btn btn-secondary mt-3" onclick="loadOrders()">Cancel</button>
          </form>
        `;
        document.getElementById("mainContent").innerHTML = html;
        window.lineItems = [];
      } else {
        let html = `
          <h2>Create Order</h2>
          <form onsubmit="createOrder(event)">
            <div class="form-group">
              <label>Customer:</label>
              <select class="form-control" id="orderCustomerId" required>
                <option value="">-- Select Customer --</option>
                ${customerOptions}
              </select>
            </div>
            <div class="form-group">
              <label>Tech Notes:</label>
              <textarea class="form-control" id="techNotes" rows="3" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Create Order</button>
            <button type="button" class="btn btn-secondary" onclick="loadOrders()">Cancel</button>
          </form>
        `;
        document.getElementById("mainContent").innerHTML = html;
      }
    })
    .catch(err => console.error("Error fetching customers:", err));
}

function toggleBuildMode() {
  const buildArea = document.getElementById("buildArea");
  buildArea.style.display = (buildArea.style.display === "none") ? "block" : "none";
}

function showAddLineItemForm() {
  let html = `
    <div class="form-group">
      <label>Description:</label>
      <input type="text" id="lineDesc" class="form-control">
    </div>
    <div class="form-group">
      <label>Quantity:</label>
      <input type="number" id="lineQty" class="form-control" value="1">
    </div>
    <div class="form-group">
      <label>Price (USD):</label>
      <input type="number" step="0.01" id="linePrice" class="form-control" value="0">
    </div>
    <button class="btn btn-success" onclick="addLineItem()">Add</button>
    <button class="btn btn-secondary" onclick="cancelAddLineItem()">Cancel</button>
  `;
  const buildArea = document.getElementById("buildArea");
  let tempDiv = document.createElement("div");
  tempDiv.id = "tempLineForm";
  tempDiv.innerHTML = html;
  buildArea.appendChild(tempDiv);
}

function cancelAddLineItem() {
  const tempDiv = document.getElementById("tempLineForm");
  if (tempDiv) tempDiv.remove();
}

function addLineItem() {
  const desc = document.getElementById("lineDesc").value.trim();
  const qty = parseInt(document.getElementById("lineQty").value) || 1;
  const price = parseFloat(document.getElementById("linePrice").value) || 0;
  if (!desc) {
    alert("Description is required.");
    return;
  }
  window.lineItems.push({ description: desc, quantity: qty, price });
  renderLineItems();
  cancelAddLineItem();
}

function renderLineItems() {
  const tableBody = document.querySelector("#lineItemsTable tbody");
  tableBody.innerHTML = "";
  window.lineItems.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>${item.price.toFixed(2)}</td>
      <td><button class="btn btn-sm btn-danger" onclick="removeLineItem(${index})">X</button></td>
    `;
    tableBody.appendChild(row);
  });
}

function removeLineItem(index) {
  window.lineItems.splice(index, 1);
  renderLineItems();
}

function createOrder(event) {
  event.preventDefault();
  const customerId = document.getElementById("orderCustomerId").value;
  const techNotes = document.getElementById("techNotes").value.trim();
  if (!customerId) {
    alert("Please select a customer.");
    return;
  }
  if (window.userRole === "admin") {
    const tax = parseFloat(document.getElementById("orderTax").value);
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, tax })
    })
      .then(res => res.json())
      .then(order => {
        let promises = [];
        if (techNotes) {
          promises.push(
            fetch(`/api/orders/${order.id}/lines`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ description: techNotes, quantity: 1, price: 0 })
            })
          );
        }
        if (window.lineItems && window.lineItems.length > 0) {
          window.lineItems.forEach(item => {
            promises.push(
              fetch(`/api/orders/${order.id}/lines`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item)
              })
            );
          });
        }
        return Promise.all(promises);
      })
      .then(() => loadOrders())
      .catch(err => console.error("Error creating order:", err));
  } else {
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId })
    })
      .then(res => res.json())
      .then(order => {
        return fetch(`/api/orders/${order.id}/lines`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: techNotes, quantity: 1, price: 0 })
        });
      })
      .then(() => loadOrders())
      .catch(err => console.error("Error creating order:", err));
  }
}

function editOrder(orderId) {
  alert("Edit order functionality coming soon!");
}

function deleteOrder(orderId) {
  if (confirm("Are you sure you want to delete order " + orderId + "?")) {
    fetch(`/api/orders/${orderId}`, { method: "DELETE" })
      .then(() => loadOrders())
      .catch(err => console.error("Error deleting order:", err));
  }
}

// ------------------ CUSTOMERS TAB ------------------

function loadCustomers() {
  fetch("/api/customers")
    .then(res => res.json())
    .then(customers => {
      let html = `<h2>Customers</h2>
        <button class="btn btn-success mb-3" onclick="showCreateCustomerForm()">Create Customer</button>`;
      if (customers.length === 0) {
        html += "<p>No customers found.</p>";
      } else {
        html += `<table class="table table-bordered">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Actions</th></tr>
          </thead>
          <tbody>`;
        customers.forEach(cust => {
          html += `<tr>
            <td>${cust.id}</td>
            <td>${cust.name}</td>
            <td>${cust.email}</td>
            <td>
              <button class="btn btn-sm btn-info" onclick="editCustomer(${cust.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${cust.id})">Delete</button>
            </td>
          </tr>`;
        });
        html += `</tbody></table>`;
      }
      document.getElementById("mainContent").innerHTML = html;
    })
    .catch(err => console.error("Error loading customers:", err));
}

function showCreateCustomerForm() {
  let html = `
    <h2>Create Customer</h2>
    <form onsubmit="createCustomer(event)">
      <div class="form-group">
        <label>Name:</label>
        <input type="text" class="form-control" id="customerName" required>
      </div>
      <div class="form-group">
        <label>Email:</label>
        <input type="email" class="form-control" id="customerEmail" required>
      </div>
      <div class="form-group">
        <label>Phone:</label>
        <input type="text" class="form-control" id="customerPhone">
      </div>
      <div class="form-group">
        <label>Address:</label>
        <input type="text" class="form-control" id="customerAddress">
      </div>
      <div class="form-group">
        <label>Contact Notes:</label>
        <textarea class="form-control" id="customerNotes"></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Create</button>
      <button type="button" class="btn btn-secondary" onclick="loadCustomers()">Cancel</button>
    </form>
  `;
  document.getElementById("mainContent").innerHTML = html;
}

function createCustomer(event) {
  event.preventDefault();
  const name = document.getElementById("customerName").value.trim();
  const email = document.getElementById("customerEmail").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const contactNotes = document.getElementById("customerNotes").value.trim();
  if (!name || !email) {
    alert("Name and email are required.");
    return;
  }
  fetch("/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, address, contactNotes })
  })
    .then(res => res.json())
    .then(() => loadCustomers())
    .catch(err => console.error("Error creating customer:", err));
}

function editCustomer(customerId) {
  alert("Edit customer functionality coming soon!");
}

function deleteCustomer(customerId) {
  if (confirm("Are you sure you want to delete customer " + customerId + "?")) {
    fetch(`/api/customers/${customerId}`, { method: "DELETE" })
      .then(() => loadCustomers())
      .catch(err => console.error("Error deleting customer:", err));
  }
}

// ------------------ PARTS TAB ------------------

function loadParts() {
  fetch("/api/parts")
    .then(res => res.json())
    .then(parts => {
      let html = `<h2>Parts</h2>
        <button class="btn btn-success mb-3" onclick="showCreatePartForm()">Create Part</button>`;
      if (parts.length === 0) {
        html += "<p>No parts found.</p>";
      } else {
        html += `<table class="table table-bordered">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>`;
        parts.forEach(part => {
          html += `<tr>
            <td>${part.id}</td>
            <td>${part.name}</td>
            <td>${part.price}</td>
            <td>${part.stock}</td>
            <td>
              <button class="btn btn-sm btn-info" onclick="editPart(${part.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deletePart(${part.id})">Delete</button>
            </td>
          </tr>`;
        });
        html += `</tbody></table>`;
      }
      document.getElementById("mainContent").innerHTML = html;
    })
    .catch(err => console.error("Error loading parts:", err));
}

function showCreatePartForm() {
  let html = `
    <h2>Create Part</h2>
    <form onsubmit="createPart(event)">
      <div class="form-group">
        <label>Part Name:</label>
        <input type="text" class="form-control" id="partName" required>
      </div>
      <div class="form-group">
        <label>Price (USD):</label>
        <input type="number" step="0.01" class="form-control" id="partPrice" value="0" required>
      </div>
      <div class="form-group">
        <label>Stock:</label>
        <input type="number" class="form-control" id="partStock" value="0" required>
      </div>
      <button type="submit" class="btn btn-primary">Create</button>
      <button type="button" class="btn btn-secondary" onclick="loadParts()">Cancel</button>
    </form>
  `;
  document.getElementById("mainContent").innerHTML = html;
}

function createPart(event) {
  event.preventDefault();
  const name = document.getElementById("partName").value.trim();
  const price = parseFloat(document.getElementById("partPrice").value) || 0;
  const stock = parseInt(document.getElementById("partStock").value) || 0;
  if (!name) {
    alert("Part name is required.");
    return;
  }
  fetch("/api/parts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price, stock })
  })
    .then(res => res.json())
    .then(() => loadParts())
    .catch(err => console.error("Error creating part:", err));
}

function editPart(partId) {
  alert("Edit part functionality coming soon!");
}

function deletePart(partId) {
  if (confirm("Are you sure you want to delete part " + partId + "?")) {
    fetch(`/api/parts/${partId}`, { method: "DELETE" })
      .then(() => loadParts())
      .catch(err => console.error("Error deleting part:", err));
  }
}

// ------------------ REPORTS TAB ------------------

function loadReports() {
  let html = `
    <h2>Reports</h2>
    <form onsubmit="getDateRangeReport(event)">
      <div class="form-group">
        <label>Start Date:</label>
        <input type="date" class="form-control" id="reportStart" required>
      </div>
      <div class="form-group">
        <label>End Date:</label>
        <input type="date" class="form-control" id="reportEnd" required>
      </div>
      <button type="submit" class="btn btn-primary">Get Report</button>
      <button type="button" class="btn btn-secondary" onclick="loadReports()">Cancel</button>
    </form>
    <div id="dateRangeResults" class="mt-3"></div>
  `;
  document.getElementById("mainContent").innerHTML = html;
}

function getDateRangeReport(event) {
  event.preventDefault();
  const start = document.getElementById("reportStart").value;
  const end = document.getElementById("reportEnd").value;
  if (!start || !end) {
    alert("Please select both start and end dates.");
    return;
  }
  fetch(`/api/orders/date-range?start=${start}&end=${end}`)
    .then(res => res.json())
    .then(orders => {
      let html = "<h4>Report Results</h4><ul class='list-group'>";
      orders.forEach(o => {
        html += `<li class="list-group-item">
          Order #${o.id} - ${o.repairOrderNumber} - CustomerID: ${o.customerId}<br>
          Created: ${new Date(o.createdAt).toLocaleString()}
        </li>`;
      });
      html += "</ul>";
      document.getElementById("dateRangeResults").innerHTML = html;
    })
    .catch(err => console.error("Error fetching report:", err));
}

// ------------------ ADMIN PORTAL ------------------

function loadAdminPortal() {
  if (window.userRole !== "admin") {
    alert("Access Denied");
    return;
  }
  fetch("/api/users")
    .then(res => res.json())
    .then(users => {
      let html = `<h2>Admin Portal - User Management</h2>
        <button class="btn btn-success mb-3" onclick="showCreateUserForm()">Create User</button>`;
      if (users.length === 0) {
        html += "<p>No users found.</p>";
      } else {
        html += `<table class="table table-bordered">
          <thead>
            <tr><th>ID</th><th>Username</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>`;
        users.forEach(user => {
          html += `<tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>
              <button class="btn btn-sm btn-info" onclick="showEditUserForm(${user.id}, '${user.username}', '${user.role}')">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>
            </td>
          </tr>`;
        });
        html += `</tbody></table>`;
      }
      document.getElementById("mainContent").innerHTML = html;
    })
    .catch(err => console.error("Error loading admin portal:", err));
}

function showCreateUserForm() {
  let html = `
    <h2>Create New User</h2>
    <form onsubmit="createUser(event)">
      <div class="form-group">
        <label>Username:</label>
        <input type="text" class="form-control" id="newUsername" required>
      </div>
      <div class="form-group">
        <label>Password:</label>
        <input type="password" class="form-control" id="newPassword" required>
      </div>
      <div class="form-group">
        <label>Role:</label>
        <select class="form-control" id="newRole">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary">Create</button>
      <button type="button" class="btn btn-secondary" onclick="loadAdminPortal()">Cancel</button>
    </form>
  `;
  document.getElementById("mainContent").innerHTML = html;
}

function createUser(event) {
  event.preventDefault();
  const username = document.getElementById("newUsername").value.trim();
  const password = document.getElementById("newPassword").value;
  const role = document.getElementById("newRole").value;
  if (!username || !password) {
    alert("Username and password are required.");
    return;
  }
  fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role })
  })
    .then(res => res.json())
    .then(() => loadAdminPortal())
    .catch(err => console.error("Error creating user:", err));
}

function showEditUserForm(userId, username, role) {
  let html = `
    <h2>Edit User #${userId}</h2>
    <form onsubmit="updateUser(event, ${userId})">
      <div class="form-group">
        <label>Username:</label>
        <input type="text" class="form-control" id="editUsername" value="${username}" disabled>
      </div>
      <div class="form-group">
        <label>New Password (optional):</label>
        <input type="password" class="form-control" id="editPassword">
      </div>
      <div class="form-group">
        <label>Role:</label>
        <select class="form-control" id="editRole">
          <option value="user" ${role === "user" ? "selected" : ""}>User</option>
          <option value="admin" ${role === "admin" ? "selected" : ""}>Admin</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary">Update</button>
      <button type="button" class="btn btn-secondary" onclick="loadAdminPortal()">Cancel</button>
    </form>
  `;
  document.getElementById("mainContent").innerHTML = html;
}

function updateUser(event, userId) {
  event.preventDefault();
  const password = document.getElementById("editPassword").value;
  const role = document.getElementById("editRole").value;
  fetch(`/api/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, role })
  })
    .then(res => res.json())
    .then(() => loadAdminPortal())
    .catch(err => console.error("Error updating user:", err));
}

function deleteUser(userId) {
  if (confirm(`Are you sure you want to delete user #${userId}?`)) {
    fetch(`/api/users/${userId}`, { method: "DELETE" })
      .then(() => loadAdminPortal())
      .catch(err => console.error("Error deleting user:", err));
  }
}

// ------------------ INIT ------------------
loadTaxRates();

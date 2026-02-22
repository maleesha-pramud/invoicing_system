const API_BASE_URL = '/invoicing_system/api';

function loadAllClients() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", API_BASE_URL + "/client", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        console.log("Clients loaded:", data);

        var clientSelect = document.querySelector('select[name="clientSelect"]');
        if (clientSelect && data.data) {
          var existingOptions = clientSelect.querySelectorAll('option:not([data-dynamic])');

          Array.from(clientSelect.querySelectorAll('option[data-dynamic]')).forEach(opt => opt.remove());

          data.data.forEach(function(client) {
            var option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name + ' - ' + client.email;
            option.setAttribute('data-dynamic', 'true');
            option.setAttribute('data-email', client.email);
            option.setAttribute('data-phone', client.phone || '');
            option.setAttribute('data-address', client.address || '');
            clientSelect.appendChild(option);
          });
        }

        updateInvoiceList();
      } catch (error) {
        console.error("Error parsing clients:", error);
      }
    } else {
      console.error("Error loading clients. Status:", xhr.status);
    }
  };

  xhr.onerror = function() {
    console.error("AJAX Error loading clients");
  };

  xhr.send();
}

function getClientById(clientId) {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", API_BASE_URL + "/client/" + clientId, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        console.log("Client details:", data);
        return data;
      } catch (error) {
        console.error("Error parsing client:", error);
      }
    }
  };

  xhr.send();
}

function createClient(clientData) {
  var xhr = new XMLHttpRequest();

  xhr.open("POST", API_BASE_URL + "/client", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log("Client created successfully");
      showNotification("Client created successfully!", "success");
      loadAllClients();
    } else {
      console.error("Error creating client");
      showNotification("Error creating client", "error");
    }
  };

  xhr.onerror = function() {
    console.error("AJAX Error creating client");
    showNotification("Network error creating client", "error");
  };

  xhr.send(JSON.stringify(clientData));
}

function updateClient(clientData) {
  var xhr = new XMLHttpRequest();

  xhr.open("PUT", API_BASE_URL + "/client", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log("Client updated successfully");
      showNotification("Client updated successfully!", "success");
      loadAllClients();
    } else {
      console.error("Error updating client");
      showNotification("Error updating client", "error");
    }
  };

  xhr.send(JSON.stringify(clientData));
}

function deleteClient(clientId) {
  if (!confirm("Are you sure you want to delete this client?")) {
    return;
  }

  var xhr = new XMLHttpRequest();

  xhr.open("DELETE", API_BASE_URL + "/client/" + clientId, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log("Client deleted successfully");
      showNotification("Client deleted successfully!", "success");
      loadAllClients();
    } else {
      console.error("Error deleting client");
      showNotification("Error deleting client", "error");
    }
  };

  xhr.send();
}

function loadAllInvoices() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", API_BASE_URL + "/invoice", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        console.log("Invoices loaded:", data);
        updateInvoiceList(data.data || data);
      } catch (error) {
        console.error("Error parsing invoices:", error);
      }
    } else {
      console.error("Error loading invoices. Status:", xhr.status);
    }
  };

  xhr.onerror = function() {
    console.error("AJAX Error loading invoices");
  };

  xhr.send();
}

function getInvoiceById(invoiceId) {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", API_BASE_URL + "/invoice/" + invoiceId, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        console.log("Invoice details:", data);
        populateInvoiceView(data.data || data);
      } catch (error) {
        console.error("Error parsing invoice:", error);
      }
    }
  };

  xhr.send();
}

function createInvoice(invoiceData) {
  var xhr = new XMLHttpRequest();

  xhr.open("POST", API_BASE_URL + "/invoice", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        var response = JSON.parse(xhr.responseText);
        console.log("Invoice created successfully");
        showNotification("Invoice created successfully!", "success");

        setTimeout(function() {
          window.location.href = 'invoice-list.html';
        }, 1500);
      } catch (error) {
        console.error("Error parsing response:", error);
        showNotification("Invoice created successfully!", "success");
      }
    } else {
      console.error("Error creating invoice");
      showNotification("Error creating invoice", "error");
    }
  };

  xhr.onerror = function() {
    console.error("AJAX Error creating invoice");
    showNotification("Network error creating invoice", "error");
  };

  xhr.send(JSON.stringify(invoiceData));
}

function updateInvoice(invoiceData) {
  var xhr = new XMLHttpRequest();

  xhr.open("PUT", API_BASE_URL + "/invoice", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log("Invoice updated successfully");
      showNotification("Invoice updated successfully!", "success");

      if (invoiceData.id) {
        getInvoiceById(invoiceData.id);
      }
    } else {
      console.error("Error updating invoice");
      showNotification("Error updating invoice", "error");
    }
  };

  xhr.send(JSON.stringify(invoiceData));
}

function deleteInvoice(invoiceId) {
  if (!confirm("Are you sure you want to delete this invoice?")) {
    return;
  }

  var xhr = new XMLHttpRequest();

  xhr.open("DELETE", API_BASE_URL + "/invoice/" + invoiceId, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log("Invoice deleted successfully");
      showNotification("Invoice deleted successfully!", "success");
      loadAllInvoices();
    } else {
      console.error("Error deleting invoice");
      showNotification("Error deleting invoice", "error");
    }
  };

  xhr.send();
}

function loadAllServices() {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", API_BASE_URL + "/service", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        console.log("Services loaded:", data);
        populateServiceDropdown(data.data || data);
      } catch (error) {
        console.error("Error parsing services:", error);
      }
    } else {
      console.error("Error loading services. Status:", xhr.status);
    }
  };

  xhr.onerror = function() {
    console.error("AJAX Error loading services");
  };

  xhr.send();
}

function getServiceById(serviceId) {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", API_BASE_URL + "/service/" + serviceId, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        console.log("Service details:", data);
        return data;
      } catch (error) {
        console.error("Error parsing service:", error);
      }
    }
  };

  xhr.send();
}

function createService(serviceData) {
  var xhr = new XMLHttpRequest();

  xhr.open("POST", API_BASE_URL + "/service", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log("Service created successfully");
      showNotification("Service created successfully!", "success");
      loadAllServices();
    } else {
      console.error("Error creating service");
      showNotification("Error creating service", "error");
    }
  };

  xhr.send(JSON.stringify(serviceData));
}

function updateService(serviceData) {
  var xhr = new XMLHttpRequest();

  xhr.open("PUT", API_BASE_URL + "/service", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log("Service updated successfully");
      showNotification("Service updated successfully!", "success");
      loadAllServices();
    } else {
      console.error("Error updating service");
      showNotification("Error updating service", "error");
    }
  };

  xhr.send(JSON.stringify(serviceData));
}

function deleteService(serviceId) {
  if (!confirm("Are you sure you want to delete this service?")) {
    return;
  }

  var xhr = new XMLHttpRequest();

  xhr.open("DELETE", API_BASE_URL + "/service/" + serviceId, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log("Service deleted successfully");
      showNotification("Service deleted successfully!", "success");
      loadAllServices();
    } else {
      console.error("Error deleting service");
      showNotification("Error deleting service", "error");
    }
  };

  xhr.send();
}

function updateInvoiceList(invoices) {
  var tableBody = document.querySelector('table tbody');
  if (!tableBody) return;

  console.log("Updating invoice list with:", invoices);
}

function populateServiceDropdown(services) {
  var serviceSelects = document.querySelectorAll('select[name="service"], select.service-select');
  serviceSelects.forEach(function(select) {

    while (select.options.length > 1) {
      select.remove(1);
    }

    services.forEach(function(service) {
      var option = document.createElement('option');
      option.value = service.id;
      option.textContent = service.name + ' - $' + service.rate;
      select.appendChild(option);
    });
  });
}

function populateInvoiceView(invoice) {
  console.log("Populating invoice view:", invoice);
  var invoiceNumber = document.querySelector('[data-invoice-number]');
  if (invoiceNumber) {
    invoiceNumber.textContent = 'INV-' + invoice.id;
  }
}

function showNotification(message, type) {
  var notification = document.createElement('div');
  notification.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3';

  if (type === 'success') {
    notification.className += ' bg-green-600 text-white';
    notification.innerHTML = '<span class="material-symbols-outlined">check_circle</span><span class="font-medium">' + message + '</span>';
  } else if (type === 'error') {
    notification.className += ' bg-red-600 text-white';
    notification.innerHTML = '<span class="material-symbols-outlined">error</span><span class="font-medium">' + message + '</span>';
  }

  document.body.appendChild(notification);

  setTimeout(function() {
    notification.remove();
  }, 3000);
}

function onClientSelectChange() {
  var clientSelect = document.querySelector('select[name="clientSelect"]');
  if (!clientSelect) return;

  var selectedOption = clientSelect.options[clientSelect.selectedIndex];
  var emailInput = document.querySelector('input[placeholder="email@example.com"]');
  var phoneInput = document.querySelector('input[placeholder="+1 (555) 000-0000"]');
  var addressInput = document.querySelector('textarea[placeholder*="Street Address"]');

  if (selectedOption.value) {
    if (emailInput) emailInput.value = selectedOption.getAttribute('data-email') || '';
    if (phoneInput) phoneInput.value = selectedOption.getAttribute('data-phone') || '';
    if (addressInput) addressInput.value = selectedOption.getAttribute('data-address') || '';
  }
}

function submitCreateInvoice() {
  var clientSelect = document.querySelector('select[name="clientSelect"]');
  var invoiceNumber = document.querySelector('input[value="2024-001"]');
  var issueDate = document.querySelector('input[type="date"][value="2023-10-27"]');
  var dueDate = document.querySelector('input[type="date"][value="2023-11-27"]');

  if (!clientSelect || !clientSelect.value) {
    showNotification("Please select a client", "error");
    return;
  }

  var items = [];
  var rows = document.querySelectorAll('table tbody tr:not(:last-child)');
  rows.forEach(function(row) {
    var descInput = row.querySelector('input[type="text"]');
    var qtyInput = row.querySelector('input[type="number"][placeholder*="Qty"]') || row.querySelectorAll('input[type="number"]')[0];
    var rateInput = row.querySelectorAll('input[type="number"]')[1];

    if (descInput && descInput.value && qtyInput && rateInput) {
      items.push({
        description: descInput.value,
        quantity: qtyInput.value,
        rate: rateInput.value
      });
    }
  });

  if (items.length === 0) {
    showNotification("Please add at least one item", "error");
    return;
  }

  var invoiceData = {
    clientId: clientSelect.value,
    invoiceNumber: invoiceNumber ? invoiceNumber.value : 'INV-' + new Date().getTime(),
    issueDate: issueDate ? issueDate.value : new Date().toISOString().split('T')[0],
    dueDate: dueDate ? dueDate.value : new Date().toISOString().split('T')[0],
    items: items,
    status: 'DRAFT'
  };

  createInvoice(invoiceData);
}

document.addEventListener('DOMContentLoaded', function() {
  loadAllClients();
  loadAllServices();
  loadAllInvoices();

  var clientSelect = document.querySelector('select[name="clientSelect"]');
  if (clientSelect) {
    clientSelect.addEventListener('change', onClientSelectChange);
  }

  var sendInvoiceBtn = Array.from(document.querySelectorAll('button')).find(btn =>
    btn.querySelector('span') && btn.querySelector('span').textContent.includes('Send Invoice')
  ) || document.querySelector('button.btn-send-invoice');

  var createNewInvoiceBtn = Array.from(document.querySelectorAll('button')).find(btn =>
    btn.querySelector('span') && btn.querySelector('span').textContent.includes('Create New Invoice')
  ) || document.querySelector('button.btn-create-invoice');

  if (sendInvoiceBtn) {
    sendInvoiceBtn.addEventListener('click', submitCreateInvoice);
  }

  var deleteButtons = document.querySelectorAll('button[title="Delete"]');
  deleteButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var row = btn.closest('tr');
      var invoiceNumber = row ? row.querySelector('td').textContent : '';
      deleteInvoice(invoiceNumber);
    });
  });

  var viewButtons = document.querySelectorAll('button[title="View Detail"]');
  viewButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var row = btn.closest('tr');
      var invoiceNumber = row ? row.querySelector('td').textContent : '';
      window.location.href = 'invoice-view.html?id=' + invoiceNumber;
    });
  });
});


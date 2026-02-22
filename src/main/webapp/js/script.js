const API_BASE_URL = '/invoicing_system/api';

// Globally cached services list for populating row dropdowns
var _cachedServices = [];

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
  var invoiceIdNum = parseInt(invoiceId);
  if (isNaN(invoiceIdNum) || invoiceIdNum <= 0) {
    console.error("Invalid invoice ID");
    return;
  }

  var xhr = new XMLHttpRequest();

  xhr.open("GET", API_BASE_URL + "/invoice/" + invoiceIdNum, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        var response = JSON.parse(xhr.responseText);
        var invoice = response.data || response;
        console.log("Invoice details:", invoice);

        // Populate invoice view with full details including client data
        if (invoice) {
          populateInvoiceView(invoice);

          // Populate invoice items
          if (invoice.items && invoice.items.length > 0) {
            populateInvoiceItems(invoice.items);
          }

          // Update date information
          var issueDate = document.querySelector('[data-issue-date]');
          if (issueDate) issueDate.textContent = invoice.date || 'N/A';
        }
      } catch (error) {
        console.error("Error parsing invoice:", error);
      }
    } else {
      console.error("Error loading invoice. Status:", xhr.status);
    }
  };

  xhr.onerror = function() {
    console.error("AJAX Error loading invoice");
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

      // Redirect to invoice view page after successful update
      setTimeout(function() {
        window.location.href = 'invoice-view.html?id=' + invoiceData.id;
      }, 1500);
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

  var invoiceIdNum = parseInt(invoiceId);
  if (isNaN(invoiceIdNum) || invoiceIdNum <= 0) {
    showNotification("Invalid invoice ID", "error");
    return;
  }

  var xhr = new XMLHttpRequest();

  xhr.open("DELETE", API_BASE_URL + "/invoice/" + invoiceIdNum, true);
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

  xhr.onerror = function() {
    console.error("AJAX Error deleting invoice");
    showNotification("Network error deleting invoice", "error");
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
        _cachedServices = data.data || data || [];
        populateServiceDropdown(_cachedServices);

        // On create-invoice page, add one initial row once services are ready
        var tbody = document.getElementById('itemsTableBody');
        if (tbody && tbody.children.length === 0) {
          addItemRow();
        }
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

  // Clear existing rows
  tableBody.innerHTML = '';

  if (!invoices || invoices.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-slate-500">No invoices found</td></tr>';
    return;
  }

  invoices.forEach(function(invoice) {
    var row = document.createElement('tr');
    row.className = 'border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors';

    var statusClass = invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-slate-100 text-slate-800';

    row.innerHTML = '<td class="px-6 py-4 font-semibold text-slate-900 dark:text-white">' + invoice.id + '</td>' +
                    '<td class="px-6 py-4 text-slate-600 dark:text-slate-400">' + (invoice.clientName || 'N/A') + '</td>' +
                    '<td class="px-6 py-4 text-slate-600 dark:text-slate-400">$' + invoice.totalAmount.toFixed(2) + '</td>' +
                    '<td class="px-6 py-4 text-slate-600 dark:text-slate-400">' + invoice.date + '</td>' +
                    '<td class="px-6 py-4"><span class="px-3 py-1 rounded-full text-xs font-semibold ' + statusClass + '">' + (invoice.status || 'DRAFT') + '</span></td>' +
                    '<td class="px-6 py-4 text-right space-x-2">' +
                    '  <button title="View Detail" class="text-primary hover:bg-primary/10 px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1">' +
                    '    <span class="material-symbols-outlined text-lg">visibility</span>' +
                    '  </button>' +
                    '  <button title="Update Invoice" class="text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1">' +
                    '    <span class="material-symbols-outlined text-lg">edit</span>' +
                    '  </button>' +
                    '  <button title="Delete" class="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1">' +
                    '    <span class="material-symbols-outlined text-lg">delete</span>' +
                    '  </button>' +
                    '</td>';

    tableBody.appendChild(row);
  });

  // Reattach event listeners
  attachInvoiceListeners();
}

function attachInvoiceListeners() {
  var deleteButtons = document.querySelectorAll('button[title="Delete"]');
  deleteButtons.forEach(function(btn) {
    btn.onclick = function() {
      var row = btn.closest('tr');
      var invoiceId = row ? row.querySelector('td').textContent : '';
      if (invoiceId) {
        deleteInvoice(invoiceId);
      }
    };
  });

  var viewButtons = document.querySelectorAll('button[title="View Detail"]');
  viewButtons.forEach(function(btn) {
    btn.onclick = function() {
      var row = btn.closest('tr');
      var invoiceId = row ? row.querySelector('td').textContent : '';
      if (invoiceId) {
        window.location.href = 'invoice-view.html?id=' + invoiceId;
      }
    };
  });

  var updateButtons = document.querySelectorAll('button[title="Update Invoice"]');
  updateButtons.forEach(function(btn) {
    btn.onclick = function() {
      var row = btn.closest('tr');
      var invoiceId = row ? row.querySelector('td').textContent : '';
      if (invoiceId) {
        window.location.href = 'update-invoice.html?id=' + invoiceId;
      }
    };
  });
}

function populateServiceDropdown(services) {
  _cachedServices = services || [];

  var serviceSelects = document.querySelectorAll('select[name="service"], select.service-select');
  serviceSelects.forEach(function(select) {
    while (select.options.length > 1) {
      select.remove(1);
    }
    services.forEach(function(service) {
      var option = document.createElement('option');
      option.value = service.id;
      option.textContent = service.name + ' - $' + (service.unitPrice || service.rate || 0).toFixed(2);
      select.appendChild(option);
    });
  });

  var rowSelects = document.querySelectorAll('select.item-service-select');
  rowSelects.forEach(function(sel) {
    var currentVal = sel.value;
    fillServiceSelect(sel);
    sel.value = currentVal;
  });
}

// Populate a single <select> element with the cached service list
function fillServiceSelect(selectEl) {
  selectEl.innerHTML = '<option value="">-- Select Service --</option>';
  _cachedServices.forEach(function(service) {
    var option = document.createElement('option');
    option.value = service.id;
    option.setAttribute('data-price', service.unitPrice || service.rate || 0);
    option.textContent = service.name + ' ($' + (service.unitPrice || service.rate || 0).toFixed(2) + ')';
    selectEl.appendChild(option);
  });
}

// Add a new item row to the create-invoice items table
function addItemRow() {
  var tbody = document.getElementById('itemsTableBody');
  if (!tbody) return;

  var tr = document.createElement('tr');
  tr.className = 'invoice-item-row group hover:bg-slate-50 dark:hover:bg-slate-800/20';

  var tdService = document.createElement('td');
  tdService.className = 'px-6 py-3';
  var serviceSelect = document.createElement('select');
  serviceSelect.className = 'item-service-select form-input w-full rounded border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-2';
  fillServiceSelect(serviceSelect);

  serviceSelect.onchange = function() {
    var selectedService = _cachedServices.find(function(s) {
      return s.id == serviceSelect.value;
    });
    if (selectedService) {
      rateInput.value = (selectedService.unitPrice || selectedService.rate || 0).toFixed(2);
      updateRowAmount(tr);
    }
  };
  tdService.appendChild(serviceSelect);

  var tdQty = document.createElement('td');
  tdQty.className = 'px-6 py-3';
  var qtyInput = document.createElement('input');
  qtyInput.type = 'number';
  qtyInput.className = 'item-quantity form-input w-20 rounded border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm text-center py-2';
  qtyInput.value = '1';
  qtyInput.min = '1';
  qtyInput.onchange = function() { updateRowAmount(tr); };
  tdQty.appendChild(qtyInput);

  var tdRate = document.createElement('td');
  tdRate.className = 'px-6 py-3';
  var rateInput = document.createElement('input');
  rateInput.type = 'number';
  rateInput.step = '0.01';
  rateInput.className = 'item-rate form-input w-28 rounded border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm text-right py-2';
  rateInput.value = '0.00';
  rateInput.onchange = function() { updateRowAmount(tr); };
  tdRate.appendChild(rateInput);

  var tdAmount = document.createElement('td');
  tdAmount.className = 'px-6 py-3 text-right';
  var amountSpan = document.createElement('span');
  amountSpan.className = 'item-amount text-sm font-semibold text-slate-900 dark:text-white';
  amountSpan.textContent = '$0.00';
  tdAmount.appendChild(amountSpan);

  var tdDelete = document.createElement('td');
  tdDelete.className = 'px-6 py-3 text-center';
  var deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded transition-colors';
  deleteBtn.innerHTML = '<span class="material-symbols-outlined text-lg">delete</span>';
  deleteBtn.onclick = function() {
    tr.remove();
    recalcTotal();
  };
  tdDelete.appendChild(deleteBtn);

  tr.appendChild(tdService);
  tr.appendChild(tdQty);
  tr.appendChild(tdRate);
  tr.appendChild(tdAmount);
  tr.appendChild(tdDelete);

  tbody.appendChild(tr);
}

function updateRowAmount(row) {
  var qtyInput = row.querySelector('.item-quantity');
  var rateInput = row.querySelector('.item-rate');
  var amountSpan = row.querySelector('.item-amount');

  if (qtyInput && rateInput && amountSpan) {
    var qty = parseInt(qtyInput.value) || 0;
    var rate = parseFloat(rateInput.value) || 0;
    var amount = qty * rate;
    amountSpan.textContent = '$' + amount.toFixed(2);
    recalcTotal();
  }
}

function recalcTotal() {
  var totalElement = document.querySelector('[data-total-amount]');
  if (!totalElement) return;
  var total = 0;
  document.querySelectorAll('tr.invoice-item-row').forEach(function(row) {
    var amountSpan = row.querySelector('.item-amount');
    if (amountSpan) {
      total += parseFloat(amountSpan.textContent.replace('$', '')) || 0;
    }
  });
  totalElement.textContent = '$' + total.toFixed(2);
}

function populateInvoiceView(invoice) {
  console.log("Populating invoice view:", invoice);

  // Store current invoice globally for update functionality
  window.currentInvoice = invoice;

  // Update invoice number
  var invoiceNumberElements = document.querySelectorAll('[data-invoice-number]');
  invoiceNumberElements.forEach(function(el) {
    el.textContent = 'INV-' + invoice.id;
  });

  // Update status badge
  var statusEl = document.querySelector('[data-invoice-status]');
  if (statusEl) statusEl.textContent = invoice.status || 'N/A';

  // Update issue date
  var issueDate = document.querySelector('[data-issue-date]');
  if (issueDate) issueDate.textContent = invoice.date || 'N/A';

  // Update total amount in sidebar
  var totalAmountEl = document.querySelector('[data-total-amount]');
  if (totalAmountEl) totalAmountEl.textContent = '$' + (invoice.totalAmount || 0).toFixed(2);

  // Support both nested client object and flat clientName
  var clientName = (invoice.client && invoice.client.name) ? invoice.client.name : (invoice.clientName || '');
  var clientEmail = (invoice.client && invoice.client.email) ? invoice.client.email : '';
  var clientPhone = (invoice.client && invoice.client.phone) ? invoice.client.phone : '';
  var clientAddress = (invoice.client && invoice.client.address) ? invoice.client.address : '';

  var billToName = document.querySelector('[data-bill-to-name]');
  var billToEmail = document.querySelector('[data-bill-to-email]');
  var billToPhone = document.querySelector('[data-bill-to-phone]');
  var billToAddress = document.querySelector('[data-bill-to-address]');

  if (billToName) billToName.textContent = clientName;
  if (billToEmail) billToEmail.textContent = clientEmail;
  if (billToPhone) billToPhone.textContent = clientPhone;
  if (billToAddress) billToAddress.textContent = clientAddress;
}

function populateInvoiceItems(items) {
  var tableBody = document.querySelector('table tbody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  var totalAmount = 0;
  items.forEach(function(item) {
    var row = document.createElement('tr');
    row.className = 'group hover:bg-slate-50/50 dark:hover:bg-slate-800/20';

    var unitPrice = item.unitPrice || item.rate || 0;
    var itemTotal = (item.quantity || 0) * unitPrice;
    totalAmount += itemTotal;

    row.innerHTML = '<td class="px-6 py-4">' +
                    '  <div class="text-sm font-bold text-slate-900 dark:text-white">' + (item.serviceName || item.description || 'N/A') + '</div>' +
                    '</td>' +
                    '<td class="px-6 py-4 text-center text-sm">' + (item.quantity || 0) + '</td>' +
                    '<td class="px-6 py-4 text-right text-sm font-medium">$' + unitPrice.toFixed(2) + '</td>' +
                    '<td class="px-6 py-4 text-right text-sm font-bold">$' + itemTotal.toFixed(2) + '</td>' +
                    '<td class="px-6 py-4 text-right"></td>';

    tableBody.appendChild(row);
  });

  // Update total amount display
  var totalElement = document.querySelector('[data-total-amount]');
  if (totalElement) {
    totalElement.textContent = '$' + totalAmount.toFixed(2);
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

function submitUpdateInvoice() {
  var urlParams = new URLSearchParams(window.location.search);
  var invoiceId = urlParams.get('id');

  if (!invoiceId) {
    showNotification("No invoice ID found", "error");
    return;
  }

  var clientSelect = document.querySelector('select[name="clientSelect"]');
  var issueDateInput = document.getElementById('issueDateInput');
  var statusSelect = document.getElementById('statusSelect');

  if (!clientSelect || !clientSelect.value) {
    showNotification("Please select a client", "error");
    return;
  }

  // Collect items from table rows
  var items = [];
  var rows = document.querySelectorAll('tr.invoice-item-row');

  rows.forEach(function(row) {
    var serviceSelect = row.querySelector('.item-service-select');
    var qtyInput = row.querySelector('.item-quantity');

    if (serviceSelect && qtyInput && serviceSelect.value) {
      var selectedService = _cachedServices.find(function(s) {
        return s.id == serviceSelect.value;
      });

      if (selectedService) {
        // Get rate from either input field or hidden in the service data
        var rateInput = row.querySelector('.item-rate');
        var unitPrice = selectedService.unitPrice || selectedService.rate || 0;

        // If rateInput is an input element, use its value
        if (rateInput && rateInput.tagName === 'INPUT') {
          unitPrice = parseFloat(rateInput.value) || unitPrice;
        }

        items.push({
          serviceId: parseInt(serviceSelect.value),
          serviceName: selectedService.name,
          quantity: parseInt(qtyInput.value) || 1,
          unitPrice: unitPrice
        });
      }
    }
  });

  if (items.length === 0) {
    showNotification("Please add at least one service item", "error");
    return;
  }

  // Calculate total amount from displayed amounts
  var totalAmount = 0;
  document.querySelectorAll('tr.invoice-item-row .item-amount').forEach(function(span) {
    totalAmount += parseFloat(span.textContent.replace('$', '')) || 0;
  });

  var invoiceData = {
    id: parseInt(invoiceId),
    clientId: parseInt(clientSelect.value),
    date: issueDateInput ? issueDateInput.value : new Date().toISOString().split('T')[0],
    items: items,
    totalAmount: totalAmount,
    statusId: statusSelect ? parseInt(statusSelect.value) : 2
  };

  console.log("Submitting updated invoice data:", invoiceData);
  updateInvoice(invoiceData);
}

function loadInvoiceForUpdate(invoiceId) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", API_BASE_URL + "/invoice/" + invoiceId, true);

  xhr.onload = function() {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      var invoice = response.data || response;

      console.log("Loaded invoice for update:", invoice);

      // Store invoice globally
      window.currentInvoice = invoice;

      // Update invoice number in header
      var invoiceNumberEl = document.getElementById('invoiceNumber');
      if (invoiceNumberEl) {
        invoiceNumberEl.textContent = invoice.id;
      }

      // Populate client dropdown and select the current client
      var clientSelect = document.querySelector('select[name="clientSelect"]');
      if (clientSelect && invoice.clientId) {
        clientSelect.value = invoice.clientId;

        // Trigger change to populate email, phone, address
        var changeEvent = new Event('change');
        clientSelect.dispatchEvent(changeEvent);
      }

      // Set issue date
      var issueDateInput = document.getElementById('issueDateInput');
      if (issueDateInput && invoice.date) {
        issueDateInput.value = invoice.date;
      }

      // Set status
      var statusSelect = document.getElementById('statusSelect');
      if (statusSelect && invoice.statusId) {
        statusSelect.value = invoice.statusId;
      }

      // Clear existing items in table
      var tableBody = document.getElementById('itemsTableBody');
      if (tableBody) {
        tableBody.innerHTML = '';
      }

      // Populate items
      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach(function(item) {
          addItemRowWithData(item);
        });
      } else {
        // Add one empty row if no items
        addItemRow();
      }
    } else {
      console.error("Error loading invoice:", xhr.status);
      showNotification("Error loading invoice data", "error");
    }
  };

  xhr.onerror = function() {
    console.error("Request failed");
    showNotification("Failed to load invoice", "error");
  };

  xhr.send();
}

function addItemRowWithData(itemData) {
  var tbody = document.getElementById('itemsTableBody');
  if (!tbody) return;

  var tr = document.createElement('tr');
  tr.className = 'invoice-item-row group hover:bg-slate-50 dark:hover:bg-slate-800/20';

  var tdService = document.createElement('td');
  tdService.className = 'px-6 py-3';
  var serviceSelect = document.createElement('select');
  serviceSelect.className = 'item-service-select form-input w-full rounded border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-2';
  fillServiceSelect(serviceSelect);

  // Select the current service
  if (itemData.serviceId) {
    serviceSelect.value = itemData.serviceId;
  }

  serviceSelect.onchange = function() {
    var selectedService = _cachedServices.find(function(s) {
      return s.id == serviceSelect.value;
    });
    if (selectedService) {
      rateInput.value = (selectedService.unitPrice || selectedService.rate || 0).toFixed(2);
      updateRowAmount(tr);
    }
  };
  tdService.appendChild(serviceSelect);

  var tdQty = document.createElement('td');
  tdQty.className = 'px-6 py-3';
  var qtyInput = document.createElement('input');
  qtyInput.type = 'number';
  qtyInput.className = 'item-quantity form-input w-20 rounded border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm text-center py-2';
  qtyInput.value = itemData.quantity || 1;
  qtyInput.min = '1';
  qtyInput.onchange = function() { updateRowAmount(tr); };
  tdQty.appendChild(qtyInput);

  var tdRate = document.createElement('td');
  tdRate.className = 'px-6 py-3';
  var rateInput = document.createElement('input');
  rateInput.type = 'number';
  rateInput.step = '0.01';
  rateInput.className = 'item-rate form-input w-28 rounded border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm text-right py-2';
  rateInput.value = (itemData.unitPrice || 0).toFixed(2);
  rateInput.onchange = function() { updateRowAmount(tr); };
  tdRate.appendChild(rateInput);

  var tdAmount = document.createElement('td');
  tdAmount.className = 'px-6 py-3 text-right';
  var amountSpan = document.createElement('span');
  amountSpan.className = 'item-amount text-sm font-semibold text-slate-900 dark:text-white';
  amountSpan.textContent = '$' + ((itemData.quantity || 1) * (itemData.unitPrice || 0)).toFixed(2);
  tdAmount.appendChild(amountSpan);

  var tdDelete = document.createElement('td');
  tdDelete.className = 'px-6 py-3 text-center';
  var deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded transition-colors';
  deleteBtn.innerHTML = '<span class="material-symbols-outlined text-lg">delete</span>';
  deleteBtn.onclick = function() {
    tr.remove();
    recalcTotal();
  };
  tdDelete.appendChild(deleteBtn);

  tr.appendChild(tdService);
  tr.appendChild(tdQty);
  tr.appendChild(tdRate);
  tr.appendChild(tdAmount);
  tr.appendChild(tdDelete);

  tbody.appendChild(tr);

  recalcTotal();
}

function submitCreateInvoice() {
  var clientSelect = document.querySelector('select[name="clientSelect"]');
  var issueDateInput = document.querySelectorAll('input[type="date"]')[0];

  if (!clientSelect || !clientSelect.value) {
    showNotification("Please select a client", "error");
    return;
  }

  // Collect items from table rows
  var items = [];
  var rows = document.querySelectorAll('tr.invoice-item-row');
  rows.forEach(function(row) {
    var serviceSelect = row.querySelector('select.item-service-select');
    var qtyInput = row.querySelector('input.item-quantity');

    var serviceId = serviceSelect ? parseInt(serviceSelect.value) : 0;
    var qty = qtyInput ? parseInt(qtyInput.value) : 0;

    if (serviceId > 0 && qty > 0) {
      items.push({ serviceId: serviceId, quantity: qty });
    }
  });

  if (items.length === 0) {
    showNotification("Please add at least one service item", "error");
    return;
  }

  // Calculate total amount from displayed amounts
  var totalAmount = 0;
  document.querySelectorAll('tr.invoice-item-row .item-amount').forEach(function(span) {
    totalAmount += parseFloat(span.textContent.replace('$', '')) || 0;
  });

  var invoiceData = {
    clientId: parseInt(clientSelect.value),
    date: issueDateInput ? issueDateInput.value : new Date().toISOString().split('T')[0],
    items: items,
    totalAmount: totalAmount,
    statusId: 1   // default to first status (e.g. Pending / Draft)
  };

  console.log("Submitting invoice data:", invoiceData);
  createInvoice(invoiceData);
}

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the invoice view page
  var urlParams = new URLSearchParams(window.location.search);
  var invoiceId = urlParams.get('id');
  var currentPage = window.location.pathname.split('/').pop();

  if (currentPage === 'invoice-view.html' && invoiceId) {
    // Load invoice details on view page
    getInvoiceById(invoiceId);
  } else if (currentPage === 'update-invoice.html' && invoiceId) {
    // Load data for update page
    loadAllClients();
    loadAllServices();
    // Wait a bit for clients and services to load, then load invoice
    setTimeout(function() {
      loadInvoiceForUpdate(invoiceId);
    }, 500);
  } else {
    // Load data for create/list pages
    loadAllClients();
    loadAllServices();
    loadAllInvoices();
  }

  var clientSelect = document.querySelector('select[name="clientSelect"]');
  if (clientSelect) {
    clientSelect.addEventListener('change', onClientSelectChange);
  }

  // Wire up Add Row buttons on create-invoice and update-invoice pages
  var addRowBtn = document.getElementById('addRowBtn');
  if (addRowBtn) addRowBtn.addEventListener('click', addItemRow);

  var addRowBtn2 = document.getElementById('addRowBtn2');
  if (addRowBtn2) addRowBtn2.addEventListener('click', addItemRow);

  var sendInvoiceBtn = Array.from(document.querySelectorAll('button')).find(btn =>
    btn.querySelector('span') && btn.querySelector('span').textContent.includes('Send Invoice')
  ) || document.querySelector('button.btn-send-invoice');


  if (sendInvoiceBtn) {
    sendInvoiceBtn.addEventListener('click', submitCreateInvoice);
  }

  // Attach event listeners for invoice list actions
  attachInvoiceListeners();
});


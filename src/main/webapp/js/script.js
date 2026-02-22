const API_BASE_URL = '/invoicing_system/api';

var _cachedServices = [];

function showLoadingOverlay(message) {
  var existingOverlay = document.getElementById('loadingOverlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  var overlay = document.createElement('div');
  overlay.id = 'loadingOverlay';
  overlay.className = 'fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center';
  overlay.innerHTML =
    '<div class="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4 border border-slate-200 dark:border-slate-800">' +
    '  <div class="relative">' +
    '    <div class="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-primary"></div>' +
    '    <span class="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary text-2xl">hourglass_empty</span>' +
    '  </div>' +
    '  <div class="text-center">' +
    '    <p class="text-slate-900 dark:text-white font-bold text-lg">' + message + '</p>' +
    '    <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Please wait...</p>' +
    '  </div>' +
    '</div>';
  document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
  var overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s';
    setTimeout(function() {
      overlay.remove();
    }, 200);
  }
}

function showNotification(message, type, duration) {
  duration = duration || 3000;

  var notification = document.createElement('div');
  notification.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-slide-up';

  var iconMap = {
    'success': 'check_circle',
    'error': 'error',
    'warning': 'warning',
    'info': 'info',
    'loading': 'sync'
  };

  var colorMap = {
    'success': 'bg-green-600 text-white',
    'error': 'bg-red-600 text-white',
    'warning': 'bg-yellow-500 text-white',
    'info': 'bg-blue-600 text-white',
    'loading': 'bg-slate-700 text-white'
  };

  notification.className += ' ' + (colorMap[type] || 'bg-slate-700 text-white');

  var icon = iconMap[type] || 'info';
  var iconClass = type === 'loading' ? 'animate-spin' : '';

  notification.innerHTML =
    '<span class="material-symbols-outlined ' + iconClass + '">' + icon + '</span>' +
    '<span class="font-medium">' + message + '</span>';

  document.body.appendChild(notification);

  if (type !== 'loading') {
    setTimeout(function() {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s';
      setTimeout(function() {
        notification.remove();
      }, 300);
    }, duration);
  }

  return notification; // Return for manual removal if needed
}

// Progress indicator for operations
function showProgress(message) {
  var progressBar = document.getElementById('progressBar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'progressBar';
    progressBar.className = 'fixed top-0 left-0 right-0 z-[150] h-1 bg-slate-200 dark:bg-slate-800';
    progressBar.innerHTML = '<div class="h-full bg-primary transition-all duration-300" style="width: 0%"></div>';
    document.body.appendChild(progressBar);
  }

  var bar = progressBar.querySelector('div');
  bar.style.width = '0%';

  // Animate progress
  setTimeout(function() { bar.style.width = '30%'; }, 50);
  setTimeout(function() { bar.style.width = '60%'; }, 200);
  setTimeout(function() { bar.style.width = '90%'; }, 500);

  if (message) {
    showNotification(message, 'loading');
  }
}

function hideProgress() {
  var progressBar = document.getElementById('progressBar');
  if (progressBar) {
    var bar = progressBar.querySelector('div');
    bar.style.width = '100%';
    setTimeout(function() {
      progressBar.remove();
    }, 300);
  }

  // Remove loading notification
  var loadingNotif = document.querySelector('.fixed.bottom-6 .animate-spin');
  if (loadingNotif) {
    loadingNotif.closest('.fixed').remove();
  }
}

function loadAllClients() {
  showProgress('Loading clients...');

  var xhr = new XMLHttpRequest();

  xhr.open("GET", API_BASE_URL + "/client", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    hideProgress();
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
        showNotification(data.data.length + ' clients loaded successfully', 'success', 2000);
      } catch (error) {
        console.error("Error parsing clients:", error);
        showNotification("Error parsing client data", "error");
      }
    } else {
      console.error("Error loading clients. Status:", xhr.status);
      showNotification("Failed to load clients (Status: " + xhr.status + ")", "error");
    }
  };

  xhr.onerror = function() {
    hideProgress();
    console.error("AJAX Error loading clients");
    showNotification("Network error: Could not connect to server", "error");
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
  showLoadingOverlay('Creating client...');

  var xhr = new XMLHttpRequest();

  xhr.open("POST", API_BASE_URL + "/client", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    hideLoadingOverlay();
    if (xhr.status === 200) {
      console.log("Client created successfully");
      showNotification("✓ Client created successfully!", "success");
      loadAllClients();
    } else {
      console.error("Error creating client");
      var errorMsg = "Failed to create client";
      try {
        var response = JSON.parse(xhr.responseText);
        errorMsg = response.message || errorMsg;
      } catch(e) {}
      showNotification(errorMsg, "error");
    }
  };

  xhr.onerror = function() {
    hideLoadingOverlay();
    console.error("AJAX Error creating client");
    showNotification("Network error: Unable to create client", "error");
  };

  xhr.send(JSON.stringify(clientData));
}

function updateClient(clientData) {
  showLoadingOverlay('Updating client...');

  var xhr = new XMLHttpRequest();

  xhr.open("PUT", API_BASE_URL + "/client", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    hideLoadingOverlay();
    if (xhr.status === 200) {
      console.log("Client updated successfully");
      showNotification("✓ Client updated successfully!", "success");
      loadAllClients();
    } else {
      console.error("Error updating client");
      var errorMsg = "Failed to update client";
      try {
        var response = JSON.parse(xhr.responseText);
        errorMsg = response.message || errorMsg;
      } catch(e) {}
      showNotification(errorMsg, "error");
    }
  };

  xhr.onerror = function() {
    hideLoadingOverlay();
    console.error("AJAX Error updating client");
    showNotification("Network error: Unable to update client", "error");
  };

  xhr.send(JSON.stringify(clientData));
}

function deleteClient(clientId) {
  if (!confirm("Are you sure you want to delete this client?")) {
    return;
  }

  showLoadingOverlay('Deleting client...');

  var xhr = new XMLHttpRequest();

  xhr.open("DELETE", API_BASE_URL + "/client/" + clientId, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    hideLoadingOverlay();
    if (xhr.status === 200) {
      console.log("Client deleted successfully");
      showNotification("✓ Client deleted successfully!", "success");
      loadAllClients();
    } else {
      console.error("Error deleting client");
      var errorMsg = "Failed to delete client";
      try {
        var response = JSON.parse(xhr.responseText);
        errorMsg = response.message || errorMsg;
      } catch(e) {}
      showNotification(errorMsg, "error");
    }
  };

  xhr.onerror = function() {
    hideLoadingOverlay();
    console.error("AJAX Error deleting client");
    showNotification("Network error: Unable to delete client", "error");
  };

  xhr.send();
}

function loadAllInvoices() {
  showProgress('Loading invoices...');

  var xhr = new XMLHttpRequest();

  xhr.open("GET", API_BASE_URL + "/invoice", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    hideProgress();
    if (xhr.status === 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        console.log("Invoices loaded:", data);
        updateInvoiceList(data.data || data);

        var count = (data.data || data).length;
        showNotification(count + ' invoice' + (count !== 1 ? 's' : '') + ' loaded', 'success', 2000);
      } catch (error) {
        console.error("Error parsing invoices:", error);
        showNotification("Error parsing invoice data", "error");
      }
    } else {
      console.error("Error loading invoices. Status:", xhr.status);
      showNotification("Failed to load invoices (Status: " + xhr.status + ")", "error");
    }
  };

  xhr.onerror = function() {
    hideProgress();
    console.error("AJAX Error loading invoices");
    showNotification("Network error: Could not load invoices", "error");
  };

  xhr.send();
}

function getInvoiceById(invoiceId) {
  var invoiceIdNum = parseInt(invoiceId);
  if (isNaN(invoiceIdNum) || invoiceIdNum <= 0) {
    console.error("Invalid invoice ID");
    showNotification("Invalid invoice ID", "error");
    return;
  }

  showLoadingOverlay('Loading invoice details...');

  var xhr = new XMLHttpRequest();

  xhr.open("GET", API_BASE_URL + "/invoice/" + invoiceIdNum, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    hideLoadingOverlay();
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

          showNotification("Invoice #" + invoiceIdNum + " loaded successfully", "success", 2000);
        }
      } catch (error) {
        console.error("Error parsing invoice:", error);
        showNotification("Error parsing invoice data", "error");
      }
    } else if (xhr.status === 404) {
      showNotification("Invoice #" + invoiceIdNum + " not found", "error");
    } else {
      console.error("Error loading invoice. Status:", xhr.status);
      showNotification("Failed to load invoice (Status: " + xhr.status + ")", "error");
    }
  };

  xhr.onerror = function() {
    hideLoadingOverlay();
    console.error("AJAX Error loading invoice");
    showNotification("Network error: Could not load invoice", "error");
  };

  xhr.send();
}

function createInvoice(invoiceData) {
  showLoadingOverlay('Creating invoice...');

  var xhr = new XMLHttpRequest();

  xhr.open("POST", API_BASE_URL + "/invoice", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    hideLoadingOverlay();
    if (xhr.status === 200) {
      try {
        var response = JSON.parse(xhr.responseText);
        console.log("Invoice created successfully");
        showNotification("✓ Invoice created successfully! Redirecting...", "success");

        setTimeout(function() {
          window.location.href = 'invoice-list.html';
        }, 1500);
      } catch (error) {
        console.error("Error parsing response:", error);
        showNotification("✓ Invoice created successfully! Redirecting...", "success");
        setTimeout(function() {
          window.location.href = 'invoice-list.html';
        }, 1500);
      }
    } else {
      console.error("Error creating invoice");
      var errorMsg = "Failed to create invoice";
      try {
        var response = JSON.parse(xhr.responseText);
        errorMsg = response.message || errorMsg;
      } catch(e) {}
      showNotification(errorMsg, "error");
    }
  };

  xhr.onerror = function() {
    hideLoadingOverlay();
    console.error("AJAX Error creating invoice");
    showNotification("Network error: Unable to create invoice", "error");
  };

  xhr.send(JSON.stringify(invoiceData));
}

function updateInvoice(invoiceData) {
  showLoadingOverlay('Updating invoice...');

  var xhr = new XMLHttpRequest();

  xhr.open("PUT", API_BASE_URL + "/invoice", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    hideLoadingOverlay();
    if (xhr.status === 200) {
      console.log("Invoice updated successfully");
      showNotification("✓ Invoice updated successfully! Redirecting...", "success");

      // Redirect to invoice view page after successful update
      setTimeout(function() {
        window.location.href = 'invoice-view.html?id=' + invoiceData.id;
      }, 1500);
    } else {
      console.error("Error updating invoice");
      var errorMsg = "Failed to update invoice";
      try {
        var response = JSON.parse(xhr.responseText);
        errorMsg = response.message || errorMsg;
      } catch(e) {}
      showNotification(errorMsg, "error");
    }
  };

  xhr.onerror = function() {
    hideLoadingOverlay();
    console.error("AJAX Error updating invoice");
    showNotification("Network error: Unable to update invoice", "error");
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

  showLoadingOverlay('Deleting invoice...');

  var xhr = new XMLHttpRequest();

  xhr.open("DELETE", API_BASE_URL + "/invoice/" + invoiceIdNum, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    hideLoadingOverlay();
    if (xhr.status === 200) {
      console.log("Invoice deleted successfully");
      showNotification("✓ Invoice #" + invoiceIdNum + " deleted successfully!", "success");
      loadAllInvoices();
    } else {
      console.error("Error deleting invoice");
      var errorMsg = "Failed to delete invoice";
      try {
        var response = JSON.parse(xhr.responseText);
        errorMsg = response.message || errorMsg;
      } catch(e) {}
      showNotification(errorMsg, "error");
    }
  };

  xhr.onerror = function() {
    hideLoadingOverlay();
    console.error("AJAX Error deleting invoice");
    showNotification("Network error: Unable to delete invoice", "error");
  };

  xhr.send();
}

function loadAllServices() {
  showProgress('Loading services...');

  var xhr = new XMLHttpRequest();

  xhr.open("GET", API_BASE_URL + "/service", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    hideProgress();
    if (xhr.status === 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        console.log("Services loaded:", data);
        _cachedServices = data.data || data || [];
        populateServiceDropdown(_cachedServices);

        // On create-invoice page only, add one initial row once services are ready
        var currentPage = window.location.pathname.split('/').pop();
        var tbody = document.getElementById('itemsTableBody');
        if (tbody && tbody.children.length === 0 && currentPage === 'create-invoice.html') {
          addItemRow();
        }

        showNotification(_cachedServices.length + ' services loaded', 'success', 2000);
      } catch (error) {
        console.error("Error parsing services:", error);
        showNotification("Error parsing service data", "error");
      }
    } else {
      console.error("Error loading services. Status:", xhr.status);
      showNotification("Failed to load services (Status: " + xhr.status + ")", "error");
    }
  };

  xhr.onerror = function() {
    hideProgress();
    console.error("AJAX Error loading services");
    showNotification("Network error: Could not load services", "error");
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
  showLoadingOverlay('Creating service...');

  var xhr = new XMLHttpRequest();

  xhr.open("POST", API_BASE_URL + "/service", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    hideLoadingOverlay();
    if (xhr.status === 200) {
      console.log("Service created successfully");
      showNotification("✓ Service created successfully!", "success");
      loadAllServices();
    } else {
      console.error("Error creating service");
      var errorMsg = "Failed to create service";
      try {
        var response = JSON.parse(xhr.responseText);
        errorMsg = response.message || errorMsg;
      } catch(e) {}
      showNotification(errorMsg, "error");
    }
  };

  xhr.onerror = function() {
    hideLoadingOverlay();
    console.error("AJAX Error creating service");
    showNotification("Network error: Unable to create service", "error");
  };

  xhr.send(JSON.stringify(serviceData));
}

function updateService(serviceData) {
  showLoadingOverlay('Updating service...');

  var xhr = new XMLHttpRequest();

  xhr.open("PUT", API_BASE_URL + "/service", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    hideLoadingOverlay();
    if (xhr.status === 200) {
      console.log("Service updated successfully");
      showNotification("✓ Service updated successfully!", "success");
      loadAllServices();
    } else {
      console.error("Error updating service");
      var errorMsg = "Failed to update service";
      try {
        var response = JSON.parse(xhr.responseText);
        errorMsg = response.message || errorMsg;
      } catch(e) {}
      showNotification(errorMsg, "error");
    }
  };

  xhr.onerror = function() {
    hideLoadingOverlay();
    console.error("AJAX Error updating service");
    showNotification("Network error: Unable to update service", "error");
  };

  xhr.send(JSON.stringify(serviceData));
}

function deleteService(serviceId) {
  if (!confirm("Are you sure you want to delete this service?")) {
    return;
  }

  showLoadingOverlay('Deleting service...');

  var xhr = new XMLHttpRequest();

  xhr.open("DELETE", API_BASE_URL + "/service/" + serviceId, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    hideLoadingOverlay();
    if (xhr.status === 200) {
      console.log("Service deleted successfully");
      showNotification("✓ Service deleted successfully!", "success");
      loadAllServices();
    } else {
      console.error("Error deleting service");
      var errorMsg = "Failed to delete service";
      try {
        var response = JSON.parse(xhr.responseText);
        errorMsg = response.message || errorMsg;
      } catch(e) {}
      showNotification(errorMsg, "error");
    }
  };

  xhr.onerror = function() {
    hideLoadingOverlay();
    console.error("AJAX Error deleting service");
    showNotification("Network error: Unable to delete service", "error");
  };

  xhr.send();
}

function updateInvoiceList(invoices) {
  // Only target the invoice list table, not other tables on the page
  var tableBody = document.querySelector('#invoiceListTable tbody');
  if (!tableBody) {
    // Fallback to generic selector only if specific table doesn't exist
    tableBody = document.querySelector('table tbody');
    if (!tableBody) return;

    // Check if we're on update-invoice or create-invoice page - don't update those tables
    var currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'update-invoice.html' || currentPage === 'create-invoice.html') {
      return;
    }
  }

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
                    '<td class="px-6 py-4 text-slate-600 dark:text-slate-400">LKR ' + invoice.totalAmount.toFixed(2) + '</td>' +
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
      option.textContent = service.name + ' - LKR ' + (service.unitPrice || service.rate || 0).toFixed(2);
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

function fillServiceSelect(selectEl) {
  selectEl.innerHTML = '<option value="">-- Select Service --</option>';
  _cachedServices.forEach(function(service) {
    var option = document.createElement('option');
    option.value = service.id;
    option.setAttribute('data-price', service.unitPrice || service.rate || 0);
    option.textContent = service.name + ' (LKR ' + (service.unitPrice || service.rate || 0).toFixed(2) + ')';
    selectEl.appendChild(option);
  });
}

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
  amountSpan.textContent = 'LKR 0.00';
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
    amountSpan.textContent = 'LKR ' + amount.toFixed(2);
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
      total += parseFloat(amountSpan.textContent.replace('LKR ', '').replace(',', '')) || 0;
    }
  });
  totalElement.textContent = 'LKR ' + total.toFixed(2);
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
  if (totalAmountEl) totalAmountEl.textContent = 'LKR ' + (invoice.totalAmount || 0).toFixed(2);

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
                    '<td class="px-6 py-4 text-right text-sm font-medium">LKR ' + unitPrice.toFixed(2) + '</td>' +
                    '<td class="px-6 py-4 text-right text-sm font-bold">LKR ' + itemTotal.toFixed(2) + '</td>' +
                    '<td class="px-6 py-4 text-right"></td>';

    tableBody.appendChild(row);
  });

  // Update total amount display
  var totalElement = document.querySelector('[data-total-amount]');
  if (totalElement) {
    totalElement.textContent = 'LKR ' + totalAmount.toFixed(2);
  }
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
    showNotification("⚠ No invoice ID found", "error");
    return;
  }

  var clientSelect = document.querySelector('select[name="clientSelect"]');
  var issueDateInput = document.getElementById('issueDateInput');
  var statusSelect = document.getElementById('statusSelect');

  if (!clientSelect || !clientSelect.value) {
    showNotification("⚠ Please select a client", "warning");
    if (clientSelect) {
      clientSelect.focus();
      clientSelect.classList.add('border-red-500', 'ring-2', 'ring-red-500');
      setTimeout(function() {
        clientSelect.classList.remove('border-red-500', 'ring-2', 'ring-red-500');
      }, 2000);
    }
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
    showNotification("⚠ Please add at least one service item", "warning");
    var addRowBtn = document.getElementById('addRowBtn');
    if (addRowBtn) {
      addRowBtn.classList.add('animate-pulse', 'ring-2', 'ring-yellow-500');
      setTimeout(function() {
        addRowBtn.classList.remove('animate-pulse', 'ring-2', 'ring-yellow-500');
      }, 2000);
    }
    return;
  }

  // Calculate total amount from displayed amounts
  var totalAmount = 0;
  document.querySelectorAll('tr.invoice-item-row .item-amount').forEach(function(span) {
    totalAmount += parseFloat(span.textContent.replace('LKR ', '').replace(',', '')) || 0;
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
  showNotification("Validating invoice data...", "info", 1000);

  setTimeout(function() {
    updateInvoice(invoiceData);
  }, 300);
}

function loadInvoiceForUpdate(invoiceId) {
  // Check if services are loaded, if not, wait and retry
  if (!_cachedServices || _cachedServices.length === 0) {
    console.log("Services not loaded yet, waiting...");
    setTimeout(function() {
      loadInvoiceForUpdate(invoiceId);
    }, 200);
    return;
  }

  showLoadingOverlay('Loading invoice for update...');

  var xhr = new XMLHttpRequest();
  xhr.open("GET", API_BASE_URL + "/invoice/" + invoiceId, true);

  xhr.onload = function() {
    hideLoadingOverlay();
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      var invoice = response.data || response;

      console.log("Loaded invoice for update:", invoice);
      console.log("Available services:", _cachedServices.length);

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
        console.log("Populating " + invoice.items.length + " invoice items...");
        invoice.items.forEach(function(item) {
          addItemRowWithData(item);
        });
        showNotification("Invoice #" + invoiceId + " loaded - " + invoice.items.length + " items", "success", 2000);
      } else {
        // Add one empty row if no items
        addItemRow();
        showNotification("Invoice #" + invoiceId + " loaded", "success", 2000);
      }
    } else if (xhr.status === 404) {
      console.error("Invoice not found");
      showNotification("Invoice #" + invoiceId + " not found", "error");
      setTimeout(function() {
        window.location.href = 'invoice-list.html';
      }, 2000);
    } else {
      console.error("Error loading invoice:", xhr.status);
      showNotification("Failed to load invoice (Status: " + xhr.status + ")", "error");
    }
  };

  xhr.onerror = function() {
    hideLoadingOverlay();
    console.error("Request failed");
    showNotification("Network error: Failed to load invoice", "error");
  };

  xhr.send();
}

function addItemRowWithData(itemData) {
  var tbody = document.getElementById('itemsTableBody');
  if (!tbody) {
    console.error("itemsTableBody not found!");
    return;
  }

  console.log("Adding item row with data:", itemData);
  console.log("Available services:", _cachedServices.length);

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
    console.log("Set service select value to:", itemData.serviceId);
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
  amountSpan.textContent = 'LKR ' + ((itemData.quantity || 1) * (itemData.unitPrice || 0)).toFixed(2);
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

  // Validation with real-time feedback
  if (!clientSelect || !clientSelect.value) {
    showNotification("⚠ Please select a client", "warning");
    if (clientSelect) {
      clientSelect.focus();
      clientSelect.classList.add('border-red-500', 'ring-2', 'ring-red-500');
      setTimeout(function() {
        clientSelect.classList.remove('border-red-500', 'ring-2', 'ring-red-500');
      }, 2000);
    }
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
    showNotification("⚠ Please add at least one service item", "warning");
    var addRowBtn = document.getElementById('addRowBtn');
    if (addRowBtn) {
      addRowBtn.classList.add('animate-pulse', 'ring-2', 'ring-yellow-500');
      setTimeout(function() {
        addRowBtn.classList.remove('animate-pulse', 'ring-2', 'ring-yellow-500');
      }, 2000);
    }
    return;
  }

  // Calculate total amount from displayed amounts
  var totalAmount = 0;
  document.querySelectorAll('tr.invoice-item-row .item-amount').forEach(function(span) {
    totalAmount += parseFloat(span.textContent.replace('LKR ', '').replace(',', '')) || 0;
  });

  var invoiceData = {
    clientId: parseInt(clientSelect.value),
    date: issueDateInput ? issueDateInput.value : new Date().toISOString().split('T')[0],
    items: items,
    totalAmount: totalAmount,
    statusId: 1   // default to first status (e.g. Pending / Draft)
  };

  console.log("Submitting invoice data:", invoiceData);
  showNotification("Validating invoice data...", "info", 1000);

  setTimeout(function() {
    createInvoice(invoiceData);
  }, 300);
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
    // Load invoice (it will wait for services to be ready internally)
    loadInvoiceForUpdate(invoiceId);
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

  // Add real-time validation feedback for form inputs
  setupRealTimeValidation();

  // Show initial load success message
  setTimeout(function() {
    var pageTitle = document.querySelector('h1, h2');
    if (pageTitle && currentPage) {
      var pageName = pageTitle.textContent.trim();
      showNotification("Page loaded successfully", "success", 2000);
    }
  }, 800);
});

function setupRealTimeValidation() {
  // Validate client selection in real-time
  var clientSelect = document.querySelector('select[name="clientSelect"]');
  if (clientSelect) {
    clientSelect.addEventListener('change', function() {
      if (this.value) {
        this.classList.remove('border-red-500');
        this.classList.add('border-green-500');
        showNotification("✓ Client selected", "success", 1500);

        setTimeout(function() {
          clientSelect.classList.remove('border-green-500');
        }, 1500);
      }
    });
  }

  // Add real-time feedback for quantity changes
  document.addEventListener('input', function(e) {
    if (e.target.classList.contains('item-quantity')) {
      var value = parseInt(e.target.value);
      if (value < 1 || isNaN(value)) {
        e.target.classList.add('border-red-500');
      } else {
        e.target.classList.remove('border-red-500');
        e.target.classList.add('border-green-500');
        setTimeout(function() {
          e.target.classList.remove('border-green-500');
        }, 1000);
      }
    }

    // Real-time feedback for rate changes
    if (e.target.classList.contains('item-rate')) {
      var value = parseFloat(e.target.value);
      if (value < 0 || isNaN(value)) {
        e.target.classList.add('border-red-500');
      } else {
        e.target.classList.remove('border-red-500');
      }
    }
  });
}

var autoSaveDraftTimeout;
function scheduleAutoSaveDraft() {
  clearTimeout(autoSaveDraftTimeout);
  autoSaveDraftTimeout = setTimeout(function() {
    saveDraftToLocalStorage();
  }, 2000);
}

function saveDraftToLocalStorage() {
  var currentPage = window.location.pathname.split('/').pop();
  if (currentPage !== 'create-invoice.html') return;

  var clientSelect = document.querySelector('select[name="clientSelect"]');
  if (!clientSelect || !clientSelect.value) return;

  var draft = {
    clientId: clientSelect.value,
    timestamp: new Date().toISOString(),
    items: []
  };

  var rows = document.querySelectorAll('tr.invoice-item-row');
  rows.forEach(function(row) {
    var serviceSelect = row.querySelector('select.item-service-select');
    var qtyInput = row.querySelector('input.item-quantity');

    if (serviceSelect && qtyInput && serviceSelect.value) {
      draft.items.push({
        serviceId: serviceSelect.value,
        quantity: qtyInput.value
      });
    }
  });

  if (draft.items.length > 0) {
    localStorage.setItem('invoiceDraft', JSON.stringify(draft));
    showNotification("Draft saved automatically", "info", 1500);
  }
}

function loadDraftFromLocalStorage() {
  var draft = localStorage.getItem('invoiceDraft');
  if (draft) {
    try {
      var draftData = JSON.parse(draft);
      if (confirm("A draft invoice was found. Would you like to restore it?")) {
        showNotification("Draft restored", "success");
        localStorage.removeItem('invoiceDraft');
      }
    } catch (e) {
      console.error("Error loading draft:", e);
    }
  }
}

function updateInvoiceStatus(invoiceId, statusId) {
  showLoadingOverlay('Updating invoice status...');

  var xhr = new XMLHttpRequest();
  xhr.open("PUT", API_BASE_URL + "/invoice/" + invoiceId + "/status", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    hideLoadingOverlay();
    if (xhr.status === 200) {
      showNotification("✓ Invoice status updated successfully!", "success");
      var urlParams = new URLSearchParams(window.location.search);
      var currentInvoiceId = urlParams.get('id');
      if (currentInvoiceId) {
        getInvoiceById(currentInvoiceId);
      } else {
        loadAllInvoices();
      }
    } else {
      showNotification("Failed to update invoice status", "error");
    }
  };

  xhr.onerror = function() {
    hideLoadingOverlay();
    showNotification("Network error: Unable to update status", "error");
  };

  xhr.send(JSON.stringify({ id: invoiceId, statusId: statusId }));
}

// Real-time search functionality with debouncing
var searchTimeout;
function setupRealtimeSearch() {
  var searchInput = document.querySelector('input[placeholder*="Search"]');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      clearTimeout(searchTimeout);
      var query = e.target.value.toLowerCase().trim();

      if (query.length === 0) {
        loadAllInvoices();
        return;
      }

      searchTimeout = setTimeout(function() {
        showProgress('Searching...');
        filterInvoices(query);
        hideProgress();
      }, 300);
    });
  }
}

function filterInvoices(query) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", API_BASE_URL + "/invoice", true);

  xhr.onload = function() {
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      var invoices = data.data || data;

      var filtered = invoices.filter(function(invoice) {
        return (invoice.id && invoice.id.toString().includes(query)) ||
               (invoice.clientName && invoice.clientName.toLowerCase().includes(query)) ||
               (invoice.status && invoice.status.toLowerCase().includes(query));
      });

      updateInvoiceList(filtered);
      showNotification(filtered.length + " result(s) found", "info", 2000);
    }
  };

  xhr.send();
}

// Status filter with real-time feedback
function setupStatusFilter() {
  var statusSelect = document.querySelector('select option:first-child');
  if (statusSelect && statusSelect.parentElement) {
    var select = statusSelect.parentElement;
    select.addEventListener('change', function(e) {
      var selectedStatus = e.target.value;

      if (selectedStatus === 'All Status') {
        showProgress('Loading all invoices...');
        loadAllInvoices();
      } else {
        showProgress('Filtering by status...');
        filterInvoicesByStatus(selectedStatus);
      }
    });
  }
}

function filterInvoicesByStatus(status) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", API_BASE_URL + "/invoice", true);

  xhr.onload = function() {
    hideProgress();
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      var invoices = data.data || data;

      var filtered = invoices.filter(function(invoice) {
        return invoice.status && invoice.status.toUpperCase() === status.toUpperCase();
      });

      updateInvoiceList(filtered);
      showNotification(filtered.length + " " + status + " invoice(s)", "info", 2000);
    }
  };

  xhr.send();
}

// Initialize enhanced features on page load
document.addEventListener('DOMContentLoaded', function() {
  setupRealtimeSearch();
  setupStatusFilter();
});


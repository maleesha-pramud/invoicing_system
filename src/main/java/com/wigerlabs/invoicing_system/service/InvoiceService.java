package com.wigerlabs.invoicing_system.service;

import com.google.gson.JsonObject;
import com.wigerlabs.invoicing_system.dto.InvoiceDTO;
import com.wigerlabs.invoicing_system.entity.Client;
import com.wigerlabs.invoicing_system.entity.Invoice;
import com.wigerlabs.invoicing_system.entity.Service;
import com.wigerlabs.invoicing_system.entity.Status;
import com.wigerlabs.invoicing_system.util.AppUtil;
import com.wigerlabs.invoicing_system.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class InvoiceService {

    public String createInvoice(InvoiceDTO invoiceDTO) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;
        Transaction transaction = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();

            // Fetch related entities
            Client client = session.get(Client.class, invoiceDTO.getClientId());
            Service service = session.get(Service.class, invoiceDTO.getServiceId());
            Status invoiceStatus = session.get(Status.class, invoiceDTO.getStatusId());

            if (client == null) {
                message = "Client not found";
            } else if (service == null) {
                message = "Service not found";
            } else if (invoiceStatus == null) {
                message = "Status not found";
            } else {
                Invoice invoice = new Invoice();
                invoice.setClient(client);
                invoice.setService(service);
                invoice.setDate(invoiceDTO.getDate());
                invoice.setTotalAmount(invoiceDTO.getTotalAmount());
                invoice.setQuantity(invoiceDTO.getQuantity());
                invoice.setStatus(invoiceStatus);

                session.persist(invoice);
                transaction.commit();

                status = true;
                message = "Invoice created successfully";
                responseObject.addProperty("invoiceId", invoice.getId());
            }

        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            message = "Error creating invoice: " + e.getMessage();
            e.printStackTrace();
        } finally {
            if (session != null) {
                session.close();
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return responseObject.toString();
    }

    public String getAllInvoices() {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();

            List<Invoice> invoices = session.createQuery("FROM Invoice", Invoice.class).list();

            List<InvoiceDTO> invoiceDTOs = new ArrayList<>();
            for (Invoice invoice : invoices) {
                InvoiceDTO dto = new InvoiceDTO(
                    invoice.getId(),
                    invoice.getClient().getId(),
                    invoice.getService().getId(),
                    invoice.getDate(),
                    invoice.getTotalAmount(),
                    invoice.getQuantity(),
                    invoice.getStatus().getId()
                );
                invoiceDTOs.add(dto);
            }

            status = true;
            message = "Invoices retrieved successfully";
            responseObject.addProperty("status", status);
            responseObject.addProperty("message", message);
            responseObject.add("data", AppUtil.GSON.toJsonTree(invoiceDTOs));

            return responseObject.toString();

        } catch (Exception e) {
            message = "Error retrieving invoices: " + e.getMessage();
            e.printStackTrace();
        } finally {
            if (session != null) {
                session.close();
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return responseObject.toString();
    }

    public String getInvoiceById(int id) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();

            Invoice invoice = session.get(Invoice.class, id);

            if (invoice != null) {
                InvoiceDTO invoiceDTO = new InvoiceDTO(
                    invoice.getId(),
                    invoice.getClient().getId(),
                    invoice.getService().getId(),
                    invoice.getDate(),
                    invoice.getTotalAmount(),
                    invoice.getQuantity(),
                    invoice.getStatus().getId()
                );

                status = true;
                message = "Invoice found";
                responseObject.addProperty("status", status);
                responseObject.addProperty("message", message);
                responseObject.add("data", AppUtil.GSON.toJsonTree(invoiceDTO));
            } else {
                message = "Invoice not found";
            }

        } catch (Exception e) {
            message = "Error retrieving invoice: " + e.getMessage();
            e.printStackTrace();
        } finally {
            if (session != null) {
                session.close();
            }
        }

        if (!status) {
            responseObject.addProperty("status", status);
            responseObject.addProperty("message", message);
        }
        return responseObject.toString();
    }

    public String updateInvoice(InvoiceDTO invoiceDTO) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;
        Transaction transaction = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();

            Invoice invoice = session.get(Invoice.class, invoiceDTO.getId());

            if (invoice != null) {
                // Fetch related entities
                Client client = session.get(Client.class, invoiceDTO.getClientId());
                Service service = session.get(Service.class, invoiceDTO.getServiceId());
                Status invoiceStatus = session.get(Status.class, invoiceDTO.getStatusId());

                if (client == null) {
                    message = "Client not found";
                } else if (service == null) {
                    message = "Service not found";
                } else if (invoiceStatus == null) {
                    message = "Status not found";
                } else {
                    // Update invoice fields
                    invoice.setClient(client);
                    invoice.setService(service);
                    invoice.setDate(invoiceDTO.getDate());
                    invoice.setTotalAmount(invoiceDTO.getTotalAmount());
                    invoice.setQuantity(invoiceDTO.getQuantity());
                    invoice.setStatus(invoiceStatus);

                    session.merge(invoice);
                    transaction.commit();

                    status = true;
                    message = "Invoice updated successfully";
                }
            } else {
                message = "Invoice not found";
            }

        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            message = "Error updating invoice: " + e.getMessage();
            e.printStackTrace();
        } finally {
            if (session != null) {
                session.close();
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return responseObject.toString();
    }

    public String deleteInvoice(int id) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;
        Transaction transaction = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();

            Invoice invoice = session.get(Invoice.class, id);

            if (invoice != null) {
                session.remove(invoice);
                transaction.commit();

                status = true;
                message = "Invoice deleted successfully";
            } else {
                message = "Invoice not found";
            }

        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            message = "Error deleting invoice: " + e.getMessage();
            e.printStackTrace();
        } finally {
            if (session != null) {
                session.close();
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return responseObject.toString();
    }
}

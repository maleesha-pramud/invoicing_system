package com.wigerlabs.invoicing_system.service;

import com.google.gson.JsonObject;
import com.wigerlabs.invoicing_system.dto.InvoiceDTO;
import com.wigerlabs.invoicing_system.dto.InvoiceItemDTO;
import com.wigerlabs.invoicing_system.entity.*;
import com.wigerlabs.invoicing_system.util.AppUtil;
import com.wigerlabs.invoicing_system.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.util.ArrayList;
import java.util.List;

public class InvoiceService {

    private InvoiceDTO toDTO(Invoice invoice) {
        List<InvoiceItemDTO> itemDTOs = new ArrayList<>();
        for (InvoiceItem item : invoice.getItems()) {
            itemDTOs.add(new InvoiceItemDTO(
                item.getId(),
                item.getService().getId(),
                item.getService().getName(),
                item.getQuantity(),
                item.getUnitPrice()
            ));
        }
        return new InvoiceDTO(
            invoice.getId(),
            invoice.getClient().getId(),
            invoice.getClient().getName(),
            invoice.getDate(),
            invoice.getTotalAmount(),
            invoice.getStatus().getId(),
            invoice.getStatus().getValue(),
            itemDTOs
        );
    }

    public String createInvoice(InvoiceDTO invoiceDTO) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;
        Transaction transaction = null;

        System.out.println("Creating invoice for client ID: " + invoiceDTO.getClientId() + ", status ID: " + invoiceDTO.getStatusId() + ", items count: " + (invoiceDTO.getItems() != null ? invoiceDTO.getItems().size() : 0));

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();

            Client client = session.get(Client.class, invoiceDTO.getClientId());
            Status invoiceStatus = session.get(Status.class, invoiceDTO.getStatusId());

            if (client == null) {
                message = "Client not found";
            } else if (invoiceStatus == null) {
                message = "Status not found";
            } else if (invoiceDTO.getItems() == null || invoiceDTO.getItems().isEmpty()) {
                message = "Invoice must have at least one item";
            } else {
                Invoice invoice = new Invoice();
                invoice.setClient(client);
                invoice.setDate(invoiceDTO.getDate());
                invoice.setStatus(invoiceStatus);

                double total = 0;
                for (InvoiceItemDTO itemDTO : invoiceDTO.getItems()) {
                    Service svc = session.get(Service.class, itemDTO.getServiceId());
                    if (svc == null) { message = "Service not found: " + itemDTO.getServiceId(); break; }
                    double unitPrice = svc.getUnitPrice();
                    int qty = itemDTO.getQuantity();
                    InvoiceItem item = new InvoiceItem(invoice, svc, qty, unitPrice);
                    invoice.addItem(item);
                    total += qty * unitPrice;
                }

                if (message.isEmpty()) {
                    invoice.setTotalAmount(total);
                    session.persist(invoice);
                    transaction.commit();
                    status = true;
                    message = "Invoice created successfully";
                    responseObject.addProperty("invoiceId", invoice.getId());
                }
            }

        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            message = "Error creating invoice: " + e.getMessage();
            e.printStackTrace();
        } finally {
            if (session != null) session.close();
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
                invoiceDTOs.add(toDTO(invoice));
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
            if (session != null) session.close();
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
                status = true;
                message = "Invoice found";
                responseObject.addProperty("status", status);
                responseObject.addProperty("message", message);
                responseObject.add("data", AppUtil.GSON.toJsonTree(toDTO(invoice)));
            } else {
                message = "Invoice not found";
            }

        } catch (Exception e) {
            message = "Error retrieving invoice: " + e.getMessage();
            e.printStackTrace();
        } finally {
            if (session != null) session.close();
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

            if (invoice == null) {
                message = "Invoice not found";
            } else {
                Client client = session.get(Client.class, invoiceDTO.getClientId());
                Status invoiceStatus = session.get(Status.class, invoiceDTO.getStatusId());

                if (client == null) {
                    message = "Client not found";
                } else if (invoiceStatus == null) {
                    message = "Status not found";
                } else if (invoiceDTO.getItems() == null || invoiceDTO.getItems().isEmpty()) {
                    message = "Invoice must have at least one item";
                } else {
                    invoice.setClient(client);
                    invoice.setDate(invoiceDTO.getDate());
                    invoice.setStatus(invoiceStatus);
                    invoice.getItems().clear();

                    double total = 0;
                    boolean itemError = false;
                    for (InvoiceItemDTO itemDTO : invoiceDTO.getItems()) {
                        Service svc = session.get(Service.class, itemDTO.getServiceId());
                        if (svc == null) { message = "Service not found: " + itemDTO.getServiceId(); itemError = true; break; }
                        double unitPrice = svc.getUnitPrice();
                        int qty = itemDTO.getQuantity();
                        InvoiceItem item = new InvoiceItem(invoice, svc, qty, unitPrice);
                        invoice.addItem(item);
                        total += qty * unitPrice;
                    }

                    if (!itemError) {
                        invoice.setTotalAmount(total);
                        session.merge(invoice);
                        transaction.commit();
                        status = true;
                        message = "Invoice updated successfully";
                    }
                }
            }

        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            message = "Error updating invoice: " + e.getMessage();
            e.printStackTrace();
        } finally {
            if (session != null) session.close();
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
            if (transaction != null) transaction.rollback();
            message = "Error deleting invoice: " + e.getMessage();
            e.printStackTrace();
        } finally {
            if (session != null) session.close();
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return responseObject.toString();
    }
}

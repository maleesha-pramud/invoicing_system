package com.wigerlabs.invoicing_system.dto;

import java.io.Serializable;
import java.time.LocalDate;

public class InvoiceDTO implements Serializable {
    private int id;
    private int clientId;
    private int serviceId;
    private LocalDate date;
    private double totalAmount;
    private int quantity;
    private int statusId;

    public InvoiceDTO() {
    }

    public InvoiceDTO(int id, int clientId, int serviceId, LocalDate date, double totalAmount, int quantity, int statusId) {
        this.id = id;
        this.clientId = clientId;
        this.serviceId = serviceId;
        this.date = date;
        this.totalAmount = totalAmount;
        this.quantity = quantity;
        this.statusId = statusId;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getClientId() {
        return clientId;
    }

    public void setClientId(int clientId) {
        this.clientId = clientId;
    }

    public int getServiceId() {
        return serviceId;
    }

    public void setServiceId(int serviceId) {
        this.serviceId = serviceId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getStatusId() {
        return statusId;
    }

    public void setStatusId(int statusId) {
        this.statusId = statusId;
    }
}

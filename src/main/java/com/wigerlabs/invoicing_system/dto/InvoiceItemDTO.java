package com.wigerlabs.invoicing_system.dto;

import java.io.Serializable;

public class InvoiceItemDTO implements Serializable {
    private int id;
    private int serviceId;
    private String serviceName;
    private int quantity;
    private double unitPrice;
    private double amount;

    public InvoiceItemDTO() {}

    public InvoiceItemDTO(int id, int serviceId, String serviceName, int quantity, double unitPrice) {
        this.id = id;
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.amount = quantity * unitPrice;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getServiceId() { return serviceId; }
    public void setServiceId(int serviceId) { this.serviceId = serviceId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(double unitPrice) { this.unitPrice = unitPrice; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
}


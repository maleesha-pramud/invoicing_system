package com.wigerlabs.invoicing_system.dto;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class InvoiceDTO implements Serializable {
    private int id;
    private int clientId;
    private String clientName;
    private LocalDate date;
    private double totalAmount;
    private int statusId;
    private String status;
    private List<InvoiceItemDTO> items = new ArrayList<>();

    public InvoiceDTO() {}

    public InvoiceDTO(int id, int clientId, String clientName, LocalDate date, double totalAmount, int statusId, String status, List<InvoiceItemDTO> items) {
        this.id = id;
        this.clientId = clientId;
        this.clientName = clientName;
        this.date = date;
        this.totalAmount = totalAmount;
        this.statusId = statusId;
        this.status = status;
        this.items = items != null ? items : new ArrayList<>();
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getClientId() { return clientId; }
    public void setClientId(int clientId) { this.clientId = clientId; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public int getStatusId() { return statusId; }
    public void setStatusId(int statusId) { this.statusId = statusId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<InvoiceItemDTO> getItems() { return items; }
    public void setItems(List<InvoiceItemDTO> items) { this.items = items; }
}

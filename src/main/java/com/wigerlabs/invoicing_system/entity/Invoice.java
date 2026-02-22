package com.wigerlabs.invoicing_system.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
public class Invoice extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "total_amount", nullable = false)
    private double totalAmount;

    @Column(nullable = false)
    private int quantity;

    @ManyToOne
    @JoinColumn(name = "status_id", nullable = false)
    private Status status;

    public Invoice() {
    }

    public Invoice(int id, Client client, Service service, LocalDate date, double totalAmount, int quantity, Status status) {
        this.id = id;
        this.client = client;
        this.service = service;
        this.date = date;
        this.totalAmount = totalAmount;
        this.quantity = quantity;
        this.status = status;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public Service getService() {
        return service;
    }

    public void setService(Service service) {
        this.service = service;
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

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}

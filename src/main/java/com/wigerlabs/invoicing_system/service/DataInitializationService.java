package com.wigerlabs.invoicing_system.service;

import com.wigerlabs.invoicing_system.entity.Client;
import com.wigerlabs.invoicing_system.entity.Service;
import com.wigerlabs.invoicing_system.entity.Status;
import com.wigerlabs.invoicing_system.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.time.LocalDateTime;
import java.util.List;

public class DataInitializationService {

    public static void initializeDefaultData() {
        initializeStatuses();
        initializeClients();
        initializeServices();
    }

    private static void initializeStatuses() {
        Session session = null;
        Transaction transaction = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();

            // Check if statuses already exist
            List<Status> existingStatuses = session.createQuery("FROM Status", Status.class).list();

            if (existingStatuses.isEmpty()) {
                // Create default statuses
                LocalDateTime now = LocalDateTime.now();

                session.createNativeMutationQuery("INSERT INTO status (id, value) VALUES (:id, :value)")
                        .setParameter("id", 1)
                        .setParameter("value", "paid")
                        .executeUpdate();

                session.createNativeMutationQuery("INSERT INTO status (id, value) VALUES (:id, :value)")
                        .setParameter("id", 2)
                        .setParameter("value", "pending")
                        .executeUpdate();

                transaction.commit();
                System.out.println("Default status values initialized successfully.");
            } else {
                System.out.println("Status values already exist. Skipping initialization.");
            }

        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            System.err.println("Error initializing status values: " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (session != null) {
                session.close();
            }
        }
    }

    private static void initializeClients() {
        Session session = null;
        Transaction transaction = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();

            // Check if clients already exist
            List<Client> existingClients = session.createQuery("FROM Client", Client.class).list();

            if (existingClients.isEmpty()) {
                LocalDateTime now = LocalDateTime.now();

                // Create sample clients
                Client[] clients = {
                        new Client("Gamini Fernando", "gamini@gmail.com", "Rathnapura, Kaluthara, Uthura"),
                        new Client("Jayasena Finance", "jayasena@gmail.com", "Kaluthara, Bo gaha mawatha"),
                        new Client("Kasun Wijeweera", "kasun@gmail.com.com", "Uthuru Nuwara, Main Street, Uthura"),
                        new Client("Navindu Jayanuwan", "navindu@gmail.com", "35, Colombo Road, Kaluthara"),
                        new Client("Naditha Goshana", "nadisha@gmail.com", "Colombo 7, 557 Wihara Mawatha"),
                        new Client("Sahan Gamage", "sahan@gmail.com", "55, Horana Road, Homagama"),
                        new Client("Ravindu Bandara", "ravindu@gmail.com", "Pokunuwita Road, Galpatha"),
                        new Client("Tharuka Penal", "tharuka@gmail.com", "67/8, Abagas Mawatha, Uthuru Kolaba")
                };

                for (Client client : clients) {
                    session.persist(client);
                }

                transaction.commit();
                System.out.println("Sample clients initialized successfully.");
            } else {
                System.out.println("Clients already exist. Skipping initialization.");
            }

        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            System.err.println("Error initializing clients: " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (session != null) {
                session.close();
            }
        }
    }

    private static void initializeServices() {
        Session session = null;
        Transaction transaction = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();

            // Check if services already exist
            List<Service> existingServices = session.createQuery("FROM Service", Service.class).list();

            if (existingServices.isEmpty()) {
                LocalDateTime now = LocalDateTime.now();

                // Create sample services for software and IT solutions company
                Service[] services = {
                        new Service("Custom Software Development", 150.00),
                        new Service("Web Application Development", 120.00),
                        new Service("Mobile App Development", 140.00),
                        new Service("Cloud Infrastructure Setup", 200.00),
                        new Service("System Integration Services", 130.00),
                        new Service("IT Consulting", 100.00),
                        new Service("Database Design & Optimization", 110.00),
                        new Service("Cybersecurity Audit", 180.00),
                        new Service("API Development", 125.00),
                        new Service("DevOps & CI/CD Implementation", 160.00),
                        new Service("Quality Assurance & Testing", 95.00),
                        new Service("Technical Support & Maintenance", 75.00),
                        new Service("Cloud Migration Services", 170.00),
                        new Service("UI/UX Design", 105.00),
                        new Service("Data Analytics Solution", 155.00)
                };

                for (Service service : services) {
                    session.persist(service);
                }

                transaction.commit();
                System.out.println("Sample services initialized successfully.");
            } else {
                System.out.println("Services already exist. Skipping initialization.");
            }

        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            System.err.println("Error initializing services: " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (session != null) {
                session.close();
            }
        }
    }

}


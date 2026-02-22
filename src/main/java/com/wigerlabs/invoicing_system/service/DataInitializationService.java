package com.wigerlabs.invoicing_system.service;

import com.wigerlabs.invoicing_system.entity.Status;
import com.wigerlabs.invoicing_system.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.time.LocalDateTime;
import java.util.List;

public class DataInitializationService {

    public static void initializeDefaultData() {
        initializeStatuses();
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

                session.createNativeMutationQuery("INSERT INTO status (id, value, created_at, updated_at) VALUES (:id, :value, :created, :updated)")
                        .setParameter("id", 1)
                        .setParameter("value", "paid")
                        .setParameter("created", now)
                        .setParameter("updated", now)
                        .executeUpdate();

                session.createNativeMutationQuery("INSERT INTO status (id, value, created_at, updated_at) VALUES (:id, :value, :created, :updated)")
                        .setParameter("id", 2)
                        .setParameter("value", "pending")
                        .setParameter("created", now)
                        .setParameter("updated", now)
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

}


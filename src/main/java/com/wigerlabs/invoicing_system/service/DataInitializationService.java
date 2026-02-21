package com.wigerlabs.invoicing_system.service;

//import com.wigerlabs.invoicing_system.entity.Status;
import com.wigerlabs.invoicing_system.entity.User;
import com.wigerlabs.invoicing_system.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.time.LocalDateTime;
import java.util.List;

public class DataInitializationService {

    public static void initializeDefaultData() {
//        initializeStatuses();
        initializeUsers();
    }

//    private static void initializeStatuses() {
//        Session session = null;
//        Transaction transaction = null;
//
//        try {
//            session = HibernateUtil.getSessionFactory().openSession();
//            transaction = session.beginTransaction();
//
//            // Check if statuses already exist
//            List<Status> existingStatuses = session.createQuery("FROM Status", Status.class).list();
//
//            if (existingStatuses.isEmpty()) {
//                // Create default statuses using native SQL
//                LocalDateTime now = LocalDateTime.now();
//
//                session.createNativeMutationQuery("INSERT INTO status (id, value, created_at, updated_at) VALUES (:id, :value, :created, :updated)")
//                        .setParameter("id", 1)
//                        .setParameter("value", Status.Type.ACTIVE.getValue())
//                        .setParameter("created", now)
//                        .setParameter("updated", now)
//                        .executeUpdate();
//
//                session.createNativeMutationQuery("INSERT INTO status (id, value, created_at, updated_at) VALUES (:id, :value, :created, :updated)")
//                        .setParameter("id", 2)
//                        .setParameter("value", Status.Type.INACTIVE.getValue())
//                        .setParameter("created", now)
//                        .setParameter("updated", now)
//                        .executeUpdate();
//
//                session.createNativeMutationQuery("INSERT INTO status (id, value, created_at, updated_at) VALUES (:id, :value, :created, :updated)")
//                        .setParameter("id", 3)
//                        .setParameter("value", Status.Type.PENDING.getValue())
//                        .setParameter("created", now)
//                        .setParameter("updated", now)
//                        .executeUpdate();
//
//                session.createNativeMutationQuery("INSERT INTO status (id, value, created_at, updated_at) VALUES (:id, :value, :created, :updated)")
//                        .setParameter("id", 4)
//                        .setParameter("value", Status.Type.BLOCKED.getValue())
//                        .setParameter("created", now)
//                        .setParameter("updated", now)
//                        .executeUpdate();
//
//                session.createNativeMutationQuery("INSERT INTO status (id, value, created_at, updated_at) VALUES (:id, :value, :created, :updated)")
//                        .setParameter("id", 5)
//                        .setParameter("value", Status.Type.VERIFIED.getValue())
//                        .setParameter("created", now)
//                        .setParameter("updated", now)
//                        .executeUpdate();
//
//                session.createNativeMutationQuery("INSERT INTO status (id, value, created_at, updated_at) VALUES (:id, :value, :created, :updated)")
//                        .setParameter("id", 6)
//                        .setParameter("value", Status.Type.CANCELED.getValue())
//                        .setParameter("created", now)
//                        .setParameter("updated", now)
//                        .executeUpdate();
//
//                session.createNativeMutationQuery("INSERT INTO status (id, value, created_at, updated_at) VALUES (:id, :value, :created, :updated)")
//                        .setParameter("id", 7)
//                        .setParameter("value", Status.Type.COMPLETED.getValue())
//                        .setParameter("created", now)
//                        .setParameter("updated", now)
//                        .executeUpdate();
//
//                transaction.commit();
//                System.out.println("Default status values initialized successfully.");
//            } else {
//                System.out.println("Status values already exist. Skipping initialization.");
//            }
//
//        } catch (Exception e) {
//            if (transaction != null) {
//                transaction.rollback();
//            }
//            System.err.println("Error initializing status values: " + e.getMessage());
//            e.printStackTrace();
//        } finally {
//            if (session != null) {
//                session.close();
//            }
//        }
//    }

    private static void initializeUsers() {
        Session session = null;
        Transaction transaction = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();

            // Check if users already exist
            List<?> existingUsers = session.createQuery("FROM User", User.class).list();

            if (existingUsers.isEmpty()) {
                session.createNativeMutationQuery("INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES (:id, :name, :email, :password, :created_at, :updated_at)")
                        .setParameter("id", 1)
                        .setParameter("name", "Maleesha")
                        .setParameter("email", "maleesha@gmail.com")
                        .setParameter("password", "maleesha@2005")
                        .setParameter("created_at", LocalDateTime.now())
                        .setParameter("updated_at", LocalDateTime.now())
                        .executeUpdate();
                transaction.commit();
                System.out.println("Default users initialized successfully.");
            } else {
                System.out.println("Users already exist. Skipping initialization.");
            }
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            System.err.println("Error initializing users: " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (session != null) {
                session.close();
            }
        }
    }
}


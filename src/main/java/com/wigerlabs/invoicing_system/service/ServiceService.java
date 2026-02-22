package com.wigerlabs.invoicing_system.service;

import com.google.gson.JsonObject;
import com.wigerlabs.invoicing_system.dto.ServiceDTO;
import com.wigerlabs.invoicing_system.entity.Service;
import com.wigerlabs.invoicing_system.util.AppUtil;
import com.wigerlabs.invoicing_system.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ServiceService {

    public String createService(ServiceDTO serviceDTO) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;
        Transaction transaction = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();

            Service existingService = session.createQuery("FROM Service s WHERE s.name = :name", Service.class)
                    .setParameter("name", serviceDTO.getName())
                    .getSingleResultOrNull();

            if (existingService != null) {
                message = "Service with this name already exists";
            } else {
                Service service = new Service();
                service.setName(serviceDTO.getName());
                service.setUnitPrice(serviceDTO.getUnitPrice());

                session.persist(service);
                transaction.commit();

                status = true;
                message = "Service created successfully";
                responseObject.addProperty("serviceId", service.getId());
            }

        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            message = "Error creating service: " + e.getMessage();
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

    public String getAllServices() {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();

            List<Service> services = session.createQuery("FROM Service", Service.class).list();

            List<ServiceDTO> serviceDTOs = new ArrayList<>();
            for (Service service : services) {
                ServiceDTO dto = new ServiceDTO(
                        service.getId(),
                        service.getName(),
                        service.getUnitPrice()
                );
                serviceDTOs.add(dto);
            }

            status = true;
            message = "Services retrieved successfully";
            responseObject.addProperty("status", status);
            responseObject.addProperty("message", message);
            responseObject.add("data", AppUtil.GSON.toJsonTree(serviceDTOs));

            return responseObject.toString();

        } catch (Exception e) {
            message = "Error retrieving services: " + e.getMessage();
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

    public String getServiceById(int id) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();

            Service service = session.get(Service.class, id);

            if (service != null) {
                ServiceDTO serviceDTO = new ServiceDTO(
                        service.getId(),
                        service.getName(),
                        service.getUnitPrice()
                );

                status = true;
                message = "Service found";
                responseObject.addProperty("status", status);
                responseObject.addProperty("message", message);
                responseObject.add("data", AppUtil.GSON.toJsonTree(serviceDTO));
            } else {
                message = "Service not found";
            }

        } catch (Exception e) {
            message = "Error retrieving service: " + e.getMessage();
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

    public String updateService(ServiceDTO serviceDTO) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;
        Transaction transaction = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();

            Service service = session.get(Service.class, serviceDTO.getId());

            if (service != null) {
                if (!service.getName().equals(serviceDTO.getName())) {
                    Service existingService = session.createQuery("FROM Service s WHERE s.name = :name AND s.id != :id", Service.class)
                            .setParameter("name", serviceDTO.getName())
                            .setParameter("id", serviceDTO.getId())
                            .uniqueResult();

                    if (existingService != null) {
                        message = "Service with this name already exists";
                        responseObject.addProperty("status", status);
                        responseObject.addProperty("message", message);
                        return responseObject.toString();
                    }
                }

                service.setName(serviceDTO.getName());
                service.setUnitPrice(serviceDTO.getUnitPrice());

                session.merge(service);
                transaction.commit();

                status = true;
                message = "Service updated successfully";
            } else {
                message = "Service not found";
            }

        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            message = "Error updating service: " + e.getMessage();
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

    public String deleteService(int id) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;
        Transaction transaction = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();

            Service service = session.get(Service.class, id);

            if (service != null) {
                session.remove(service);
                transaction.commit();

                status = true;
                message = "Service deleted successfully";
            } else {
                message = "Service not found";
            }

        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            message = "Error deleting service: " + e.getMessage();
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

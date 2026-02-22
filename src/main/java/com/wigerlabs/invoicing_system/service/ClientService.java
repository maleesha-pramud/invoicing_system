package com.wigerlabs.invoicing_system.service;

import com.google.gson.JsonObject;
import com.wigerlabs.invoicing_system.dto.ClientDTO;
import com.wigerlabs.invoicing_system.entity.Client;
import com.wigerlabs.invoicing_system.util.AppUtil;
import com.wigerlabs.invoicing_system.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ClientService {

    public String createClient(ClientDTO clientDTO) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;
        Transaction transaction = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();

            // Check if email already exists
            Client existingClient = session.createQuery("FROM Client c WHERE c.email=:email", Client.class)
                    .setParameter("email", clientDTO.getEmail())
                    .getSingleResultOrNull();

            if (existingClient != null) {
                message = "Client with this email already exists";
            } else {
                // Create new client
                Client client = new Client();
                client.setName(clientDTO.getName());
                client.setEmail(clientDTO.getEmail());
                client.setAddress(clientDTO.getAddress());
                client.setCreatedAt(LocalDateTime.now());
                client.setUpdatedAt(LocalDateTime.now());

                session.persist(client);
                transaction.commit();

                status = true;
                message = "Client created successfully";
                responseObject.addProperty("clientId", client.getId());
            }

        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            message = "Error creating client: " + e.getMessage();
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

    public String getAllClients() {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();

            List<Client> clients = session.createQuery("FROM Client", Client.class).list();

            List<ClientDTO> clientDTOs = new ArrayList<>();
            for (Client client : clients) {
                ClientDTO dto = new ClientDTO(
                    client.getId(),
                    client.getName(),
                    client.getEmail(),
                    client.getAddress()
                );
                clientDTOs.add(dto);
            }

            status = true;
            message = "Clients retrieved successfully";
            responseObject.addProperty("status", status);
            responseObject.addProperty("message", message);
            responseObject.add("data", AppUtil.GSON.toJsonTree(clientDTOs));

            return responseObject.toString();

        } catch (Exception e) {
            message = "Error retrieving clients: " + e.getMessage();
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

    public String getClientById(int id) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();

            Client client = session.get(Client.class, id);

            if (client != null) {
                ClientDTO clientDTO = new ClientDTO(
                    client.getId(),
                    client.getName(),
                    client.getEmail(),
                    client.getAddress()
                );

                status = true;
                message = "Client found";
                responseObject.addProperty("status", status);
                responseObject.addProperty("message", message);
                responseObject.add("data", AppUtil.GSON.toJsonTree(clientDTO));
            } else {
                message = "Client not found";
            }

        } catch (Exception e) {
            message = "Error retrieving client: " + e.getMessage();
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

    public String updateClient(ClientDTO clientDTO) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;
        Transaction transaction = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();

            Client client = session.get(Client.class, clientDTO.getId());

            if (client != null) {
                // Check if email is being changed and if it already exists
                if (!client.getEmail().equals(clientDTO.getEmail())) {
                    Client existingClient = session.createQuery("FROM Client c WHERE c.email=:email AND c.id != :id", Client.class)
                            .setParameter("email", clientDTO.getEmail())
                            .setParameter("id", clientDTO.getId())
                            .getSingleResultOrNull();

                    if (existingClient != null) {
                        message = "Client with this email already exists";
                        responseObject.addProperty("status", status);
                        responseObject.addProperty("message", message);
                        return responseObject.toString();
                    }
                }

                // Update client fields
                client.setName(clientDTO.getName());
                client.setEmail(clientDTO.getEmail());
                client.setAddress(clientDTO.getAddress());
                client.setUpdatedAt(LocalDateTime.now());

                session.merge(client);
                transaction.commit();

                status = true;
                message = "Client updated successfully";
            } else {
                message = "Client not found";
            }

        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            message = "Error updating client: " + e.getMessage();
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

    public String deleteClient(int id) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        Session session = null;
        Transaction transaction = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();

            Client client = session.get(Client.class, id);

            if (client != null) {
                session.remove(client);
                transaction.commit();

                status = true;
                message = "Client deleted successfully";
            } else {
                message = "Client not found";
            }

        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            message = "Error deleting client: " + e.getMessage();
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

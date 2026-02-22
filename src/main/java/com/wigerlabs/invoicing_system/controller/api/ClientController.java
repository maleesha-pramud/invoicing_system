package com.wigerlabs.invoicing_system.controller.api;

import com.wigerlabs.invoicing_system.dto.ClientDTO;
import com.wigerlabs.invoicing_system.service.ClientService;
import com.wigerlabs.invoicing_system.util.AppUtil;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/client")
public class ClientController {

    private final ClientService clientService = new ClientService();

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createClient(String jsonData) {
        ClientDTO clientDTO = AppUtil.GSON.fromJson(jsonData, ClientDTO.class);
        String responseJson = clientService.createClient(clientDTO);
        return Response.ok().entity(responseJson).build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllClients() {
        String responseJson = clientService.getAllClients();
        return Response.ok().entity(responseJson).build();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getClientById(@PathParam("id") int id) {
        String responseJson = clientService.getClientById(id);
        return Response.ok().entity(responseJson).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateClient(String jsonData) {
        ClientDTO clientDTO = AppUtil.GSON.fromJson(jsonData, ClientDTO.class);
        String responseJson = clientService.updateClient(clientDTO);
        return Response.ok().entity(responseJson).build();
    }

    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteClient(@PathParam("id") int id) {
        String responseJson = clientService.deleteClient(id);
        return Response.ok().entity(responseJson).build();
    }
}

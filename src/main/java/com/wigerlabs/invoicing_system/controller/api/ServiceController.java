package com.wigerlabs.invoicing_system.controller.api;

import com.wigerlabs.invoicing_system.dto.ServiceDTO;
import com.wigerlabs.invoicing_system.service.ServiceService;
import com.wigerlabs.invoicing_system.util.AppUtil;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/service")
public class ServiceController {

    private final ServiceService serviceService = new ServiceService();

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createService(String jsonData) {
        ServiceDTO serviceDTO = AppUtil.GSON.fromJson(jsonData, ServiceDTO.class);
        String responseJson = serviceService.createService(serviceDTO);
        return Response.ok().entity(responseJson).build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllServices() {
        String responseJson = serviceService.getAllServices();
        return Response.ok().entity(responseJson).build();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getServiceById(@PathParam("id") int id) {
        String responseJson = serviceService.getServiceById(id);
        return Response.ok().entity(responseJson).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateService(String jsonData) {
        ServiceDTO serviceDTO = AppUtil.GSON.fromJson(jsonData, ServiceDTO.class);
        String responseJson = serviceService.updateService(serviceDTO);
        return Response.ok().entity(responseJson).build();
    }

    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteService(@PathParam("id") int id) {
        String responseJson = serviceService.deleteService(id);
        return Response.ok().entity(responseJson).build();
    }
}

package com.wigerlabs.invoicing_system.controller.api;

import com.wigerlabs.invoicing_system.dto.InvoiceDTO;
import com.wigerlabs.invoicing_system.service.InvoiceService;
import com.wigerlabs.invoicing_system.util.AppUtil;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/invoice")
public class InvoiceController {

    private final InvoiceService invoiceService = new InvoiceService();

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createInvoice(String jsonData) {
        InvoiceDTO invoiceDTO = AppUtil.GSON.fromJson(jsonData, InvoiceDTO.class);
        String responseJson = invoiceService.createInvoice(invoiceDTO);
        return Response.ok().entity(responseJson).build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllInvoices() {
        String responseJson = invoiceService.getAllInvoices();
        return Response.ok().entity(responseJson).build();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getInvoiceById(@PathParam("id") int id) {
        String responseJson = invoiceService.getInvoiceById(id);
        return Response.ok().entity(responseJson).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateInvoice(String jsonData) {
        InvoiceDTO invoiceDTO = AppUtil.GSON.fromJson(jsonData, InvoiceDTO.class);
        String responseJson = invoiceService.updateInvoice(invoiceDTO);
        return Response.ok().entity(responseJson).build();
    }

    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteInvoice(@PathParam("id") int id) {
        String responseJson = invoiceService.deleteInvoice(id);
        return Response.ok().entity(responseJson).build();
    }
}

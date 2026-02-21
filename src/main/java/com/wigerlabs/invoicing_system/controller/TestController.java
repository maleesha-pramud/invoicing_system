package com.wigerlabs.invoicing_system.controller;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/test")
public class TestController {
    @GET
    @Produces(MediaType.TEXT_HTML)
    public Response test() {
        try {
            return Response.ok().entity("API is working successfully").build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }
}

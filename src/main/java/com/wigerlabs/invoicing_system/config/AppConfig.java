package com.wigerlabs.invoicing_system.config;

import org.glassfish.jersey.server.ResourceConfig;

public class AppConfig extends ResourceConfig {
    public AppConfig(){
        packages("com.wigerlabs.invoicing_system.controller");
        register(org.glassfish.jersey.media.multipart.MultiPartFeature.class);
    }
}

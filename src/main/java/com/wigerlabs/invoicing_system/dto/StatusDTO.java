package com.wigerlabs.invoicing_system.dto;

import java.io.Serializable;

public class StatusDTO implements Serializable {
    private int id;
    private String value;

    public StatusDTO() {
    }

    public StatusDTO(int id, String value) {
        this.id = id;
        this.value = value;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}

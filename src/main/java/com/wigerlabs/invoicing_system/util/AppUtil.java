package com.wigerlabs.invoicing_system.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.TypeAdapter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;

import java.io.IOException;
import java.security.SecureRandom;
import java.sql.Date;

public class AppUtil {
    public static final Gson GSON = new GsonBuilder()
            .registerTypeAdapter(Date.class, new TypeAdapter<Date>() {
                @Override
                public void write(JsonWriter out, Date value) throws IOException {
                    if (value == null) {
                        out.nullValue();
                    } else {
                        out.value(value.toString()); // Returns yyyy-MM-dd format
                    }
                }

                @Override
                public Date read(JsonReader in) throws IOException {
                    if (in != null) {
                        String dateStr = in.nextString();
                        return Date.valueOf(dateStr); // Expects yyyy-MM-dd format
                    }
                    return null;
                }
            })
            .create();

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public static String generateCode() {
        int randomNumber = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%6d", randomNumber);
    }
}

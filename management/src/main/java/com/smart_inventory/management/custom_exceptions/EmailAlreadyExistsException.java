package com.smart_inventory.management.custom_exceptions;

public class EmailAlreadyExistsException extends RuntimeException{
    public EmailAlreadyExistsException(String email){
        super("Email already exists !!!"+email);
    }
}

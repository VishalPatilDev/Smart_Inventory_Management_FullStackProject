//package com.smart_inventory.management.service;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.mail.SimpleMailMessage;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.stereotype.Service;
//
//@Service
//public class EmailService {
//
//    @Value("${app.mail.from}")
//    private String from;
//
//    @Autowired
//    private JavaMailSender javaMailSender;
//
//    public void sendWelcomeEmail(String email, String name){
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setFrom(from);
//        message.setTo(email);
//        message.setSubject("Welcome to Smart Inventory Mangement !");
//        message.setText("Hello "+name+",/n/n"+"Thank You for registering with us");
//        javaMailSender.send(message);
//    }
//}

//package com.smart_inventory.management.listeners;
//
//import com.smart_inventory.management.events.UserRegisterEvent;
//import com.smart_inventory.management.service.EmailService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.event.EventListener;
//import org.springframework.scheduling.annotation.Async;
//import org.springframework.stereotype.Component;
//
//@Component
//public class EmailEventListener {
//
//    @Autowired
//    private EmailService emailService;
//
//    @Async
//    @EventListener
//    public void handleEmailEvent(UserRegisterEvent userRegisterEvent){
//        emailService.sendWelcomeEmail(userRegisterEvent.getUser().getEmail(),userRegisterEvent.getUser().getName());
//    }
//}

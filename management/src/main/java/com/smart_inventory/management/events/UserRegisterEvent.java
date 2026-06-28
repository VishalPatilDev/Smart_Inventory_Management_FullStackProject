package com.smart_inventory.management.events;

import com.smart_inventory.management.model.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegisterEvent {
    private final User user;

    public UserRegisterEvent(User user) {
        this.user = user;
    }
}

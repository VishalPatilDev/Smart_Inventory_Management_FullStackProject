package com.smart_inventory.management.model;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;


@Getter
public enum Role {
    ADMIN(Set.of(Permissions.READ,Permissions.WRITE,Permissions.DELETE)),STAFF(Set.of(Permissions.READ));

    private final Set<Permissions> permissions;

    Role(Set<Permissions> permissions) {
        this.permissions = permissions;
    }
}

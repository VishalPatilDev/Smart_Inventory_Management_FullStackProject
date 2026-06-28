package com.smart_inventory.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @Column(unique = true,nullable = false)
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToMany(mappedBy = "createdBy")
    private List<PurchaseOrder> purchaseOrders;
    //Cascade?  //No.    //Deleting user should not delete orders.   //Orders are historical data.

    @OneToMany(mappedBy = "createdBy")
    private List<SalesOrder> salesOrders;

    @OneToMany(mappedBy = "performedBy")
    private List<StockTransaction> stockTransactions;
    //No cascade.   //Stock audit data must remain.



















    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
//        return List.of();
//        return List.of(new SimpleGrantedAuthority(role.name()));

        Set<SimpleGrantedAuthority> simpleGrantedAuthorities = new HashSet<>();
        simpleGrantedAuthorities.add(new SimpleGrantedAuthority("ROLE_"+role));
        simpleGrantedAuthorities.addAll(role.getPermissions().stream().map(p->new SimpleGrantedAuthority(p.name())).collect(Collectors.toSet()));
        return simpleGrantedAuthorities;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
}

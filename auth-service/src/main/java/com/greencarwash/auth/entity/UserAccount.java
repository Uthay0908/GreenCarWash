package com.greencarwash.auth.entity;

import jakarta.persistence.*;

@Entity
@Table(name="user_accounts", uniqueConstraints=@UniqueConstraint(columnNames="email"))
public class UserAccount {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,unique=true) private String email;
 @Column(nullable=false) private String passwordHash;
 @Column(nullable=false) private String role;
 private boolean emailVerified; private boolean active=true;
 public Long getId(){return id;} public String getEmail(){return email;} public void setEmail(String email){this.email=email;} public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String v){passwordHash=v;} public String getRole(){return role;} public void setRole(String v){role=v;} public boolean isEmailVerified(){return emailVerified;} public void setEmailVerified(boolean v){emailVerified=v;} public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
}

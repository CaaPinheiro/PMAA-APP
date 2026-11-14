package com.barcarena.integrapmaa.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private Key chave() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String gerarToken(String login, String papel, Long id) {
        return Jwts.builder()
                .setSubject(login)
                .claim("papel", papel)
                .claim("id", id)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(chave(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extrairLogin(String token) {
        return claims(token).getSubject();
    }

    public String extrairPapel(String token) {
        return claims(token).get("papel", String.class);
    }

    public boolean valido(String token) {
        try {
            claims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims claims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(chave())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

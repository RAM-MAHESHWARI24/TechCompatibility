package com.example.demo.controller;

import com.example.demo.dto.ConnectionCheckDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CheckController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/check")
    public ConnectionCheckDto verifyStack() {
        String mysqlVersion = jdbcTemplate.queryForObject("SELECT VERSION()", String.class);
        return new ConnectionCheckDto("CONNECTED", mysqlVersion, System.currentTimeMillis());
    }
}

package com.example.demo.controller;

import com.example.demo.dto.LemfRecordDto;
import com.example.demo.entity.LemfRecord;
import com.example.demo.repository.LemfRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/lemf")
public class LemfController {

    private final LemfRecordRepository repository;

    public LemfController(LemfRecordRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<LemfRecordDto> list() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @PostMapping
    public LemfRecordDto create(@RequestBody LemfRecordDto request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }

        LemfRecord entity = new LemfRecord();
        entity.setName(request.name());
        entity.setCategory(request.category());
        entity.setAssignedTo(request.assignedTo());
        entity.setNotes(request.notes());
        entity.setStatus(request.status() == null || request.status().isBlank() ? "PENDING" : request.status());

        LemfRecord saved = repository.save(entity);
        return toDto(saved);
    }

    private LemfRecordDto toDto(LemfRecord entity) {
        return new LemfRecordDto(entity.getId(), entity.getName(), entity.getCategory(), entity.getAssignedTo(), entity.getNotes(), entity.getStatus());
    }
}

package com.example.application.services;

import com.example.application.data.Company;
import com.example.application.data.CompanyRepository;
import com.example.application.data.Contact;
import com.example.application.data.ContactRepository;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import dev.hilla.BrowserCallable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.stream.Collectors;

@AnonymousAllowed
@BrowserCallable
public class CRMService {

    private final CompanyRepository companyRepository;
    private final ContactRepository contactRepository;

    public CRMService(CompanyRepository companyRepository, ContactRepository contactRepository) {
        this.companyRepository = companyRepository;
        this.contactRepository = contactRepository;
    }

    public record ContactRecord(
            Long id,
            @NotNull
            @Size(min = 1, max = 50)
            String firstName,
            @NotNull
            @Size(min = 1, max = 50)
            String lastName,
            @NotNull
            @Email
            String email,
            @NotNull
            CompanyRecord company,
            @NotNull
            String status
    ) {
    }

    public record CompanyRecord(
            @NotNull
            Long id,
            String name
    ) {
    }

    private ContactRecord toContactRecord(Contact c) {
        return new ContactRecord(
                c.getId(),
                c.getFirstName(),
                c.getLastName(),
                c.getEmail(),
                new CompanyRecord(
                        c.getCompany().getId(),
                        c.getCompany().getName()
                ),
                c.getId() % 2 == 0 ? "Success" : "Error"
        );
    }

    private CompanyRecord toCompanyRecord(Company c) {
        return new CompanyRecord(
                c.getId(),
                c.getName()
        );
    }

    public List<CompanyRecord> findAllCompanies() {
        List<CompanyRecord> list = companyRepository.findAll().stream()
                .map(this::toCompanyRecord).toList();
        return list;
    }

    public List<ContactRecord> findAllContacts() {
        List<Contact> all = contactRepository.findAllWithCompany();
        return all.stream()
                .map(this::toContactRecord).toList();
    }

    public ContactRecord save(ContactRecord contact) {
        var dbContact = contactRepository.findById(contact.id).orElseThrow();
        var company = companyRepository.findById(contact.company.id).orElseThrow();

        dbContact.setFirstName(contact.firstName);
        dbContact.setLastName(contact.lastName);
        dbContact.setEmail(contact.email);
        dbContact.setCompany(company);

        var saved = contactRepository.save(dbContact);

        return toContactRecord(saved);
    }

    public record PageResponse(List<CRMService.ContactRecord> items, long totalCount) { }

    public PageResponse fetchContacts(int page, int pageSize, String searchTerm) {
        PageResponse res = null;
        if (searchTerm == null || "".equals(searchTerm)) {
            Page<Contact> all = contactRepository.findAll(PageRequest.of(page, pageSize));
            res = new PageResponse(all.getContent().stream().map(this::toContactRecord).collect(Collectors.toList()), all.getTotalElements());
        } else {
            Page<Contact> c = contactRepository.findByFirstNameContaining(searchTerm, PageRequest.of(page, pageSize));
            res = new PageResponse(c.getContent().stream().map(this::toContactRecord).collect(Collectors.toList()), c.getTotalElements());
        }
        return res;
    }

}

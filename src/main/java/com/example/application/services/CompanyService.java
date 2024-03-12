package com.example.application.services;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import dev.hilla.BrowserCallable;
import dev.hilla.Nonnull;
import dev.hilla.Nullable;
import dev.hilla.crud.CountService;
import dev.hilla.crud.ListService;
import dev.hilla.crud.filter.AndFilter;
import dev.hilla.crud.filter.Filter;
import dev.hilla.crud.filter.OrFilter;
import dev.hilla.crud.filter.PropertyStringFilter;
import org.springframework.data.domain.Pageable;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.RecordComponent;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@BrowserCallable
@AnonymousAllowed
public class CompanyService implements ListService<CompanyService.CompanyRec>, CountService {

    List<CompanyRec> companies = new ArrayList<>();

    public CompanyService() {
        String[] names = {"Apple", "Microsoft", "Google", "Facebook", "Amazon", "Netflix", "Tesla", "Twitter", "Uber", "Airbnb"};
        int index = 0;
        for (int i = 0; i < 100; i++) {
            for (int j = 0; j < names.length; j++) {
                String name = names[j];
                CompanyRec company = new CompanyRec(name + " " + i, index++);
                companies.add(company);
            }
        }
    }

    @Override
    public long count(@Nullable Filter filter) {
        System.out.println("Count");
        return companies.stream()
                .filter(companyRec -> filterCompanyRec(companyRec, filter))
                .count();
    }

    @Override
    public @Nonnull List<@Nonnull CompanyRec> list(Pageable pageable, @Nullable Filter filter) {
        return companies.stream()
                .filter(companyRec -> filterCompanyRec(companyRec, filter))
                .skip(pageable.getOffset())
                .limit(pageable.getPageSize())
                .collect(Collectors.toList());
    }

    public boolean filterCompanyRec(CompanyRec companyRec, Filter rawFilter) {
        if (rawFilter instanceof AndFilter filter) {
            List<Filter> children = filter.getChildren();
            for (Filter child : children) {
                if (!filterCompanyRec(companyRec, child)) {
                    return false;
                }
            }
            return true;
        } else if (rawFilter instanceof OrFilter filter) {
            List<Filter> children = filter.getChildren();
            for (Filter child : children) {
                if (filterCompanyRec(companyRec, child)) {
                    return true;
                }
            }
            return false;
        } else if (rawFilter instanceof PropertyStringFilter filter) {
            PropertyStringFilter psf = (PropertyStringFilter) filter;
            PropertyStringFilter.Matcher matcher = psf.getMatcher();

            String filterValue = psf.getFilterValue();
            if (filterValue == null || "".equals(filterValue)) {
                return true;
            }
            String propertyId = psf.getPropertyId();
            RecordComponent[] recordComponents = CompanyRec.class.getRecordComponents();
            for (RecordComponent recordComponent : recordComponents) {
                if (recordComponent.getName().equals(propertyId)) {
                    Object propertyValue = null;
                    try {
                        propertyValue = recordComponent.getAccessor().invoke(companyRec);
                        if (propertyValue == null) {
                            return false;
                        }
                        switch (matcher) {
                            case CONTAINS:
                                if (propertyValue.toString().contains(filterValue)) {
                                    return true;
                                }
                                break;
                            case EQUALS:
                                if (propertyValue.toString().equals(filterValue)) {
                                    return true;
                                }
                                break;
                            case LESS_THAN:
                                Number number = (Number) propertyValue;

                                if (number.doubleValue() < Double.parseDouble(filterValue)) {
                                    return true;
                                }
                                break;
                            case GREATER_THAN:
                                Number number2 = (Number) propertyValue;
                                if (number2.doubleValue() > Double.parseDouble(filterValue)) {
                                    return true;
                                }
                                break;
                            default:
                                throw new IllegalArgumentException("Unknown matcher: " + matcher);
                        }
                        if (propertyValue != null && propertyValue.toString().contains(filterValue)) {
                            return true;
                        }
                    } catch (IllegalAccessException e) {
                        throw new RuntimeException(e);
                    } catch (InvocationTargetException e) {
                        throw new RuntimeException(e);
                    } catch (NumberFormatException e) {
                        return false;
                    }

                }
            }
            return false;

        } else {
            throw new IllegalArgumentException("Unknown filter type: " + rawFilter.getClass());
        }
    }

    public static record CompanyRec(String name, int id) {

    }
}

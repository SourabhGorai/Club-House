package com.clubHouse.tnp.dto.response;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
public class PagedResponse<T> {

    private List<T> content;
    private int page;           // current page (0-indexed)
    private int size;           // page size requested
    private long totalElements; // total records matching the filter
    private int totalPages;     // total pages available
    private boolean first;
    private boolean last;

    public static <T> PagedResponse<T> from(Page<T> pageResult) {
        return PagedResponse.<T>builder()
                .content(pageResult.getContent())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .first(pageResult.isFirst())
                .last(pageResult.isLast())
                .build();
    }
}
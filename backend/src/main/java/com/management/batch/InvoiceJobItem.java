package com.management.batch;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Item passed from reader to writer for auto-generating one invoice.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceJobItem {

    private Long roomId;
    private int month;
    private int year;
    private Long ownerUserId;
}

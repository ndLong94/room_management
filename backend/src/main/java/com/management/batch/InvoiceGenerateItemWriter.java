package com.management.batch;

import com.management.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

/**
 * Writes (generates) one invoice per item by calling InvoiceService.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class InvoiceGenerateItemWriter implements ItemWriter<InvoiceJobItem> {

    private final InvoiceService invoiceService;

    @Override
    public void write(Chunk<? extends InvoiceJobItem> chunk) {
        for (InvoiceJobItem item : chunk.getItems()) {
            try {
                invoiceService.generateForOwner(item.getRoomId(), item.getMonth(), item.getYear(), item.getOwnerUserId());
                log.info("Auto-created invoice for room {} {}/{}", item.getRoomId(), item.getMonth(), item.getYear());
            } catch (Exception e) {
                log.warn("Failed to auto-create invoice for room {}: {}", item.getRoomId(), e.getMessage());
            }
        }
    }
}

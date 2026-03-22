package com.management.batch;

import com.management.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.scope.context.StepSynchronizationManager;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

/**
 * Writes (generates) one invoice per item by calling InvoiceService.
 * Failures are counted on the step execution context; {@link InvoiceGenerationStepListener} marks the step failed if any.
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
                log.error("Failed to auto-create invoice for roomId={} month={} year={} ownerUserId={}",
                        item.getRoomId(), item.getMonth(), item.getYear(), item.getOwnerUserId(), e);
                recordWriteFailure();
            }
        }
    }

    private void recordWriteFailure() {
        var sync = StepSynchronizationManager.getContext();
        if (sync == null) {
            return;
        }
        StepExecution stepExecution = sync.getStepExecution();
        if (stepExecution == null) {
            return;
        }
        ExecutionContext ec = stepExecution.getExecutionContext();
        int n = ec.getInt(InvoiceGenerationStepListener.INVOICE_WRITE_FAILURES_KEY, 0);
        ec.putInt(InvoiceGenerationStepListener.INVOICE_WRITE_FAILURES_KEY, n + 1);
    }
}

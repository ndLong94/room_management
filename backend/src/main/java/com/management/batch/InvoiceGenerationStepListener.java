package com.management.batch;

import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.stereotype.Component;

/**
 * Marks the invoice generation step as failed if any per-room write failed
 * (see {@link InvoiceGenerateItemWriter}).
 */
@Component
public class InvoiceGenerationStepListener implements StepExecutionListener {

    public static final String INVOICE_WRITE_FAILURES_KEY = "invoiceWriteFailures";

    @Override
    public void beforeStep(StepExecution stepExecution) {
        stepExecution.getExecutionContext().remove(INVOICE_WRITE_FAILURES_KEY);
    }

    @Override
    public ExitStatus afterStep(StepExecution stepExecution) {
        ExecutionContext ec = stepExecution.getExecutionContext();
        int failures = ec.getInt(INVOICE_WRITE_FAILURES_KEY, 0);
        if (failures > 0) {
            return ExitStatus.FAILED.addExitDescription(failures + " invoice(s) failed in batch writer");
        }
        return null;
    }
}

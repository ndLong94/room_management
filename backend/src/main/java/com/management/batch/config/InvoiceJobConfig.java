package com.management.batch.config;

import com.management.batch.InvoiceGenerateItemWriter;
import com.management.batch.InvoiceGenerationStepListener;
import com.management.batch.InvoiceJobItem;
import com.management.batch.InvoiceJobItemReader;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

/**
 * Spring Batch job config: one job with one step that reads rooms needing an invoice and generates them.
 */
@Configuration
@RequiredArgsConstructor
public class InvoiceJobConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final InvoiceJobItemReader invoiceJobItemReader;
    private final InvoiceGenerateItemWriter invoiceGenerateItemWriter;
    private final InvoiceGenerationStepListener invoiceGenerationStepListener;

    @Value("${app.batch.invoice-chunk-size:10}")
    private int invoiceChunkSize;

    @Bean
    public Job invoiceGenerationJob() {
        return new JobBuilder("invoiceGenerationJob", jobRepository)
                .start(invoiceGenerationStep())
                .build();
    }

    @Bean
    public Step invoiceGenerationStep() {
        return new StepBuilder("invoiceGenerationStep", jobRepository)
                .<InvoiceJobItem, InvoiceJobItem>chunk(invoiceChunkSize, transactionManager)
                .reader(invoiceJobItemReader)
                .writer(invoiceGenerateItemWriter)
                .listener(invoiceGenerationStepListener)
                .build();
    }
}

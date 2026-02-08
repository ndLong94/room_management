package com.management.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Chạy job batch tạo hóa đơn tự động vào 6h sáng (ngày thanh toán của từng phòng).
 * Logic nằm trong batch (reader/writer/config).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class InvoiceScheduledJob {

    private final JobLauncher jobLauncher;
    private final Job invoiceGenerationJob;

    @Scheduled(cron = "0 0 6 * * ?")
    public void runInvoiceGenerationJob() {
        try {
            jobLauncher.run(invoiceGenerationJob,
                    new JobParametersBuilder().addLong("runAt", System.currentTimeMillis()).toJobParameters());
            log.info("Invoice generation batch job completed");
        } catch (Exception e) {
            log.error("Invoice generation batch job failed", e);
        }
    }
}

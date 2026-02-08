package com.management.service;

import com.management.dto.response.InvoiceResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Gửi tin nhắn Zalo cho hóa đơn (Zalo Official Account API).
 * Cấu hình: ZALO_ACCESS_TOKEN, ZALO_ENABLED, APP_BASE_URL.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ZaloNotificationService {

    private static final String ZALO_SEND_MESSAGE_URL = "https://graph.zalo.me/v2.0/me/message";
    private static final DateTimeFormatter DUE_DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.zalo.access-token:}")
    private String accessToken;

    @Value("${app.zalo.enabled:false}")
    private boolean zaloEnabled;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    /**
     * Tạo nội dung tin nhắn theo template hóa đơn phòng trọ.
     */
    public String buildInvoiceMessage(InvoiceResponse inv, String viewInvoiceUrl) {
        String title = String.format("[HÓA ĐƠN PHÒNG TRỌ – THÁNG %d/%d]",
                inv.getMonth() != null ? inv.getMonth() : 0,
                inv.getYear() != null ? inv.getYear() : 0);
        String roomName = inv.getRoomName() != null ? inv.getRoomName() : "—";
        String rent = formatMoney(inv.getRentAmount());
        String elecLine = formatElecLine(inv);
        String waterLine = formatWaterLine(inv);
        String total = formatMoney(inv.getTotalAmount());
        String dueDate = inv.getDueDate() != null ? inv.getDueDate().format(DUE_DATE_FMT) : "—";
        String link = viewInvoiceUrl != null && !viewInvoiceUrl.isBlank() ? viewInvoiceUrl : (baseUrl + "/invoices/" + inv.getId());

        return title + "\n\n"
                + "Phòng: " + roomName + "\n"
                + "Tiền phòng: " + rent + "\n"
                + elecLine + "\n"
                + waterLine + "\n\n"
                + "👉 Tổng: " + total + "\n"
                + "Hạn thanh toán: " + dueDate + "\n\n"
                + "Xem chi tiết: " + link;
    }

    private String formatElecLine(InvoiceResponse inv) {
        BigDecimal amount = inv.getElecAmount() != null ? inv.getElecAmount() : BigDecimal.ZERO;
        if (inv.getElecConsumption() != null && inv.getElecUnitPrice() != null) {
            String kwh = inv.getElecConsumption().stripTrailingZeros().toPlainString();
            String unit = formatMoney(inv.getElecUnitPrice());
            return "Điện: " + kwh + "kWh x " + unit + " = " + formatMoney(amount);
        }
        return "Tiền điện = " + formatMoney(amount);
    }

    private String formatWaterLine(InvoiceResponse inv) {
        BigDecimal amount = inv.getWaterAmount() != null ? inv.getWaterAmount() : BigDecimal.ZERO;
        if (inv.getWaterConsumption() != null && inv.getWaterUnitPrice() != null) {
            String m3 = inv.getWaterConsumption().stripTrailingZeros().toPlainString();
            String unit = formatMoney(inv.getWaterUnitPrice());
            return "Nước: " + m3 + "m³ x " + unit + " = " + formatMoney(amount);
        }
        return "Tiền nước = " + formatMoney(amount);
    }

    private static String formatMoney(BigDecimal value) {
        if (value == null) return "0đ";
        long v = value.setScale(0, java.math.RoundingMode.HALF_UP).longValue();
        return String.format("%,dđ", v).replace(',', '.'); // VN: 3.000.000đ
    }

    /**
     * Gửi tin nhắn text tới Zalo user (Zalo OA API).
     */
    public void sendMessage(String zaloUserId, String message) {
        if (!zaloEnabled || accessToken == null || accessToken.isBlank()) {
            log.warn("Zalo chưa bật hoặc chưa cấu hình access token. Bỏ qua gửi tin.");
            throw new IllegalStateException("Zalo chưa được cấu hình. Đặt ZALO_ENABLED=true và ZALO_ACCESS_TOKEN trong .env.");
        }
        String url = ZALO_SEND_MESSAGE_URL + "?access_token=" + accessToken;
        Map<String, Object> body = new LinkedHashMap<>();
        Map<String, String> recipient = new LinkedHashMap<>();
        recipient.put("user_id", zaloUserId);
        body.put("recipient", recipient);
        Map<String, String> msg = new LinkedHashMap<>();
        msg.put("text", message);
        body.put("message", msg);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            log.error("Zalo API lỗi: {} - {}", response.getStatusCode(), response.getBody());
            throw new IllegalStateException("Gửi Zalo thất bại: " + response.getBody());
        }
        log.info("Đã gửi tin Zalo cho user {}", zaloUserId);
    }
}

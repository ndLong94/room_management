package com.management.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.management.exception.AuthException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

/**
 * Verifies OAuth tokens from Google and Facebook and returns user email/name.
 */
@Service
@Slf4j
public class OAuthVerificationService {

    private final String googleClientId;
    private final String facebookAppId;
    private final String facebookAppSecret;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OAuthVerificationService(
            @Value("${app.oauth.google.client-id:}") String googleClientId,
            @Value("${app.oauth.facebook.app-id:}") String facebookAppId,
            @Value("${app.oauth.facebook.app-secret:}") String facebookAppSecret) {
        this.googleClientId = googleClientId;
        this.facebookAppId = facebookAppId;
        this.facebookAppSecret = facebookAppSecret;
    }

    /**
     * Verify Google ID token (from frontend credential) and return email + name.
     */
    public OAuthUserInfo verifyGoogleToken(String credential) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new AuthException("Đăng nhập Google chưa được cấu hình.");
        }
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null) {
                throw new AuthException("Token Google không hợp lệ.");
            }
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            if (email == null || email.isBlank()) {
                throw new AuthException("Google không cung cấp email.");
            }
            Object nameObj = payload.get("name");
            String name = (nameObj != null && nameObj.toString() != null && !nameObj.toString().isBlank())
                    ? nameObj.toString() : email;
            return new OAuthUserInfo(email.trim().toLowerCase(), name);
        } catch (AuthException e) {
            throw e;
        } catch (Exception e) {
            log.debug("Google token verification failed: {}", e.getMessage());
            throw new AuthException("Token Google không hợp lệ hoặc đã hết hạn.");
        }
    }

    /**
     * Verify Facebook access token and return email + name via Graph API.
     */
    public OAuthUserInfo verifyFacebookToken(String accessToken) {
        if (facebookAppId == null || facebookAppId.isBlank()) {
            throw new AuthException("Đăng nhập Facebook chưa được cấu hình.");
        }
        try {
            String url = "https://graph.facebook.com/me?fields=id,email,name&access_token=" + accessToken;
            String json = restTemplate.getForObject(url, String.class);
            if (json == null) {
                throw new AuthException("Không thể xác thực Facebook.");
            }
            JsonNode node = objectMapper.readTree(json);
            if (node.has("error")) {
                throw new AuthException("Token Facebook không hợp lệ hoặc đã hết hạn.");
            }
            String email = node.has("email") ? node.get("email").asText() : null;
            if (email == null || email.isBlank()) {
                throw new AuthException("Facebook không cung cấp email. Vui lòng cấp quyền email cho app.");
            }
            String name = node.has("name") ? node.get("name").asText() : email;
            return new OAuthUserInfo(email.trim().toLowerCase(), name);
        } catch (AuthException e) {
            throw e;
        } catch (Exception e) {
            log.debug("Facebook token verification failed: {}", e.getMessage());
            throw new AuthException("Token Facebook không hợp lệ hoặc đã hết hạn.");
        }
    }

    public record OAuthUserInfo(String email, String name) {}
}

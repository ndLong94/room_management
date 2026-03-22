package com.management.util;

/**
 * Shared string helpers for the API layer. Prefer these over copy-pasting
 * {@code s != null ? s.trim() : null} across services.
 */
public final class Text {

    private Text() {}

    /**
     * Trims whitespace; returns {@code null} if the input is {@code null} or blank after trim.
     */
    public static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}

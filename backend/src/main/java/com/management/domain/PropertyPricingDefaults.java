package com.management.domain;

import java.math.BigDecimal;

/**
 * Single source of truth for default electricity / water unit prices when none is supplied
 * (entity field defaults, property creation fallbacks).
 */
public final class PropertyPricingDefaults {

    public static final BigDecimal DEFAULT_ELEC_PRICE = new BigDecimal("3500");
    public static final BigDecimal DEFAULT_WATER_PRICE = new BigDecimal("15000");

    private PropertyPricingDefaults() {}
}

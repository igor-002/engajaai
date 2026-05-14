# Checkout — page overrides

Inherits MASTER. Overrides:

- Container narrower: `max-w-6xl` (not `max-w-7xl`)
- Reduced top padding `py-6 md:py-10` (form-heavy, less vertical breathing)
- Pay button: `h-12` (larger than default, primary CTA only one on the screen)
- Payment method cards: 2 columns on `md+`, 1 col mobile
- Order summary on mobile: collapsed by default with "Ver detalhes" toggle, fixed total bar at bottom
- Success/error feedback: inline below pay button, `aria-live="polite"`

PIX-specific:
- After "Pagar", show QR code + copy-paste pix code
- Poll order status every 3s (max 10 min)
- Success state: green checkmark + redirect `/checkout/success` after 2s

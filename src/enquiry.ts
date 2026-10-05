/*
 * `handled` is the panel's own flag on an enquiry, `true` or absent (E2.7).
 * The inbox ticks it and the panel counts it, so both read it here: a record
 * with no flag is unhandled, never handled.
 */
export const isHandled = (enquiry: { handled?: unknown }) => enquiry.handled === true;

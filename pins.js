/* ===== PIN LIST =====
   One PIN per line:   "PIN  START-DATE"   (6 digits, then date as YYYY-MM-DD)
   Each PIN works for 3 months from its start date, then stops automatically.
   Lines starting with XXXXXX are placeholders (ignored): replace XXXXXX with your real 6-digit PIN. Delete a line to cancel that PIN at once.
   Don't forget the comma at the end of every line except the last. */
window.PIN_CONFIG = {
  months: 3,
  pins: [
    "033054 2026-10-25",
    "XXXXXX 2027-01-25",
    "XXXXXX 2027-04-25",
    "XXXXXX 2027-07-25",
    "XXXXXX 2027-10-25"
  ]
};

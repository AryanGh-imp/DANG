# Backup Format and Data Rules

## Exported JSON

Backups export format version 3. The [sample backup](../examples/sample-backup.json) contains synthetic data and can be imported in an isolated test profile. The [JSON Schema](../schemas/backup.schema.json) describes the public fields; the runtime validator in `store.js` is authoritative for calendar validity, aggregate limits, duplicate handling, and legacy normalization.

```json
{
  "v": 3,
  "settings": {
    "theme": "persepolis",
    "unit": "toman",
    "ucustom": "",
    "cal": "j",
    "lang": "fa",
    "budget": 6000000,
    "uv": 1,
    "cats": [{ "k": "food", "c": "#956b35" }, { "k": "other", "c": "#77746b" }]
  },
  "items": [{ "id": "sample-1", "date": "2026-11-08", "amt": 185000, "desc": "Sample lunch", "cat": "food" }]
}
```

The `items` array is required. `settings` and `v` can be omitted in supported historical imports. Version values 1, 2, and 3 are accepted. Internal database revisions and recovery records are not part of ordinary exported backups.

## Expense fields

| Field | Meaning and limits |
| --- | --- |
| `id` | Stable string key; historical integer IDs are converted to strings. Missing IDs are generated during normalization. |
| `date` | Valid Gregorian ISO date, `YYYY-MM-DD`, year 1000–9999. Calendar presentation does not change this stored value. |
| `amt` | JSON number, 0.01 through 1,000,000,000,000 inclusive, with at most two decimal places. Strings are not accepted in JSON backups. |
| `desc` | Optional string, at most 10,000 characters; defaults to an empty string. |
| `cat` | Optional category key; unknown or missing categories map to `other`. |

Keys use 1–100 ASCII letters, digits, underscores, or hyphens. `__proto__`, `constructor`, and `prototype` are prohibited. The total amount in cents must remain a JavaScript safe integer. A backup that would violate these rules is rejected before data is committed.

The entry form separately supports Persian/Arabic digits and valid thousands separators. This input convenience does not change the numeric JSON format.

## Settings

| Field | Supported values |
| --- | --- |
| `theme` | `auto`, `persepolis`, `limestone`, `obsidian`, `lapis`, `cedar`, `porphyry`, plus legacy names mapped to current themes |
| `unit` | `none`, `toman`, `rial`, `custom`; historical Persian toman/rial labels are normalized |
| `ucustom` | Custom display label, maximum 80 characters |
| `cal` | `j` for Jalali; `g` for Gregorian |
| `lang` | `fa` or `en` |
| `budget` | Zero disables the budget; otherwise the amount limits and precision rules apply |
| `cats` | Up to 1,000 input categories; unique safe keys, optional names up to 120 characters and six-digit hex colors |
| `uv` | Historical compatibility field; normalization supplies the current default |

Missing settings fields receive defaults. Invalid explicit settings are rejected in a backup import. Unknown fields are not used as application behavior. Built-in category names are translated; custom names are kept as entered.

## Import and merge behavior

1. Parse and validate the complete backup before attempting a write. File selection accepts JSON files up to 20,000,000 bytes and prepares a draft; it does not immediately import it.
2. Confirm the restore-settings checkbox matches the intended operation, then choose Restore.
3. Expenses with identical IDs and contents are retained once. Different entries with the same ID are preserved as separate copies.
4. Repeated imports of the same supported backup do not continually duplicate conflicting copies.
5. Restoring settings keeps category metadata needed by existing expenses. Without restoring settings, new backup categories can be added while the current appearance, language, calendar, currency, and budget remain selected.
6. Validation or storage failures abort the transaction and leave existing data intact.

Merging a backup does not replace the entire database. Use a fresh browser context when inspecting an example, or intentionally clear expenses through the application's confirmation flow before a full replacement. Keep a backup before destructive operations.

## Recovery and other exports

Legacy or damaged input can have a separately downloadable original-data recovery file. That file is for inspection and recovery, and is not necessarily valid as a normal backup. The original localStorage keys are retained by migration.

CSV and print reports export the filtered report; they do not contain the complete application settings or serve as a lossless restore format. JSON is the format for moving all supported expense data and settings.

use serde::Deserialize;

#[derive(Deserialize)]
pub struct AuditEntryDto {
  pub action: String,
  pub details: String,
  pub result: String,
}

#[tauri::command]
pub async fn cmd_append_audit_entry(entry: AuditEntryDto) -> Result<(), String> {
  // TODO: Persist to an append-only file or SQLite DB under app data.
  println!("AUDIT: {} {} {}", entry.action, entry.result, entry.details);
  Ok(())
}

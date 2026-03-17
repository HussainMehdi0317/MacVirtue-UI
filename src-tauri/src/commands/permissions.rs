use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct PermissionPreferenceDto {
  pub action: String,
  pub decision: String,
  pub timestamp: String,
}

#[tauri::command]
pub async fn cmd_load_permissions() -> Result<Vec<PermissionPreferenceDto>, String> {
  // TODO: load from app config file (JSON) and return.
  Ok(vec![])
}

#[tauri::command]
pub async fn cmd_save_permissions(prefs: Vec<PermissionPreferenceDto>) -> Result<(), String> {
  // TODO: persist to disk, ideally encrypted.
  println!("Saving {} permission preferences", prefs.len());
  Ok(())
}

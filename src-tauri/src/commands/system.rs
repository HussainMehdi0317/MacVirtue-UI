use serde::Serialize;

#[derive(Serialize)]
pub struct SystemResponse {
  pub ok: bool,
  pub message: String,
}

#[tauri::command]
pub async fn cmd_sleep_system() -> Result<SystemResponse, String> {
  // TODO: macOS: `pmset sleepnow`; Windows: `rundll32.exe powrprof.dll,SetSuspendState` (may require elevation).
  Ok(SystemResponse { ok: false, message: "sleep_system not implemented".into() })
}

#[tauri::command]
pub async fn cmd_set_wallpaper(path: String) -> Result<SystemResponse, String> {
  // TODO: platform-specific wallpaper setter with user consent.
  Ok(SystemResponse { ok: false, message: format!("set_wallpaper not implemented for {path}") })
}

#[tauri::command]
pub async fn cmd_close_app(process_name: String) -> Result<SystemResponse, String> {
  // TODO: platform-specific app close (macOS: AppleScript; Windows: taskkill /IM name /T /F with care).
  Ok(SystemResponse { ok: false, message: format!("close_app not implemented for {process_name}") })
}

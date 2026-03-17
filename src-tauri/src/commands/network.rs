use serde::Serialize;

#[derive(Serialize)]
pub struct NetworkDetails {
  pub ok: bool,
  pub ssid: Option<String>,
  pub signal_strength: Option<i32>,
  pub message: String,
}

#[tauri::command]
pub async fn cmd_get_network_details() -> Result<NetworkDetails, String> {
  // TODO: Implement via platform-specific APIs or wifi plugins.
  Ok(NetworkDetails {
    ok: false,
    ssid: None,
    signal_strength: None,
    message: "Network details not implemented".into(),
  })
}

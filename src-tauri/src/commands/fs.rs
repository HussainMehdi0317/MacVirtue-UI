use serde::Serialize;
use tauri::State;

#[derive(Serialize)]
pub struct FsResponse {
  pub ok: bool,
  pub message: String,
}

pub struct AllowedRoots {
  pub root: std::path::PathBuf,
}

#[tauri::command]
pub async fn cmd_make_folder(
  state: State<'_, AllowedRoots>,
  relative: String
) -> Result<FsResponse, String> {
  let mut path = state.root.clone();
  let rel = std::path::Path::new(&relative);
  for comp in rel.components() {
    use std::path::Component;
    match comp {
      Component::Normal(p) => path.push(p),
      _ => return Err("Invalid path component".into()),
    }
  }

  std::fs::create_dir_all(&path)
    .map_err(|e| format!("Failed to create folder: {e}"))?;

  Ok(FsResponse {
    ok: true,
    message: format!("Created {}", path.display())
  })
}

#[tauri::command]
pub async fn cmd_open_file(path: String) -> Result<FsResponse, String> {
  // TODO: OS-specific open implementation (macOS: `open`, Windows: `start`).
  Ok(FsResponse { ok: false, message: format!("Not implemented yet: {path}") })
}

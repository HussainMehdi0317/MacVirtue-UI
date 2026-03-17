#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::{fs::*, system::*, audit::*, permissions::*, network::*};

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      cmd_make_folder,
      cmd_open_file,
      cmd_sleep_system,
      cmd_set_wallpaper,
      cmd_close_app,
      cmd_get_network_details,
      cmd_append_audit_entry,
      cmd_load_permissions,
      cmd_save_permissions
    ])
    .run(tauri::generate_context!())
    .expect("error while running MacVirtue UI");
}

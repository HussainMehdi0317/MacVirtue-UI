import React from "react";
import {
  PermissionAction,
  PermissionDecision,
  useSystemStore
} from "../../../state/useSystemStore";

const friendlyName: Record<PermissionAction, string> = {
  make_folder: "Create folders",
  open_file: "Open files",
  open_url: "Open URLs in browser",
  close_app: "Close other applications",
  sleep_system: "Put system to sleep",
  set_wallpaper: "Change wallpaper",
  network_details: "Read network details (SSID / strength)"
};

const PermissionsPanel: React.FC = () => {
  const permissions = useSystemStore((s) => s.permissions);
  const upsert = useSystemStore((s) => s.upsertPermission);

  const update = (action: PermissionAction, decision: PermissionDecision) => {
    upsert({
      action,
      decision,
      timestamp: new Date().toISOString()
    });
  };

  const actions = Object.keys(friendlyName) as PermissionAction[];

  return (
    <div className="text-[11px] space-y-3">
      <p className="text-slate-300">
        Native capabilities are disabled by default. You must explicitly grant
        permission before this app can create folders, open files, or perform
        any system-level operation.
      </p>
      <table className="w-full text-left border-collapse">
        <thead className="text-slate-400">
          <tr>
            <th className="py-1">Capability</th>
            <th className="py-1">Decision</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action) => {
            const existing = permissions.find((p) => p.action === action);
            return (
              <tr key={action} className="border-t border-white/5">
                <td className="py-1 pr-4">{friendlyName[action]}</td>
                <td className="py-1">
                  <select
                    className="bg-black/40 border border-white/15 rounded px-2 py-0.5"
                    value={existing?.decision ?? "deny"}
                    onChange={(e) =>
                      update(action, e.target.value as PermissionDecision)
                    }
                  >
                    <option value="deny">Deny</option>
                    <option value="allow-once" disabled>
                      Allow once (prompted at runtime)
                    </option>
                    <option value="allow-always">Always allow</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-[10px] text-slate-500 mt-2">
        
        “Allow once” decisions are handled via inline permission modals when you
        trigger a specific action.
      </p>
    </div>
  );
};

export default PermissionsPanel;

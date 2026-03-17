import React from "react";
import { useSystemStore } from "../../../state/useSystemStore";

const AuditLogView: React.FC = () => {
  const auditLog = useSystemStore((s) => s.auditLog);

  return (
    <div className="text-[11px] space-y-2">
      <p className="text-slate-300">
        Every attempted native action is recorded here, including denied and
        failed operations. This log is local to your machine and is never sent
        anywhere.
      </p>
      {auditLog.length === 0 ? (
        <p className="text-slate-400">No entries yet.</p>
      ) : (
        <div className="max-h-80 overflow-auto border border-white/10 rounded">
          <table className="w-full border-collapse">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-2 py-1 text-left">Time</th>
                <th className="px-2 py-1 text-left">Action</th>
                <th className="px-2 py-1 text-left">Result</th>
                <th className="px-2 py-1 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLog
                .slice()
                .reverse()
                .map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="px-2 py-1">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-2 py-1">{entry.action}</td>
                    <td className="px-2 py-1">{entry.result}</td>
                    <td className="px-2 py-1">{entry.details}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogView;

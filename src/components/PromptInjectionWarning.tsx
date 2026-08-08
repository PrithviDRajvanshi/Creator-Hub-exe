import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  reason?: string;
}

export const PromptInjectionWarning: React.FC<Props> = ({ reason }) => {
  return (
    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start gap-3 my-3">
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-amber-200 text-sm">Security Guard Alert: Suspicious Prompt Pattern Detected</h4>
        <p className="text-xs text-amber-300/80 mt-1">
          Our prompt injection defense engine detected instructions attempting to override model system boundaries.
          The request was safely sanitized and wrapped inside structural boundaries to protect platform integrity.
        </p>
        {reason && <p className="text-[11px] font-mono text-amber-400 mt-1.5 bg-amber-950/40 p-1.5 rounded border border-amber-500/20">{reason}</p>}
      </div>
    </div>
  );
};

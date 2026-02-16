'use client';
import { Switch } from '@/components/ui/switch';

type ChannelSwitchListProps = {
  channels?: Record<string, boolean | undefined>;
  blacklistType?: string;
  onToggle?: (params: {
    channel: string;
    blacklistType: string;
    newStatus: boolean;
  }) => void;
};

export function ChannelSwitchList({
  channels,
  blacklistType,
  onToggle,
}: ChannelSwitchListProps) {
  return (
    <ul className="list-disc pl-6"> {/* enough padding for bullets */}
      {Object.entries(channels).map(([channel, isEnabled]) => (
        <li key={channel} className="relative py-1" style={{ minWidth: 120 }}>
          <div className="flex items-center justify-between p-2">
            <span className="capitalize">{channel}</span>
            <Switch
              defaultChecked={!!isEnabled}
              className="!w-8 !h-4"
              onCheckedChange={(checked) => {
                if (onToggle) {
                  onToggle({
                    channel,
                    blacklistType,
                    newStatus: checked,
                  });
                }
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

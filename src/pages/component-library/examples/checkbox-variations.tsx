import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const font = "'Inter', system-ui, sans-serif";

/** Professional dark-themed checkbox with visible check mark. */
export function CheckboxDefault() {
  return (
    <div className="flex items-center gap-3">
      <Checkbox
        id="checkbox-default"
        defaultChecked={true}
        className="size-5 rounded-[5px] border-[#404045] bg-[#141416] data-[state=checked]:bg-[#f5a623] data-[state=checked]:border-[#f5a623] data-[state=checked]:text-[#1a1a1d]"
        style={{ fontFamily: font, '--ui-checkbox-selection-speed': '0.22s' } as React.CSSProperties}
      />
      <Label
        htmlFor="checkbox-default"
        className="text-sm font-medium"
        style={{ color: '#f0ede8', fontFamily: font }}
      >
        Enable notifications
      </Label>
    </div>
  );
}

/** Checkbox with label and description text below. */
export function CheckboxWithDescription() {
  return (
    <div className="flex gap-3">
      <Checkbox
        id="checkbox-desc"
        defaultChecked={true}
        className="size-5 rounded-[5px] border-[#404045] bg-[#141416] data-[state=checked]:bg-[#10b981] data-[state=checked]:border-[#10b981] data-[state=checked]:text-white mt-0.5"
        style={{ fontFamily: font, '--ui-checkbox-selection-speed': '0.22s' } as React.CSSProperties}
      />
      <div className="flex flex-col gap-1">
        <Label
          htmlFor="checkbox-desc"
          className="text-sm font-medium"
          style={{ color: '#f0ede8', fontFamily: font }}
        >
          Marketing emails
        </Label>
        <span
          className="text-xs leading-snug"
          style={{ color: '#9a9aa3', fontFamily: font }}
        >
          Receive updates about new features and promotions.
        </span>
      </div>
    </div>
  );
}

/** Vertical group of 3 checkboxes for notification preferences. */
export function CheckboxGroup() {
  const items = [
    { id: 'cb-email', label: 'Email notifications', checked: true },
    { id: 'cb-sms', label: 'SMS alerts', checked: false },
    { id: 'cb-push', label: 'Push notifications', checked: true },
    { id: 'cb-slack', label: 'Slack integration', checked: false },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3">
          <Checkbox
            id={item.id}
            defaultChecked={item.checked}
            className="size-5 rounded-[5px] border-[#404045] bg-[#141416] data-[state=checked]:bg-[#8b5cf6] data-[state=checked]:border-[#8b5cf6] data-[state=checked]:text-white"
            style={{ fontFamily: font, '--ui-checkbox-selection-speed': '0.22s' } as React.CSSProperties}
          />
          <Label
            htmlFor={item.id}
            className="text-sm font-normal"
            style={{ color: '#e2e8f0', fontFamily: font }}
          >
            {item.label}
          </Label>
        </div>
      ))}
    </div>
  );
}

/** Disabled checkbox example. */
export function CheckboxDisabled() {
  return (
    <div className="flex items-center gap-3">
      <Checkbox
        id="checkbox-disabled"
        defaultChecked={false}
        disabled
        className="size-5 rounded-[5px] border-[#303035] bg-[#0f0f11]"
        style={{ fontFamily: font, '--ui-checkbox-selection-speed': '0.22s' } as React.CSSProperties}
      />
      <Label
        htmlFor="checkbox-disabled"
        className="text-sm font-normal"
        style={{ color: '#5a5a64', fontFamily: font }}
      >
        Accept terms (disabled)
      </Label>
    </div>
  );
}

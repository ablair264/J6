import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/** Default checkbox with label — animated selection. */
export function CheckboxDefault() {
  const rootClassName = [
    'bg-[var(--j6-neutral-0-light)]',
    'border-solid',
    'border',
    'border-[#1f2937]/30',
    'rounded-sm',
    'text-xs',
    'font-bold',
    'text-center',
    'justify-center',
    'min-h-[19px]',
    'h-[34px]',
    'px-[0px]',
  ].join(' ');
  const rootStyle = {
    color: 'rgba(226, 232, 240, 1.000)',
    fontFamily: 'Nunito',
    '--ui-checkbox-selection-speed': '0.22s',
  };

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="checkbox-demo"
        defaultChecked={true}
        disabled={false}
        required={false}
        name="ui-checkbox"
        value="enabled"
        className={rootClassName}
        style={rootStyle}
      />
      <Label htmlFor="checkbox-demo">Enable notifications</Label>
    </div>
  );
}

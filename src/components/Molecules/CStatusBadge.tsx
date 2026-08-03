import { CChip } from '../Atoms/CChip';
import { CircleCheck, CircleAlert, TriangleAlert } from '@/components/Icons';

interface CStatusBadgeProps {
  status: 'OK' | 'Error' | 'Warning' | string;
  showIcon?: boolean;
}

export const CStatusBadge = ({ status, showIcon = true }: CStatusBadgeProps) => {
  let tone: 'blue' | 'orange' | 'gray' = 'gray';
  let icon = undefined;
  let label = status;

  if (status === 'OK') {
    tone = 'blue';
    icon = <CircleCheck size={14} strokeWidth={2} />;
    label = 'Success';
  } else if (status === 'Error') {
    tone = 'orange';
    icon = <CircleAlert size={14} strokeWidth={2} />;
    label = 'Error';
  } else if (status === 'Warning') {
    tone = 'orange';
    icon = <TriangleAlert size={14} strokeWidth={2} />;
    label = 'Warning';
  }

  return (
    <CChip
      label={label}
      tone={tone}
      icon={showIcon && icon ? icon : undefined}
    />
  );
};

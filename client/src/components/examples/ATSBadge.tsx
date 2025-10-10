import { ATSBadge } from "../ATSBadge";

export default function ATSBadgeExample() {
  return (
    <div className="flex gap-4">
      <ATSBadge passed={true} score={92} />
      <ATSBadge passed={false} score={45} />
    </div>
  );
}

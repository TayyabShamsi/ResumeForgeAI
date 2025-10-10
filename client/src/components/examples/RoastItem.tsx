import { RoastItem } from "../RoastItem";

export default function RoastItemExample() {
  return (
    <div className="space-y-4 max-w-2xl">
      <RoastItem
        type="criticism"
        text="Your bullet points read like a grocery list, not accomplishments"
        explanation="Use action verbs and quantify your impact. 'Led team' is weak, 'Led 5-person team to 40% revenue increase' is powerful."
      />
      <RoastItem
        type="strength"
        text="Strong quantifiable achievements in the experience section"
        explanation="Great use of metrics and specific numbers to demonstrate impact."
      />
    </div>
  );
}

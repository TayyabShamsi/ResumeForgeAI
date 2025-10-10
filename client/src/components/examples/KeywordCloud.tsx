import { KeywordCloud } from "../KeywordCloud";

export default function KeywordCloudExample() {
  const keywords = [
    "Leadership",
    "Agile",
    "Data Analysis",
    "Problem Solving",
    "Communication",
    "Project Management",
    "Stakeholder Management",
  ];

  return <KeywordCloud keywords={keywords} />;
}

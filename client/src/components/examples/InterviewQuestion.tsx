import { InterviewQuestion } from "../InterviewQuestion";

export default function InterviewQuestionExample() {
  return (
    <div className="space-y-4 max-w-3xl">
      <InterviewQuestion
        category="Behavioral"
        question="Tell me about a time when you had to deal with a difficult stakeholder or client."
        reason="They want to assess your communication skills, conflict resolution abilities, and professionalism under pressure."
        sampleAnswer="In my previous role as a Product Manager, I worked with a stakeholder who was resistant to our new feature prioritization. I scheduled a one-on-one meeting to understand their concerns, shared data showing user impact, and collaboratively revised the roadmap to address their key business needs while maintaining our product vision. This resulted in their full support and a 30% faster feature adoption rate."
        talkingPoints={[
          "Start with the specific situation and stakeholder",
          "Explain the challenge or conflict clearly",
          "Describe your approach to resolution",
          "Quantify the positive outcome",
        ]}
      />
      <InterviewQuestion
        category="Technical"
        question="How would you optimize a slow-performing database query?"
        reason="Testing your technical problem-solving skills and understanding of database performance optimization."
        sampleAnswer="I would start by analyzing the query execution plan to identify bottlenecks. Common optimizations include: adding appropriate indexes, reviewing JOIN operations, optimizing WHERE clauses, and considering query result caching. I'd also check for N+1 query problems and consider database-specific features like materialized views or partitioning for large datasets."
        talkingPoints={[
          "Mention profiling and analysis tools",
          "Discuss indexing strategies",
          "Reference specific optimization techniques",
          "Include monitoring and testing approach",
        ]}
      />
    </div>
  );
}

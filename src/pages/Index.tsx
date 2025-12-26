import { useState } from "react";
import { LandingPage } from "@/components/CloudRecommendation/LandingPage";
import { QuestionnaireFlow } from "@/components/CloudRecommendation/QuestionnaireFlow";
import { RecommendationResults } from "@/components/CloudRecommendation/RecommendationResults";

type AppState = "landing" | "questionnaire" | "results";

interface Answer {
  questionId: string;
  answer: string | string[];
}

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>("landing");
  const [answers, setAnswers] = useState<Answer[]>([]);

  const handleStartQuestionnaire = () => {
    setCurrentState("questionnaire");
  };

  const handleQuestionnaireComplete = (questionnaireAnswers: Answer[]) => {
    setAnswers(questionnaireAnswers);
    setCurrentState("results");
  };

  const handleBackToQuestionnaire = () => {
    setCurrentState("questionnaire");
  };

  const handleStartOver = () => {
    setAnswers([]);
    setCurrentState("landing");
  };

  switch (currentState) {
    case "landing":
      return <LandingPage onStartQuestionnaire={handleStartQuestionnaire} />;
    
    case "questionnaire":
      return (
        <QuestionnaireFlow 
          onComplete={handleQuestionnaireComplete}
          onBack={handleStartOver}
        />
      );
    
    case "results":
      return (
        <RecommendationResults 
          answers={answers}
          onBack={handleBackToQuestionnaire}
          onStartOver={handleStartOver}
        />
      );
    
    default:
      return <LandingPage onStartQuestionnaire={handleStartQuestionnaire} />;
  }
};

export default Index;

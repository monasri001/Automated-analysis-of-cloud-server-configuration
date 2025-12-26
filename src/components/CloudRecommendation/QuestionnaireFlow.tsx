import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

interface Answer {
  questionId: string;
  answer: string | string[];
}

interface QuestionnaireFlowProps {
  onComplete: (answers: Answer[]) => void;
  onBack: () => void;
}

export function QuestionnaireFlow({ onComplete, onBack }: QuestionnaireFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);

  // Question configuration
  const initialQuestions = [
    {
      id: "workload_type",
      question: "What type of workload will you be running?",
      type: "single",
      options: [
        { id: "web", label: "Web Application", description: "Frontend/backend web services" },
        { id: "ml", label: "Machine Learning", description: "AI/ML training and inference" },
        { id: "batch", label: "Batch Processing", description: "Data processing jobs" },
        { id: "microservices", label: "Microservices", description: "Distributed application architecture" },
        { id: "enterprise", label: "Enterprise Application", description: "Large-scale business applications" }
      ]
    },
    {
      id: "services",
      question: "Which cloud services do you need?",
      type: "multiple",
      options: [
        { id: "compute", label: "Compute", description: "Virtual machines and containers" },
        { id: "storage", label: "Storage", description: "Data storage solutions" },
        { id: "database", label: "Database", description: "Managed database services" },
        { id: "networking", label: "Networking", description: "CDN and load balancing" },
        { id: "security", label: "Security", description: "Identity and access management" },
        { id: "monitoring", label: "Monitoring", description: "Performance and logging" }
      ]
    },
    {
      id: "providers",
      question: "Which cloud providers do you prefer?",
      type: "multiple",
      options: [
        { id: "aws", label: "Amazon Web Services", description: "Most comprehensive service offering" },
        { id: "azure", label: "Microsoft Azure", description: "Best integration with Microsoft tools" },
        { id: "gcp", label: "Google Cloud Platform", description: "Strong in AI/ML and data analytics" },
        { id: "all", label: "No Preference", description: "Show me the best options from all providers" }
      ]
    }
  ];

  // Dynamic questions based on selected services
  const serviceQuestions = {
    compute: [
      {
        id: "compute_workload",
        question: "What type of compute workload?",
        type: "single",
        options: [
          { id: "web", label: "Web/API Server", description: "HTTP/REST API services" },
          { id: "ml", label: "ML Training", description: "Machine learning model training" },
          { id: "batch", label: "Batch Processing", description: "Scheduled data processing" }
        ]
      },
      {
        id: "compute_traffic",
        question: "Expected traffic load?",
        type: "single",
        options: [
          { id: "low", label: "Low", description: "< 1000 requests/day" },
          { id: "medium", label: "Medium", description: "1K - 100K requests/day" },
          { id: "high", label: "High", description: "> 100K requests/day" }
        ]
      },
      {
        id: "compute_gpu",
        question: "Do you need GPU acceleration?",
        type: "single",
        options: [
          { id: "yes", label: "Yes", description: "GPU-intensive workloads" },
          { id: "no", label: "No", description: "CPU-only workloads" }
        ]
      }
    ],
    storage: [
      {
        id: "storage_access",
        question: "How often will you access the data?",
        type: "single",
        options: [
          { id: "hot", label: "Hot", description: "Frequent access (daily)" },
          { id: "warm", label: "Warm", description: "Occasional access (weekly)" },
          { id: "cold", label: "Cold", description: "Rare access (monthly)" }
        ]
      },
      {
        id: "storage_size",
        question: "How much storage do you need?",
        type: "single",
        options: [
          { id: "small", label: "< 100 GB", description: "Small datasets" },
          { id: "medium", label: "100 GB - 10 TB", description: "Medium datasets" },
          { id: "large", label: "> 10 TB", description: "Large datasets" }
        ]
      }
    ],
    database: [
      {
        id: "db_type",
        question: "Which type of database?",
        type: "single",
        options: [
          { id: "sql", label: "SQL Database", description: "Relational database (MySQL, PostgreSQL)" },
          { id: "nosql", label: "NoSQL Database", description: "Document/Key-value store (MongoDB, DynamoDB)" }
        ]
      },
      {
        id: "db_workload",
        question: "Database workload type?",
        type: "single",
        options: [
          { id: "oltp", label: "OLTP", description: "Online transaction processing" },
          { id: "olap", label: "OLAP", description: "Online analytical processing" }
        ]
      }
    ],
    networking: [
      {
        id: "network_latency",
        question: "Latency sensitivity?",
        type: "single",
        options: [
          { id: "low", label: "Low Sensitivity", description: "Can tolerate higher latency" },
          { id: "medium", label: "Medium Sensitivity", description: "Moderate latency requirements" },
          { id: "high", label: "High Sensitivity", description: "Ultra-low latency required" }
        ]
      },
      {
        id: "network_cdn",
        question: "Need Content Delivery Network?",
        type: "single",
        options: [
          { id: "yes", label: "Yes", description: "Global content distribution" },
          { id: "no", label: "No", description: "Single region deployment" }
        ]
      }
    ],
    security: [
      {
        id: "security_compliance",
        question: "Compliance requirements?",
        type: "multiple",
        options: [
          { id: "hipaa", label: "HIPAA", description: "Healthcare data protection" },
          { id: "gdpr", label: "GDPR", description: "EU data protection regulation" },
          { id: "soc2", label: "SOC 2", description: "Security and availability standards" },
          { id: "none", label: "None", description: "No specific compliance needed" }
        ]
      }
    ],
    monitoring: [
      {
        id: "monitoring_metrics",
        question: "What metrics do you want to track?",
        type: "multiple",
        options: [
          { id: "performance", label: "Performance", description: "CPU, memory, disk I/O" },
          { id: "availability", label: "Availability", description: "Uptime and health checks" },
          { id: "costs", label: "Costs", description: "Spending and budget alerts" },
          { id: "security", label: "Security", description: "Security events and threats" }
        ]
      }
    ]
  };

  const [dynamicQuestions, setDynamicQuestions] = useState<any[]>([]);
  const totalSteps = initialQuestions.length + dynamicQuestions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  useEffect(() => {
    // Generate dynamic questions based on selected services
    if (selectedServices.length > 0) {
      const newDynamicQuestions: any[] = [];
      selectedServices.forEach(service => {
        if (serviceQuestions[service as keyof typeof serviceQuestions]) {
          newDynamicQuestions.push(...serviceQuestions[service as keyof typeof serviceQuestions]);
        }
      });
      setDynamicQuestions(newDynamicQuestions);
    }
  }, [selectedServices]);

  const allQuestions = [...initialQuestions, ...dynamicQuestions];
  const currentQuestion = allQuestions[currentStep];

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    const updatedAnswers = answers.filter(a => a.questionId !== questionId);
    updatedAnswers.push({ questionId, answer });
    setAnswers(updatedAnswers);

    // Handle special cases
    if (questionId === "services") {
      setSelectedServices(Array.isArray(answer) ? answer : [answer]);
    }
    if (questionId === "providers") {
      setSelectedProviders(Array.isArray(answer) ? answer : [answer]);
    }
  };

  const getCurrentAnswer = (questionId: string) => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer?.answer || (currentQuestion?.type === "multiple" ? [] : "");
  };

  const canProceed = () => {
    const currentAnswer = getCurrentAnswer(currentQuestion?.id);
    if (currentQuestion?.type === "multiple") {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    }
    return currentAnswer !== "";
  };

  const handleNext = () => {
    if (currentStep < allQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Cloud Service Assessment</h1>
          <Progress value={progress} className="max-w-md mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>

        {/* Question Card */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {currentQuestion.type === "single" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option: any) => (
                  <div
                    key={option.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      getCurrentAnswer(currentQuestion.id) === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleAnswer(currentQuestion.id, option.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{option.label}</h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {getCurrentAnswer(currentQuestion.id) === option.id && (
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option: any) => {
                  const currentAnswers = getCurrentAnswer(currentQuestion.id) as string[];
                  const isSelected = currentAnswers.includes(option.id);
                  
                  return (
                    <div
                      key={option.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        const currentAnswers = getCurrentAnswer(currentQuestion.id) as string[];
                        let newAnswers;
                        if (isSelected) {
                          newAnswers = currentAnswers.filter(a => a !== option.id);
                        } else {
                          newAnswers = [...currentAnswers, option.id];
                        }
                        handleAnswer(currentQuestion.id, newAnswers);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{option.label}</h3>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected answers summary for multiple choice */}
            {currentQuestion.type === "multiple" && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-2">Selected:</p>
                <div className="flex flex-wrap gap-2">
                  {(getCurrentAnswer(currentQuestion.id) as string[]).map(answerId => {
                    const option = currentQuestion.options.find((opt: any) => opt.id === answerId);
                    return (
                      <Badge key={answerId} variant="secondary">
                        {option?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between max-w-4xl mx-auto mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep === 0 ? "Back to Home" : "Previous"}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            {currentStep === allQuestions.length - 1 ? "Get Recommendations" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
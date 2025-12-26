import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateScore, ServiceType, Inputs } from "./calculatescore";
import { ArrowLeft, Award, DollarSign, Cpu, HardDrive, Shield, TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Answer {
  questionId: string;
  answer: string | string[];
}

interface Recommendation {
  rank: number;
  instanceId: string;
  provider: string;
  instanceType: string;
  monthlyCost: string;
  cpu: string;
  ram: string;
  gpu: string;
  networkGbps: string;
  useCase: string;
  score: number;
  justification: string;
  compliance: string[];
}

interface RecommendationResultsProps {
  answers: Answer[];
  onBack: () => void;
  onStartOver: () => void;
}

export function RecommendationResults({ answers, onBack, onStartOver }: RecommendationResultsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string>("all");

  useEffect(() => {
    generateRecommendations();
  }, [answers]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Fetch cloud services and variants from Supabase
      const { data: services, error: servicesError } = await supabase.from('cloud_services').select('*');
      const { data: variants, error: variantsError } = await supabase.from('service_variants').select('*');

      if (servicesError || variantsError) {
        console.error('Error fetching data:', servicesError || variantsError);
        return;
      }

      // Filter services to only AWS, GCP, Azure
      const filteredServices = (services || []).filter(s => ["AWS", "GCP", "Azure"].includes(s.provider));
      const filteredVariants = (variants || []).filter(v => filteredServices.some(s => s.service_id === v.service_id));

      // Generate scored recommendations
      const scoredRecommendations = generateScoredRecommendations(filteredServices, filteredVariants);

      // Get top recommendation from each provider
      const topByProvider: Recommendation[] = [];
      ["AWS", "GCP", "Azure"].forEach(provider => {
        const top = scoredRecommendations
          .filter(r => r.provider === provider)
          .sort((a, b) => b.score - a.score)[0];
        if (top) topByProvider.push(top);
      });

      // Rank recommendations
      topByProvider.sort((a, b) => b.score - a.score).forEach((rec, idx) => (rec.rank = idx + 1));

      setRecommendations(topByProvider);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const inputs: Inputs = {
  workload: 80,
  tps: 50,
  responseTime: 30,
  };

  const score = calculateScore("Compute" as ServiceType, inputs);

  const generateScoredRecommendations = (services: any[], variants: any[]): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    const workloadType = getAnswer('workload_type') as string;
    const selectedServices = getAnswer('services') as string[] || [];
    const selectedProviders = getAnswer('providers') as string[] || [];
    const traffic = getAnswer('compute_traffic') as string;
    const needsGpu = getAnswer('compute_gpu') as string;

    variants.forEach(variant => {
      const service = services.find(s => s.service_id === variant.service_id);
      if (!service) return;

      let score = 0;
      let justification: string[] = [];
      let compliance: string[] = [];

      // Workload scoring
      if (workloadType === 'web' && service.category === 'Compute') {
        score += 30; justification.push('Optimized for web applications');
      }
      if (workloadType === 'ml' && variant.gpu && variant.gpu !== 'None') {
        score += 40; justification.push('GPU acceleration for ML workloads');
      }
      if (workloadType === 'batch' && service.category === 'Compute') {
        score += 25; justification.push('Suitable for batch processing');
      }

      // Service category matching
      if (selectedServices.includes('compute') && service.category === 'Compute') score += 25;
      if (selectedServices.includes('storage') && service.category === 'Storage') score += 25;
      if (selectedServices.includes('database') && service.category === 'Database') score += 25;

      // Provider preference
      if (selectedProviders.includes('all') || selectedProviders.includes(service.provider.toLowerCase())) score += 20;

      // Traffic scoring
      if (traffic === 'high' && variant.vcpu && parseInt(variant.vcpu) >= 8) { score += 20; justification.push('High CPU count for high traffic'); }
      if (traffic === 'low' && variant.vcpu && parseInt(variant.vcpu) <= 4) { score += 15; justification.push('Cost-effective for low traffic'); }

      // GPU requirements
      if (needsGpu === 'yes' && variant.gpu && variant.gpu !== 'None') { score += 35; justification.push('GPU available'); }
      if (needsGpu === 'no' && (!variant.gpu || variant.gpu === 'None')) { score += 10; justification.push('No unnecessary GPU'); }

      // Cost efficiency
      const pricePerHour = parseFloat(variant.price_per_hr || '0');
      if (pricePerHour > 0 && pricePerHour < 1) score += 15;

      // Compliance
      if (variant.use_case?.includes('Enterprise')) compliance.push('SOC 2', 'GDPR');
      if (variant.use_case?.includes('High Performance')) compliance.push('Performance Certified');

      recommendations.push({
        rank: 0,
        instanceId: variant.variant_id.toString(),
        provider: service.provider,
        instanceType: variant.variant_name,
        monthlyCost: `$${(pricePerHour * 24 * 30).toFixed(2)}`,
        cpu: variant.vcpu || 'N/A',
        ram: variant.ram_gb ? `${variant.ram_gb}GB` : 'N/A',
        gpu: variant.gpu || 'None',
        networkGbps: variant.network_gbps || 'Standard',
        useCase: variant.use_case || 'General Purpose',
        score,
        justification: justification.join(', ') || 'Matches your requirements',
        compliance
      });
    });

    return recommendations;
  };

  const getAnswer = (questionId: string) => answers.find(a => a.questionId === questionId)?.answer;

  const filteredRecommendations = selectedProvider === "all"
    ? recommendations
    : recommendations.filter(rec => rec.provider.toLowerCase() === selectedProvider);

  const providers = ["AWS", "GCP", "Azure"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Analyzing Your Requirements</h3>
            <p className="text-muted-foreground mb-4">
              Our AI is processing your needs and generating personalized recommendations...
            </p>
            <Progress value={75} className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Your Cloud Recommendations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Based on your requirements, we've found the best cloud service configurations for your project
          </p>
        </div>

        {/* Provider Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={selectedProvider === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedProvider("all")}
            >
              All Providers
            </Button>
            {providers.map(provider => (
              <Button
                key={provider}
                variant={selectedProvider === provider.toLowerCase() ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedProvider(provider.toLowerCase())}
              >
                {provider}
              </Button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="recommendations" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">Top Recommendations</TabsTrigger>
            <TabsTrigger value="comparison">Detailed Comparison</TabsTrigger>
            <TabsTrigger value="analysis">Cost Analysis</TabsTrigger>
          </TabsList>

          {/* Top Recommendations */}
          <TabsContent value="recommendations" className="space-y-6">
            {filteredRecommendations.map((rec) => (
              <Card key={rec.instanceId} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Award className={`h-6 w-6 ${rec.rank === 1 ? 'text-yellow-500' : rec.rank === 2 ? 'text-gray-400' : rec.rank === 3 ? 'text-amber-600' : 'text-primary'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          #{rec.rank} - {rec.provider} {rec.instanceType}
                        </CardTitle>
                        <p className="text-muted-foreground">{rec.useCase}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{rec.monthlyCost}</div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{rec.cpu} vCPU</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{rec.ram} RAM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{rec.networkGbps} Network</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{rec.gpu !== 'None' ? rec.gpu : 'No GPU'}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Match Score</span>
                        <span className="text-sm text-muted-foreground">{rec.score}/100</span>
                      </div>
                      <Progress value={rec.score} className="h-2" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">{rec.justification}</p>
                    </div>

                    {rec.compliance.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {rec.compliance.map(comp => (
                          <Badge key={comp} variant="secondary" className="text-xs">
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Detailed Comparison */}
          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Detailed Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Rank</th>
                        <th className="text-left p-2">Provider</th>
                        <th className="text-left p-2">Instance</th>
                        <th className="text-left p-2">vCPU</th>
                        <th className="text-left p-2">RAM</th>
                        <th className="text-left p-2">GPU</th>
                        <th className="text-left p-2">Cost/Month</th>
                        <th className="text-left p-2">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecommendations.map((rec) => (
                        <tr key={rec.instanceId} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-bold">#{rec.rank}</td>
                          <td className="p-2">{rec.provider}</td>
                          <td className="p-2">{rec.instanceType}</td>
                          <td className="p-2">{rec.cpu}</td>
                          <td className="p-2">{rec.ram}</td>
                          <td className="p-2">{rec.gpu}</td>
                          <td className="p-2 font-semibold text-primary">{rec.monthlyCost}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Progress value={rec.score} className="h-2 w-16" />
                              <span className="text-xs">{rec.score}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Analysis */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredRecommendations.map((rec) => (
                      <div key={rec.instanceId} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{rec.provider} {rec.instanceType}</p>
                          <p className="text-sm text-muted-foreground">#{rec.rank} recommendation</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{rec.monthlyCost}</p>
                          <p className="text-xs text-muted-foreground">per month</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What-If Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-2">If you scale 2x:</h4>
                      <p className="text-sm text-muted-foreground">
                        Your top recommendation would cost approximately{' '}
                        <span className="font-semibold text-primary">
                          ${(parseFloat(filteredRecommendations[0]?.monthlyCost.replace('$', '') || '0') * 2).toFixed(2)}
                        </span>{' '}
                        per month with horizontal scaling.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-2">Cost Optimization Tip:</h4>
                      <p className="text-sm text-muted-foreground">
                        Consider reserved instances for a 30-40% discount if you plan to run this workload long-term.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-between max-w-7xl mx-auto mt-8">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Questions
          </Button>
          <Button onClick={onStartOver} className="flex items-center gap-2">
            Start New Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}

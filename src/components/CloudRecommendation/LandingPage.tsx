import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Server, Database, Shield, Network, Activity, ArrowRight } from "lucide-react";

interface LandingPageProps {
  onStartQuestionnaire: () => void;
}

export function LandingPage({ onStartQuestionnaire }: LandingPageProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const services = [
    { icon: Server, title: "Compute", description: "High-performance computing instances", color: "text-blue-400" },
    { icon: Database, title: "Storage", description: "Scalable and secure data storage", color: "text-green-400" },
    { icon: Network, title: "Networking", description: "Global content delivery network", color: "text-purple-400" },
    { icon: Database, title: "Database", description: "Managed database services", color: "text-yellow-400" },
    { icon: Shield, title: "Security", description: "Enterprise-grade security", color: "text-red-400" },
    { icon: Activity, title: "Monitoring", description: "Real-time performance insights", color: "text-cyan-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            {/* Floating Cloud Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <Cloud className="h-20 w-20 text-primary animate-float" />
                <div className="absolute inset-0 h-20 w-20 text-primary animate-pulse-glow opacity-30" />
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent">
                CloudFit Finder
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                A Cloud Service Configuration Recommendation System 
              </p>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"> 
                by- Team DO WHILE ! 
              </p>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"> 
                CKCET
              </p>
            </div>

            {/* Description */}
            <div className="max-w-4xl mx-auto space-y-6">
              <p className="text-lg text-muted-foreground">
                Get personalized cloud service recommendations based on your project requirements. 
                Our intelligent system analyzes your needs and suggests the best cloud configurations 
                from top providers.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  Adaptive Questionnaire
                </span>
                <span className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-400" />
                  Cost Optimization
                </span>
                <span className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-400" />
                  Multi-Provider Analysis
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Button 
                onClick={onStartQuestionnaire}
                size="lg"
                className="px-8 py-6 text-lg font-semibold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 animate-pulse-glow"
              >
                Start Your Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Cloud Services We Analyze
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our system evaluates multiple cloud service categories to provide comprehensive recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden transition-all duration-300 cursor-pointer group ${
                hoveredCard === index ? 'scale-105 shadow-2xl' : 'hover:scale-102 hover:shadow-xl'
              }`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity cloud-gradient`} />
              
              <CardHeader className="relative">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-muted ${service.color}`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative">
                <CardDescription className="text-base">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose CloudFit Finder?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">01</span>
              </div>
              <h3 className="text-xl font-semibold">Smart Analysis</h3>
              <p className="text-muted-foreground">
                Adaptive questionnaire that asks only relevant questions based on your selections
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">02</span>
              </div>
              <h3 className="text-xl font-semibold">Cost Optimization</h3>
              <p className="text-muted-foreground">
                Get the best price-performance ratio for your specific requirements
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">03</span>
              </div>
              <h3 className="text-xl font-semibold">Visual Reports</h3>
              <p className="text-muted-foreground">
                Comprehensive visual analysis with what-if scenarios and justifications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
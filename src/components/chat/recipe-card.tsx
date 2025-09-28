'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Recipe } from '@/lib/types';
import { Zap, Soup, Leaf, CookingPot, BarChart3, Loader2 } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  style?: string;
  onAnalyzeNutrition: () => void;
  onTransferStyle: (style: string) => void;
  onStartCooking: () => void;
}

const styleOptions = [
  { name: 'Quick', icon: Zap, hint: 'Make it faster' },
  { name: 'Healthy', icon: Leaf, hint: 'Make it healthier' },
  { name: 'Vegan', icon: Soup, hint: 'Make it vegan' },
];

const parseInstructions = (instructions: string) => {
    return instructions
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim()); // remove leading numbers
}

export default function RecipeCard({ recipe, style, onAnalyzeNutrition, onTransferStyle, onStartCooking }: RecipeCardProps) {
  const [loadingStyle, setLoadingStyle] = useState<string | null>(null);

  const handleStyleTransferClick = (style: string) => {
    setLoadingStyle(style);
    onTransferStyle(style);
    // Loading state will be managed by parent component re-render
  };
  
  const instructionSteps = parseInstructions(recipe.instructions);

  return (
    <div className="w-full max-w-2xl">
      <Card className="border-primary/20 bg-background/30 shadow-lg">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="font-headline text-xl sm:text-2xl lg:text-3xl font-bold text-primary flex flex-col sm:flex-row items-start justify-between gap-2">
            <span className="break-words">{recipe.recipeName}</span>
            {style && <Badge variant="secondary" className="text-xs sm:text-sm">{style}</Badge>}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">A delicious recipe generated just for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="font-bold font-headline text-lg sm:text-xl mb-2 sm:mb-3">Ingredients</h3>
            <ul className="list-disc list-inside space-y-1 sm:space-y-1.5 text-sm sm:text-base marker:text-primary">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="break-words">{ing}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold font-headline text-lg sm:text-xl mb-2 sm:mb-3">Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 sm:space-y-3 text-sm sm:text-base">
                {instructionSteps.map((step, i) => (
                    <li key={i} className="pl-2 marker:font-semibold marker:text-primary break-words leading-relaxed">{step}</li>
                ))}
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-2 pt-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={onStartCooking} size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                  <CookingPot className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Start Cooking
              </Button>
              <Button variant="outline" onClick={onAnalyzeNutrition} className="w-full sm:w-auto text-sm sm:text-base">
                  <BarChart3 className="mr-2 h-4 w-4" /> Analyze Nutrition
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-start">
                {styleOptions.map(opt => (
                    <Button 
                        key={opt.name} 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleStyleTransferClick(opt.name)}
                        disabled={!!loadingStyle}
                        title={opt.hint}
                        className="text-xs sm:text-sm flex-1 sm:flex-none min-w-0"
                    >
                        {loadingStyle === opt.name ? (
                            <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        ) : (
                            <opt.icon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                        <span className="truncate">{opt.name}</span>
                    </Button>
                ))}
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}

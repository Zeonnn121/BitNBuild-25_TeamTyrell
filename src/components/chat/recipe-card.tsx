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
        <CardHeader>
          <CardTitle className="font-headline text-3xl font-bold text-primary flex items-start justify-between">
            {recipe.recipeName}
            {style && <Badge variant="secondary">{style}</Badge>}
          </CardTitle>
          <CardDescription>A delicious recipe generated just for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-bold font-headline text-xl mb-3">Ingredients</h3>
            <ul className="list-disc list-inside space-y-1.5 text-sm marker:text-primary">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold font-headline text-xl mb-3">Instructions</h3>
            <ol className="list-decimal list-inside space-y-3">
                {instructionSteps.map((step, i) => (
                    <li key={i} className="pl-2 marker:font-semibold marker:text-primary">{step}</li>
                ))}
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
            <Button onClick={onStartCooking} size="lg">
                <CookingPot className="mr-2 h-5 w-5" /> Start Cooking
            </Button>
            <Button variant="outline" onClick={onAnalyzeNutrition}>
                <BarChart3 className="mr-2 h-4 w-4" /> Analyze Nutrition
            </Button>
            <div className="flex gap-2 pt-2 sm:pt-0">
                {styleOptions.map(opt => (
                    <Button 
                        key={opt.name} 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleStyleTransferClick(opt.name)}
                        disabled={!!loadingStyle}
                        title={opt.hint}
                    >
                        {loadingStyle === opt.name ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <opt.icon className="mr-2 h-4 w-4" />
                        )}
                        {opt.name}
                    </Button>
                ))}
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}

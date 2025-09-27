import type { GenerateRecipeFromImageOutput } from '@/ai/flows/generate-recipe-from-image';
import type { AnalyzeRecipeNutritionOutput } from '@/ai/flows/analyze-recipe-nutrition';

export type Recipe = GenerateRecipeFromImageOutput;
export type Nutrition = AnalyzeRecipeNutritionOutput;

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content?: React.ReactNode;
  image?: string;
  recipe?: Recipe;
  nutrition?: Nutrition;
  style?: string;
  isLoading?: boolean;
};

export type GenerateRecipeState = {
  recipe?: Recipe;
  error?: string;
  image?: string;
};

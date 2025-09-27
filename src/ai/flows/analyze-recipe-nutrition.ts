'use server';

/**
 * @fileOverview An AI agent that analyzes the nutritional information of a recipe.
 *
 * - analyzeRecipeNutrition - A function that analyzes the nutritional information of a recipe.
 * - AnalyzeRecipeNutritionInput - The input type for the analyzeRecipeNutrition function.
 * - AnalyzeRecipeNutritionOutput - The return type for the analyzeRecipeNutrition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRecipeNutritionInputSchema = z.object({
  recipeText: z.string().describe('The text of the recipe to analyze.'),
});
export type AnalyzeRecipeNutritionInput = z.infer<
  typeof AnalyzeRecipeNutritionInputSchema
>;

const AnalyzeRecipeNutritionOutputSchema = z.object({
  calories: z.number().describe('The total number of calories in the recipe.'),
  protein: z
    .number()
    .describe('The total amount of protein in grams in the recipe.'),
  fat: z.number().describe('The total amount of fat in grams in the recipe.'),
  carbohydrates: z
    .number()
    .describe('The total amount of carbohydrates in grams in the recipe.'),
  ingredients: z
    .array(z.string())
    .describe('A list of the ingredients in the recipe.'),
  servings: z
    .number()
    .optional()
    .describe('The number of servings the recipe makes.'),
});
export type AnalyzeRecipeNutritionOutput = z.infer<
  typeof AnalyzeRecipeNutritionOutputSchema
>;

export async function analyzeRecipeNutrition(
  input: AnalyzeRecipeNutritionInput
): Promise<AnalyzeRecipeNutritionOutput> {
  return analyzeRecipeNutritionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRecipeNutritionPrompt',
  input: {schema: AnalyzeRecipeNutritionInputSchema},
  output: {schema: AnalyzeRecipeNutritionOutputSchema},
  prompt: `You are a nutritional expert. Analyze the following recipe and extract the nutritional information, including calories, protein, fat, and carbohydrates, as well as ingredients, and servings.

Recipe:
{{recipeText}}

Output the nutritional information in JSON format. If servings cannot be determined, omit the servings field.
`,
});

const analyzeRecipeNutritionFlow = ai.defineFlow(
  {
    name: 'analyzeRecipeNutritionFlow',
    inputSchema: AnalyzeRecipeNutritionInputSchema,
    outputSchema: AnalyzeRecipeNutritionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

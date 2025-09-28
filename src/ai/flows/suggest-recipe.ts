'use server';

/**
 * @fileOverview A flow to suggest a random recipe.
 *
 * - suggestRecipe - A function that suggests a recipe.
 * - SuggestRecipeOutput - The return type for the suggestRecipe function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  ingredients: z.array(z.string()).describe('The list of ingredients.'),
  instructions: z.string().describe('The cooking instructions, formatted as a numbered list.'),
});
export type SuggestRecipeOutput = z.infer<typeof SuggestRecipeOutputSchema>;

export async function suggestRecipe(): Promise<SuggestRecipeOutput> {
  return suggestRecipeFlow();
}

const prompt = ai.definePrompt({
  name: 'suggestRecipePrompt',
  output: { schema: SuggestRecipeOutputSchema },
  prompt: `You are a creative chef.
Your task is to suggest a single, interesting, and delicious recipe.

The recipe can be of any style and from any cuisine.
Be creative! Don't suggest something boring like "Spaghetti Bolognese" or "Caesar Salad".
Surprise the user with something they might not have thought of.

Please create a recipe.
Provide the recipe name, a list of ingredients, and cooking instructions.
The instructions should be a numbered list of clear, concise steps.
Each step must be on a separate line. Do not use a single paragraph.
Use format like:
1. First step here
2. Second step here  
3. Third step here
Respond in markdown format.

Recipe name:
Ingredients:
Instructions:`,
});

const suggestRecipeFlow = ai.defineFlow(
  {
    name: 'suggestRecipeFlow',
    outputSchema: SuggestRecipeOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    return output!;
  }
);

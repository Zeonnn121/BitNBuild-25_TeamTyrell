'use server';

/**
 * @fileOverview A recipe style transfer AI agent.
 *
 * - transferRecipeStyle - A function that handles the recipe style transfer process.
 * - TransferRecipeStyleInput - The input type for the transferRecipeStyle function.
 * - TransferRecipeStyleOutput - The return type for the transferRecipeStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransferRecipeStyleInputSchema = z.object({
  recipe: z.string().describe('The original recipe to be transformed.'),
  targetStyle: z
    .string()
    .describe(
      'The desired style to transform the recipe into (e.g., Healthy, Quick, Vegan).'
    ),
});
export type TransferRecipeStyleInput = z.infer<typeof TransferRecipeStyleInputSchema>;

const TransferRecipeStyleOutputSchema = z.object({
  transformedRecipe: z
    .string()
    .describe('The recipe transformed to the specified style.'),
});
export type TransferRecipeStyleOutput = z.infer<typeof TransferRecipeStyleOutputSchema>;

export async function transferRecipeStyle(
  input: TransferRecipeStyleInput
): Promise<TransferRecipeStyleOutput> {
  return transferRecipeStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transferRecipeStylePrompt',
  input: {schema: TransferRecipeStyleInputSchema},
  output: {schema: TransferRecipeStyleOutputSchema},
  prompt: `You are a culinary expert specializing in adapting recipes to different styles.

You will take an original recipe and transform it into a new style, while maintaining the essence of the original recipe.

Original Recipe:
{{{recipe}}}

Target Style:
{{{targetStyle}}}

Transformed Recipe:`, // The model will continue from here
});

const transferRecipeStyleFlow = ai.defineFlow(
  {
    name: 'transferRecipeStyleFlow',
    inputSchema: TransferRecipeStyleInputSchema,
    outputSchema: TransferRecipeStyleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

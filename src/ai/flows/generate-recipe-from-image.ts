'use server';

/**
 * @fileOverview Generates a recipe based on an image of ingredients.
 *
 * - generateRecipeFromImage - A function that handles the recipe generation process from an image.
 * - GenerateRecipeFromImageInput - The input type for the generateRecipeFromImage function.
 * - GenerateRecipeFromImageOutput - The return type for the generateRecipeFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  text: z.string().optional().describe('A text description of ingredients or a desired dish.'),
  skillLevel: z.string().optional().describe('The cooking skill level of the user (e.g., Beginner, Intermediate, Expert).'),
  styles: z.array(z.string()).optional().describe('An array of desired recipe styles (e.g., Quick, Healthy, Vegan).'),
});
export type GenerateRecipeFromImageInput = z.infer<
  typeof GenerateRecipeFromImageInputSchema
>;

const GenerateRecipeFromImageOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  ingredients: z.array(z.string()).describe('The list of ingredients.'),
  instructions: z.string().describe('The cooking instructions, formatted as a numbered list.'),
});
export type GenerateRecipeFromImageOutput = z.infer<
  typeof GenerateRecipeFromImageOutputSchema
>;

export async function generateRecipeFromImage(
  input: GenerateRecipeFromImageInput
): Promise<GenerateRecipeFromImageOutput> {
  return generateRecipeFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipeFromImagePrompt',
  input: {schema: GenerateRecipeFromImageInputSchema},
  output: {schema: GenerateRecipeFromImageOutputSchema},
  prompt: `You are a professional chef. Your task is to create a recipe based on the provided information.

Consider the user's cooking skill level: {{{skillLevel}}}.
The user is also interested in the following styles: {{#if styles}}{{#each styles}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}any style{{/if}}.

Generate a recipe using the ingredients from the text and/or image provided.
If both text and an image are provided, prioritize the text but use the image for context if helpful.

{{#if text}}
User's request: {{{text}}}
{{/if}}

{{#if imageDataUri}}
Image of ingredients: {{media url=imageDataUri}}
{{/if}}

Please create a recipe that matches these criteria.
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

const generateRecipeFromImageFlow = ai.defineFlow(
  {
    name: 'generateRecipeFromImageFlow',
    inputSchema: GenerateRecipeFromImageInputSchema,
    outputSchema: GenerateRecipeFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';

import { generateRecipeFromImage } from '@/ai/flows/generate-recipe-from-image';
import { transferRecipeStyle } from '@/ai/flows/transfer-recipe-style';
import { analyzeRecipeNutrition } from '@/ai/flows/analyze-recipe-nutrition';
import { suggestRecipe } from '@/ai/flows/suggest-recipe';
import { z } from 'zod';
import { type Recipe, type Nutrition, type GenerateRecipeState } from './types';

// Helper function to convert file to data URI
async function fileToDataUri(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

const generateRecipeSchema = z.object({
  image: z.instanceof(File).optional(),
  text: z.string().optional(),
  skillLevel: z.string().optional(),
  styles: z.preprocess((val) => (Array.isArray(val) ? val : [val].filter(Boolean)), z.array(z.string()).optional()),
});

export async function generateRecipeAction(
  prevState: GenerateRecipeState,
  formData: FormData
): Promise<GenerateRecipeState> {
  const validatedFields = generateRecipeSchema.safeParse({
    image: formData.get('image') || undefined,
    text: formData.get('text') || undefined,
    skillLevel: formData.get('skillLevel') || 'Intermediate',
    styles: formData.getAll('styles'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid input.' };
  }

  const { image, text, skillLevel, styles } = validatedFields.data;

  if ((!image || image.size === 0) && !text) {
    return { error: 'Please upload an image or provide a text description.' };
  }

  try {
    const imageDataUri = image && image.size > 0 ? await fileToDataUri(image) : undefined;
    const recipe = await generateRecipeFromImage({ imageDataUri, text, skillLevel, styles });
    return { recipe, image: imageDataUri };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate recipe. Our chef is busy, please try again later.' };
  }
}

export async function suggestRecipeAction(): Promise<{
  recipe?: Recipe;
  error?: string;
}> {
  try {
    const recipe = await suggestRecipe();
    return { recipe };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to suggest a recipe. Please try again.' };
  }
}

export async function analyzeNutritionAction(recipeText: string): Promise<{
  nutrition?: Nutrition;
  error?: string;
}> {
  if (!recipeText) {
    return { error: 'No recipe text provided for analysis.' };
  }
  try {
    const nutrition = await analyzeRecipeNutrition({ recipeText });
    return { nutrition };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to analyze nutrition. Please try again.' };
  }
}

export async function transferStyleAction(recipe: string, targetStyle: string): Promise<{
  transformedRecipe?: Recipe;
  error?: string;
}> {
  if (!recipe || !targetStyle) {
    return { error: 'Missing recipe or target style for transformation.' };
  }

  try {
    const { transformedRecipe } = await transferRecipeStyle({ recipe, targetStyle });

    // The AI returns a single string. We need to parse it into our Recipe structure.
    // This is a simplified parser; a more robust solution might be needed.
    const lines = transformedRecipe.split('\n');
    const recipeName = lines.find(line => line.startsWith('Recipe Name:'))?.replace('Recipe Name:', '').trim() ||
                       lines.find(line => line.startsWith('# '))?.replace('# ', '').trim() ||
                       'Transformed Recipe';
    
    const ingredientsIndex = lines.findIndex(line => line.toLowerCase().includes('ingredients'));
    const instructionsIndex = lines.findIndex(line => line.toLowerCase().includes('instructions'));

    let ingredients: string[] = [];
    if (ingredientsIndex !== -1) {
      const ingredientsBlock = lines.slice(ingredientsIndex + 1, instructionsIndex !== -1 ? instructionsIndex : undefined);
      ingredients = ingredientsBlock.map(line => line.replace(/^-|^\*|\d+\.\s/g, '').trim()).filter(Boolean);
    }
    
    let instructions = '';
    if (instructionsIndex !== -1) {
      instructions = lines.slice(instructionsIndex + 1).join('\n').trim();
    } else {
      // If no 'Instructions' heading, assume everything after ingredients is instructions
      instructions = lines.slice(ingredientsIndex + ingredients.length + 2).join('\n').trim();
    }

    if(ingredients.length === 0 && instructions === '') {
        // Fallback if parsing fails
        instructions = transformedRecipe;
    }

    return {
      transformedRecipe: {
        recipeName,
        ingredients,
        instructions
      }
    };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to transform recipe style. Please try again.' };
  }
}

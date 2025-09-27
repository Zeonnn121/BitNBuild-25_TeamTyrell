import { config } from 'dotenv';
config();

import '@/ai/flows/generate-recipe-from-image.ts';
import '@/ai/flows/analyze-recipe-nutrition.ts';
import '@/ai/flows/transfer-recipe-style.ts';
import '@/ai/flows/suggest-recipe.ts';

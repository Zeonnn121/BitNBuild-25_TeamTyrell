'use client';

import { useEffect, useRef, useState, useActionState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Message, Recipe, Nutrition, GenerateRecipeState } from '@/lib/types';
import { generateRecipeAction, analyzeNutritionAction, transferStyleAction, suggestRecipeAction } from '@/lib/actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './chat-message';
import ChatInput from './chat-input';
import { nanoid } from 'nanoid';
import CoPilotMode from '../copilot/copilot-mode';

const initialState: GenerateRecipeState = {};

const initialMessage: Message = {
  id: 'init',
  role: 'assistant',
  content: (
    <div className="space-y-4 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-primary font-headline tracking-tight">
        Hello, I&apos;m GourmetNet
      </h1>
      <p className="text-lg text-muted-foreground">
        How can I help you in the kitchen today?
      </p>
    </div>
  ),
};

interface ChatInterfaceProps {
  messages: Message[];
  onMessagesUpdate: (messages: Message[]) => void;
}

export default function ChatInterface({ messages: initialMessages = [], onMessagesUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [formState, formAction] = useActionState(generateRecipeAction, initialState);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [view, setView] = useState<'chat' | 'copilot'>('chat');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Sync messages with parent
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Helper function to update messages and sync with parent
  const updateMessages = useCallback((updater: (prev: Message[]) => Message[]) => {
    setMessages(prev => {
      const newMessages = updater(prev);
      onMessagesUpdate(newMessages);
      return newMessages;
    });
  }, [onMessagesUpdate]);

  const setMessagesAndSync = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
    onMessagesUpdate(newMessages);
  }, [onMessagesUpdate]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, view]);

  useEffect(() => {
    if (formState.error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: formState.error,
      });
      updateMessages((prev) => prev.filter((msg) => !msg.isLoading));
    }
    if (formState.recipe) { // image is not needed here
      updateMessages((prev) =>
        prev.map((msg) =>
          msg.isLoading
            ? {
                id: msg.id,
                role: 'assistant',
                recipe: formState.recipe,
              }
            : msg
        )
      );
      formRef.current?.reset();
    }
  }, [formState, toast, updateMessages]);

  const handleFormSubmit = (formData: FormData) => {
    const image = formData.get('image') as File;
    const text = formData.get('text') as string;

    if ((!image || image.size === 0) && !text) {
      toast({
        variant: 'destructive',
        title: 'No input provided',
        description: 'Please upload an image or enter some text.',
      });
      return;
    }

    const imagePreviewUrl = image && image.size > 0 ? URL.createObjectURL(image) : undefined;
    const userMessage = text || 'Uploaded ingredients';

    const newMessages: Message[] = [
      ...messages,
      { id: nanoid(), role: 'user' as const, content: userMessage, image: imagePreviewUrl },
      { id: nanoid(), role: 'assistant' as const, isLoading: true },
    ];
    
    setMessagesAndSync(newMessages);
  };
  
  const handleSuggest = async () => {
    setIsSuggesting(true);
    const id = nanoid();
    updateMessages((prev) => [...prev, { id: nanoid(), role: 'user' as const, content: "Suggest a recipe" }, { id, role: 'assistant' as const, isLoading: true, content: 'Thinking of a suggestion...' }]);
    
    const result = await suggestRecipeAction();

    if(result.error || !result.recipe) {
        toast({ variant: 'destructive', title: 'Suggestion Failed', description: result.error });
        updateMessages(prev => prev.filter(msg => msg.id !== id));
    } else {
        updateMessages(prev => prev.map(msg => msg.id === id ? { ...msg, isLoading: false, recipe: result.recipe, content: "Here's a delicious idea for you:" } : msg));
    }
    setIsSuggesting(false);
  };

  const handleNutritionAnalysis = async (recipe: Recipe) => {
    const recipeText = `Recipe: ${recipe.recipeName}\n\nIngredients:\n${recipe.ingredients.join('\n')}\n\nInstructions:\n${recipe.instructions}`;
    const id = nanoid();
    updateMessages((prev) => [...prev, { id, role: 'assistant' as const, isLoading: true, content: `Analyzing nutrition for ${recipe.recipeName}...` }]);
    
    const result = await analyzeNutritionAction(recipeText);

    if(result.error || !result.nutrition) {
        toast({ variant: 'destructive', title: 'Analysis Failed', description: result.error });
        updateMessages(prev => prev.filter(msg => msg.id !== id));
    } else {
        updateMessages(prev => prev.map(msg => msg.id === id ? { ...msg, isLoading: false, nutrition: result.nutrition, content: `Here is the nutritional analysis for ${recipe.recipeName}:` } : msg));
    }
  };

  const handleStyleTransfer = async (recipe: Recipe, style: string) => {
    const recipeText = `Recipe Name: ${recipe.recipeName}\n\nIngredients:\n${recipe.ingredients.map(i => `- ${i}`).join('\n')}\n\nInstructions:\n${recipe.instructions}`;
    const id = nanoid();
    updateMessages((prev) => [...prev, { id, role: 'assistant' as const, isLoading: true, content: `Transforming to a ${style} style...` }]);
    
    const result = await transferStyleAction(recipeText, style);

    if(result.error || !result.transformedRecipe) {
        toast({ variant: 'destructive', title: 'Transformation Failed', description: result.error });
        updateMessages(prev => prev.filter(msg => msg.id !== id));
    } else {
        updateMessages(prev => prev.map(msg => msg.id === id ? { ...msg, isLoading: false, recipe: result.transformedRecipe, content: `Here is the ${style} version of ${recipe.recipeName}:`, style } : msg));
    }
  };
  
  const handleStartCooking = (recipe: Recipe) => {
    setActiveRecipe(recipe);
    setView('copilot');
  }

  const handleExitCooking = () => {
    setActiveRecipe(null);
    setView('chat');
  }
  
  if(view === 'copilot' && activeRecipe) {
    return <CoPilotMode recipe={activeRecipe} onExit={handleExitCooking} />
  }

  // Initial centered state when no messages
  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-3xl space-y-6 sm:space-y-8">
          {/* Centered initial message */}
          <div className="text-center space-y-3 sm:space-y-4 px-2">
            <ChatMessage message={initialMessage} onAnalyzeNutrition={()=>{}} onTransferStyle={()=>{}} onStartCooking={()=>{}} />
          </div>
          
          {/* Centered input */}
          <div className="w-full px-2 sm:px-0">
            <ChatInput 
              formRef={formRef}
              onFormSubmit={handleFormSubmit} 
              onSuggest={handleSuggest} 
              isSuggesting={isSuggesting}
              formAction={formAction}
            />
          </div>
        </div>
      </div>
    );
  }

  // Normal chat layout after messages exist
  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-2 sm:p-4" ref={scrollAreaRef}>
        <div className="space-y-4 sm:space-y-8 max-w-3xl mx-auto py-4 sm:py-8">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onAnalyzeNutrition={handleNutritionAnalysis}
              onTransferStyle={handleStyleTransfer}
              onStartCooking={handleStartCooking}
            />
          ))}
        </div>
      </ScrollArea>
      <div className="border-t bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto p-2 sm:p-4">
          <ChatInput 
            formRef={formRef}
            onFormSubmit={handleFormSubmit} 
            onSuggest={handleSuggest} 
            isSuggesting={isSuggesting}
            formAction={formAction}
          />
        </div>
      </div>
    </div>
  );
}

    
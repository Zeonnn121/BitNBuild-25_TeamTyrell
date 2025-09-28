import type { Message, Recipe } from '@/lib/types';
import { Avatar } from '@/components/ui/avatar';
import Image from 'next/image';
import { Utensils, User } from 'lucide-react';
import RecipeCard from './recipe-card';
import NutritionChart from './nutrition-chart';
import { Spinner } from '../ui/spinner';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';

interface ChatMessageProps {
  message: Message;
  onAnalyzeNutrition: (recipe: Recipe) => void;
  onTransferStyle: (recipe: Recipe, style: string) => void;
  onStartCooking: (recipe: Recipe) => void;
}

// Function to format instructions with proper line breaks for numbered lists
function formatInstructions(content: React.ReactNode) {
  if (!content || typeof content !== 'string') return content;
  
  // Check if content contains numbered instructions (patterns like "1.", "2.", etc.)
  const hasNumberedList = /\d+\.\s/.test(content);
  
  // Check for other instruction patterns like bullet points or step indicators
  const hasBulletPoints = /•|\*\s|\-\s/.test(content);
  const hasStepWords = /\b(step|instruction|first|second|third|next|then|finally)\b/i.test(content);
  
  if (!hasNumberedList && !hasBulletPoints && !hasStepWords) {
    return content;
  }
  
  // Function to truncate long instructions while keeping key information
  const truncateInstruction = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    
    // Try to cut at a sentence boundary first
    const sentences = text.split(/[.!?]+/);
    let truncated = sentences[0];
    
    // If first sentence is still too long, cut at word boundary
    if (truncated.length > maxLength) {
      const words = truncated.split(' ');
      truncated = '';
      for (const word of words) {
        if ((truncated + ' ' + word).length > maxLength - 3) break;
        truncated += (truncated ? ' ' : '') + word;
      }
      truncated += '...';
    } else if (sentences.length > 1) {
      truncated += '.';
    }
    
    return truncated;
  };
  
  // Handle numbered lists
  if (hasNumberedList) {
    const parts = content.split(/(\d+\.\s)/);
    const formatted: React.ReactNode[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (/^\d+\.\s$/.test(part)) {
        // This is a number like "1. " or "2. "
        const nextPart = parts[i + 1];
        if (nextPart) {
          const truncatedContent = truncateInstruction(nextPart.trim());
          formatted.push(
            <div key={i} className="mb-2">
              <strong>{part}</strong>{truncatedContent}
            </div>
          );
          i++; // Skip the next part as we've already processed it
        }
      } else if (i === 0) {
        // This is content before the first numbered item
        formatted.push(<div key={i} className="mb-2">{part}</div>);
      }
    }
    
    return formatted.length > 0 ? formatted : content;
  }
  
  // Handle other instruction formats by splitting on sentence boundaries and common instruction words
  const sentences = content.split(/(?<=[.!?])\s+(?=[A-Z])|(?=\b(?:Step|Instruction|First|Second|Third|Next|Then|Finally)\b)/i);
  
  if (sentences.length > 1) {
    return sentences.map((sentence, index) => {
      const trimmed = sentence.trim();
      if (!trimmed) return null;
      
      const truncatedSentence = truncateInstruction(trimmed);
      return (
        <div key={index} className="mb-2">
          {truncatedSentence}
        </div>
      );
    }).filter(Boolean);
  }
  
  return content;
}

export default function ChatMessage({ message, onAnalyzeNutrition, onTransferStyle, onStartCooking }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isInitial = message.id === 'init';

  if (isInitial) {
    return (
        <div className="text-center">
            {message.content}
        </div>
    )
  }

  return (
    <div className={cn(
        "flex items-start gap-4", 
        isUser ? "justify-end" : "animate-in",
        isUser && "animate-in"
      )}
      style={{ '--duration': '500ms' } as React.CSSProperties}
    >
      {!isUser && (
        <Avatar className="w-10 h-10 border-2 border-primary/50 shrink-0">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
             <Utensils className="h-5 w-5" />
          </div>
        </Avatar>
      )}
      <div className={cn(
        "max-w-[85%] rounded-lg shadow-md",
        isUser
          ? "bg-primary text-primary-foreground rounded-br-none"
          : "bg-card text-card-foreground rounded-bl-none border",
        !message.image && "px-4 py-3"
      )}>
        {message.isLoading ? (
          <div className="flex items-center gap-2 px-4 py-3">
            <Spinner className="w-5 h-5" />
            <span className="text-sm text-muted-foreground animate-pulse">
                {message.content || 'Our chef is cooking...'}
            </span>
          </div>
        ) : message.image && message.content ? (
            <Card className="bg-transparent border-none shadow-none">
              <CardContent className="p-0 space-y-2">
                 <Image
                    src={message.image}
                    alt="User upload"
                    width={200}
                    height={200}
                    className="rounded-t-lg object-cover"
                  />
                  <p className='p-3'>{message.content}</p>
              </CardContent>
            </Card>
        ) : message.image ? (
          <Image
            src={message.image}
            alt="User upload"
            width={200}
            height={200}
            className="rounded-lg object-cover"
          />
        ) : message.recipe ? (
          <RecipeCard 
            recipe={message.recipe} 
            style={message.style}
            onAnalyzeNutrition={() => onAnalyzeNutrition(message.recipe!)}
            onTransferStyle={(style) => onTransferStyle(message.recipe!, style)}
            onStartCooking={() => onStartCooking(message.recipe!)}
          />
        ) : message.nutrition ? (
          <div className="space-y-2 p-2">
            <p>{message.content}</p>
            <NutritionChart nutrition={message.nutrition} />
          </div>
        ) : (
          <div className="prose prose-sm prose-p:leading-relaxed text-inherit max-w-none">
            {formatInstructions(message.content)}
          </div>
        )}
      </div>
      {isUser && (
        <Avatar className="w-10 h-10 border-2 border-muted-foreground/50 shrink-0">
           <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground">
             <User className="h-5 w-5" />
          </div>
        </Avatar>
      )}
    </div>
  );
}

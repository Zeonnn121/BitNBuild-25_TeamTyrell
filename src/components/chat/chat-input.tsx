'use client';

import { useState, useRef, type RefObject, DragEvent } from 'react';
import { Paperclip, Send, X, ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormStatus } from 'react-dom';
import { Spinner } from '../ui/spinner';
import Image from 'next/image';
import { Textarea } from '../ui/textarea';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ChefHat, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  formRef: RefObject<HTMLFormElement>;
  onFormSubmit: (formData: FormData) => void;
  onSuggest: () => void;
  isSuggesting: boolean;
  formAction: (payload: FormData) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending} aria-label="Send message" className="rounded-full w-10 h-10">
      {pending ? <Spinner /> : <Send />}
    </Button>
  );
}

const skillLevels = ["Beginner", "Intermediate", "Expert"];
const recipeStyles = ["Quick", "Healthy", "Vegan", "Gourmet"];

export default function ChatInput({ formRef, onFormSubmit, onSuggest, isSuggesting, formAction }: ChatInputProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Set the file on the file input so it gets submitted with the form
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = (formData: FormData) => {
    onFormSubmit(formData);
    handleRemoveImage();
    setText("");
    setIsDragging(false);
  }
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };


  return (
    <form ref={formRef} action={formAction} onSubmit={(e) => handleSubmit(new FormData(e.currentTarget))} className="relative space-y-3 sm:space-y-4">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Skill Level</span>
          </div>
          <ToggleGroup type="single" defaultValue="Intermediate" variant="outline" className="flex-wrap justify-start gap-1 sm:gap-2">
            {skillLevels.map(level => (
              <ToggleGroupItem key={level} value={level} aria-label={level} className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                {level}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <input type="hidden" name="skillLevel" value="Intermediate" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Recipe Style (optional)</span>
          </div>
          <ToggleGroup type="multiple" variant="outline" className="flex-wrap justify-start gap-1 sm:gap-2">
            {recipeStyles.map(style => (
              <ToggleGroupItem key={style} value={style} aria-label={style} className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                {style}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <input type="hidden" name="styles" value="" />
        </div>
      </div>

      <div 
        className={cn(
          "relative transition-all duration-300 rounded-2xl sm:rounded-full",
          isDragging && "ring-2 sm:ring-4 ring-primary/50 ring-offset-1 sm:ring-offset-2 ring-offset-background bg-primary/10"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
          {imagePreview && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-card rounded-lg border shadow-lg z-10">
              <div className="relative">
                <Image src={imagePreview} alt="Image preview" width={80} height={80} className="rounded-md object-cover w-16 h-16 sm:w-20 sm:h-20" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 rounded-full"
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          )}
          {isDragging && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl sm:rounded-full pointer-events-none">
                <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                <p className="font-bold text-primary text-sm sm:text-base">Drop image here</p>
            </div>
          )}
          <div className="relative flex w-full items-center">
            <div className="absolute left-2 sm:left-2.5 flex flex-col sm:flex-row items-start sm:items-center gap-1 z-10">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary rounded-full w-8 h-8 sm:w-10 sm:h-10"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach image"
              >
                {imagePreview ? <ImageIcon className="text-primary h-4 w-4 sm:h-5 sm:w-5"/> : <Paperclip className="h-4 w-4 sm:h-5 sm:w-5"/>}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary rounded-full w-8 h-8 sm:w-10 sm:h-10"
                onClick={onSuggest}
                disabled={isSuggesting}
                aria-label="Suggest a recipe"
              >
                {isSuggesting ? <Spinner className="h-4 w-4 sm:h-5 sm:w-5" /> : <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
            </div>
            <input
              type="file"
              name="image"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
            <Textarea
              name="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your ingredients, drag & drop an image, or ask for a suggestion..."
              className="w-full pl-16 sm:pl-[6.5rem] pr-12 sm:pr-14 py-2 sm:py-3 bg-card rounded-2xl sm:rounded-full border focus-within:ring-2 focus-within:ring-primary/50 shadow-sm resize-none min-h-[2.5rem] sm:h-12 flex items-center text-sm sm:text-base"
              rows={1}
            />
            <div className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2">
              <Button type="submit" size="icon" disabled={false} aria-label="Send message" className="rounded-full w-8 h-8 sm:w-10 sm:h-10">
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
      </div>
    </form>
  );
}

    
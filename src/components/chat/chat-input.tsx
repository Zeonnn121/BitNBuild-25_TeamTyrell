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
    <form ref={formRef} action={formAction} onSubmit={(e) => handleSubmit(new FormData(e.currentTarget))} className="relative space-y-4">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ChefHat className="w-5 h-5" />
              <span>Skill Level</span>
          </div>
          <ToggleGroup type="single" defaultValue="Intermediate" name="skillLevel" variant="outline" className="flex-wrap justify-start">
            {skillLevels.map(level => (
              <ToggleGroupItem key={level} value={level} aria-label={level}>
                {level}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Tag className="w-5 h-5" />
              <span>Recipe Style (optional)</span>
          </div>
          <ToggleGroup type="multiple" name="styles" variant="outline" className="flex-wrap justify-start">
            {recipeStyles.map(style => (
              <ToggleGroupItem key={style} value={style} aria-label={style}>
                {style}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div 
        className={cn(
          "relative transition-all duration-300 rounded-full",
          isDragging && "ring-4 ring-primary/50 ring-offset-2 ring-offset-background bg-primary/10"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
          {imagePreview && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-card rounded-lg border shadow-lg">
              <div className="relative">
                <Image src={imagePreview} alt="Image preview" width={80} height={80} className="rounded-md object-cover w-20 h-20" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {isDragging && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-full pointer-events-none">
                <ImageIcon className="w-12 h-12 text-primary" />
                <p className="font-bold text-primary">Drop image here</p>
            </div>
          )}
          <div className="relative flex w-full items-center">
            <div className="absolute left-2.5 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary rounded-full w-10 h-10"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach image"
              >
                {imagePreview ? <ImageIcon className="text-primary"/> : <Paperclip/>}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary rounded-full w-10 h-10"
                onClick={onSuggest}
                disabled={isSuggesting}
                aria-label="Suggest a recipe"
              >
                {isSuggesting ? <Spinner /> : <Sparkles />}
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
              className="w-full pl-[6.5rem] pr-14 py-3 bg-card rounded-full border focus-within:ring-2 focus-within:ring-primary/50 shadow-sm resize-none h-12 flex items-center"
              rows={1}
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              <SubmitButton />
            </div>
          </div>
      </div>
    </form>
  );
}

    
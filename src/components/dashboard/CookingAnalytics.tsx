'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface CookingStatsProps {
  stats: {
    totalRecipes: number;
    favoriteRecipes: number;
    cookingStreak: number;
    totalCookingTime: number;
    skillLevel: string;
    completedChallenges: number;
  };
}

export function FavoriteCuisines({ stats }: CookingStatsProps) {
  const cuisines = [
    { name: "Italian", percentage: 85, recipes: 43 },
    { name: "Asian", percentage: 70, recipes: 35 },
    { name: "Mediterranean", percentage: 60, recipes: 28 },
    { name: "Mexican", percentage: 45, recipes: 21 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Favorite Cuisines</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cuisines.map((cuisine, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{cuisine.name}</span>
              <span>{cuisine.recipes} recipes</span>
            </div>
            <Progress value={cuisine.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function WeeklyActivity() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week's Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {days.map((day, index) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-8 text-sm font-medium">{day}</div>
              <div className="flex-1 bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${Math.random() * 100}%` }}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.floor(Math.random() * 3) + 1} recipes
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
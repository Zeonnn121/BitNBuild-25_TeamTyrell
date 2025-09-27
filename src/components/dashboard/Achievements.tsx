'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChefHat, Zap, Heart, Users } from 'lucide-react';

const achievements = [
  { icon: ChefHat, title: "Master Chef", description: "Cooked 100+ recipes", unlocked: true },
  { icon: Zap, title: "Speed Cooker", description: "Completed 10 quick meals", unlocked: true },
  { icon: Heart, title: "Health Enthusiast", description: "Made 25 healthy recipes", unlocked: true },
  { icon: Users, title: "Party Planner", description: "Cooked for 50+ people", unlocked: false },
];

const weeklyGoals = [
  { title: "Try 3 new cuisines", progress: 67, current: 2, target: 3 },
  { title: "Cook 5 healthy meals", progress: 80, current: 4, target: 5 },
  { title: "Spend 10 hours cooking", progress: 45, current: 4.5, target: 10 }
];

export function AchievementsList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {achievements.map((achievement, index) => (
        <Card key={index} className={achievement.unlocked ? "" : "opacity-50"}>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className={`p-2 rounded-lg ${achievement.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <achievement.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{achievement.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </div>
            {achievement.unlocked && (
              <Badge variant="default">Unlocked</Badge>
            )}
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export function WeeklyGoals() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Goals</CardTitle>
        <p className="text-sm text-muted-foreground">Track your progress towards this week's cooking goals</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {weeklyGoals.map((goal, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{goal.title}</h3>
              <span className="text-sm text-muted-foreground">
                {goal.current}/{goal.target}
              </span>
            </div>
            <Progress value={goal.progress} className="h-3" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
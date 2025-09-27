'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChefHat, 
  Clock, 
  TrendingUp, 
  Heart, 
  Utensils, 
  Star,
  Calendar,
  Target,
  Award,
  BookOpen,
  Users,
  Zap
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  // Mock data for demonstration
  const cookingStats = {
    totalRecipes: 127,
    favoriteRecipes: 34,
    cookingStreak: 7,
    totalCookingTime: 156, // hours
    skillLevel: 'Intermediate Chef',
    completedChallenges: 12
  };

  const recentRecipes = [
    { id: 1, name: "Mediterranean Pasta", cuisine: "Italian", difficulty: "Easy", rating: 4.8, cookTime: "25 min" },
    { id: 2, name: "Spicy Thai Curry", cuisine: "Thai", difficulty: "Medium", rating: 4.9, cookTime: "35 min" },
    { id: 3, name: "Classic Beef Stew", cuisine: "American", difficulty: "Medium", rating: 4.7, cookTime: "2h 30min" },
    { id: 4, name: "Sushi Rolls", cuisine: "Japanese", difficulty: "Hard", rating: 4.6, cookTime: "45 min" }
  ];

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

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <ChefHat className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">Sign in to view your Dashboard</h2>
          <p className="text-muted-foreground">Track your cooking journey and discover new recipes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, {user.displayName || 'Chef'}! 👨‍🍳</h1>
          <p className="text-muted-foreground">Track your culinary journey and discover new flavors</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cookingStats.totalRecipes}</div>
              <p className="text-xs text-muted-foreground">
                +12 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cooking Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cookingStats.cookingStreak} days</div>
              <p className="text-xs text-muted-foreground">
                Keep it up! 🔥
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cooking Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cookingStats.totalCookingTime}h</div>
              <p className="text-xs text-muted-foreground">
                Total time spent cooking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skill Level</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Intermediate</div>
              <p className="text-xs text-muted-foreground">
                Chef Level 3
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recipes">Recent Recipes</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="goals">Weekly Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Favorite Cuisines */}
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Cuisines</CardTitle>
                  <CardDescription>Your most cooked cuisine types</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Italian", percentage: 85, recipes: 43 },
                    { name: "Asian", percentage: 70, recipes: 35 },
                    { name: "Mediterranean", percentage: 60, recipes: 28 },
                    { name: "Mexican", percentage: 45, recipes: 21 }
                  ].map((cuisine, index) => (
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

              {/* Cooking Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>This Week's Activity</CardTitle>
                  <CardDescription>Your cooking activity this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
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
            </div>
          </TabsContent>

          <TabsContent value="recipes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Recipes</CardTitle>
                <CardDescription>Your latest culinary creations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRecipes.map((recipe) => (
                    <div key={recipe.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Utensils className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{recipe.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{recipe.cuisine}</Badge>
                            <span>•</span>
                            <span>{recipe.difficulty}</span>
                            <span>•</span>
                            <span>{recipe.cookTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{recipe.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <Card key={index} className={achievement.unlocked ? "" : "opacity-50"}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className={`p-2 rounded-lg ${achievement.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <achievement.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <CardDescription>{achievement.description}</CardDescription>
                    </div>
                    {achievement.unlocked && (
                      <Badge variant="default">Unlocked</Badge>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Goals</CardTitle>
                <CardDescription>Track your progress towards this week's cooking goals</CardDescription>
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
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into your cooking journey</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="default" className="gap-2">
              <ChefHat className="h-4 w-4" />
              Start Cooking
            </Button>
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Browse Recipes
            </Button>
            <Button variant="outline" className="gap-2">
              <Heart className="h-4 w-4" />
              View Favorites
            </Button>
            <Button variant="outline" className="gap-2">
              <Target className="h-4 w-4" />
              Set New Goal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
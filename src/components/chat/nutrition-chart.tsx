'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Nutrition } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface NutritionChartProps {
  nutrition: Nutrition;
}

const MacroCard = ({ title, value, percentage, color, icon: Icon }: { title: string, value: number, percentage: number, color: string, icon: React.ElementType }) => (
    <div className="flex-1 rounded-xl p-4 shadow-sm" style={{ backgroundColor: `hsl(var(${color}))` }}>
        <div className="flex items-center gap-2 mb-2">
            <div className="bg-background/50 rounded-full p-1.5">
                <Icon className="w-4 h-4 text-foreground/80" />
            </div>
            <p className="font-semibold text-sm">{title}</p>
        </div>
        <p className="text-2xl font-bold">{value.toFixed(1)}g</p>
        <p className="text-lg font-bold opacity-80">{percentage}%</p>
    </div>
);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 p-2 border rounded-md shadow-lg">
        <p className="font-bold">{`${payload[0].name}: ${payload[0].value.toFixed(1)}g (${(payload[0].payload.percent * 100).toFixed(0)}%)`}</p>
      </div>
    );
  }
  return null;
};


const MacronutrientIcon = ({ name }: { name: string }) => {
    const iconStyle = "w-5 h-5 inline-block mr-2";
    if (name.toLowerCase().includes('carb')) return <svg className={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"></path><path d="M5.6 16.8c1.5-1.5 4.7-1.5 6.2 0 1.5 1.5.5 5 0 5s-4.7-3.5-6.2-5z"></path></svg>; // Placeholder for carbs
    if (name.toLowerCase().includes('protein')) return <svg className={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M7 7h3v3H7zM7 14h3v3H7zM14 7h3v3h-3zM14 14h3v3h-3z"></path></svg>; // Placeholder for protein
    if (name.toLowerCase().includes('fat')) return <svg className={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5.6 7.4A7.49 7.49 0 003 12.5C3 17.7 7.3 22 12.5 22S22 17.7 22 12.5c0-2-1.4-5.3-2.6-7.1L14 3h-4z"></path><path d="M12 9c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>; // Placeholder for fat
    return null;
}


export default function NutritionChart({ nutrition }: NutritionChartProps) {
  const { calories, protein, fat, carbohydrates } = nutrition;
  
  const totalMacros = protein + fat + carbohydrates;
  const proteinPercent = totalMacros > 0 ? (protein / totalMacros) * 100 : 0;
  const fatPercent = totalMacros > 0 ? (fat / totalMacros) * 100 : 0;
  const carbsPercent = totalMacros > 0 ? (carbohydrates / totalMacros) * 100 : 0;

  const data = [
    { name: 'Carbohydrates', value: carbohydrates, color: 'hsl(var(--chart-3))' },
    { name: 'Protein', value: protein, color: 'hsl(var(--chart-2))' },
    { name: 'Fat', value: fat, color: 'hsl(var(--chart-4))' },
  ];

  return (
    <Card className="bg-background/50 border-dashed w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-lg font-headline">Macronutrients</CardTitle>
        {nutrition.servings && <CardDescription>Per serving (makes {nutrition.servings} servings)</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
            <div className='flex flex-col items-center justify-center p-2 rounded-lg bg-yellow-100/50 dark:bg-yellow-900/30'>
                <p className='font-semibold text-yellow-600 dark:text-yellow-400'>Carbs</p>
                <p className='text-xl font-bold'>{carbohydrates.toFixed(1)}g</p>
                <p className='text-sm text-muted-foreground'>{carbsPercent.toFixed(0)}%</p>
            </div>
            <div className='flex flex-col items-center justify-center p-2 rounded-lg bg-green-100/50 dark:bg-green-900/30'>
                <p className='font-semibold text-green-600 dark:text-green-400'>Protein</p>
                <p className='text-xl font-bold'>{protein.toFixed(1)}g</p>
                <p className='text-sm text-muted-foreground'>{proteinPercent.toFixed(0)}%</p>
            </div>
             <div className='flex flex-col items-center justify-center p-2 rounded-lg bg-red-100/50 dark:bg-red-900/30 col-span-2 sm:col-span-1'>
                <p className='font-semibold text-red-600 dark:text-red-400'>Fat</p>
                <p className='text-xl font-bold'>{fat.toFixed(1)}g</p>
                <p className='text-sm text-muted-foreground'>{fatPercent.toFixed(0)}%</p>
            </div>
        </div>

        <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        fill="#8884d8"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="text-center">
             <p className="text-4xl font-bold tracking-tight">{calories.toFixed(0)}</p>
             <p className="text-sm text-muted-foreground">Total Calories</p>
        </div>
      </CardContent>
    </Card>
  );
}

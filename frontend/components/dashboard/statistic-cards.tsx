import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FC } from "react";

interface StatisticCard {
  title: string;
  value: string;
  change: string;
  progress: number;
}

interface StatisticCardsProps {
  cards: StatisticCard[];
}

export const StatisticCards: FC<StatisticCardsProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="border border-[#444444] shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-medium font-inter">{card.title}</h3>
            <div className="space-y-1">
              <div className="text-2xl font-bold font-inter">{card.value}</div>
              <p className="text-xs text-[#848484] font-inter">{card.change}</p>
            </div>
            <Progress value={card.progress} className="h-1" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatisticCards;

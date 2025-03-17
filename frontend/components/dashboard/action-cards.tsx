import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { FC } from "react";

interface ActionCard {
  title: string;
  link: string;
  icon?: string;
  buttonText?: string;
}

interface ActionCardsProps {
  cards: ActionCard[];
}

export const ActionCards: FC<ActionCardsProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Link href={card.link} key={index}>
          <Card className="h-full bg-[#D9D9D9] hover:bg-[#D9D9D9]/90 transition-colors">
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
              {card.icon && (
                <div className="mb-4">{/* Icon component would go here */}</div>
              )}
              <h3 className="text-2xl font-bold font-outfit">{card.title}</h3>
              {card.buttonText && (
                <Button className="mt-4" variant="outline">
                  {card.buttonText}
                </Button>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default ActionCards;

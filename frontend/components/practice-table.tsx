import { Badge } from "@/components/ui/badge";

interface PracticeTableProps {
  showRecommended?: boolean;
}

export default function PracticeTable({
  showRecommended = false,
}: PracticeTableProps) {
  const practices = [
    {
      scenario: "Enquiry about CPF Withdrawal",
      scheme: "Retirement",
      date: "27/03/2023",
      score: "76/100",
      recommended: true,
    },
    {
      scenario: "Enquiry about CPF Housing",
      scheme: "Housing",
      date: "25/03/2023",
      score: "82/100",
      recommended: false,
    },
    {
      scenario: "Enquiry about CPF Education",
      scheme: "Education",
      date: "22/03/2023",
      score: "68/100",
      recommended: true,
    },
  ];

  return (
    <div className="text-xs overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-1">Scenario</th>
            <th className="text-left py-2 px-1">Scheme</th>
            <th className="text-left py-2 px-1">Time Completed</th>
            <th className="text-left py-2 px-1">Score</th>
          </tr>
        </thead>
        <tbody>
          {practices.map((practice, index) => (
            <tr key={index} className="border-b last:border-b-0">
              <td className="py-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="truncate">{practice.scenario}</span>
                  {showRecommended && practice.recommended && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 text-[10px] whitespace-nowrap"
                    >
                      Recommended
                    </Badge>
                  )}
                </div>
              </td>
              <td className="py-2 px-1">{practice.scheme}</td>
              <td className="py-2 px-1">{practice.date}</td>
              <td className="py-2 px-1">{practice.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

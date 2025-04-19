import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Medal } from "lucide-react";
import { FC } from "react";

interface LeaderboardEntry {
  name: string;
  schemes: number;
  score: number;
}

const leaderboardEntries = [
  { name: "Admin User", schemes: 12, score: 95 },
  { name: "Test User", schemes: 10, score: 92 },
  { name: "Trainer User", schemes: 8, score: 88 },
];

export const Leaderboard: FC = () => {
  return (
    <div className="bg-card text-card-foreground p-6 rounded">
      <h3 className="text-[20px] font-semibold mb-4">Leaderboard</h3>

      <div className="flex justify-between mb-6">
        <div className="flex items-center gap-2">
          <Medal className="w-6 h-6 text-yellow-500" />
          <span className="text-sm">Most Hardworking</span>
        </div>
        <div className="flex items-center gap-2">
          <Medal className="w-6 h-6 text-blue-500" />
          <span className="text-sm">Most Scenarios</span>
        </div>
        <div className="flex items-center gap-2">
          <Medal className="w-6 h-6 text-green-500" />
          <span className="text-sm">Most Improved</span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Scenarios</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboardEntries.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>{entry.name}</TableCell>
              <TableCell>{entry.schemes}</TableCell>
              <TableCell className="text-right font-medium">
                {entry.score}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Leaderboard;

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

export const Leaderboard: FC<{ entries: LeaderboardEntry[] }> = ({
  entries,
}) => {
  return (
    <div className="bg-card text-card-foreground p-6 rounded">
      <h3 className="text-[20px] font-semibold mb-4">Leaderboard</h3>

      <div className="flex justify-between mb-6">
        <div className="flex items-center gap-2">
          <Medal className="w-6 h-6 text-yellow-500" />
          <span className="text-sm">Top Performer</span>
        </div>
        <div className="flex items-center gap-2">
          <Medal className="w-6 h-6 text-blue-500" />
          <span className="text-sm">Rising Star</span>
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
          {entries.map((entry, index) => (
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

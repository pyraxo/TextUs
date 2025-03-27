import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface TrainerLeaderboardProps {
  entries: Array<{
    name: string;
    schemes: string;
    score: string;
  }>;
}

export const TrainerLeaderboard: FC<TrainerLeaderboardProps> = ({
  entries,
}) => {
  return (
    <Card className="bg-card border-0 rounded-lg shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="">
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Schemes</TableHead>
              <TableHead className="text-center">Scores</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, index) => (
              <TableRow key={index}>
                <TableCell className="font-semibold">{entry.name}</TableCell>
                <TableCell className="text-center">{entry.schemes}</TableCell>
                <TableCell className="text-center">{entry.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TrainerLeaderboard;

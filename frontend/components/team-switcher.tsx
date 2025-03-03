"use client";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Team {
  name: string;
  logo: React.ElementType;
  plan: string;
}

interface TeamSwitcherProps {
  teams: Team[];
}

export function TeamSwitcher({ teams }: TeamSwitcherProps) {
  const [selectedTeam, setSelectedTeam] = React.useState(teams[0]?.name || "");

  return (
    <div className="flex items-center gap-2 p-2">
      <Select value={selectedTeam} onValueChange={setSelectedTeam}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select team" />
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team.name} value={team.name}>
              <div className="flex items-center gap-2">
                <team.logo className="h-4 w-4" />
                <span>{team.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {team.plan}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

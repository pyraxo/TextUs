import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScenarioCreate } from "@/types/scenario";
import { Plus } from "lucide-react";
import { FC, useState } from "react";
interface NewScenarioDialogProps {
  onScenarioCreate?: (scenario: ScenarioCreate) => void;
  schemeId?: string;
  schemeName?: string;
}

export const NewScenarioDialog: FC<NewScenarioDialogProps> = ({
  onScenarioCreate,
  schemeId,
  schemeName,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && description && schemeId) {
      onScenarioCreate?.({
        name,
        description,
        scheme_id: schemeId,
      });

      // Reset form
      setName("");
      setDescription("");

      // Close dialog
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#0B6160] text-white flex items-center gap-2"
        >
          <Plus size={18} />
          Create Scenario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create New Scenario for {schemeName}
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create a new training scenario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Scenario Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter scenario name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the scenario"
              required
              rows={4}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name || !schemeId}
              onClick={handleSubmit}
              className="bg-[#0B6160] hover:bg-[#094a49] text-white"
            >
              Create Scenario
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewScenarioDialog;

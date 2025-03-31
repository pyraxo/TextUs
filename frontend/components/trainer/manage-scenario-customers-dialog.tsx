"use client";

import { useCustomers } from "@/hooks/use-customers";
import {
  useAddCustomerToScenario,
  useRemoveCustomerFromScenario,
  useScenarioCustomers,
  useUpdateScenarioCustomer,
} from "@/hooks/use-scenario-customers";
import { Customer } from "@/types/customer";
import { Scenario } from "@/types/scenario";
import {
  ScenarioCustomer,
  ScenarioCustomerUpdate,
} from "@/types/scenario-customer";
import { Bot, Loader2, PlusCircle, Save, Trash, X } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

interface ManageScenarioCustomersDialogProps {
  scenario: Scenario;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageScenarioCustomersDialog: FC<
  ManageScenarioCustomersDialogProps
> = ({ scenario, open, onOpenChange }) => {
  // State for the form
  const [editingCustomer, setEditingCustomer] =
    useState<ScenarioCustomer | null>(null);
  const [deletingCustomer, setDeletingCustomer] =
    useState<ScenarioCustomer | null>(null);
  const [name, setName] = useState<string>("");
  const [scenarioPrompt, setScenarioPrompt] = useState<string>("");
  const [temperature, setTemperature] = useState<string>("0.7");
  const [expectedQueries, setExpectedQueries] = useState<string>("");

  // Fetch customers for the scenario
  const { data: scenarioCustomers, isLoading: isLoadingScenarioCustomers } =
    useScenarioCustomers(scenario.id);

  // Fetch all customers for adding
  const { data: allCustomers } = useCustomers();

  // Mutations
  const { mutate: addCustomer, isPending: isAddingCustomer } =
    useAddCustomerToScenario();
  const { mutate: removeCustomer, isPending: isRemovingCustomer } =
    useRemoveCustomerFromScenario();
  const { mutate: updateCustomer, isPending: isUpdatingCustomer } =
    useUpdateScenarioCustomer();

  // Reset form when editing customer changes
  useEffect(() => {
    if (editingCustomer) {
      setName(editingCustomer.name);
      setScenarioPrompt(editingCustomer.scenario_prompt || "");
      setTemperature(editingCustomer.temperature?.toString() || "0.7");
      setExpectedQueries(editingCustomer.expected_queries?.join("\n") || "");
    } else {
      setName("");
      setScenarioPrompt("");
      setTemperature("0.7");
      setExpectedQueries("");
    }
  }, [editingCustomer]);

  // Find customers that are not in the scenario yet
  const availableCustomers = allCustomers?.filter(
    (customer) =>
      !scenarioCustomers?.some(
        (scenarioCustomer) => scenarioCustomer.customer_id === customer.id
      )
  );

  const handleAddCustomer = (customer: Customer) => {
    // Count existing instances of this customer to create a unique name
    const existingCount =
      scenarioCustomers?.filter((sc) => sc.customer_id === customer.id)
        .length || 0;

    // Create a unique name if this is a duplicate
    const uniqueName =
      existingCount > 0
        ? `${customer.name} (${existingCount + 1})`
        : customer.name;

    addCustomer(
      {
        scenarioId: scenario.id,
        customerId: customer.id,
        name: uniqueName,
      },
      {
        onSuccess: () => {
          toast.success(`Added ${uniqueName} to scenario`);
        },
        onError: (error) => {
          toast.error(`Failed to add bot: ${error.message}`);
        },
      }
    );
  };

  const handleRemoveCustomer = (customer: ScenarioCustomer) => {
    setDeletingCustomer(customer);
  };

  const confirmRemoveCustomer = () => {
    if (!deletingCustomer) return;

    removeCustomer(
      {
        scenarioId: scenario.id,
        customerId: deletingCustomer.customer_id,
        scenarioCustomerId: deletingCustomer.id,
      },
      {
        onSuccess: () => {
          if (editingCustomer?.id === deletingCustomer.id) {
            setEditingCustomer(null);
          }
          toast.success("Bot removed from scenario");
          setDeletingCustomer(null);
        },
        onError: (error) => {
          toast.error(`Failed to remove bot: ${error.message}`);
          setDeletingCustomer(null);
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer && name) {
      const updates: ScenarioCustomerUpdate = {
        name,
        scenario_prompt: scenarioPrompt || undefined,
        temperature: parseFloat(temperature),
        expected_queries: expectedQueries
          ? expectedQueries.split("\n").filter((q) => q.trim())
          : [],
      };

      updateCustomer(
        {
          scenarioId: scenario.id,
          customerId: editingCustomer.customer_id,
          updates,
        },
        {
          onSuccess: () => {
            toast.success("Bot settings updated successfully");
          },
          onError: (error) => {
            toast.error(`Failed to update bot: ${error.message}`);
          },
        }
      );
    }
  };

  const isPending =
    isAddingCustomer || isRemovingCustomer || isUpdatingCustomer;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] border-0 h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Manage Bots</DialogTitle>
          <DialogDescription>
            Add, remove, and configure bots for this scenario.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left side - List of scenario customers */}
          <div className="w-1/2 border-r pr-4 overflow-hidden flex flex-col">
            <div className="font-semibold mb-2">Current Bots</div>
            <ScrollArea className="flex-1 pr-4">
              {isLoadingScenarioCustomers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : scenarioCustomers?.length ? (
                <div className="space-y-3">
                  {scenarioCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className={`p-3 border rounded-md cursor-pointer hover:bg-cpf-teal dark:hover:bg-cpf-teal-dark hover:text-white dark:hover:text-white flex justify-between items-center ${
                        editingCustomer?.id === customer.id
                          ? "bg-cpf-teal dark:bg-cpf-teal-dark text-white"
                          : ""
                      }`}
                      onClick={() => setEditingCustomer(customer)}
                    >
                      <div className="flex items-center">
                        <Bot size={16} className="mr-2" />
                        <span>{customer.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCustomer(customer);
                        }}
                        disabled={isPending}
                      >
                        <Trash size={14} className="text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No bots added to this scenario yet
                </div>
              )}
            </ScrollArea>

            <Separator className="my-4" />

            <div className="font-semibold mb-2">Add Bots</div>
            <ScrollArea className="h-40 pr-4">
              <div className="space-y-3">
                {allCustomers?.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-3 border rounded-md cursor-pointer hover:border-cpf-teal dark:hover:border-cpf-teal-dark flex justify-between items-center"
                  >
                    <span>{customer.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddCustomer(customer)}
                      disabled={isPending}
                      className="hover:text-cpf-teal dark:hover:text-cpf-teal-dark"
                    >
                      <PlusCircle
                        size={14}
                        className="text-cpf-teal dark:text-white"
                      />
                    </Button>
                  </div>
                ))}
                {!allCustomers?.length && (
                  <div className="text-center py-4 text-muted-foreground">
                    No customers available to add
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right side - Edit form */}
          <div className="w-1/2 pl-4 overflow-hidden flex flex-col">
            {editingCustomer ? (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 flex-1 overflow-auto"
              >
                <div className="font-semibold mb-2 flex justify-between items-center">
                  <span>Configure Bot</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCustomer(null)}
                  >
                    <X size={14} />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Bot Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter bot name"
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scenarioPrompt">
                    Scenario-specific Prompt
                  </Label>
                  <Textarea
                    id="scenarioPrompt"
                    value={scenarioPrompt}
                    onChange={(e) => setScenarioPrompt(e.target.value)}
                    placeholder="Bot-specific prompt for this scenario"
                    rows={4}
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">
                    Scenario-specific Temperature
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="0.7"
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedQueries">
                    Expected Queries (one per line)
                  </Label>
                  <Textarea
                    id="expectedQueries"
                    value={expectedQueries}
                    onChange={(e) => setExpectedQueries(e.target.value)}
                    placeholder="List of expected queries, one per line"
                    rows={4}
                    disabled={isPending}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Bot Settings
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a bot to configure its settings
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Dialog for Delete */}
        <AlertDialog
          open={!!deletingCustomer}
          onOpenChange={(open) => !open && setDeletingCustomer(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Bot</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {deletingCustomer?.name} from
                this scenario? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemoveCustomer}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

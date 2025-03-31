"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCustomer } from "@/hooks/use-customers";
import { Customer, CustomerUpdate } from "@/types/customer";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface CustomerFormProps {
  customer: Customer | null;
  onSave?: () => void;
  loading?: boolean;
}

export function CustomerForm({
  customer,
  onSave,
  loading = false,
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerUpdate>({
    name: "",
    description: "",
    profile_prompt: "",
    personality_traits: [],
  });

  const [traitInput, setTraitInput] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);

  const updateCustomer = useUpdateCustomer();

  // Reset form when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        description: customer.description || "",
        profile_prompt: customer.profile_prompt || "",
        personality_traits: customer.personality_traits || [],
      });

      setIsDirty(false);
    } else {
      resetForm();
    }
  }, [customer]);

  const resetForm = () => {
    if (customer) {
      setFormData({
        name: customer.name,
        description: customer.description || "",
        profile_prompt: customer.profile_prompt || "",
        personality_traits: customer.personality_traits || [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        profile_prompt: "",
        personality_traits: [],
      });
    }

    setTraitInput("");
    setIsDirty(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleTraitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && traitInput.trim()) {
      e.preventDefault();
      addTrait();
    }
  };

  const addTrait = () => {
    if (
      traitInput.trim() &&
      !formData.personality_traits?.includes(traitInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        personality_traits: [
          ...(prev.personality_traits || []),
          traitInput.trim(),
        ],
      }));
      setTraitInput("");
      setIsDirty(true);
    }
  };

  const removeTrait = (traitToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      personality_traits:
        prev.personality_traits?.filter((trait) => trait !== traitToRemove) ||
        [],
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!customer?.id) return;

    updateCustomer.mutate(
      {
        id: customer.id as string,
        customerData: formData,
      },
      {
        onSuccess: () => {
          setIsDirty(false);
          if (onSave) onSave();
        },
      }
    );
  };

  if (!customer) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Select a customer to edit</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Edit Customer</h2>
            <p className="text-sm text-muted-foreground">
              Update customer details and profile information
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter the customer's full name"
              disabled={loading || updateCustomer.isPending}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Provide a detailed description of the customer's background and preferences"
              rows={3}
              disabled={loading || updateCustomer.isPending}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="personality" className="text-sm font-medium">
              Personality Traits
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.personality_traits?.map((trait, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="pl-2 pr-1 py-1"
                >
                  {trait}
                  <button
                    type="button"
                    className="ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => removeTrait(trait)}
                    disabled={loading || updateCustomer.isPending}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex">
              <Input
                placeholder="Enter a personality trait and press Enter"
                value={traitInput}
                onChange={(e) => setTraitInput(e.target.value)}
                onKeyDown={handleTraitKeyDown}
                disabled={loading || updateCustomer.isPending}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                className="ml-2"
                onClick={addTrait}
                disabled={
                  !traitInput.trim() || loading || updateCustomer.isPending
                }
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="profile_prompt" className="text-sm font-medium">
              Profile Prompt
            </label>
            <Textarea
              id="profile_prompt"
              name="profile_prompt"
              value={formData.profile_prompt || ""}
              onChange={handleChange}
              placeholder="Enter a detailed prompt to guide AI in generating responses that match this customer's profile"
              rows={5}
              disabled={loading || updateCustomer.isPending}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={resetForm}
            disabled={!isDirty || loading || updateCustomer.isPending}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isDirty || loading || updateCustomer.isPending}
          >
            {updateCustomer.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}

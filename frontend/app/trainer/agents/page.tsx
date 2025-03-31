"use client";

import { customerColumns } from "@/components/customers/customer-columns";
import { CustomerForm } from "@/components/customers/customer-form";
import { CustomerTable } from "@/components/customers/customer-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useCreateCustomer,
  useCustomer,
  useCustomers,
} from "@/hooks/use-customers";
import { Customer } from "@/types/customer";
import {
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

export default function CustomersPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Fetch customers
  const { data: customers = [], isLoading: isLoadingCustomers } =
    useCustomers();
  const createCustomer = useCreateCustomer();

  // Fetch selected customer details
  const { data: selectedCustomer, isLoading: isLoadingCustomer } =
    useCustomer(selectedCustomerId);

  // Handle row click
  const handleRowClick = (customer: Customer) => {
    setSelectedCustomerId(customer.id as string);
  };

  const handleCreateCustomer = () => {
    createCustomer.mutate({
      name: "New Customer",
      description: "Customer description",
    });
  };

  const table = useReactTable({
    data: customers,
    columns: customerColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="h-full flex-col overflow-hidden">
      <div className="mx-auto">
        {/* Header content area */}
        <div className="bg-cpf-light-teal pt-8 pb-8">
          <div className="container mx-auto">
            {/* Main heading */}
            <h1 className="text-3xl font-bold mb-2">Manage Trainees</h1>

            {/* Subheading */}
            <h2 className="text-sm">
              Monitor, evaluate, and support the progress of your assigned
              trainees
            </h2>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-6">
        <div className="flex gap-6">
          {/* Left Panel - Data Table */}
          <div className="w-2/5">
            <Card className="h-[70vh] flex flex-col border-0">
              <CardContent className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Filter trainees..."
                      value={
                        (table
                          ?.getColumn("name")
                          ?.getFilterValue() as string) ?? ""
                      }
                      onChange={(event) =>
                        table
                          ?.getColumn("name")
                          ?.setFilterValue(event.target.value)
                      }
                      className="max-w-sm"
                    />
                  </div>
                  <Button
                    onClick={handleCreateCustomer}
                    disabled={createCustomer.isPending}
                  >
                    {createCustomer.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        New Trainee
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
              <ScrollArea className="flex-1">
                <CustomerTable
                  data={customers}
                  isLoading={isLoadingCustomers}
                  onRowClick={handleRowClick}
                  selectedCustomerId={selectedCustomerId}
                />
              </ScrollArea>
            </Card>
          </div>

          {/* Right Panel - Customer Form */}
          <div className="w-3/5">
            <Card className="h-[70vh]">
              <CardContent className="p-0 h-full overflow-y-auto">
                {isLoadingCustomer && selectedCustomerId ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Loading customer details...
                      </p>
                    </div>
                  </div>
                ) : (
                  <CustomerForm
                    customer={selectedCustomer || null}
                    loading={isLoadingCustomer}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

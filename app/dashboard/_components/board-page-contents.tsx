"use client";

import { FormPopover } from "@/components/forms/form-popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Grid3X3, List, Plus, Search } from "lucide-react";
import { useState } from "react";
import { BoardCreateForm } from "./board-create-form";
import { BoardList } from "./board-list";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const BoardPageContents = () => {
  const trpc = useTRPC();
  const { data, isLoading } = useSuspenseQuery(
    trpc.pages.boardPage.queryOptions(),
  );

  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-6 px-4 sm:py-8 space-y-4">
        {/* Board List */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                Your Boards
              </h2>
              <p className="text-gray-600">Manage your projects and tasks</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center  space-y-2 sm:space-y-0 space-x-2">
              <div className="flex items-center space-x-2 bg-white border p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3></Grid3X3>
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List></List>
                </Button>
              </div>
              <Button variant="default" size="sm">
                <Filter></Filter>
                Filter
              </Button>
              <FormPopover
                disabled={false}
                formContent={<BoardCreateForm />}
                prompt="Create Board"
                side="top"
                sideOffset={10}
              >
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Board
                </Button>
              </FormPopover>

              {/* Search */}
              <div className="relative mb-4sm:mb-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400"></Search>
                <Input
                  id="search"
                  placeholder="Search boards..."
                  className="pl-10"
                ></Input>
              </div>
            </div>
          </div>
          {/* Boards Grid/List */}
          {data?.boards.length === 0 ? (
            <div>No boards found</div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              grid
            </div>
          ) : (
            <div>list</div>
          )}
        </div>
      </main>
    </div>
  );
};

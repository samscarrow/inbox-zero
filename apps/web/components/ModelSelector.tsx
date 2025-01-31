"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";

type ModelTier = "haiku" | "sonnet" | "opus";

interface ModelCapability {
  contextWindow: string;
  speedRating: number;
  costRating: number;
  analysisDepth: string;
}

type ModelInfo = {
  id: string;
  name: string;
  description: string;
  capabilities: ModelCapability;
  available: boolean;
  tier: ModelTier;
};

const CLAUDE_MODELS: ModelInfo[] = [
  {
    id: "anthropic.claude-3-haiku-20240307-v1:0",
    name: "Claude 3 Haiku",
    description: "Fast, efficient model for straightforward tasks",
    capabilities: {
      contextWindow: "200K tokens",
      speedRating: 5,
      costRating: 1,
      analysisDepth: "Basic reasoning and analysis",
    },
    available: true,
    tier: "haiku",
  },
  {
    id: "anthropic.claude-3-sonnet-20240229-v1:0",
    name: "Claude 3 Sonnet",
    description: "Balanced performance for complex tasks",
    capabilities: {
      contextWindow: "400K tokens",
      speedRating: 4,
      costRating: 2,
      analysisDepth: "Advanced reasoning and context understanding",
    },
    available: true,
    tier: "sonnet",
  },
  {
    id: "anthropic.claude-3-opus-20240229-v1:0",
    name: "Claude 3 Opus",
    description: "Most capable model for sophisticated analysis",
    capabilities: {
      contextWindow: "1M tokens",
      speedRating: 3,
      costRating: 3,
      analysisDepth: "Expert-level analysis and complex reasoning",
    },
    available: true,
    tier: "opus",
  },
];

const getTierValue = (tier: ModelTier): number => {
  switch (tier) {
    case "haiku":
      return 0;
    case "sonnet":
      return 50;
    case "opus":
      return 100;
    default:
      return 0;
  }
};

const getTierFromValue = (value: number): ModelTier => {
  if (value <= 25) return "haiku";
  if (value <= 75) return "sonnet";
  return "opus";
};

interface ModelSelectorProps {
  onModelChange?: (modelId: string) => void;
  className?: string;
}

export function ModelSelector({
  onModelChange,
  className,
}: ModelSelectorProps) {
  const [selectedTier, setSelectedTier] = useState<ModelTier>("sonnet");

  const handleSliderChange = (value: number[]) => {
    const newTier = getTierFromValue(value[0]);
    setSelectedTier(newTier);
    const model = CLAUDE_MODELS.find((m) => m.tier === newTier);
    if (model && onModelChange) {
      onModelChange(model.id);
    }
  };

  const selectedModel = CLAUDE_MODELS.find((m) => m.tier === selectedTier)!;

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center justify-between">
        <HoverCard openDelay={200}>
          <HoverCardTrigger asChild>
            <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Model: {selectedModel.name}
            </h3>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{selectedModel.name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedModel.description}
              </p>
              <div className="flex items-center pt-2">
                <span className="text-sm font-medium leading-none">
                  Capabilities:
                </span>
                <Badge variant="secondary" className="ml-auto">
                  {selectedModel.capabilities.contextWindow}
                </Badge>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        <Tooltip
          content={selectedModel.available ? "Available" : "Unavailable"}
        >
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              selectedModel.available ? "bg-green-500" : "bg-red-500",
            )}
          />
        </Tooltip>
      </div>

      <Slider
        className="w-full"
        value={[getTierValue(selectedTier)]}
        onValueChange={handleSliderChange}
        max={100}
        step={1}
        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
      />

      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div>Fast & Efficient</div>
        <div className="text-center">Balanced</div>
        <div className="text-right">Most Capable</div>
      </div>
    </div>
  );
}

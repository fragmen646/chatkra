import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { SunIcon, MoonIcon, SaveIcon, RotateCcwIcon } from "lucide-react";

interface SettingsPanelProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  settings?: {
    apiEndpoint: string;
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    darkMode: boolean;
  };
  onSaveSettings?: (settings: {
    apiEndpoint: string;
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    darkMode: boolean;
  }) => void;
  onToggleTheme?: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  open = false,
  onOpenChange = () => {},
  settings = {
    apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: "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",
    model: "qwen/qwen3-235b-a22b:free",
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt:
      "Anda adalah asisten AI yang membantu dengan berbagai pertanyaan.",
    darkMode: true,
  },
  onSaveSettings = () => {},
  onToggleTheme = () => {},
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSaveSettings(localSettings);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalSettings({
      apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: "",
      model: "qwen/qwen3-235b-a22b:free",
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt:
        "Anda adalah asisten AI yang membantu dengan berbagai pertanyaan.",
      darkMode: settings.darkMode,
    });
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Pengaturan
          </DialogTitle>
          <DialogDescription>
            Sesuaikan pengaturan Chat-KRA sesuai kebutuhan Anda.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiEndpoint">Endpoint API</Label>
            <Input
              id="apiEndpoint"
              value={localSettings.apiEndpoint}
              onChange={(e) => handleChange("apiEndpoint", e.target.value)}
              placeholder="https://openrouter.ai/api/v1/chat/completions"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={localSettings.apiKey}
              onChange={(e) => handleChange("apiKey", e.target.value)}
              placeholder="Masukkan API key Anda"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={localSettings.model}
              onChange={(e) => handleChange("model", e.target.value)}
              placeholder="qwen/qwen3-235b-a22b:free"
            />
          </div>

          <Separator />

          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="temperature">
                Temperatur: {localSettings.temperature.toFixed(1)}
              </Label>
              <span className="text-xs text-muted-foreground">(0.1 - 1.0)</span>
            </div>
            <Slider
              id="temperature"
              min={0.1}
              max={1.0}
              step={0.1}
              value={[localSettings.temperature]}
              onValueChange={(value) => handleChange("temperature", value[0])}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="maxTokens">
                Maksimal Token: {localSettings.maxTokens}
              </Label>
              <span className="text-xs text-muted-foreground">
                (100 - 4000)
              </span>
            </div>
            <Slider
              id="maxTokens"
              min={100}
              max={4000}
              step={100}
              value={[localSettings.maxTokens]}
              onValueChange={(value) => handleChange("maxTokens", value[0])}
            />
          </div>

          <Separator />

          <div className="grid gap-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              value={localSettings.systemPrompt}
              onChange={(e) => handleChange("systemPrompt", e.target.value)}
              placeholder="Masukkan system prompt"
              className="min-h-[80px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label htmlFor="darkMode" className="cursor-pointer">
                Tema Gelap
              </Label>
              <Switch
                id="darkMode"
                checked={localSettings.darkMode}
                onCheckedChange={(checked) => {
                  handleChange("darkMode", checked);
                  onToggleTheme();
                }}
              />
            </div>
            <div className="flex items-center space-x-1">
              <SunIcon className="h-4 w-4 text-muted-foreground" />
              <span className="mx-1">/</span>
              <MoonIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcwIcon className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <SaveIcon className="h-4 w-4" />
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;

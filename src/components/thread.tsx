"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CodeIcon,
  CopyIcon,
  DownloadIcon,
  GlobeIcon,
  LoaderIcon,
  PencilIcon,
  RefreshCwIcon,
  SparklesIcon,
  SquareIcon,
  ZapIcon,
} from "lucide-react";
import {
  ActionBarPrimitive,
  AuiIf,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import "@assistant-ui/react-markdown/styles/dot.css";

import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { Reasoning, ReasoningGroup } from "@/components/assistant-ui/reasoning";
import { Sources } from "@/components/assistant-ui/sources";
import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from "@/components/assistant-ui/attachment";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────

export function Thread() {
  return (
    <ThreadPrimitive.Root
      className="flex h-full flex-col bg-[#0d0d0f] text-sm"
      style={{
        "--thread-max-width": "48rem",
        "--accent-color": "#7c3aed",
        "--accent-foreground": "#ffffff",
      } as React.CSSProperties}
    >
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-scroll scroll-smooth px-4 pt-6"
      >
        <AuiIf condition={({ thread }) => thread.isEmpty}>
          <ThreadWelcome />
        </AuiIf>

        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            EditComposer,
            AssistantMessage,
          }}
        />

        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mx-auto mt-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-3 overflow-visible bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/95 to-transparent pb-5 pt-4">
          <ThreadScrollToBottom />
          <Composer />
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Welcome screen
// ─────────────────────────────────────────────────────────────────────────────

function ThreadWelcome() {
  return (
    <div className="mx-auto my-auto flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
      {/* Hero */}
      <div className="flex w-full flex-grow flex-col items-center justify-center">
        <div className="flex size-full flex-col items-center justify-center gap-5 px-8 py-12">
          <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-[0_0_40px_rgba(124,58,237,0.45)]">
            <SparklesIcon className="size-8 text-white" />
            {/* subtle ring */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              OpenVerse AI
            </h1>
            <p className="mt-2 text-base text-zinc-400">
              Your intelligent assistant — ready to help with anything.
            </p>
          </div>
        </div>
      </div>

      {/* Suggestion chips — 2×2 grid */}
      <div className="grid w-full gap-2 pb-4 sm:grid-cols-2">
        <SuggestionChip
          prompt="Explain quantum computing simply"
          icon={<ZapIcon className="size-3.5 text-violet-400" />}
          title="Explain quantum computing"
          subtitle="simply and clearly"
        />
        <SuggestionChip
          prompt="Write a Python web scraper with BeautifulSoup"
          icon={<CodeIcon className="size-3.5 text-violet-400" />}
          title="Write a Python web scraper"
          subtitle="with BeautifulSoup"
        />
        <SuggestionChip
          prompt="What are the latest trends in tech?"
          icon={<GlobeIcon className="size-3.5 text-violet-400" />}
          title="Latest trends in tech"
          subtitle="news and insights"
        />
        <SuggestionChip
          prompt="Help me debug my React component"
          icon={<SparklesIcon className="size-3.5 text-violet-400" />}
          title="Debug my React component"
          subtitle="step-by-step analysis"
        />
      </div>
    </div>
  );
}

function SuggestionChip({
  prompt,
  icon,
  title,
  subtitle,
}: {
  prompt: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <ThreadPrimitive.Suggestion prompt={prompt} asChild>
      <Button
        variant="ghost"
        className="h-auto w-full flex-col items-start justify-start gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 text-left text-sm transition-all hover:border-violet-500/40 hover:bg-violet-500/[0.08] active:scale-[0.98]"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-white/90">{title}</span>
        </div>
        <span className="text-xs text-zinc-500">{subtitle}</span>
      </Button>
    </ThreadPrimitive.Suggestion>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composer
// ─────────────────────────────────────────────────────────────────────────────

function Composer() {
  return (
    <ComposerPrimitive.Root className="relative flex w-full flex-col">
      <ComposerPrimitive.AttachmentDropzone className="flex w-full flex-col rounded-2xl border border-white/[0.08] bg-[#18181b] px-1 pt-2 shadow-lg outline-none transition-all has-[textarea:focus-visible]:border-violet-500/50 has-[textarea:focus-visible]:shadow-[0_0_0_4px_rgba(124,58,237,0.12)] data-[dragging=true]:border-violet-500/60 data-[dragging=true]:border-dashed data-[dragging=true]:bg-violet-500/[0.04]">
        <ComposerAttachments />
        <ComposerPrimitive.Input
          placeholder="Message OpenVerse AI…"
          className="mb-1 max-h-40 min-h-[3.5rem] w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm text-white outline-none placeholder:text-zinc-500 focus-visible:ring-0"
          rows={1}
          autoFocus
          aria-label="Message input"
        />
        <ComposerAction />
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
  );
}

function ComposerAction() {
  return (
    <div className="relative mx-2 mb-2 flex items-center justify-between">
      <ComposerAddAttachment />

      <AuiIf condition={({ thread }) => !thread.isRunning}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send message"
            side="bottom"
            type="submit"
            variant="default"
            size="icon"
            className="size-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-[0_2px_16px_rgba(124,58,237,0.55)] transition-all hover:shadow-[0_4px_24px_rgba(124,58,237,0.7)] hover:scale-105 active:scale-95"
            aria-label="Send message"
          >
            <ArrowUpIcon className="size-4" />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </AuiIf>

      <AuiIf condition={({ thread }) => thread.isRunning}>
        <ComposerPrimitive.Cancel asChild>
          <Button
            type="button"
            variant="default"
            size="icon"
            className="size-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-[0_2px_16px_rgba(124,58,237,0.55)] transition-all hover:scale-105 active:scale-95"
            aria-label="Stop generating"
          >
            <SquareIcon className="size-3 fill-current" />
          </Button>
        </ComposerPrimitive.Cancel>
      </AuiIf>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scroll to bottom
// ─────────────────────────────────────────────────────────────────────────────

function ThreadScrollToBottom() {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute -top-14 z-10 self-center rounded-full border border-white/10 bg-[#18181b] p-4 text-zinc-400 shadow-lg backdrop-blur-sm transition-all hover:border-violet-500/40 hover:text-white disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// User message
// ─────────────────────────────────────────────────────────────────────────────

function UserMessage() {
  return (
    <MessagePrimitive.Root
      className="mx-auto grid w-full max-w-[var(--thread-max-width)] auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 py-4 animate-in fade-in slide-in-from-bottom-2 duration-200"
      data-role="user"
    >
      <UserMessageAttachments />

      <div className="relative col-start-2 min-w-0">
        <div className="rounded-2xl rounded-tr-sm border border-violet-500/20 bg-gradient-to-br from-violet-600/20 to-indigo-600/15 px-4 py-3 break-words text-white/90 backdrop-blur-sm">
          <MessagePrimitive.Parts />
        </div>
        <div className="absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2">
          <UserActionBar />
        </div>
      </div>

      <BranchPicker className="col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
    </MessagePrimitive.Root>
  );
}

function UserActionBar() {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton
          tooltip="Edit"
          className="p-4 text-zinc-500 transition-colors hover:text-white"
        >
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit composer (inline editing)
// ─────────────────────────────────────────────────────────────────────────────

function EditComposer() {
  return (
    <MessagePrimitive.Root className="mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col px-2 py-3">
      <ComposerPrimitive.Root className="ml-auto flex w-full max-w-[85%] flex-col rounded-2xl border border-violet-500/20 bg-[#18181b]">
        <ComposerPrimitive.Input
          className="min-h-14 w-full resize-none bg-transparent p-4 text-white text-sm outline-none"
          autoFocus
        />
        <div className="mx-3 mb-3 flex items-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button
              size="sm"
              className="bg-gradient-to-br from-violet-600 to-indigo-500 text-white hover:opacity-90"
            >
              Update
            </Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Assistant message
// ─────────────────────────────────────────────────────────────────────────────

function AssistantMessage() {
  return (
    <MessagePrimitive.Root
      className="relative mx-auto w-full max-w-[var(--thread-max-width)] py-4 animate-in fade-in slide-in-from-bottom-2 duration-200"
      data-role="assistant"
    >
      {/* Avatar row */}
      <div className="mb-3 flex items-center gap-2.5 px-2">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 shadow-[0_0_10px_rgba(124,58,237,0.45)]">
          <SparklesIcon className="size-3 text-white" />
        </div>
        <span className="text-xs font-semibold tracking-wide text-zinc-400">OpenVerse AI</span>
      </div>

      {/* Body */}
      <div className="break-words px-2 leading-relaxed text-zinc-100">
        <MessagePrimitive.Parts
          components={{
            Text: MarkdownText,
            tools: { Fallback: ToolFallback },
            Reasoning,
            ReasoningGroup,
            Source: Sources,
          }}
        />
        <MessageError />
        <AuiIf
          condition={({ thread, message }) =>
            thread.isRunning && message.content.length === 0
          }
        >
          <div className="flex items-center gap-2 text-violet-400/80">
            <LoaderIcon className="size-4 animate-spin" />
            <span className="text-xs">Thinking…</span>
          </div>
        </AuiIf>
      </div>

      {/* Action bar */}
      <div className="mt-2 ml-2 flex">
        <BranchPicker />
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  );
}

function MessageError() {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="mt-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-300 text-sm">
        <ErrorPrimitive.Message className="line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
}

function AssistantActionBar() {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="-ml-1 flex gap-0.5 text-zinc-600 data-floating:absolute data-floating:rounded-xl data-floating:border data-floating:border-white/[0.06] data-floating:bg-[#18181b] data-floating:p-1 data-floating:shadow-lg"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton
          tooltip="Copy"
          className="rounded-lg p-2 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <AuiIf condition={({ message }) => message.isCopied}>
            <CheckIcon />
          </AuiIf>
          <AuiIf condition={({ message }) => !message.isCopied}>
            <CopyIcon />
          </AuiIf>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.ExportMarkdown asChild>
        <TooltipIconButton
          tooltip="Export as Markdown"
          className="rounded-lg p-2 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <DownloadIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.ExportMarkdown>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton
          tooltip="Regenerate"
          className="rounded-lg p-2 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Branch picker
// ─────────────────────────────────────────────────────────────────────────────

function BranchPicker({ className, ...rest }: { className?: string }) {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "mr-2 -ml-2 inline-flex items-center text-xs text-zinc-600",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton
          tooltip="Previous"
          className="rounded-lg p-1 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium text-zinc-500">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton
          tooltip="Next"
          className="rounded-lg p-1 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
}

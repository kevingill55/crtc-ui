"use client";

import { TextStyleKit } from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/react";
import { Placeholder } from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useMemo, useState } from "react";
import { useProtectedRoute } from "../../hooks/useProtectedRoute";
import ProtectedPage from "@/app/components/ProtectedPage";
import { sendMassEmail } from "@/app/actions/send-email";
import "./temp.css";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import {
  NotificationStatus,
  useNotificationsContext,
} from "@/app/providers/Notifications";
import { apiFetch } from "@/app/clients/api";
import { League, LeagueEnrollment, Member } from "@/app/types";

const extensions = [
  StarterKit.configure({
    bulletList: {
      HTMLAttributes: {
        class: "list-disc",
      },
    },
  }),
  Placeholder.configure({
    placeholder: "Write your email here...",
    // Adds this class to the editor element when empty — matched by the ::before rule in temp.css
    emptyEditorClass: "is-editor-empty",
  }),
  TextStyleKit,
];

const MenuBarButton = ({
  onClick,
  label,
  active,
  disabled,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${
        active ? "bg-tennis hover:bg-tennis/80" : ""
      } px-2.5 py-1 rounded-lg bg-gray-200 text-sm hover:cursor-pointer hover:bg-gray-300/80`}
    >
      {label}
    </button>
  );
};

const MenuBar = ({ editor }: { editor: Editor }) => {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive("bold") ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive("italic") ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive("strike") ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isCode: ctx.editor.isActive("code") ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
        isParagraph: ctx.editor.isActive("paragraph") ?? false,
        isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
        isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
        isHeading5: ctx.editor.isActive("heading", { level: 5 }) ?? false,
        isHeading6: ctx.editor.isActive("heading", { level: 6 }) ?? false,
        isBulletList: ctx.editor.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor.isActive("orderedList") ?? false,
        isCodeBlock: ctx.editor.isActive("codeBlock") ?? false,
        isBlockquote: ctx.editor.isActive("blockquote") ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      };
    },
  });

  return (
    <div className="border-b border-gray-100 pb-2">
      <div className="flex gap-1 flex-wrap">
        <MenuBarButton
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
          active={editorState.isBold}
        />
        <MenuBarButton
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
          active={editorState.isItalic}
        />
        <MenuBarButton
          label="Strike"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
          active={editorState.isStrike}
        />
        <MenuBarButton
          label="Code"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editorState.canCode}
          active={editorState.isCode}
        />
        <MenuBarButton
          label="H1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          disabled={false}
          active={editorState.isHeading1}
        />
        <MenuBarButton
          label="H2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          disabled={false}
          active={editorState.isHeading2}
        />
        <MenuBarButton
          label="H3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          disabled={false}
          active={editorState.isHeading3}
        />
        <MenuBarButton
          label="H4"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          disabled={false}
          active={editorState.isHeading4}
        />
        <MenuBarButton
          label="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={false}
          active={editorState.isBulletList}
        />
      </div>
    </div>
  );
};

function RecipientChip({
  label,
  count,
  selected,
  loading,
  onClick,
}: {
  label: string;
  count: number | null;
  selected: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        selected
          ? "bg-primary text-white"
          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
      }`}
    >
      {label}
      <span
        className={`text-xs px-1.5 py-0.5 rounded-full ${
          selected ? "bg-white/20" : "bg-gray-300 text-gray-500"
        }`}
      >
        {loading || count === null ? "–" : count}
      </span>
    </button>
  );
}

export default function AdminEmail() {
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const { addNotification } = useNotificationsContext();
  const { user } = useProtectedRoute({ isAdmin: true });

  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        // "tiptap" activates the selectors in temp.css
        class: "tiptap prose prose-lg focus:outline-none m-0 p-0 min-h-[200px]",
      },
    },
  });

  // ── Recipient data ──────────────────────────────────────────────────────────

  const { data: activeMembersData, isLoading: activeMembersLoading } =
    useQuery<{ data: Member[] }>({
      queryKey: ["getMembers", "active"],
      queryFn: async () => {
        const res = await apiFetch("/api/members?status=ACTIVE", {
          method: "GET",
        });
        return res.json();
      },
    });
  const activeMembers = activeMembersData?.data ?? [];

  const { data: waitlistMembersData, isLoading: waitlistLoading } =
    useQuery<{ data: Member[] }>({
      queryKey: ["getMembers", "waitlist"],
      queryFn: async () => {
        const res = await apiFetch("/api/members?status=WAITLIST", {
          method: "GET",
        });
        return res.json();
      },
    });
  const waitlistMembers = waitlistMembersData?.data ?? [];

  const { data: leaguesData, isLoading: leaguesLoading } = useQuery<{
    success: boolean;
    data: League[];
  }>({
    queryKey: ["getLeagues"],
    queryFn: async () => {
      const res = await apiFetch("/api/leagues", { method: "GET" });
      return res.json();
    },
  });
  const leagues = leaguesData?.data ?? [];

  const leagueRosterResults = useQueries({
    queries: leagues.map((league) => ({
      queryKey: ["leagueRoster", league.id],
      queryFn: async () => {
        const res = await apiFetch(`/api/leagues/${league.id}/roster`, {
          method: "GET",
        });
        return res.json() as Promise<{
          success: boolean;
          data: LeagueEnrollment[];
        }>;
      },
    })),
  });

  // ── Computed recipient list ─────────────────────────────────────────────────

  const recipientEmails = useMemo(() => {
    const emailSet = new Set<string>();
    if (selectedGroups.has("active")) {
      activeMembers.forEach((m) => emailSet.add(m.email));
    }
    if (selectedGroups.has("waitlist")) {
      waitlistMembers.forEach((m) => emailSet.add(m.email));
    }
    leagues.forEach((league, i) => {
      if (selectedGroups.has(`league-${league.id}`)) {
        (leagueRosterResults[i]?.data?.data ?? []).forEach((e) => {
          if (e.members?.email) emailSet.add(e.members.email);
        });
      }
    });
    return [...emailSet];
  }, [selectedGroups, activeMembers, waitlistMembers, leagues, leagueRosterResults]);

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Mutation ────────────────────────────────────────────────────────────────

  const { mutate: submitEmail } = useMutation({
    onSuccess: () => {
      setSubject("");
      setSelectedGroups(new Set());
      editor?.commands.setContent("");
      addNotification({
        status: NotificationStatus.SUCCESS,
        id: "temp",
        expiresIn: 5000,
        title: "Email sent successfully",
      });
    },
    mutationFn: async (content: string) => {
      const formData = new FormData();
      formData.append("body", content);
      formData.append("subject", subject);
      formData.append("recipients", recipientEmails.join(", "));
      await sendMassEmail(formData);
    },
  });

  if (!user || !editor) return null;

  const handleSend = () => {
    if (recipientEmails.length === 0) {
      addNotification({
        status: NotificationStatus.ERROR,
        id: "temp",
        expiresIn: 4000,
        title: "Select at least one recipient group before sending",
      });
      return;
    }
    submitEmail(editor.getHTML());
  };

  const handleClear = () => {
    setSelectedGroups(new Set());
    setSubject("");
    editor.commands.setContent("");
  };

  return (
    <ProtectedPage title="Email">
      <div className="w-full border rounded-xl border-zinc-200 bg-zinc-100 shadow-lg p-6 flex flex-col gap-5">
        {/* Recipients */}
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">Recipients</p>

          {/* Member groups */}
          <div className="flex flex-wrap gap-2">
            <RecipientChip
              label="All active members"
              count={activeMembersLoading ? null : activeMembers.length}
              selected={selectedGroups.has("active")}
              loading={activeMembersLoading}
              onClick={() => toggleGroup("active")}
            />
            <RecipientChip
              label="Club waitlist"
              count={waitlistLoading ? null : waitlistMembers.length}
              selected={selectedGroups.has("waitlist")}
              loading={waitlistLoading}
              onClick={() => toggleGroup("waitlist")}
            />
          </div>

          {/* League groups */}
          {leaguesLoading ? (
            <p className="text-xs text-gray-400">Loading leagues...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {leagues.map((league, i) => {
                const result = leagueRosterResults[i];
                return (
                  <RecipientChip
                    key={league.id}
                    label={league.name}
                    count={
                      result?.isLoading ? null : (result?.data?.data?.length ?? 0)
                    }
                    selected={selectedGroups.has(`league-${league.id}`)}
                    loading={result?.isLoading ?? false}
                    onClick={() => toggleGroup(`league-${league.id}`)}
                  />
                );
              })}
            </div>
          )}

          <p
            className={`text-xs ${
              selectedGroups.size === 0 ? "text-amber-600" : "text-gray-500"
            }`}
          >
            {selectedGroups.size === 0
              ? "No recipients selected"
              : `${recipientEmails.length} unique recipient${recipientEmails.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Subject */}
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          type="text"
          placeholder="Subject"
          className="px-4 py-2 w-1/2 rounded-lg border border-gray-200 focus:outline-1 focus:outline-primary hover:border-gray-400"
        />

        {/* Editor */}
        <div className="prose flex flex-col gap-4">
          <MenuBar editor={editor} />
          <EditorContent
            className="focus:outline-none border-0"
            editor={editor}
          />
        </div>
      </div>

      <div className="flex w-full gap-2 items-center py-6 pl-2">
        <button
          onClick={handleClear}
          className="hover:cursor-pointer hover:bg-gray-300/80 rounded-lg py-2 px-6 text-sm flex justify-center items-center bg-gray-100 text-primary border-primary border"
        >
          Clear
        </button>
        <button
          onClick={handleSend}
          className="hover:cursor-pointer hover:bg-primary/80 border border-primary rounded-lg py-2 px-6 text-sm flex justify-center items-center bg-primary text-white"
        >
          Send
        </button>
      </div>
    </ProtectedPage>
  );
}

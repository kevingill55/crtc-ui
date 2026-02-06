"use client";

import { TextStyleKit } from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/react";
import { Placeholder } from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { useProtectedRoute } from "../../hooks/useProtectedRoute";
import ProtectedPage from "@/app/components/ProtectedPage";
import { sendMassEmail } from "@/app/actions/send-email";
import "./temp.css";
import { useMutation } from "@tanstack/react-query";
import {
  NotificationStatus,
  useNotificationsContext,
} from "@/app/providers/Notifications";

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
    emptyEditorClass: "text-gray-600",
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
  // Read the current editor's state, and re-render the component when it changes
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

export default function AdminEmail() {
  const [sendToList, setSendToList] = useState("");
  const { addNotification } = useNotificationsContext();
  const [subject, setSubject] = useState("");
  const { user } = useProtectedRoute({ isAdmin: true });
  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-lg focus:outline-none list-disc m-0 p-0",
      },
    },
  });

  const { mutate: submitEmail } = useMutation({
    onSuccess: () => {
      setSubject("");
      setSendToList("");
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
      formData.append("recipients", sendToList);
      await sendMassEmail(formData);
    },
  });

  if (!user || !editor) return null;

  const handleOnClick = () => {
    const htmlContent = editor.getHTML();
    submitEmail(htmlContent);
  };

  return (
    <ProtectedPage title="Email">
      <div className="w-full border rounded-xl border-zinc-200 bg-zinc-100 shadow-lg p-6">
        <div className="flex items-center gap-2 w-full mb-4">
          <input
            id="crtc-admin-email-subject"
            value={sendToList}
            onChange={(e) => {
              setSendToList(e.target.value);
            }}
            type="text"
            placeholder="Recipients"
            className="px-4 py-2 w-1/2 rounded-lg border border-gray-200 focus:outline-1 focus:outline-primary hover:border-gray-400"
          />
        </div>
        <div className="flex items-center gap-2 w-full mb-4">
          <input
            id="crtc-admin-email-subject"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
            }}
            type="text"
            placeholder="Subject"
            className="px-4 py-2 w-1/2 rounded-lg border border-gray-200 focus:outline-1 focus:outline-primary hover:border-gray-400"
          />
        </div>
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
          onClick={() => editor?.commands.setContent("")}
          className="hover:cursor-pointer hover:bg-gray-300/80 rounded-lg py-2 px-6 text-sm flex justify-center items-center bg-gray-100 text-primary border-primary border"
        >
          Clear
        </button>
        <button
          onClick={handleOnClick}
          className="hover:cursor-pointer hover:bg-primary/80 border border-primary rounded-lg py-2 px-6 text-sm flex justify-center items-center bg-primary text-white"
        >
          Done
        </button>
      </div>
    </ProtectedPage>
  );
}

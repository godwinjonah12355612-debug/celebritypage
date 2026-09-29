"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Conversation = {
  id: string;
  member_id: string;
  booking_id: string | null;
  subject: string;
  status: "open" | "closed" | "archived";
  last_message_at: string | null;
  created_at: string;
};

type Member = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
};

type ConversationWithMember = Conversation & {
  member: Member | null;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  read_at: string | null;
  created_at: string;
};

type Props = {
  userId: string;
  profile?: {
    role?: string | null;
  } | null;
};

export default function MessagesClient({
  userId,
  profile,
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  /*
   * ---------------------------------------------------------
   * MANAGEMENT ROLE
   * ---------------------------------------------------------
   *
   * This prevents:
   *
   * Cannot read properties of undefined (reading 'role')
   *
   * if profile is temporarily unavailable.
   */
  const managementRole =
    profile?.role ?? "management";

  const [loading, setLoading] = useState(true);

  const [conversations, setConversations] =
    useState<ConversationWithMember[]>([]);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [search, setSearch] =
    useState("");

  const [messageText, setMessageText] =
    useState("");

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [savingStatus, setSavingStatus] =
    useState(false);

  const [isOtherTyping, setIsOtherTyping] =
    useState(false);

  const typingTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const lastTypingBroadcastRef =
    useRef(0);

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id === selectedId
    ) ?? null;

  /*
   * ---------------------------------------------------------
   * LOAD CONVERSATIONS
   * ---------------------------------------------------------
   */

  async function loadConversations() {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        id,
        member_id,
        booking_id,
        subject,
        status,
        last_message_at,
        created_at,
        member:profiles!conversations_member_id_fkey(
          id,
          full_name,
          display_name,
          email
        )
      `)
      .order("last_message_at", {
        ascending: false,
        nullsFirst: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "CONVERSATIONS ERROR:",
        error
      );
      return;
    }

    const mapped =
      (data ?? []).map((conversation) => ({
        ...conversation,
        member: Array.isArray(
          conversation.member
        )
          ? conversation.member[0] ?? null
          : conversation.member,
      })) as ConversationWithMember[];

    setConversations(mapped);

    setSelectedId((current) => {
      if (
        current &&
        mapped.some(
          (conversation) =>
            conversation.id === current
        )
      ) {
        return current;
      }

      return mapped[0]?.id ?? null;
    });
  }

  /*
   * ---------------------------------------------------------
   * LOAD MESSAGES
   * ---------------------------------------------------------
   */

  async function loadMessages(
    conversationId: string
  ) {
    setLoadingMessages(true);

    const { data, error } = await supabase
      .from("messages")
      .select(`
        id,
        conversation_id,
        sender_id,
        message,
        read_at,
        created_at
      `)
      .eq(
        "conversation_id",
        conversationId
      )
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "MESSAGES ERROR:",
        error
      );

      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    const loadedMessages =
      (data ?? []) as Message[];

    setMessages(loadedMessages);

    const conversation =
      conversations.find(
        (item) =>
          item.id === conversationId
      );

    if (conversation) {
      const unreadIds =
        loadedMessages
          .filter(
            (message) =>
              message.sender_id ===
                conversation.member_id &&
              !message.read_at
          )
          .map(
            (message) => message.id
          );

      if (unreadIds.length > 0) {
        const {
          error: readError,
        } = await supabase
          .from("messages")
          .update({
            read_at:
              new Date().toISOString(),
          })
          .in("id", unreadIds);

        if (readError) {
          console.error(
            "MARK READ ERROR:",
            readError
          );
        }
      }
    }

    setLoadingMessages(false);
  }

  /*
   * ---------------------------------------------------------
   * INITIAL LOAD
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      setLoading(true);

      await loadConversations();

      if (mounted) {
        setLoading(false);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * LOAD SELECTED CONVERSATION
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      setIsOtherTyping(false);
      return;
    }

    setIsOtherTyping(false);

    loadMessages(selectedId);
  }, [selectedId]);

  /*
   * ---------------------------------------------------------
   * REALTIME
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    console.log(
      "Starting management realtime:",
      selectedId
    );

    const channel = supabase
      .channel(`chat-${selectedId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedId}`,
        },
        (payload) => {
          console.log(
            "MANAGEMENT REALTIME MESSAGE:",
            payload
          );

          const incomingMessage =
            payload.new as Message;

          setMessages((current) => {
            const alreadyExists =
              current.some(
                (message) =>
                  message.id ===
                  incomingMessage.id
              );

            if (alreadyExists) {
              return current;
            }

            return [
              ...current,
              incomingMessage,
            ];
          });

          setConversations((current) =>
            current
              .map((conversation) =>
                conversation.id ===
                incomingMessage.conversation_id
                  ? {
                      ...conversation,
                      last_message_at:
                        incomingMessage.created_at,
                    }
                  : conversation
              )
              .sort((a, b) => {
                const aTime =
                  a.last_message_at
                    ? new Date(
                        a.last_message_at
                      ).getTime()
                    : 0;

                const bTime =
                  b.last_message_at
                    ? new Date(
                        b.last_message_at
                      ).getTime()
                    : 0;

                return bTime - aTime;
              })
          );

          /*
           * If the member sent this message,
           * mark it as read because management
           * is currently viewing the conversation.
           */
          if (
            incomingMessage.sender_id !==
            userId
          ) {
            supabase
              .from("messages")
              .update({
                read_at:
                  new Date().toISOString(),
              })
              .eq(
                "id",
                incomingMessage.id
              )
              .then(({ error }) => {
                if (error) {
                  console.error(
                    "REALTIME READ ERROR:",
                    error
                  );
                }
              });
          }
        }
      )
      .on(
        "broadcast",
        {
          event: "typing",
        },
        ({ payload }) => {
          if (!payload) {
            return;
          }

          /*
           * Ignore our own typing event.
           */
          if (
            payload.userId === userId
          ) {
            return;
          }

          const typing =
            payload.isTyping === true;

          setIsOtherTyping(typing);

          if (typing) {
            if (
              typingTimeoutRef.current
            ) {
              clearTimeout(
                typingTimeoutRef.current
              );
            }

            typingTimeoutRef.current =
              setTimeout(() => {
                setIsOtherTyping(false);
              }, 2000);
          }
        }
      )
      .subscribe((status) => {
        console.log(
          "MANAGEMENT REALTIME STATUS:",
          status
        );

        if (
          status === "SUBSCRIBED"
        ) {
          console.log(
            "Management realtime connected."
          );
        }

        if (
          status === "CHANNEL_ERROR"
        ) {
          console.error(
            "Management realtime channel error."
          );
        }

        if (
          status === "TIMED_OUT"
        ) {
          console.error(
            "Management realtime connection timed out."
          );
        }
      });

    return () => {
      console.log(
        "Removing management realtime:",
        selectedId
      );

      if (
        typingTimeoutRef.current
      ) {
        clearTimeout(
          typingTimeoutRef.current
        );
      }

      setIsOtherTyping(false);

      supabase.removeChannel(
        channel
      );
    };
  }, [
    selectedId,
    supabase,
    userId,
  ]);

  /*
   * ---------------------------------------------------------
   * BROADCAST TYPING
   * ---------------------------------------------------------
   */

  async function broadcastTyping(
    isTyping: boolean
  ) {
    if (!selectedId) {
      return;
    }

    const existingChannel =
      supabase
        .getChannels()
        .find(
          (item) =>
            item.topic ===
            `realtime:chat-${selectedId}`
        );

    if (!existingChannel) {
      return;
    }

    await existingChannel.send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId,
        isTyping,
      },
    });
  }

  /*
   * ---------------------------------------------------------
   * HANDLE TYPING
   * ---------------------------------------------------------
   */

  function handleMessageChange(
    value: string
  ) {
    setMessageText(value);

    if (!selectedId) {
      return;
    }

    if (!value.trim()) {
      broadcastTyping(false);
      return;
    }

    const now = Date.now();

    if (
      now -
        lastTypingBroadcastRef.current <
      500
    ) {
      return;
    }

    lastTypingBroadcastRef.current =
      now;

    broadcastTyping(true);

    if (
      typingTimeoutRef.current
    ) {
      clearTimeout(
        typingTimeoutRef.current
      );
    }

    typingTimeoutRef.current =
      setTimeout(() => {
        broadcastTyping(false);
      }, 1200);
  }

  /*
   * ---------------------------------------------------------
   * SEND MESSAGE
   * ---------------------------------------------------------
   */

  async function sendMessage() {
    const text =
      messageText.trim();

    if (!text) {
      return;
    }

    if (!selectedConversation) {
      return;
    }

    if (sending) {
      return;
    }

    if (
      selectedConversation.status !==
      "open"
    ) {
      return;
    }

    await broadcastTyping(false);

    if (
      typingTimeoutRef.current
    ) {
      clearTimeout(
        typingTimeoutRef.current
      );
    }

    setSending(true);

    const {
      data,
      error,
    } = await supabase
      .from("messages")
      .insert({
        conversation_id:
          selectedConversation.id,
        sender_id: userId,
        message: text,
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        message,
        read_at,
        created_at
      `)
      .single();

    if (error) {
      console.error(
        "SEND MESSAGE ERROR:",
        error
      );

      setSending(false);
      return;
    }

    if (data) {
      const newMessage =
        data as Message;

      setMessages((current) => {
        if (
          current.some(
            (message) =>
              message.id ===
              newMessage.id
          )
        ) {
          return current;
        }

        return [
          ...current,
          newMessage,
        ];
      });

      setConversations(
        (current) =>
          current.map(
            (conversation) =>
              conversation.id ===
              selectedConversation.id
                ? {
                    ...conversation,
                    last_message_at:
                      newMessage.created_at,
                  }
                : conversation
          )
      );
    }

    setMessageText("");

    const {
      error: conversationError,
    } = await supabase
      .from("conversations")
      .update({
        last_message_at:
          data?.created_at ??
          new Date().toISOString(),
      })
      .eq(
        "id",
        selectedConversation.id
      );

    if (conversationError) {
      console.error(
        "UPDATE CONVERSATION ERROR:",
        conversationError
      );
    }

    setSending(false);
  }

  /*
   * ---------------------------------------------------------
   * CHANGE STATUS
   * ---------------------------------------------------------
   */

  async function changeStatus(
    status:
      | "open"
      | "closed"
      | "archived"
  ) {
    if (!selectedConversation) {
      return;
    }

    setSavingStatus(true);

    const { error } =
      await supabase
        .from("conversations")
        .update({
          status,
        })
        .eq(
          "id",
          selectedConversation.id
        );

    if (error) {
      console.error(
        "CHANGE STATUS ERROR:",
        error
      );

      setSavingStatus(false);
      return;
    }

    setConversations((current) =>
      current.map(
        (conversation) =>
          conversation.id ===
          selectedConversation.id
            ? {
                ...conversation,
                status,
              }
            : conversation
      )
    );

    setSavingStatus(false);
  }

  /*
   * ---------------------------------------------------------
   * FILTER CONVERSATIONS
   * ---------------------------------------------------------
   */

  const filteredConversations =
    conversations.filter(
      (conversation) => {
        const memberName =
          conversation.member
            ?.full_name ??
          conversation.member
            ?.display_name ??
          "";

        const memberEmail =
          conversation.member
            ?.email ?? "";

        const subject =
          conversation.subject ?? "";

        const searchValue =
          search
            .trim()
            .toLowerCase();

        if (!searchValue) {
          return true;
        }

        return (
          memberName
            .toLowerCase()
            .includes(searchValue) ||
          memberEmail
            .toLowerCase()
            .includes(searchValue) ||
          subject
            .toLowerCase()
            .includes(searchValue)
        );
      }
    );

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  function formatTime(
    value: string
  ) {
    return new Date(
      value
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatConversationDate(
    value: string | null
  ) {
    if (!value) {
      return "";
    }

    return new Date(
      value
    ).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  }

  function getMemberName(
    conversation: ConversationWithMember
  ) {
    return (
      conversation.member
        ?.display_name ||
      conversation.member
        ?.full_name ||
      conversation.member
        ?.email ||
      "Member"
    );
  }

  function getConversationPreview(
    conversation: ConversationWithMember
  ) {
    if (
      conversation.last_message_at
    ) {
      return "Recent message";
    }

    return "No messages yet";
  }

  /*
   * ---------------------------------------------------------
   * LOADING STATE
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f2] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-black/10" />

            <div className="grid min-h-[650px] overflow-hidden rounded-3xl border border-black/10 bg-white lg:grid-cols-[360px_1fr]">
              <div className="border-r border-black/10 p-5">
                <div className="h-10 rounded-xl bg-black/5" />

                <div className="mt-5 space-y-3">
                  <div className="h-20 rounded-2xl bg-black/5" />
                  <div className="h-20 rounded-2xl bg-black/5" />
                  <div className="h-20 rounded-2xl bg-black/5" />
                </div>
              </div>

              <div className="hidden p-8 lg:block">
                <div className="h-10 w-64 rounded bg-black/5" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * PAGE
   * ---------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#f5f5f2] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Management
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Messages
            </h1>

            <p className="mt-2 text-sm text-black/55">
              Manage conversations with
              members.
            </p>
          </div>

          <Link
            href="/management"
            className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:bg-black/80"
          >
            Back to dashboard
          </Link>
        </div>

        {/* MESSAGING PANEL */}

        <div className="grid min-h-[700px] overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm lg:grid-cols-[360px_minmax(0,1fr)]">

          {/* CONVERSATION LIST */}

          <aside
            className={`flex w-full shrink-0 flex-col border-b border-black/10 lg:border-b-0 lg:border-r ${
              selectedConversation
                ? "hidden lg:flex"
                : "flex"
            }`}
          >

            {/* SEARCH */}

            <div className="border-b border-black/10 p-4 sm:p-5">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search conversations..."
                className="h-11 w-full rounded-xl border border-black/10 bg-[#f7f7f5] px-4 text-sm outline-none transition placeholder:text-black/35 focus:border-black/30 focus:bg-white"
              />
            </div>

            {/* LIST */}

            <div className="min-h-0 flex-1 overflow-y-auto">
              {filteredConversations.length ===
              0 ? (
                <div className="flex min-h-[300px] items-center justify-center px-6 text-center">
                  <div>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                      <span className="text-lg">
                        —
                      </span>
                    </div>

                    <h2 className="text-sm font-semibold text-black">
                      No conversations
                    </h2>

                    <p className="mt-1 text-xs text-black/45">
                      No messages match
                      your search.
                    </p>
                  </div>
                </div>
              ) : (
                filteredConversations.map(
                  (conversation) => {
                    const isSelected =
                      conversation.id ===
                      selectedId;

                    const memberName =
                      getMemberName(
                        conversation
                      );

                    return (
                      <button
                        key={
                          conversation.id
                        }
                        type="button"
                        onClick={() =>
                          setSelectedId(
                            conversation.id
                          )
                        }
                        className={`w-full border-b border-black/5 px-4 py-4 text-left transition sm:px-5 ${
                          isSelected
                            ? "bg-black text-white"
                            : "bg-white text-black hover:bg-black/[0.035]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                              isSelected
                                ? "bg-white text-black"
                                : "bg-black text-white"
                            }`}
                          >
                            {memberName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="truncate text-sm font-semibold">
                                {memberName}
                              </p>

                              <span
                                className={`shrink-0 text-[10px] ${
                                  isSelected
                                    ? "text-white/55"
                                    : "text-black/35"
                                }`}
                              >
                                {formatConversationDate(
                                  conversation.last_message_at
                                )}
                              </span>
                            </div>

                            <p
                              className={`mt-1 truncate text-xs ${
                                isSelected
                                  ? "text-white/60"
                                  : "text-black/45"
                              }`}
                            >
                              {
                                conversation.subject
                              }
                            </p>

                            <p
                              className={`mt-2 truncate text-xs ${
                                isSelected
                                  ? "text-white/45"
                                  : "text-black/35"
                              }`}
                            >
                              {getConversationPreview(
                                conversation
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  }
                )
              )}
            </div>
          </aside>

          {/* THREAD */}

          <section
            className={`min-w-0 flex-1 ${
              selectedConversation
                ? "flex"
                : "hidden lg:flex"
            } flex-col`}
          >
            {!selectedConversation ? (
              <div className="hidden flex-1 items-center justify-center lg:flex">
                <div className="text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
                    <span className="text-xl">
                      ✉
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold">
                    Select a conversation
                  </h2>

                  <p className="mt-2 text-sm text-black/45">
                    Choose a member conversation
                    to view messages.
                  </p>
                </div>
              </div>
            ) : (
              <>

                {/* THREAD HEADER */}

                <header className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 py-4 sm:px-6">
                  <div className="flex min-w-0 items-center gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedId(null)
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-lg transition hover:bg-black hover:text-white lg:hidden"
                      aria-label="Back to conversations"
                    >
                      ←
                    </button>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                      {getMemberName(
                        selectedConversation
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-black">
                        {getMemberName(
                          selectedConversation
                        )}
                      </h2>

                      <p className="truncate text-xs text-black/45">
                        {
                          selectedConversation.subject
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <select
                      value={
                        selectedConversation.status
                      }
                      disabled={
                        savingStatus
                      }
                      onChange={(event) =>
                        changeStatus(
                          event.target
                            .value as
                            | "open"
                            | "closed"
                            | "archived"
                        )
                      }
                      className="h-9 rounded-full border border-black/10 bg-white px-3 text-xs font-medium outline-none"
                    >
                      <option value="open">
                        Open
                      </option>

                      <option value="closed">
                        Closed
                      </option>

                      <option value="archived">
                        Archived
                      </option>
                    </select>
                  </div>
                </header>

                {/* MESSAGES */}

                <div className="min-h-0 flex-1 overflow-y-auto bg-[#fafaf8] p-4 sm:p-7">
                  {loadingMessages ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-sm text-black/45">
                        Loading messages...
                      </div>
                    </div>
                  ) : messages.length ===
                    0 ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                          <span>
                            —
                          </span>
                        </div>

                        <p className="text-sm font-medium text-black">
                          No messages yet
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          Start the
                          conversation below.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
                      {messages.map(
                        (message) => {
                          const isMemberMessage =
                            message.sender_id ===
                            selectedConversation.member_id;

                          const isManagementMessage =
                            !isMemberMessage;

                          return (
                            <div
                              key={
                                message.id
                              }
                              className={`flex ${
                                isManagementMessage
                                  ? "justify-start"
                                  : "justify-end"
                              }`}
                            >
                              <div
                                className={`flex max-w-[85%] flex-col sm:max-w-[70%] ${
                                  isManagementMessage
                                    ? "items-start"
                                    : "items-end"
                                }`}
                              >
                                <div className="mb-1 px-1 text-[10px] font-medium uppercase tracking-[0.12em] text-black/35">
                                  {isManagementMessage
                                    ? "Management"
                                    : "Member"}{" "}
                                  ·{" "}
                                  {formatTime(
                                    message.created_at
                                  )}
                                </div>

                                <div
                                  className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                                    isManagementMessage
                                      ? "rounded-tl-md bg-[#eeeeeb] text-black"
                                      : "rounded-tr-md bg-black text-white"
                                  }`}
                                >
                                  {
                                    message.message
                                  }
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}

                      {/* TYPING INDICATOR */}

                      {isOtherTyping && (
                        <div className="flex justify-start">
                          <div className="flex flex-col items-start">
                            <div className="mb-1 px-1 text-[10px] font-medium uppercase tracking-[0.12em] text-black/35">
                              Member
                            </div>

                            <div className="rounded-2xl rounded-tl-md bg-[#eeeeeb] px-4 py-3">
                              <div className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 [animation-delay:-0.3s]" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 [animation-delay:-0.15s]" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40" />
                              </div>
                            </div>

                            <span className="mt-1 px-1 text-[10px] text-black/35">
                              Member is typing...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* COMPOSER */}

                {selectedConversation.status ===
                "open" ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      sendMessage();
                    }}
                    className="shrink-0 border-t border-black/10 bg-white p-3 sm:p-5"
                  >
                    <div className="mx-auto flex max-w-4xl items-end gap-2 sm:gap-3">
                      <textarea
                        value={
                          messageText
                        }
                        onChange={(event) =>
                          handleMessageChange(
                            event.target.value
                          )
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key ===
                              "Enter" &&
                            !event.shiftKey
                          ) {
                            event.preventDefault();

                            if (
                              messageText.trim() &&
                              !sending
                            ) {
                              sendMessage();
                            }
                          }
                        }}
                        rows={2}
                        placeholder="Write a message..."
                        className="min-w-0 flex-1 resize-none rounded-2xl border border-black/10 bg-[#f7f7f5] px-4 py-3 text-sm outline-none transition placeholder:text-black/35 focus:border-black/25 focus:bg-white"
                      />

                      <button
                        type="submit"
                        disabled={
                          sending ||
                          !messageText.trim()
                        }
                        className="shrink-0 rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
                      >
                        {sending
                          ? "Sending..."
                          : "Send"}
                      </button>
                    </div>

                    <p className="mx-auto mt-2 max-w-4xl px-1 text-[10px] text-black/35">
                      Press Enter to send ·
                      Shift + Enter for a new
                      line
                    </p>
                  </form>
                ) : (
                  <div className="shrink-0 border-t border-black/10 bg-white px-5 py-4">
                    <div className="rounded-2xl bg-black/[0.035] px-4 py-3 text-center text-xs text-black/45">
                      This conversation is{" "}
                      {
                        selectedConversation.status
                      }.
                      Reopen it to send new
                      messages.
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* ROLE INFORMATION */}

        <div className="mt-5 flex items-center justify-between px-1">
          <p className="text-xs text-black/35">
            Signed in as{" "}
            <span className="font-medium text-black/50">
              {managementRole}
            </span>
          </p>

          <p className="text-xs text-black/30">
            Realtime messaging + typing enabled
          </p>
        </div>
      </div>
    </main>
  );
}
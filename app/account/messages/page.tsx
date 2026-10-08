"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
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

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  read_at: string | null;
  created_at: string;
};

type Profile = {
  full_name: string | null;
  display_name: string | null;
  email: string | null;
};

const supabase = createClient();

function formatConversationDate(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMessageDate(value: string) {
  const date = new Date(value);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return "Today";
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "CM";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function statusLabel(status: Conversation["status"]) {
  if (status === "open") return "Open";
  if (status === "closed") return "Closed";
  return "Archived";
}

function statusClasses(status: Conversation["status"]) {
  if (status === "open") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (status === "closed") {
    return "bg-slate-100 text-slate-600 ring-slate-200";
  }

  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
}: {
  name:
    | "dashboard"
    | "calendar"
    | "card"
    | "message"
    | "user"
    | "search"
    | "plus"
    | "arrow"
    | "send"
    | "back"
    | "menu"
    | "close"
    | "chevron"
    | "check"
    | "checkDouble"
    | "paperclip"
    | "smile"
    | "info"
    | "logout"
    | "external";
  size?: number;
  strokeWidth?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4.5" width="18" height="17" rx="2" />
          <path d="M16 2.5v4M8 2.5v4M3 9h18" />
        </svg>
      );

    case "card":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18M7 15h4" />
        </svg>
      );

    case "message":
      return (
        <svg {...common}>
          <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.3-.6L4 20l1.6-3.4A7.3 7.3 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />
          <path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 21a7 7 0 0 1 14 0" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 5 5" />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );

    case "send":
      return (
        <svg {...common}>
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      );

    case "back":
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );

    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "checkDouble":
      return (
        <svg {...common}>
          <path d="m2.5 12 4 4L17 5.5" />
          <path d="m8.5 16 2 2L21 7.5" />
        </svg>
      );

    case "paperclip":
      return (
        <svg {...common}>
          <path d="m20.5 11.5-8.8 8.8a5 5 0 0 1-7.1-7.1l9.1-9.1a3.5 3.5 0 1 1 5 5l-8.8 8.8a2 2 0 0 1-2.8-2.8l8-8" />
        </svg>
      );

    case "smile":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14.5s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
        </svg>
      );

    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 10v6M12 7h.01" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 17l5-5-5-5M15 12H3" />
          <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
        </svg>
      );

    case "external":
      return (
        <svg {...common}>
          <path d="M14 4h6v6M20 4l-9 9" />
          <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
        </svg>
      );

    default:
      return null;
  }
}

export default function MessagesPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [mobileConversationOpen, setMobileConversationOpen] =
    useState(false);

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const managementName = "Celebrity Management";
  const managementSubtitle = "Management Team";

  /*
   * ---------------------------------------------------------
   * AUTHENTICATION
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        router.replace(
          `/member/login?redirect=${encodeURIComponent("/account/messages")}`,
        );
        return;
      }

      setUserId(user.id);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, display_name, email")
        .eq("id", user.id)
        .maybeSingle();

      if (mounted && profileData) {
        setProfile(profileData);
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
   * ---------------------------------------------------------
   * LOAD CONVERSATIONS
   * ---------------------------------------------------------
   */

  const loadConversations = useCallback(
    async (memberId: string) => {
      setLoading(true);

      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
            id,
            member_id,
            booking_id,
            subject,
            status,
            last_message_at,
            created_at
          `,
        )
        .eq("member_id", memberId)
        .order("last_message_at", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Failed to load conversations:", error);
        setConversations([]);
      } else {
        setConversations((data ?? []) as Conversation[]);
      }

      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    if (!userId) return;

    loadConversations(userId);
  }, [userId, loadConversations]);

  /*
   * ---------------------------------------------------------
   * LOAD MESSAGES
   * ---------------------------------------------------------
   */

  const markIncomingMessagesRead = useCallback(
    async (conversationId: string, memberId: string) => {
      const { error } = await supabase
        .from("messages")
        .update({
          read_at: new Date().toISOString(),
        })
        .eq("conversation_id", conversationId)
        .neq("sender_id", memberId)
        .is("read_at", null);

      if (error) {
        console.error("Failed to mark messages as read:", error);
      }
    },
    [],
  );

  const loadMessages = useCallback(
    async (conversation: Conversation, memberId: string) => {
      setMessagesLoading(true);
      setMessages([]);

      const { data, error } = await supabase
        .from("messages")
        .select(
          `
            id,
            conversation_id,
            sender_id,
            message,
            read_at,
            created_at
          `,
        )
        .eq("conversation_id", conversation.id)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error("Failed to load messages:", error);
        setMessages([]);
      } else {
        setMessages((data ?? []) as Message[]);

        await markIncomingMessagesRead(conversation.id, memberId);
      }

      setMessagesLoading(false);
    },
    [markIncomingMessagesRead],
  );

  /*
   * ---------------------------------------------------------
   * REALTIME
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!selectedConversation || !userId) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      return;
    }

    const conversationId = selectedConversation.id;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase.channel(
      `member-messages-${conversationId}`,
    );

    channel
      .on(
        "broadcast",
        {
          event: "typing",
        },
        (payload) => {
          const incomingUserId = payload.payload?.userId;
          const typing = Boolean(payload.payload?.typing);

          if (incomingUserId === userId) {
            return;
          }

          setIsOtherTyping(typing);

          if (otherTypingTimeoutRef.current) {
            clearTimeout(otherTypingTimeoutRef.current);
          }

          if (typing) {
            otherTypingTimeoutRef.current = setTimeout(() => {
              setIsOtherTyping(false);
            }, 2500);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const incoming = payload.new as Message;

          setMessages((current) => {
            if (current.some((item) => item.id === incoming.id)) {
              return current;
            }

            return [...current, incoming];
          });

          setConversations((current) =>
            current
              .map((conversation) =>
                conversation.id === conversationId
                  ? {
                      ...conversation,
                      last_message_at: incoming.created_at,
                    }
                  : conversation,
              )
              .sort((a, b) => {
                const aDate = a.last_message_at
                  ? new Date(a.last_message_at).getTime()
                  : 0;

                const bDate = b.last_message_at
                  ? new Date(b.last_message_at).getTime()
                  : 0;

                return bDate - aDate;
              }),
          );

          if (incoming.sender_id !== userId) {
            await markIncomingMessagesRead(conversationId, userId);
          }
        },
      )
      .subscribe((status) => {
        console.log(
          `Messaging realtime status: ${status}`,
        );
      });

    channelRef.current = channel;

    return () => {
      if (otherTypingTimeoutRef.current) {
        clearTimeout(otherTypingTimeoutRef.current);
      }

      supabase.removeChannel(channel);

      if (channelRef.current === channel) {
        channelRef.current = null;
      }
    };
  }, [selectedConversation, userId, markIncomingMessagesRead]);

  /*
   * ---------------------------------------------------------
   * SELECT CONVERSATION
   * ---------------------------------------------------------
   */

  const selectConversation = async (
    conversation: Conversation,
  ) => {
    setSelectedConversation(conversation);
    setMobileConversationOpen(true);
    setIsOtherTyping(false);

    if (userId) {
      await loadMessages(conversation, userId);
    }
  };

  /*
   * ---------------------------------------------------------
   * AUTO SCROLL
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 80);

    return () => clearTimeout(timer);
  }, [messages, isOtherTyping]);

  /*
   * ---------------------------------------------------------
   * TYPING
   * ---------------------------------------------------------
   */

  const broadcastTyping = async (typing: boolean) => {
    if (!channelRef.current || !userId) return;

    await channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId,
        typing,
      },
    });
  };

  const handleTyping = (
    value: string,
  ) => {
    setMessageText(value);

    if (!value.trim()) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      broadcastTyping(false);
      return;
    }

    broadcastTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      broadcastTyping(false);
    }, 1800);
  };

  /*
   * ---------------------------------------------------------
   * SEND MESSAGE
   * ---------------------------------------------------------
   */

  const sendMessage = async (
    event?: FormEvent,
  ) => {
    event?.preventDefault();

    if (!userId || !selectedConversation) return;

    const cleanMessage = messageText.trim();

    if (!cleanMessage || sending) return;

    setSending(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    await broadcastTyping(false);

    const optimisticId = `optimistic-${Date.now()}`;

    const optimisticMessage: Message = {
      id: optimisticId,
      conversation_id: selectedConversation.id,
      sender_id: userId,
      message: cleanMessage,
      read_at: null,
      created_at: new Date().toISOString(),
    };

    setMessages((current) => [
      ...current,
      optimisticMessage,
    ]);

    setMessageText("");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: selectedConversation.id,
        sender_id: userId,
        message: cleanMessage,
      })
      .select(
        `
          id,
          conversation_id,
          sender_id,
          message,
          read_at,
          created_at
        `,
      )
      .single();

    if (error) {
      console.error("Failed to send message:", error);

      setMessages((current) =>
        current.filter(
          (message) => message.id !== optimisticId,
        ),
      );

      setMessageText(cleanMessage);
      setSending(false);
      return;
    }

    setMessages((current) =>
      current.map((message) =>
        message.id === optimisticId
          ? (data as Message)
          : message,
      ),
    );

    setConversations((current) =>
      current
        .map((conversation) =>
          conversation.id === selectedConversation.id
            ? {
                ...conversation,
                last_message_at: data.created_at,
              }
            : conversation,
        )
        .sort((a, b) => {
          const aDate = a.last_message_at
            ? new Date(a.last_message_at).getTime()
            : 0;

          const bDate = b.last_message_at
            ? new Date(b.last_message_at).getTime()
            : 0;

          return bDate - aDate;
        }),
    );

    setSelectedConversation((current) =>
      current
        ? {
            ...current,
            last_message_at: data.created_at,
          }
        : current,
    );

    setSending(false);
  };

  /*
   * ---------------------------------------------------------
   * NEW CONVERSATION
   * ---------------------------------------------------------
   */

  const createConversation = async () => {
  if (!userId) return;

  // First, check whether this member already has a conversation
  const { data: existingConversation, error: existingError } = await supabase
    .from("conversations")
    .select(`
      id,
      member_id,
      booking_id,
      subject,
      status,
      last_message_at,
      created_at
    `)
    .eq("member_id", userId)
    .maybeSingle();

  if (existingError) {
    console.error(
      "Failed to check existing conversation:",
      existingError,
    );
    return;
  }

  // If the member already has a conversation, use it
  if (existingConversation) {
    const conversation = existingConversation as Conversation;

    setConversations((current) => {
      const alreadyExists = current.some(
        (item) => item.id === conversation.id,
      );

      if (alreadyExists) {
        return current;
      }

      return [conversation, ...current];
    });

    setSelectedConversation(conversation);
    setMobileConversationOpen(true);

    // Load the existing messages
    await loadMessages(conversation, userId);

    return;
  }

  // No conversation exists, so create the first and only one
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      member_id: userId,
      subject: "General Enquiry",
      status: "open",
    })
    .select(`
      id,
      member_id,
      booking_id,
      subject,
      status,
      last_message_at,
      created_at
    `)
    .single();

  if (error) {
    console.error("Failed to create conversation:", error);
    return;
  }

  const conversation = data as Conversation;

  setConversations((current) => [
    conversation,
    ...current.filter((item) => item.id !== conversation.id),
  ]);

  setSelectedConversation(conversation);
  setMobileConversationOpen(true);
  setMessages([]);
};
  /*
   * ---------------------------------------------------------
   * MOBILE BACK
   * ---------------------------------------------------------
   */

  const handleMobileBack = () => {
    setMobileConversationOpen(false);
    setIsOtherTyping(false);
  };

  /*
   * ---------------------------------------------------------
   * FILTER CONVERSATIONS
   * ---------------------------------------------------------
   */

  const filteredConversations =
    conversations.filter((conversation) => {
      const search = searchText.trim().toLowerCase();

      if (!search) return true;

      return (
        conversation.subject
          ?.toLowerCase()
          .includes(search) ||
        conversation.status
          ?.toLowerCase()
          .includes(search)
      );
    });

  const memberName =
    profile?.display_name ||
    profile?.full_name ||
    "Member";

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-500">
            Loading your messages...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * PAGE
   * ---------------------------------------------------------
   */

  return (
    <div className="flex min-h-dvh w-full overflow-hidden bg-[#f8fafc] text-slate-900">
      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside className="hidden w-[248px] shrink-0 flex-col bg-[#0f172a] text-white lg:flex">
        <div className="flex h-[82px] items-center border-b border-white/10 px-6">
          <Link
            href="/account"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black tracking-tight text-[#0f172a]">
              CM
            </div>

            <div>
              <p className="text-sm font-bold tracking-wide">
                CELEBRITY
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
                Member Portal
              </p>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-3 py-5">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Account
          </p>

          <nav className="space-y-1">
            <Link
              href="/account"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <Icon name="dashboard" size={19} />
              Dashboard
            </Link>

            <Link
              href="/account/bookings"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <Icon name="calendar" size={19} />
              My Bookings
            </Link>

            <Link
              href="/fan-card/apply"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <Icon name="card" size={19} />
              Fan Card
            </Link>

            <Link
              href="/account/messages"
              className="group flex items-center justify-between rounded-xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/20"
            >
              <span className="flex items-center gap-3">
                <Icon name="message" size={19} />
                Messages
              </span>

              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </Link>

            <Link
              href="/account/profile"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <Icon name="user" size={19} />
              Profile
            </Link>
          </nav>

          <p className="px-3 pb-3 pt-8 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Explore
          </p>

          <nav className="space-y-1">
            <Link
              href="/celebrities"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              Browse Celebrities
            </Link>

            <Link
              href="/booking"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              Book a Celebrity
            </Link>

            <Link
              href="/events"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              Events
            </Link>
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
              {getInitials(memberName)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {memberName}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                Member Account
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN AREA
      ====================================================== */}

      <main className="flex min-h-dvh min-w-0 flex-1 flex-col overflow-hidden">
        {/* ===================================================
            TOP HEADER
        ==================================================== */}

        <header className="flex h-[74px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/account"
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 sm:flex"
              aria-label="Back to dashboard"
            >
              <Icon name="back" size={18} />
            </Link>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
                Messages
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Communicate directly with Celebrity Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={createConversation}
              className="hidden h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 sm:flex"
            >
              <Icon name="plus" size={17} />
              New Conversation
            </button>

            <button
              type="button"
              onClick={() =>
                setShowMobileMenu((current) => !current)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 sm:hidden"
              aria-label="Open menu"
            >
              <Icon name="menu" size={20} />
            </button>
          </div>
        </header>

        {/* ===================================================
            MOBILE MENU
        ==================================================== */}

        {showMobileMenu && (
          <div className="border-b border-slate-200 bg-white p-3 sm:hidden">
            <Link
              href="/account"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Icon name="dashboard" size={18} />
              Dashboard
            </Link>

            <Link
              href="/account/profile"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Icon name="user" size={18} />
              Profile
            </Link>

            <button
              type="button"
              onClick={() => {
                setShowMobileMenu(false);
                createConversation();
              }}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              <Icon name="plus" size={18} />
              New Conversation
            </button>
          </div>
        )}

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <div className="min-h-0 flex-1 p-0 sm:p-4 lg:p-6">
          <div className="flex h-full min-h-0 overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm">
            {/* =================================================
                CONVERSATION LIST
            ================================================== */}

            <section
              className={`flex w-full shrink-0 flex-col border-r border-slate-200 bg-white sm:w-[320px] lg:w-[360px] ${
                mobileConversationOpen
                  ? "hidden sm:flex"
                  : "flex"
              }`}
            >
              <div className="border-b border-slate-200 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      Conversations
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {conversations.length} conversation
                      {conversations.length === 1
                        ? ""
                        : "s"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={createConversation}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100 sm:hidden"
                    aria-label="New conversation"
                  >
                    <Icon name="plus" size={18} />
                  </button>
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Icon name="search" size={17} />
                  </div>

                  <input
                    type="text"
                    value={searchText}
                    onChange={(event) =>
                      setSearchText(event.target.value)
                    }
                    placeholder="Search conversations..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-[16px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 sm:text-sm"
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Icon name="message" size={25} />
                    </div>

                    <h2 className="text-sm font-bold text-slate-900">
                      No conversations
                    </h2>

                    <p className="mt-1 max-w-[240px] text-xs leading-5 text-slate-500">
                      Start a conversation with Celebrity
                      Management whenever you need assistance.
                    </p>

                    <button
                      type="button"
                      onClick={createConversation}
                      className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Icon name="plus" size={15} />
                      Start Conversation
                    </button>
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredConversations.map(
                      (conversation) => {
                        const selected =
                          selectedConversation?.id ===
                          conversation.id;

                        return (
                          <button
                            key={conversation.id}
                            type="button"
                            onClick={() =>
                              selectConversation(conversation)
                            }
                            className={`mb-1 flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                              selected
                                ? "bg-blue-50 ring-1 ring-blue-100"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <div
                              className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                selected
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              CM

                              {selected && (
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`truncate text-sm font-semibold ${
                                    selected
                                      ? "text-blue-950"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {managementName}
                                </p>

                                <span className="shrink-0 text-[10px] font-medium text-slate-400">
                                  {formatConversationDate(
                                    conversation.last_message_at ||
                                      conversation.created_at,
                                  )}
                                </span>
                              </div>

                              <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                                {conversation.subject ||
                                  "General Enquiry"}
                              </p>

                              <div className="mt-2 flex items-center justify-between gap-2">
                                <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold ring-1 ${statusClasses(
                                    conversation.status,
                                  )}`}
                                >
                                  {statusLabel(
                                    conversation.status,
                                  )}
                                </span>

                                {selected && (
                                  <Icon
                                    name="chevron"
                                    size={15}
                                  />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                CHAT PANEL
            ================================================== */}

            <section
              className={`min-w-0 flex-1 flex-col bg-[#f8fafc] ${
                mobileConversationOpen
                  ? "flex"
                  : "hidden sm:flex"
              }`}
            >
              {!selectedConversation ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                    <Icon name="message" size={34} />
                  </div>

                  <h2 className="text-xl font-bold tracking-tight text-slate-950">
                    Your messages
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Select a conversation from the left to
                    continue chatting with Celebrity
                    Management, or start a new conversation.
                  </p>

                  <button
                    type="button"
                    onClick={createConversation}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    <Icon name="plus" size={17} />
                    New Conversation
                  </button>
                </div>
              ) : (
                <>
                  {/* ===========================================
                      CHAT HEADER
                  ============================================ */}

                  <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={handleMobileBack}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 sm:hidden"
                        aria-label="Back to conversations"
                      >
                        <Icon name="back" size={18} />
                      </button>

                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0f172a] text-xs font-bold text-white">
                        CM

                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-950">
                          {managementName}
                        </p>

                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                          <span className="text-[11px] font-medium text-slate-500">
                            Online
                          </span>

                          <span className="text-slate-300">
                            •
                          </span>

                          <span className="truncate text-[11px] text-slate-400">
                            {managementSubtitle}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden items-center gap-2 sm:flex">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${statusClasses(
                          selectedConversation.status,
                        )}`}
                      >
                        {statusLabel(
                          selectedConversation.status,
                        )}
                      </span>

                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Conversation information"
                      >
                        <Icon name="info" size={18} />
                      </button>
                    </div>
                  </div>

                  {/* ===========================================
                      SUBJECT BAR
                  ============================================ */}

                  <div className="border-b border-slate-200/80 bg-white/80 px-4 py-2.5 sm:px-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-700">
                          {selectedConversation.subject ||
                            "General Enquiry"}
                        </p>

                        {selectedConversation.booking_id && (
                          <p className="mt-0.5 truncate text-[10px] text-slate-400">
                            Booking conversation
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        Secure conversation
                      </span>
                    </div>
                  </div>

                  {/* ===========================================
                      MESSAGES
                  ============================================ */}

                  <div className="chat-content relative flex-1 overflow-y-auto px-3 py-5 sm:px-6 sm:py-6">
                    {messagesLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                          Loading conversation...
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                          <Icon name="message" size={25} />
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">
                          Start the conversation
                        </h3>

                        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                          Send a message to Celebrity
                          Management. They will be able to
                          respond to you in realtime.
                        </p>
                      </div>
                    ) : (
                      <div className="mx-auto max-w-4xl">
                        <div className="space-y-5">
                          {messages.map(
                            (message, index) => {
                              const isMine =
                                message.sender_id ===
                                userId;

                              const previousMessage =
                                messages[index - 1];

                              const showDate =
                                !previousMessage ||
                                new Date(
                                  previousMessage.created_at,
                                ).toDateString() !==
                                  new Date(
                                    message.created_at,
                                  ).toDateString();

                              return (
                                <div key={message.id}>
                                  {showDate && (
                                    <div className="my-6 flex items-center justify-center">
                                      <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-slate-400 shadow-sm ring-1 ring-slate-200">
                                        {formatMessageDate(
                                          message.created_at,
                                        )}
                                      </span>
                                    </div>
                                  )}

                                  <div
                                    className={`flex items-end gap-2 ${
                                      isMine
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                                  >
                                    {!isMine && (
                                      <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f172a] text-[9px] font-bold text-white sm:flex">
                                        CM
                                      </div>
                                    )}

                                    <div
                                      className={`max-w-[88%] sm:max-w-[72%] ${
                                        isMine
                                          ? "items-end"
                                          : "items-start"
                                      } flex flex-col`}
                                    >
                                      <div
                                        className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                                          isMine
                                            ? "rounded-br-md bg-blue-600 text-white shadow-sm shadow-blue-600/10"
                                            : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                                        }`}
                                      >
                                        <p className="whitespace-pre-wrap break-words">
                                          {message.message}
                                        </p>
                                      </div>

                                      <div
                                        className={`mt-1.5 flex items-center gap-1.5 px-1 text-[9px] font-medium ${
                                          isMine
                                            ? "text-slate-400"
                                            : "text-slate-400"
                                        }`}
                                      >
                                        <span>
                                          {formatMessageTime(
                                            message.created_at,
                                          )}
                                        </span>

                                        {isMine && (
                                          <>
                                            {message.read_at ? (
                                              <Icon
                                                name="checkDouble"
                                                size={13}
                                                strokeWidth={1.7}
                                              />
                                            ) : (
                                              <Icon
                                                name="check"
                                                size={13}
                                                strokeWidth={1.7}
                                              />
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            },
                          )}

                          {isOtherTyping && (
                            <div className="flex items-end gap-2">
                              <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f172a] text-[9px] font-bold text-white sm:flex">
                                CM
                              </div>

                              <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
                                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
                                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" />
                                </div>
                              </div>

                              <span className="pb-1 text-[10px] font-medium text-slate-400">
                                Management is typing...
                              </span>
                            </div>
                          )}

                          <div ref={messagesEndRef} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ===========================================
                      COMPOSER
                  ============================================ */}

                  <div className="chat-composer border-t border-slate-200 bg-white px-3 pt-3 sm:px-5 sm:pt-4">
                    <form
                      onSubmit={sendMessage}
                      className="mx-auto max-w-4xl"
                    >
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5">
                        <div className="flex items-end gap-2">
                          <button
                            type="button"
                            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:flex"
                            aria-label="Attach file"
                          >
                            <Icon
                              name="paperclip"
                              size={19}
                            />
                          </button>

                          <textarea
                            value={messageText}
                            onChange={(event) =>
                              handleTyping(
                                event.target.value,
                              )
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" &&
                                !event.shiftKey
                              ) {
                                event.preventDefault();
                                sendMessage();
                              }
                            }}
                            rows={1}
                            disabled={
                              sending ||
                              selectedConversation.status !==
                                "open"
                            }
                            placeholder={
                              selectedConversation.status ===
                              "open"
                                ? "Write a message..."
                                : "This conversation is closed."
                            }
                            className="max-h-32 min-h-[42px] min-w-0 flex-1 resize-none bg-transparent px-2 py-2.5 text-[16px] leading-6 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                          />

                          <button
                            type="button"
                            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:flex"
                            aria-label="Add emoji"
                          >
                            <Icon
                              name="smile"
                              size={19}
                            />
                          </button>

                          <button
                            type="submit"
                            disabled={
                              sending ||
                              !messageText.trim() ||
                              selectedConversation.status !==
                                "open"
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none sm:w-auto sm:gap-2 sm:px-4"
                            aria-label="Send message"
                          >
                            {sending ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            ) : (
                              <>
                                <Icon
                                  name="send"
                                  size={17}
                                />
                                <span className="hidden text-xs font-semibold sm:inline">
                                  Send
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-1 pb-2 pt-2">
                        <p className="text-[9px] font-medium text-slate-400 sm:text-[10px]">
                          Press Enter to send • Shift + Enter
                          for a new line
                        </p>

                        <p className="hidden text-[10px] font-medium text-slate-400 sm:block">
                          Secure messaging
                        </p>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
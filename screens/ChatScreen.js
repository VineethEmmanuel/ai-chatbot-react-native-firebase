// ChatScreen.js
import React, { useState, useCallback, useEffect } from "react";
import {
  Bubble,
  GiftedChat,
  InputToolbar,
  Send,
} from "react-native-gifted-chat";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import OpenAI from "openai";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { HUGGING_FACE_TOKEN } from "@env";

const openai = new OpenAI({
  apiKey: HUGGING_FACE_TOKEN,
  baseURL: "https://router.huggingface.co/v1",
  dangerouslyAllowBrowser: true,
});

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const messagesRef = collection(db, "chats", userId, "messages");

    const q = query(messagesRef, orderBy("createdAt", "desc")); // newest first

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedMessages = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            _id: doc.id, // use Firestore doc ID
            text: data.text,
            createdAt: data.createdAt?.toDate() || new Date(), // Firestore Timestamp → JS Date
            user: data.user,
          };
        });

        // GiftedChat expects reversed order (oldest at bottom)
        setMessages(loadedMessages.reverse());
        setIsLoading(false);
      },
      (error) => {
        console.error("Firestore listener error:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const onSend = useCallback(async (newMessages = []) => {
    // Append locally first for instant UI feedback
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    const userId = auth.currentUser.uid;
    const messagesRef = collection(db, "chats", userId, "messages");

    // Save each new message (GiftedChat sends array, usually 1)
    for (const msg of newMessages) {
      await addDoc(messagesRef, {
        text: msg.text,
        createdAt: serverTimestamp(), // Firestore server time
        user: {
          _id: 1, // You
          name: "You",
        },
      });
    }

    // Then get AI response...
    const userInput = newMessages[0].text;
    setIsLoading(true); // optional spinner
    setIsTyping(true);

    const aiReply = await getAIResponse(userInput).then((response) => {
      setIsTyping(false);
      return response;
    });
    const aiMessage = {
      _id: Math.random().toString(),
      text: aiReply,
      createdAt: new Date(),
      user: { _id: 2, name: "AI Bot" },
    };

    setMessages((prev) => GiftedChat.append(prev, [aiMessage]));

    // Save AI reply too!
    await addDoc(messagesRef, {
      text: aiReply,
      createdAt: serverTimestamp(),
      user: {
        _id: 2,
        name: "AI Bot",
      },
    });

    setIsLoading(false);
  }, []);

  const getAIResponse = async (userInput) => {
    try {
      const completion = await openai.chat.completions.create({
        model: "meta-llama/Llama-3.2-3B-Instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful career coach for BTech students in India.",
          },
          { role: "user", content: userInput },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error("AI error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
      return "Sorry, the AI is taking a quick break. Try again in a moment!";
    }
  };

  const renderCustomBubble = (props) => {
    const { currentMessage } = props;
    const isUser = currentMessage.user._id === 1;

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: COLORS.userBubble,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 4,
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
          },
          left: {
            backgroundColor: COLORS.botBubble,
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 4,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
          },
        }}
        textStyle={{
          right: {
            color: COLORS.userText,
            fontFamily: FONTS.regular,
          },
          left: {
            color: COLORS.botText,
            fontFamily: FONTS.regular,
          },
        }}
        bottomContainerStyle={{
          right: { borderColor: "transparent" },
          left: { borderColor: "transparent" },
        }}
      />
    );
  };

  const renderCustomAvatar = (props) => {
    const { currentMessage } = props;
    const isUser = currentMessage.user._id === 1;

    return (
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: isUser ? COLORS.primary : "#9ca3af",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 8,
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          {isUser ? "You" : "AI"}
        </Text>
      </View>
    );
  };

  const renderCustomInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          backgroundColor: COLORS.inputBackground,
          padding: 8,
        }}
      />
    );
  };

  const renderCustomSend = (props) => {
    const { text, onSend } = props;
    return (
      <Send
        {...props}
        containerStyle={{
          justifyContent: "center",
          alignItems: "center",
          marginHorizontal: 8,
        }}
      >
        <View
          style={{
            backgroundColor:
              text.trim().length > 0 ? COLORS.primary : "#d1d5db",
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Send</Text>
        </View>
      </Send>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: 1, name: "You" }}
        placeholder="Ask me anything..."
        isLoadingEarlier={isLoading}
        isTyping={isTyping}
        typingText="AI is thinking..."
        // Colors
        renderAvatarOnTop={true}
        alwaysShowSend={true}
        scrollToBottomComponent={() => (
          <View style={{ padding: 8 }}>
            <Text>↓</Text>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

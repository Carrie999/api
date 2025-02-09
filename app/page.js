


"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState(""); // 用户输入
  const [response, setResponse] = useState(""); // AI 回复
  const [loading, setLoading] = useState(false); // 加载状态

  const sendMessage = async () => {
    if (!message.trim()) return; // 防止空请求
    setResponse(""); // 清空上次回复
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST", // 改为 POST 发送用户消息
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }), // 发送用户输入
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break; // 读取完毕

      setResponse((prev) => prev + decoder.decode(value)); // 追加回复
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>DeepSeek Chat</h1>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="输入你的问题..."
        rows={4}
        style={{ width: "100%", padding: "10px", fontSize: "16px" }}
      />
      <button onClick={sendMessage} disabled={loading} style={{
        marginTop: "10px", marginBottom: "10px", backgroundColor: "#8530ef", color: "white", padding: "5px", borderRadius: "5px", paddingLeft: "10px", paddingRight: "10px"
      }}>
        {loading ? "AI 生成中..." : "发送"}
      </button>
      <h3>AI 回复：</h3>
      <p style={{ whiteSpace: "pre-wrap" }}>{response || "等待回复..."}</p>
    </div>
  );
}
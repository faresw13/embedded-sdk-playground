import { useState, useEffect } from "react";
import { useAppBootstrap } from "./hooks/useAppBootstrap.js";
import { useIframeAutoBootstrap } from "./hooks/useIframeAutoBootstrap.js";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

const BACKEND_URL = "https://ai-agent-backend-nama.onrender.com";

function AppContent() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "هلا بك 👋 أنا وكيل متجرك الذكي. وش تبي أسوي في متجرك؟",
    },
  ]);

  const [store, setStore] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const {
    embedded,
    isReady,
    bootstrap,
  } = useAppBootstrap({
    debug: true,
    autoInit: false,
    onThemeChange: () => {},
    onActionClick: () => {},
  });

  const { iframeMode } = useIframeAutoBootstrap(bootstrap);

  // جلب بيانات المتجر
  useEffect(() => {
    if (!isReady) return;

    fetch(`${BACKEND_URL}/agent/store-info`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setStore(data.store);
        }
      })
      .catch((error) => {
        console.error("Store info error:", error);
      });
  }, [isReady]);

  // إرسال الرسالة للذكاء الاصطناعي
  const sendMessage = async () => {
    const text = message.trim();

    if (!text || isSending) return;

    const updatedMessages = [
      ...messages,
      {
        role: "user",
        text,
      },
    ];

    setMessages(updatedMessages);
    setMessage("");
    setIsSending(true);

    try {
      const response = await fetch(`${BACKEND_URL}/agent/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((item) => ({
            role: item.role,
            content: item.text,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي"
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: data.message,
        },
      ]);
    } catch (error) {
      console.error("AI chat error:", error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "صار خطأ أثناء الاتصال بالوكيل الذكي. حاول مرة ثانية.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    "صمم لي متجر كامل",
    "رتب الصفحة الرئيسية",
    "جهز المنتجات والأوصاف",
    "غير تصميم المتجر",
  ];

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#111111",
        color: "#ffffff",
        fontFamily: "Arial, Tahoma, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          height: "72px",
          borderBottom: "1px solid #292929",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          background: "#151515",
          boxSizing: "border-box",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            Fares AI
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "#999",
              marginTop: "4px",
            }}
          >
            وكيل متجرك الذكي
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: isReady ? "#4ade80" : "#facc15",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: isReady ? "#4ade80" : "#facc15",
              display: "inline-block",
            }}
          />

          {isReady ? "متصل بالمتجر" : "جاري الاتصال..."}
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "35px 25px",
          boxSizing: "border-box",
        }}
      >
        {/* Title */}
        <section style={{ marginBottom: "30px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: "700",
            }}
          >
            وش تبي أسوي لمتجرك؟
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#999",
              fontSize: "16px",
            }}
          >
            اكتب طلبك وأنا أساعدك في تجهيز وتطوير متجرك.
          </p>
        </section>

        {/* Store */}
        <section
          style={{
            background: "#181818",
            border: "1px solid #292929",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              color: "#888",
              fontSize: "13px",
              marginBottom: "8px",
            }}
          >
            المتجر الحالي
          </div>

          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            {store?.name || "متجرك"}
          </div>

          <div
            style={{
              color: "#777",
              fontSize: "13px",
              marginTop: "6px",
            }}
          >
            {iframeMode ? "متصل داخل لوحة سلة" : "وضع مستقل"}
          </div>
        </section>

        {/* Quick Actions */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
            marginBottom: "30px",
          }}
        >
          {quickActions.map((item) => (
            <button
              key={item}
              onClick={() => setMessage(item)}
              disabled={isSending}
              style={{
                background: "#1b1b1b",
                color: "#fff",
                border: "1px solid #303030",
                borderRadius: "14px",
                padding: "18px",
                textAlign: "right",
                cursor: isSending ? "default" : "pointer",
                fontSize: "15px",
                opacity: isSending ? 0.6 : 1,
              }}
            >
              {item}
            </button>
          ))}
        </section>

        {/* Chat */}
        <section
          style={{
            background: "#181818",
            border: "1px solid #292929",
            borderRadius: "18px",
            overflow: "hidden",
          }}
        >
          {/* Messages */}
          <div
            style={{
              padding: "20px",
              minHeight: "280px",
              maxHeight: "420px",
              overflowY: "auto",
            }}
          >
            {messages.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    item.role === "user"
                      ? "flex-start"
                      : "flex-end",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    background:
                      item.role === "user"
                        ? "#2a2a2a"
                        : "#222222",
                    border:
                      item.role === "assistant"
                        ? "1px solid #303030"
                        : "none",
                    borderRadius: "14px",
                    padding: "12px 15px",
                    lineHeight: "1.7",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item.text}
                </div>
              </div>
            ))}

            {isSending && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    background: "#222222",
                    border: "1px solid #303030",
                    borderRadius: "14px",
                    padding: "12px 15px",
                    color: "#999",
                  }}
                >
                  جاري التفكير...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              borderTop: "1px solid #292929",
              padding: "15px",
              display: "flex",
              gap: "10px",
            }}
          >
            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="اكتب وش تبي أسوي في متجرك..."
              rows={2}
              disabled={isSending}
              style={{
                flex: 1,
                resize: "none",
                background: "#111111",
                color: "#fff",
                border: "1px solid #303030",
                borderRadius: "12px",
                padding: "13px",
                outline: "none",
                fontSize: "15px",
                fontFamily: "Arial, Tahoma, sans-serif",
                opacity: isSending ? 0.6 : 1,
              }}
            />

            <button
              onClick={sendMessage}
              disabled={isSending || !message.trim()}
              style={{
                width: "110px",
                border: "none",
                borderRadius: "12px",
                background:
                  isSending || !message.trim()
                    ? "#555"
                    : "#ffffff",
                color: "#111111",
                fontWeight: "700",
                cursor:
                  isSending || !message.trim()
                    ? "default"
                    : "pointer",
                fontSize: "15px",
              }}
            >
              {isSending ? "..." : "إرسال"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

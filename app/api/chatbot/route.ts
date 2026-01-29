import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are an AI assistant for DCET Coaching, a premier coaching platform for Diploma CET (DCET) preparation in Karnataka, India.

About the platform:
- Founded by Mohammed Adnan, who secured All-India Rank 48 in DCET
- Currently studying CSE at R.V. College of Engineering (RVCE)
- Placed at Red Hat

You help students with:
1. DCET exam preparation tips and strategies
2. Subject-related doubts (Mathematics, Physics, Chemistry, FEEE, IT Skills, etc.)
3. Engineering concepts and explanations
4. Career guidance for engineering students
5. Study tips and time management

Be helpful, encouraging, and motivating. Keep responses concise but informative.
If asked about topics unrelated to education or DCET, politely redirect the conversation.

Always be positive and supportive. Remember: "Education is the most powerful weapon which you can use to change the world."`;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        userId: session.user.id,
        content: message,
        isBot: false,
      },
    });

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      const fallbackResponses = [
        "I'm here to help you with DCET preparation! While my AI features are being configured, you can ask your teachers questions directly through the Q&A section.",
        "Great question! For now, I'd recommend checking out the video lessons or asking your teacher for detailed explanations.",
        "DCET preparation requires consistent effort. Focus on Mathematics and your core subjects. Practice mock tests regularly!",
        "Remember: Mohammed Adnan secured Rank 48 through dedication and hard work. You can achieve your goals too!",
      ];
      
      const botMessage = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      await prisma.chatMessage.create({
        data: {
          userId: session.user.id,
          content: botMessage,
          isBot: true,
        },
      });

      return NextResponse.json({ message: botMessage });
    }

    // Generate AI response
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Get recent chat history for context
    const recentMessages = await prisma.chatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const chatHistory = recentMessages
      .reverse()
      .map((m) => `${m.isBot ? "Assistant" : "Student"}: ${m.content}`)
      .join("\n");

    const prompt = `${SYSTEM_PROMPT}

Recent conversation:
${chatHistory}

Student: ${message}

Provide a helpful, concise response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const botMessage = response.text();

    // Save bot response
    await prisma.chatMessage.create({
      data: {
        userId: session.user.id,
        content: botMessage,
        isBot: true,
      },
    });

    return NextResponse.json({ message: botMessage });
  } catch (error) {
    console.error("Chatbot error:", error);
    
    // Return a friendly error message
    const errorMessage = "I'm having trouble processing your request right now. Please try again or ask your teacher for help!";
    
    return NextResponse.json({ message: errorMessage });
  }
}

// Get chat history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }
}

// Clear chat history
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.chatMessage.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ message: "Chat history cleared" });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return NextResponse.json({ error: "Failed to clear chat history" }, { status: 500 });
  }
}

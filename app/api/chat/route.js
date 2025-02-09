
import { NextResponse } from "next/server"
import { OpenAI } from "openai";

const axios = require("axios");

// API Key
const API_KEY = "sk-";

// 发送请求
// async function getChatCompletion() {
//     try {
//         const response = await axios.post(
//             "https://api.lkeap.cloud.tencent.com/v1/chat/completions",
//             {
//                 model: "deepseek-r1",
//                 messages: [{ role: "user", content: "你好" }],
//                 stream: true,
//             },
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${API_KEY}`,
//                 },
//                 responseType: "stream", // 重要：启用流式响应
//             }
//         );

//         // 处理流数据
//         response.data.on("data", (chunk) => {
//             console.log("收到数据:", chunk.toString());
//         });

//         response.data.on("end", () => {
//             console.log("请求完成");
//         });

//     } catch (error) {
//         console.error("请求错误:", error.message);
//     }
// }

// 调用函数


// export async function GET(req) {
//     getChatCompletion();
//     return NextResponse.json({ message: 'success' }, { status: 200 })
// }

export async function POST(req) {
    const { message } = await req.json()
    // console.log(111, data)
    const encoder = new TextEncoder();
    const decoder = new TextDecoder("utf-8"); // 解决乱码问题


    const stream = new ReadableStream({
        async start(controller) {
            try {
                const response = await axios.post(
                    "https://api.lkeap.cloud.tencent.com/v1/chat/completions",
                    {
                        model: "deepseek-r1",
                        messages: [{ role: "user", content: message }],
                        stream: true,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${API_KEY}`,
                        },
                        responseType: "stream", // 启用流式响应
                    }
                );



                // 监听数据流
                // response.data.on("data", (chunk) => {

                // });

                // 监听数据流
                // response.data.on("data", (chunk) => {

                //     const jsonString = chunk.toString();
                //     try {
                //         const json = JSON.parse(jsonString);
                //         const reasoningContent = json.choices?.[0]?.delta?.reasoning_content;
                //         if (reasoningContent) {
                //             controller.enqueue(encoder.encode(reasoningContent + "\n"));
                //         }
                //     } catch (err) {
                //         console.error("JSON 解析错误:", err);
                //     }

                //     controller.enqueue(encoder.encode(chunk.toString()));
                // });

                response.data.on("data", (chunk) => {
                    const text = decoder.decode(chunk).trim(); // 解决乱码问题
                    // const text = chunk.toString().trim();

                    // 过滤掉非 JSON 的部分（只解析 `data:` 后的 JSON）
                    if (text.startsWith("data: ")) {
                        const jsonString = text.replace("data: ", "").trim();
                        try {
                            const json = JSON.parse(jsonString);
                            const reasoningContent = json.choices?.[0]?.delta?.reasoning_content;
                            if (reasoningContent) {
                                controller.enqueue(encoder.encode(reasoningContent + ""));
                            }
                            const Content = json.choices?.[0]?.delta?.content;
                            if (Content) {
                                controller.enqueue(encoder.encode(Content + ""));
                            }
                        } catch (err) {
                            console.error("JSON 解析失败1:", jsonString);
                        }
                    }
                });





                response.data.on("end", () => {
                    controller.close();
                });

            } catch (error) {
                console.error("请求错误:", error);
                controller.enqueue(encoder.encode(`错误: ${error.message}`));
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: { "Content-Type": "text/event-stream" },
    });
}


// export async function POST(req) {

//     return NextResponse.json({ message: 'success' }, { status: 200 })


// }

// const client = new OpenAI({
//     apiKey: "Bearer sk-fTgj5ION8hykf443PDx6MZVucbb7ZfEkeErHsgHosVH5Cfi8", // 知识引擎原子能力 APIKey
//     baseURL: "https://api.lkeap.cloud.tencent.com/v1",
// });

// // 定义一个异步函数来处理请求
// async function getCompletion() {
//     try {
//         const completion = await client.chat.completions.create({
//             model: 'deepseek-r1',
//             messages: [{ role: 'user', content: '你好' }],
//             stream: true,
//         });

//         // 处理流式响应
//         for await (const chunk of completion) {
//             if (chunk.choices) {
//                 // 打印思维链内容
//                 console.log("reasoning_content:", chunk.choices[0]?.delta?.reasoning_content);
//                 // 打印模型最终返回的content
//                 console.log("content", chunk.choices[0]?.delta?.content);
//             }
//         }
//     } catch (error) {
//         console.error("Error occurred:", error);
//     }
// }

// // 调用异步函数
// getCompletion();